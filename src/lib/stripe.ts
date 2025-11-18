import Stripe from "stripe";

// Server-only Stripe client initialization
// This file should ONLY be imported in server components and API routes

if (!process.env.STRIPE_SECRET_KEY) {
	throw new Error("STRIPE_SECRET_KEY is not set");
}

// Initialize Stripe client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
	apiVersion: "2025-10-29.clover",
	typescript: true,
});

// Re-export price constants and helpers from stripeConfig for server-side use
export {
	STRIPE_PRICE_PRO_MONTHLY,
	STRIPE_PRICE_PRO_YEARLY,
	isYearlyPrice,
} from "./stripeConfig";

/**
 * Get Stripe instance
 */
export function getStripe(): Stripe {
	return stripe;
}

/**
 * Create a Stripe customer
 */
export async function createCustomer(
	email: string,
	name?: string | null
): Promise<Stripe.Customer> {
	return await stripe.customers.create({
		email,
		name: name || undefined,
	});
}

/**
 * Create a checkout session
 * If user is in a trial, subscription will start after trial ends
 */
export async function createCheckoutSession(
	priceId: string,
	customerId?: string,
	trialDaysRemaining?: number
): Promise<Stripe.Checkout.Session> {
	const sessionParams: Stripe.Checkout.SessionCreateParams = {
		mode: "subscription",
		payment_method_types: ["card"],
		line_items: [
			{
				price: priceId,
				quantity: 1,
			},
		],
		success_url: `${
			process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
		}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${
			process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
		}/payment/cancel`,
	};

	if (customerId) {
		sessionParams.customer = customerId;
	} else {
		sessionParams.customer_email = undefined; // Will be set from session
	}

	// If user is in a trial, set subscription to start after trial ends
	// This ensures they don't pay until their free trial expires
	if (trialDaysRemaining && trialDaysRemaining > 0) {
		sessionParams.subscription_data = {
			trial_period_days: trialDaysRemaining,
		};
	}

	return await stripe.checkout.sessions.create(sessionParams);
}

/**
 * Create a customer portal session for managing subscription
 */
export async function createPortalSession(
	customerId: string,
	returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
	return await stripe.billingPortal.sessions.create({
		customer: customerId,
		return_url: returnUrl,
	});
}

/**
 * Get subscription details
 */
export async function getSubscription(
	subscriptionId: string
): Promise<Stripe.Subscription> {
	return await stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
	subscriptionId: string
): Promise<Stripe.Subscription> {
	return await stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Update subscription plan
 */
export async function updateSubscription(
	subscriptionId: string,
	newPriceId: string
): Promise<Stripe.Subscription> {
	const subscription = await stripe.subscriptions.retrieve(subscriptionId);

	return await stripe.subscriptions.update(subscriptionId, {
		items: [
			{
				id: subscription.items.data[0].id,
				price: newPriceId,
			},
		],
		proration_behavior: "always_invoice",
	});
}
