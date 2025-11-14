import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSubscriptionStatusFromSession } from "@/lib/utils/subscription";
import { createPortalSessionAction } from "@/lib/actions/billing";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import TwoPlansSelector from "./TwoPlansSelector";
import { AlgoNavbar } from "@/features/algorithms/components/AlgoNavbar";
import { ManageSubscriptionButton } from "./ManageSubscriptionButton";
import { RefreshSubscriptionButton } from "./RefreshSubscriptionButton";

export default async function TwoPlansBillingPage() {
	const session = await getSession();

	if (!session?.user) {
		redirect("/login");
	}

	const subscriptionStatus = getSubscriptionStatusFromSession(session);
	const currentStatus = subscriptionStatus?.subscriptionStatus;
	const trialDaysRemaining = subscriptionStatus?.trialDaysRemaining ?? 0;
	const planTier = subscriptionStatus?.planTier;

	return (
		<div className="min-h-screen bg-background p-4 md:p-8">
			<AlgoNavbar />
			<div className="max-w-4xl mx-auto space-y-8 pt-10">
				{/* Display based on subscription status - status is the single source of truth */}
				{(() => {
					switch (currentStatus) {
						case "app_trialing":
							return (
								<>
									{/* Trial Banner */}
									<div className="w-fit flfex jfustify-center mx-auto bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2 text-center">
										<p className="px-2 text-yellow-600 dark:text-yellow-400 font-medium">
											You have {trialDaysRemaining} day
											{trialDaysRemaining !== 1
												? "s"
												: ""}{" "}
											left in your free trial - Pick a
											plan starting at $0 to avoid
											interruptions
										</p>
									</div>
									{/* Plan Selection */}
									<TwoPlansSelector
										isTrialing={true}
										trialDaysRemaining={trialDaysRemaining}
									/>
								</>
							);

						case "stripe_trialing":
							return (
								<Card>
									<CardHeader>
										<CardTitle>
											Subscription Active
										</CardTitle>
										<CardDescription>
											Your subscription is set up and will
											start automatically in{" "}
											{trialDaysRemaining} day
											{trialDaysRemaining !== 1
												? "s"
												: ""}
											. No action needed!
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										<div>
											<p className="text-sm text-muted-foreground">
												Plan
											</p>
											<p className="font-semibold">
												{planTier || "PRO"}{" "}
												{subscriptionStatus?.isYearly
													? "Yearly"
													: "Monthly"}
											</p>
										</div>
										{subscriptionStatus?.stripeCurrentPeriodEnd && (
											<div>
												<p className="text-sm text-muted-foreground">
													Billing starts
												</p>
												<p className="font-semibold">
													{new Date(
														subscriptionStatus.stripeCurrentPeriodEnd
													).toLocaleDateString()}
												</p>
											</div>
										)}
									</CardContent>
									<CardFooter>
										<ManageSubscriptionButton />
									</CardFooter>
								</Card>
							);

						case "active":
						case "past_due":
						case "unpaid":
						case "incomplete":
						case "paused":
						case "canceled":
							return (
								<Card>
									<CardHeader>
										<div className="flex items-center justify-between">
											<CardTitle>
												Subscription Details
											</CardTitle>
											{currentStatus === "active" && (
												<span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
													Active
												</span>
											)}
											{currentStatus === "past_due" && (
												<span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
													Past Due
												</span>
											)}
											{currentStatus === "unpaid" && (
												<span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
													Unpaid
												</span>
											)}
											{currentStatus === "incomplete" && (
												<span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
													Incomplete
												</span>
											)}
											{currentStatus === "paused" && (
												<span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20">
													Paused
												</span>
											)}
											{currentStatus === "canceled" && (
												<span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20">
													Canceled
												</span>
											)}
										</div>
										<CardDescription>
											{currentStatus === "active" &&
												`You are currently subscribed to the ${
													planTier || "PRO"
												} plan`}
											{currentStatus === "past_due" &&
												"Your payment failed. Please update your payment method to continue your subscription."}
											{currentStatus === "unpaid" &&
												"Your subscription is unpaid. Please update your payment method."}
											{currentStatus === "incomplete" &&
												"Your subscription setup is incomplete. Please complete the payment process."}
											{currentStatus === "paused" &&
												"Your subscription is currently paused."}
											{currentStatus === "canceled" &&
												"Your subscription has been canceled. You'll retain access until the end of your billing period."}
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										<div>
											<p className="text-sm text-muted-foreground">
												Plan
											</p>
											<p className="font-semibold">
												{planTier || "PRO"}{" "}
												{subscriptionStatus?.isYearly
													? "Yearly"
													: "Monthly"}
											</p>
										</div>

										{subscriptionStatus?.stripeCurrentPeriodEnd && (
											<div>
												<p className="text-sm text-muted-foreground">
													{currentStatus === "active"
														? "Next billing date"
														: currentStatus ===
														  "canceled"
														? "Access ends"
														: "Period ends"}
												</p>
												<p className="font-semibold">
													{new Date(
														subscriptionStatus.stripeCurrentPeriodEnd
													).toLocaleDateString(
														"en-US",
														{
															year: "numeric",
															month: "long",
															day: "numeric",
														}
													)}
												</p>
												{currentStatus ===
													"canceled" && (
													<p className="text-xs text-muted-foreground mt-1">
														You&apos;ll lose access
														to premium features
														after this date
													</p>
												)}
											</div>
										)}

										{currentStatus === "past_due" && (
											<div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
												<p className="text-sm text-yellow-600 dark:text-yellow-400">
													⚠️ Your payment method needs
													attention. Update it to
													avoid service interruption.
												</p>
											</div>
										)}

										{currentStatus === "unpaid" && (
											<div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
												<p className="text-sm text-red-600 dark:text-red-400">
													⚠️ Your subscription is
													unpaid. Please update your
													payment method to restore
													access.
												</p>
											</div>
										)}
									</CardContent>
									<CardFooter className="flex gap-4">
										<ManageSubscriptionButton />
										<RefreshSubscriptionButton />
									</CardFooter>
								</Card>
							);

						case "expired":
						case null:
						default:
							// Show plan selector for expired or no subscription
							return (
								<TwoPlansSelector
									isTrialing={false}
									trialDaysRemaining={0}
								/>
							);
					}
				})()}
			</div>
		</div>
	);
}
