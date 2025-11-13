"use server";

import { requireAuth, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
	stripe,
	createCheckoutSession,
	createPortalSession,
	getSubscription,
	isExpertPrice,
	getPlanTier,
	STRIPE_PRICE_PRO_MONTHLY,
	STRIPE_PRICE_PRO_YEARLY,
	STRIPE_PRICE_EXPERT_MONTHLY,
	STRIPE_PRICE_EXPERT_YEARLY,
	createCustomer,
} from "@/lib/stripe";
import { getSubscriptionStatusFromSession } from "@/lib/utils/subscription";

// Possible subscription status values
// Status is the single source of truth for display logic
export type SubscriptionStatusValue =
	| null
	| "app_trialing" // App-managed trial (no Stripe subscription yet)
	| "stripe_trialing" // Stripe-managed trial (has Stripe subscription in trial)
	| "active" // Active paid subscription
	| "past_due" // Payment failed, grace period
	| "unpaid" // Payment failed, no grace period
	| "incomplete" // Subscription setup incomplete
	| "incomplete_expired" // Incomplete subscription expired
	| "paused" // Subscription paused
	| "canceled" // Subscription canceled (access until period end)
	| "expired"; // Trial/subscription expired, no access

export interface SubscriptionStatus {
	subscriptionStatus: SubscriptionStatusValue;
	stripePriceId: string | null;
	stripeCurrentPeriodEnd: Date | null;
	planTier: "PRO" | "EXPERT" | null;
	isYearly: boolean;
	trialDaysRemaining: number | null;
}

/**
 * Create a checkout session for a subscription plan
 */
export async function createCheckoutSessionAction(priceId: string): Promise<{
	success: boolean;
	error?: string;
	url?: string;
}> {
	try {
		let user;
		try {
			user = await requireAuth();
		} catch (authError) {
			return {
				success: false,
				error: "You must be logged in to subscribe. Please sign in and try again.",
			};
		}

		// Validate price ID
		const validPriceIds = [
			STRIPE_PRICE_PRO_MONTHLY,
			STRIPE_PRICE_PRO_YEARLY,
			STRIPE_PRICE_EXPERT_MONTHLY,
			STRIPE_PRICE_EXPERT_YEARLY,
		];

		if (!validPriceIds.includes(priceId)) {
			return { success: false, error: "Invalid price ID" };
		}

		// Get user from database to check subscription status
		const dbUser = await prisma.user.findUnique({
			where: { id: user.id },
		});

		if (!dbUser) {
			return { success: false, error: "User not found" };
		}

		let customerId = dbUser.stripeCustomerId;

		// Create Stripe customer if doesn't exist
		if (!customerId) {
			const customer = await createCustomer(dbUser.email, dbUser.name);
			customerId = customer.id;

			// Update user with customer ID
			await prisma.user.update({
				where: { id: user.id },
				data: { stripeCustomerId: customerId },
			});
		}

		// Calculate remaining trial days if user is in app trial
		// This ensures subscription starts after trial ends, not immediately
		let trialDaysRemaining: number | undefined;
		if (
			dbUser.subscriptionStatus === "app_trialing" &&
			dbUser.stripeCurrentPeriodEnd &&
			!dbUser.stripeSubscriptionId // Only if they don't already have a subscription
		) {
			const now = new Date();
			const trialEnd = new Date(dbUser.stripeCurrentPeriodEnd);
			const daysRemaining = Math.ceil(
				(trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
			);

			if (daysRemaining > 0) {
				trialDaysRemaining = daysRemaining;
			}
		}

		// Create checkout session
		// If user is in trial, subscription will start after trial ends
		const session = await createCheckoutSession(
			priceId,
			customerId,
			trialDaysRemaining
		);

		return {
			success: true,
			url: session.url || undefined,
		};
	} catch (error) {
		console.error("Failed to create checkout session:", error);
		return { success: false, error: "Failed to create checkout session" };
	}
}

/**
 * Create a customer portal session for managing subscription
 */
export async function createPortalSessionAction(): Promise<{
	success: boolean;
	error?: string;
	url?: string;
}> {
	"use server";

	try {
		let user;
		try {
			user = await requireAuth();
		} catch (authError) {
			return {
				success: false,
				error: "You must be logged in to manage your subscription. Please sign in and try again.",
			};
		}

		const dbUser = await prisma.user.findUnique({
			where: { id: user.id },
		});

		if (!dbUser || !dbUser.stripeCustomerId) {
			return {
				success: false,
				error: "No active subscription found. Please subscribe to a plan first.",
			};
		}

		const portalSession = await createPortalSession(
			dbUser.stripeCustomerId,
			`${
				process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
			}/billing`
		);

		if (portalSession.url) {
			return {
				success: true,
				url: portalSession.url,
			};
		}

		return {
			success: false,
			error: "Failed to create portal session. Please try again.",
		};
	} catch (error) {
		console.error("Failed to create portal session:", error);
		const errorMessage =
			error instanceof Error
				? error.message
				: "Failed to create portal session. Please try again.";
		return {
			success: false,
			error: errorMessage,
		};
	}
}

/**
 * @deprecated Use getSubscriptionStatusFromSession instead - this makes unnecessary database calls
 * Get current subscription status
 * Returns null if user is not authenticated (graceful handling for guests)
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus | null> {
	try {
		// Check authentication without throwing
		const session = await getSession();
		return getSubscriptionStatusFromSession(session);
	} catch (error) {
		console.error("Failed to get subscription status:", error);
		return null;
	}
}

/**
 * Get current plan tier (PRO or EXPERT)
 * Returns null if user is not authenticated (graceful handling for guests)
 */
export async function getCurrentPlanTier(): Promise<"PRO" | "EXPERT" | null> {
	try {
		// Check authentication without throwing
		const session = await getSession();
		if (!session?.user?.id) {
			return null; // Guest user - no plan tier
		}

		const dbUser = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: {
				stripePriceId: true,
			},
		});

		return getPlanTier(dbUser?.stripePriceId || null);
	} catch (error) {
		console.error("Failed to get current plan tier:", error);
		return null;
	}
}

/**
 * Update user role (used by webhook)
 */
export async function updateUserRole(
	userId: string,
	role: "BASIC" | "PRO" | "EXPERT" | "ADMIN"
) {
	try {
		await prisma.user.update({
			where: { id: userId },
			data: { role },
		});
		return { success: true };
	} catch (error) {
		console.error("Failed to update user role:", error);
		return { success: false, error: "Failed to update user role" };
	}
}

/**
 * Server action to manually sync subscription for current user
 */
export async function syncMySubscriptionAction(): Promise<{
	success: boolean;
	error?: string;
}> {
	const { getSession } = await import("@/lib/auth");
	const session = await getSession();

	if (!session?.user?.id) {
		return {
			success: false,
			error: "Not authenticated. Please log in.",
		};
	}

	// Fetch user from database to get stripeCustomerId
	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { stripeCustomerId: true },
	});

	if (!user?.stripeCustomerId) {
		return {
			success: false,
			error: "No Stripe customer ID found. Please contact support.",
		};
	}

	return await syncSubscriptionFromStripe(user.stripeCustomerId);
}

/**
 * Sync subscription data from Stripe
 */
export async function syncSubscriptionFromStripe(
	stripeCustomerId: string
): Promise<{ success: boolean; error?: string }> {
	try {
		// Find user by customer ID
		const user = await prisma.user.findUnique({
			where: { stripeCustomerId },
		});

		if (!user) {
			return { success: false, error: "User not found" };
		}

		// Get all subscriptions for this customer
		const subscriptions = await stripe.subscriptions.list({
			customer: stripeCustomerId,
			status: "all",
			limit: 1,
		});

		if (subscriptions.data.length === 0) {
			// No active subscription - user canceled
			await prisma.user.update({
				where: { id: user.id },
				data: {
					role: "BASIC",
					subscriptionStatus: null,
					stripeSubscriptionId: null,
					stripePriceId: null,
					stripeCurrentPeriodEnd: null,
				},
			});
			return { success: true };
		}

		const subscription = subscriptions.data[0];
		const priceId = subscription.items.data[0]?.price.id;

		// Retrieve full subscription details to get current_period_end
		// The list() method may not return all fields, so we retrieve it explicitly
		const fullSubscription = await stripe.subscriptions.retrieve(
			subscription.id
		);

		// Determine subscription status
		// Map Stripe subscription statuses to our SubscriptionStatusValue type
		// Status is the single source of truth for display logic
		let subscriptionStatus: SubscriptionStatusValue;

		// Check cancel_at_period_end first (takes precedence over active status)
		const subscriptionAny = fullSubscription as any;

		// Log all cancellation-related fields for debugging
		console.log(
			`Subscription ${subscription.id} details: ` +
				`status=${fullSubscription.status}, ` +
				`cancel_at_period_end=${subscriptionAny.cancel_at_period_end}, ` +
				`cancel_at=${subscriptionAny.cancel_at}, ` +
				`canceled_at=${subscriptionAny.canceled_at}, ` +
				`cancellation_details=${JSON.stringify(
					subscriptionAny.cancellation_details
				)}`
		);

		// Check multiple ways cancel_at_period_end might be set
		const cancelAtPeriodEnd =
			subscriptionAny.cancel_at_period_end === true ||
			subscriptionAny.cancel_at_period_end === "true" ||
			(subscriptionAny.cancel_at && subscriptionAny.cancel_at > 0); // cancel_at is a timestamp when it will cancel

		// Log cancellation status for debugging
		if (cancelAtPeriodEnd) {
			console.log(
				`Subscription ${subscription.id} has cancel_at_period_end=true. Stripe status: ${fullSubscription.status}`
			);
		}

		if (fullSubscription.status === "trialing") {
			subscriptionStatus = "stripe_trialing";
		} else if (fullSubscription.status === "active") {
			// If canceled at period end, mark as canceled (user keeps access until period ends)
			subscriptionStatus = cancelAtPeriodEnd ? "canceled" : "active";
			if (cancelAtPeriodEnd) {
				console.log(
					`Setting subscriptionStatus to "canceled" for subscription ${subscription.id} (cancel_at_period_end=true)`
				);
			}
		} else if (fullSubscription.status === "canceled") {
			// Immediately canceled (no period end) → expired
			subscriptionStatus = "expired";
		} else if (
			fullSubscription.status === "past_due" ||
			fullSubscription.status === "unpaid" ||
			fullSubscription.status === "incomplete" ||
			fullSubscription.status === "incomplete_expired" ||
			fullSubscription.status === "paused"
		) {
			subscriptionStatus =
				fullSubscription.status as SubscriptionStatusValue;
		} else {
			// Unknown status - default to null (no subscription)
			subscriptionStatus = null;
		}

		// Determine role based on price ID (PRO or EXPERT)
		let role: "BASIC" | "PRO" | "EXPERT" = "BASIC";
		if (subscriptionStatus && priceId) {
			role = isExpertPrice(priceId) ? "EXPERT" : "PRO";
		}

		// Update user with subscription data
		// Try to get current_period_end from subscription object
		// Note: TypeScript types don't expose these, but they exist in the API response
		let currentPeriodEnd = subscriptionAny.current_period_end as
			| number
			| null
			| undefined;

		// For trialing subscriptions, fall back to trial_end if current_period_end is missing
		if (!currentPeriodEnd && fullSubscription.status === "trialing") {
			currentPeriodEnd = subscriptionAny.trial_end as
				| number
				| null
				| undefined;
			if (currentPeriodEnd) {
				console.log(
					`Using trial_end for trialing subscription ${
						subscription.id
					}: ${new Date(currentPeriodEnd * 1000).toISOString()}`
				);
			}
		}

		// If still missing, try to get it from latest invoice
		if (!currentPeriodEnd && subscriptionAny.latest_invoice) {
			try {
				const latestInvoiceId =
					typeof subscriptionAny.latest_invoice === "string"
						? subscriptionAny.latest_invoice
						: subscriptionAny.latest_invoice?.id;

				if (latestInvoiceId) {
					const invoice = await stripe.invoices.retrieve(
						latestInvoiceId
					);
					const invoiceAny = invoice as any;
					if (invoiceAny.period_end) {
						currentPeriodEnd = invoiceAny.period_end as number;
						console.log(
							`Using period_end from latest invoice for subscription ${
								subscription.id
							}: ${new Date(
								currentPeriodEnd * 1000
							).toISOString()}`
						);
					}
				}
			} catch (error) {
				console.error(
					`Failed to retrieve latest invoice for subscription ${subscription.id}:`,
					error
				);
			}
		}

		// If still missing, try to calculate from billing_cycle_anchor and period
		if (!currentPeriodEnd && subscriptionAny.billing_cycle_anchor) {
			const billingCycleAnchor =
				subscriptionAny.billing_cycle_anchor as number;
			// Get period from subscription items (default to monthly)
			const items =
				subscriptionAny.items?.data || subscriptionAny.items || [];
			let interval: "day" | "week" | "month" | "year" = "month";
			let intervalCount = 1;

			if (items.length > 0) {
				const firstItem = items[0];
				const price = firstItem.price;
				if (price?.recurring?.interval) {
					interval = price.recurring.interval;
					intervalCount = price.recurring.interval_count || 1;
				}
			}

			// Calculate period end: billing_cycle_anchor + period
			// Find the next period end after now using proper date arithmetic
			const now = Math.floor(Date.now() / 1000);
			const anchorDate = new Date(billingCycleAnchor * 1000);
			let nextPeriodEnd = billingCycleAnchor;

			// Keep adding periods until we're past now
			while (nextPeriodEnd <= now) {
				const currentDate = new Date(nextPeriodEnd * 1000);

				if (interval === "day") {
					currentDate.setDate(currentDate.getDate() + intervalCount);
				} else if (interval === "week") {
					currentDate.setDate(
						currentDate.getDate() + intervalCount * 7
					);
				} else if (interval === "month") {
					currentDate.setMonth(
						currentDate.getMonth() + intervalCount
					);
				} else if (interval === "year") {
					currentDate.setFullYear(
						currentDate.getFullYear() + intervalCount
					);
				}

				nextPeriodEnd = Math.floor(currentDate.getTime() / 1000);
			}

			currentPeriodEnd = nextPeriodEnd;
			console.log(
				`Calculated current_period_end from billing_cycle_anchor for subscription ${
					subscription.id
				}: ${new Date(
					currentPeriodEnd * 1000
				).toISOString()} (${interval}, ${intervalCount})`
			);
		}

		// Log if current_period_end is still missing (for debugging)
		if (!currentPeriodEnd) {
			console.warn(
				`Warning: current_period_end could not be determined for subscription ${subscription.id}. ` +
					`Subscription status: ${fullSubscription.status}. ` +
					`Available fields: ${Object.keys(subscriptionAny).join(
						", "
					)}`
			);
		}

		// For canceled subscriptions, use cancel_at as the expiration date
		// For active subscriptions, use current_period_end as the next billing date
		let periodEndDate: Date | null = null;
		if (cancelAtPeriodEnd && subscriptionAny.cancel_at) {
			// Subscription is canceled - use cancel_at as the expiration date
			periodEndDate = new Date(
				(subscriptionAny.cancel_at as number) * 1000
			);
			console.log(
				`Using cancel_at as expiration date for canceled subscription: ${periodEndDate.toISOString()}`
			);
		} else if (currentPeriodEnd) {
			// Active subscription - use current_period_end
			periodEndDate = new Date(currentPeriodEnd * 1000);
		}

		await prisma.user.update({
			where: { id: user.id },
			data: {
				role,
				subscriptionStatus,
				stripeSubscriptionId: subscription.id,
				stripePriceId: priceId || null,
				stripeCurrentPeriodEnd: periodEndDate,
			},
		});

		// Log successful sync for debugging
		console.log(
			`Synced subscription for user ${user.id}: ` +
				`role=${role}, status=${subscriptionStatus}, ` +
				`periodEnd=${periodEndDate?.toISOString() || "null"}, ` +
				`cancel_at_period_end=${cancelAtPeriodEnd}`
		);

		return { success: true };
	} catch (error) {
		console.error("Failed to sync subscription from Stripe:", error);
		return { success: false, error: "Failed to sync subscription" };
	}
}
