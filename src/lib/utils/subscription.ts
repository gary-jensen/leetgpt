import type { SubscriptionStatusValue, SubscriptionStatus } from "@/lib/actions/billing";
import {
	STRIPE_PRICE_PRO_YEARLY,
	STRIPE_PRICE_PRO_MONTHLY,
} from "@/lib/stripeConfig";
import { prisma } from "@/lib/prisma";

/**
 * Check if subscription has expired and downgrade user if needed
 * This is a synchronous function that checks the data passed in
 * Returns true if subscription was expired and user was downgraded
 * 
 * Handles:
 * - app_trialing → expired (app trial period ended)
 * - canceled → expired (canceled subscription period ended)
 * - incomplete_expired → expired
 */
export function checkAndExpireSubscription(
	user: {
		subscriptionStatus: SubscriptionStatusValue | null | undefined;
		stripeCurrentPeriodEnd: Date | null | undefined;
		stripeSubscriptionId: string | null | undefined;
		role: string | null | undefined;
	},
	session?: {
		user?: {
			role?: string | null;
			subscriptionStatus?: SubscriptionStatusValue;
			stripeCurrentPeriodEnd?: Date | null;
		} | null;
	} | null
): boolean {
	// Handle incomplete_expired → expired
	if (user.subscriptionStatus === "incomplete_expired") {
		if (user.role !== "ADMIN") {
			if (session?.user) {
				session.user.role = "BASIC";
				session.user.subscriptionStatus = "expired";
				session.user.stripeCurrentPeriodEnd = null;
			}
			return true;
		}
		return false;
	}

	// Handle app_trialing → expired
	if (user.subscriptionStatus === "app_trialing") {
		if (!user.stripeCurrentPeriodEnd) {
			return false;
		}

		const now = new Date();
		const trialEnd = new Date(user.stripeCurrentPeriodEnd);

		if (now >= trialEnd) {
			if (user.role !== "ADMIN") {
				if (session?.user) {
					session.user.role = "BASIC";
					session.user.subscriptionStatus = "expired";
					session.user.stripeCurrentPeriodEnd = null;
				}
				return true;
			}
		}
		return false;
	}

	// Handle canceled → expired (when period ends)
	if (user.subscriptionStatus === "canceled") {
		if (!user.stripeCurrentPeriodEnd) {
			return false;
		}

		const now = new Date();
		const periodEnd = new Date(user.stripeCurrentPeriodEnd);

		if (now >= periodEnd) {
			if (user.role !== "ADMIN") {
				if (session?.user) {
					session.user.role = "BASIC";
					session.user.subscriptionStatus = "expired";
					session.user.stripeCurrentPeriodEnd = null;
				}
				return true;
			}
		}
		return false;
	}

	return false;
}

/**
 * @deprecated Use checkAndExpireSubscription instead
 * Kept for backward compatibility during migration
 */
export const checkAndExpireTrial = checkAndExpireSubscription;

/**
 * Update user in database when subscription expires (async database operation)
 * Handles app_trialing, canceled, and incomplete_expired → expired
 */
export async function updateExpiredSubscription(userId: string): Promise<void> {
	await prisma.user.update({
		where: { id: userId },
		data: {
			role: "BASIC",
			subscriptionStatus: "expired",
			stripeCurrentPeriodEnd: null,
			// Clear Stripe subscription ID if it was canceled
			stripeSubscriptionId: null,
			stripePriceId: null,
		},
	});
}

/**
 * @deprecated Use updateExpiredSubscription instead
 * Kept for backward compatibility during migration
 */
export const updateExpiredTrial = updateExpiredSubscription;

/**
 * Build subscription status from session data (synchronous, no database calls)
 * Returns null if user is not authenticated or missing subscription data
 */
export function getSubscriptionStatusFromSession(
	session: {
		user?: {
			id?: string;
			subscriptionStatus?: SubscriptionStatusValue;
			stripePriceId?: string | null;
			stripeCurrentPeriodEnd?: Date | null;
			role?: string | null;
			stripeSubscriptionId?: string | null;
		} | null;
	} | null
): SubscriptionStatus | null {
	if (!session?.user?.id || session.user.subscriptionStatus === undefined) {
		return null; // Guest user or missing subscription data
	}

	// Check and expire subscription if needed (synchronous check)
	const needsDbUpdate = checkAndExpireSubscription(
		{
			subscriptionStatus: session.user.subscriptionStatus,
			stripeCurrentPeriodEnd: session.user.stripeCurrentPeriodEnd || null,
			stripeSubscriptionId: session.user.stripeSubscriptionId || null,
			role: session.user.role || null,
		},
		session
	);

	// If subscription expired, update database asynchronously (fire and forget)
	if (needsDbUpdate && session.user.id) {
		updateExpiredSubscription(session.user.id).catch((error) => {
			console.error("Failed to update expired subscription:", error);
		});
	}

	// If subscription status is expired, ensure role is BASIC (unless ADMIN)
	if (
		session.user.subscriptionStatus === "expired" &&
		session.user.role !== "ADMIN" &&
		session.user.role !== "BASIC"
	) {
		// Update session's role for current request
		if (session.user) {
			session.user.role = "BASIC";
		}
		// Update database asynchronously (fire and forget)
		if (session.user.id) {
			prisma.user
				.update({
					where: { id: session.user.id },
					data: { role: "BASIC" },
				})
				.catch((error) => {
					console.error("Failed to update user role:", error);
				});
		}
	}

	// Determine plan tier: EXPERT if manually assigned role, PRO if Stripe subscription
	let planTier: "PRO" | "EXPERT" | null = null;
	if (session.user.role === "EXPERT") {
		planTier = "EXPERT";
	} else if (session.user.stripePriceId && (
		session.user.stripePriceId === STRIPE_PRICE_PRO_MONTHLY ||
		session.user.stripePriceId === STRIPE_PRICE_PRO_YEARLY
	)) {
		planTier = "PRO";
	}
	const isYearly = session.user.stripePriceId === STRIPE_PRICE_PRO_YEARLY;

	// Calculate trial days remaining for app_trialing or stripe_trialing
	let trialDaysRemaining: number | null = null;
	if (
		(session.user.subscriptionStatus === "app_trialing" ||
			session.user.subscriptionStatus === "stripe_trialing") &&
		session.user.stripeCurrentPeriodEnd
	) {
		const now = new Date();
		const trialEnd = new Date(session.user.stripeCurrentPeriodEnd);
		const daysRemaining = Math.ceil(
			(trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
		);
		trialDaysRemaining = Math.max(0, daysRemaining);
	}

	return {
		subscriptionStatus: session.user.subscriptionStatus,
		stripePriceId: session.user.stripePriceId || null,
		stripeCurrentPeriodEnd: session.user.stripeCurrentPeriodEnd || null,
		planTier,
		isYearly,
		trialDaysRemaining,
	};
}

