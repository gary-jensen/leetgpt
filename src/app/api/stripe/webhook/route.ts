import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import {
	syncSubscriptionFromStripe,
	updateUserRole,
} from "@/lib/actions/billing";

// Webhook secret - checked at runtime, not build time
const getWebhookSecret = () => {
	const secret = process.env.STRIPE_WEBHOOK_SECRET;
	if (!secret) {
		throw new Error("STRIPE_WEBHOOK_SECRET is not set");
	}
	return secret;
};

export async function POST(req: NextRequest) {
	const body = await req.text();
	const signature = (await headers()).get("stripe-signature");

	if (!signature) {
		return NextResponse.json({ error: "No signature" }, { status: 400 });
	}

	const webhookSecret = getWebhookSecret();

	let event: Stripe.Event;

	try {
		event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
	} catch (err) {
		console.error("Webhook signature verification failed:", err);
		return NextResponse.json(
			{ error: "Invalid signature" },
			{ status: 400 }
		);
	}

	try {
		switch (event.type) {
			case "checkout.session.completed": {
				const session = event.data.object as Stripe.Checkout.Session;

				// Get customer ID from session
				const customerId =
					typeof session.customer === "string"
						? session.customer
						: session.customer?.id;

				if (!customerId) {
					console.error("No customer ID in checkout session");
					break;
				}

				// Get subscription ID
				const subscriptionId =
					typeof session.subscription === "string"
						? session.subscription
						: session.subscription?.id;

				if (!subscriptionId) {
					console.error("No subscription ID in checkout session");
					break;
				}

				// Get subscription details - use syncSubscriptionFromStripe which handles this correctly
				// First update customer ID if needed, then sync
				const user = await prisma.user.findUnique({
					where: { stripeCustomerId: customerId },
				});

				if (!user) {
					console.error("User not found for customer:", customerId);
					break;
				}

				// Sync subscription data from Stripe (this handles all the details correctly)
				await syncSubscriptionFromStripe(customerId);

				break;
			}

			case "customer.subscription.created": {
				// Subscription was just created - sync it to get all fields including trial_end
				const subscription = event.data.object as Stripe.Subscription;
				const customerId =
					typeof subscription.customer === "string"
						? subscription.customer
						: subscription.customer?.id;

				if (!customerId) {
					console.error("No customer ID in subscription creation");
					break;
				}

				// Sync subscription data - this will capture trial_end for trialing subscriptions
				await syncSubscriptionFromStripe(customerId);
				break;
			}

			case "customer.subscription.updated": {
				const subscription = event.data.object as Stripe.Subscription;
				const customerId =
					typeof subscription.customer === "string"
						? subscription.customer
						: subscription.customer?.id;

				if (!customerId) {
					console.error("No customer ID in subscription update");
					break;
				}

				// Log subscription update for debugging
				const subscriptionAny = subscription as any;
				console.log(
					`Received customer.subscription.updated webhook: ` +
						`subscription=${subscription.id}, ` +
						`status=${subscription.status}, ` +
						`cancel_at_period_end=${subscriptionAny.cancel_at_period_end}`
				);

				// Sync subscription data
				const result = await syncSubscriptionFromStripe(customerId);
				if (!result.success) {
					console.error(
						`Failed to sync subscription for customer ${customerId}:`,
						result.error
					);
				}
				break;
			}

			case "customer.subscription.deleted": {
				const subscription = event.data.object as Stripe.Subscription;
				const customerId =
					typeof subscription.customer === "string"
						? subscription.customer
						: subscription.customer?.id;

				if (!customerId) {
					console.error("No customer ID in subscription deletion");
					break;
				}

				// Find user by customer ID
				const user = await prisma.user.findUnique({
					where: { stripeCustomerId: customerId },
				});

				if (user) {
					// Subscription immediately deleted (not canceled at period end)
					// Set to expired and clear subscription data
					await prisma.user.update({
						where: { id: user.id },
						data: {
							role: "BASIC",
							subscriptionStatus: "expired",
							stripeSubscriptionId: null,
							stripePriceId: null,
							stripeCurrentPeriodEnd: null,
						},
					});
				}

				break;
			}

			case "invoice.payment_succeeded": {
				const invoice = event.data.object as Stripe.Invoice;
				const customerId =
					typeof invoice.customer === "string"
						? invoice.customer
						: invoice.customer?.id;

				if (!customerId) {
					console.error("No customer ID in invoice");
					break;
				}

				// Ensure subscription is active after successful payment
				// Just sync from Stripe which will handle everything
				await syncSubscriptionFromStripe(customerId);

				break;
			}

			case "invoice.payment_failed": {
				const invoice = event.data.object as Stripe.Invoice;
				const customerId =
					typeof invoice.customer === "string"
						? invoice.customer
						: invoice.customer?.id;

				if (!customerId) {
					console.error("No customer ID in invoice");
					break;
				}

				// Sync subscription to get full state including current_period_end
				// This ensures we have the latest subscription data after payment failure
				// The customer.subscription.updated event will also fire, but this ensures
				// we update immediately with the correct past_due status
				await syncSubscriptionFromStripe(customerId);

				break;
			}

			case "customer.subscription.trial_will_end": {
				// Optional: Send reminder email or notification
				// For MVP, we can just log this
				console.log(
					"Trial ending soon for subscription:",
					event.data.object.id
				);
				break;
			}

			default:
				console.log(`Unhandled event type: ${event.type}`);
		}

		return NextResponse.json({ received: true });
	} catch (error) {
		console.error("Error processing webhook:", error);
		return NextResponse.json(
			{ error: "Webhook processing failed" },
			{ status: 500 }
		);
	}
}
