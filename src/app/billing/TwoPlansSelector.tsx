"use client";

import { useState } from "react";
import {
	STRIPE_PRICE_PRO_MONTHLY,
	STRIPE_PRICE_PRO_YEARLY,
} from "@/lib/stripeConfig";
import { createCheckoutSessionAction } from "@/lib/actions/billing";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import FAQ3 from "@/features/LeetGPTLanding/FAQ";

export default function TwoPlansSelector({
	isTrialing,
	trialDaysRemaining,
}: {
	isTrialing: boolean;
	trialDaysRemaining: number;
}) {
	const [isLoading, setIsLoading] = useState<string | null>(null);

	// Pricing
	const monthlyPrice = 9.99;
	const yearlyPrice = 49.99;
	const monthlyOriginalPrice = 39.99;
	const yearlyOriginalPrice = 179.99;

	// Calculate discount percentage
	const monthlyDiscount = Math.round(
		((monthlyOriginalPrice - monthlyPrice) / monthlyOriginalPrice) * 100
	);
	const yearlyDiscount = Math.round(
		((yearlyOriginalPrice - yearlyPrice) / yearlyOriginalPrice) * 100
	);

	// Only show "$0 then..." if trial is active AND has days remaining
	const hasActiveTrial = isTrialing && trialDaysRemaining > 0;

	const handleCheckout = async (priceId: string, planName: string) => {
		setIsLoading(planName);
		try {
			const result = await createCheckoutSessionAction(priceId);
			if (result.success && result.url) {
				window.location.href = result.url;
			} else {
				alert(result.error || "Failed to create checkout session");
				setIsLoading(null);
			}
		} catch (error) {
			console.error("Checkout error:", error);
			alert("An error occurred. Please try again.");
			setIsLoading(null);
		}
	};

	const plans = [
		{
			name: "Monthly",
			price: monthlyPrice,
			originalPrice: monthlyOriginalPrice,
			discount: monthlyDiscount,
			period: "/month",
			priceId: STRIPE_PRICE_PRO_MONTHLY,
			planKey: "MONTHLY",
			features: [
				"Unlimited problems",
				"AI-Powered hints and chat",
				"Submission feedback",
				"Advanced AI guidance",
			],
			highlighted: false,
		},
		{
			name: "Yearly",
			price: yearlyPrice / 12,
			period: "/month",
			annualPrice: yearlyPrice,
			annualPeriod: "/year",
			discount: yearlyDiscount,
			priceId: STRIPE_PRICE_PRO_YEARLY,
			planKey: "YEARLY",
			badge: "Most Popular",
			features: [
				"All Monthly features",
				`Save ${yearlyDiscount}% vs monthly`,
				`Save 90% vs LeetCode Premium`,
				`Only $${(yearlyPrice / 12).toFixed(2)}/month`,
			],
			highlighted: true,
		},
	];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-end justify-between">
				<div className="flex flex-col gap-2">
					<Link href="/problems">
						<Button
							variant="outline"
							size="sm"
							className="mb-2 flex items-center gap-4"
						>
							<ArrowLeftIcon /> Back
						</Button>
					</Link>
					<h1 className="text-3xl font-bold mb-2">Billing</h1>
				</div>
			</div>

			{/* Plan Cards */}
			<div className="grid md:grid-cols-2 gap-8">
				{plans.map((plan, index) => (
					<div
						key={index}
						className={`max-w-[600px] w-full mx-auto flex flex-col justify-between bg-background border rounded-lg p-8 relative ${
							plan.highlighted
								? "border-2 border-orange-500 shadow-lg"
								: "border-border"
						}`}
					>
						<div>
							{plan.badge && (
								<div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
									{plan.badge}
								</div>
							)}
							<h3 className="text-2xl font-bold text-foreground mb-4">
								{plan.name}
							</h3>
							<div className="mb-6">
								<div className="flex items-baseline gap-2">
									<span className="text-4xl font-bold text-foreground">
										{hasActiveTrial
											? "$0"
											: `$${plan.price.toFixed(2)}`}
									</span>
									<span className="text-muted-foreground">
										{plan.period}
									</span>
								</div>
								{hasActiveTrial && (
									<div className="mt-2 text-sm text-muted-foreground">
										then ${plan.price.toFixed(2)}
										{plan.period} in {trialDaysRemaining}{" "}
										day{trialDaysRemaining !== 1 ? "s" : ""}
									</div>
								)}
								{plan.annualPrice ? (
									<div className="mt-2 text-sm text-muted-foreground">
										billed annually at{" "}
										<span className="font-semibold text-foreground">
											${plan.annualPrice.toFixed(2)}
										</span>
										{plan.annualPeriod}
									</div>
								) : (
									plan.originalPrice && (
										<div className="mt-2 flex items-center gap-2">
											<span className="text-sm text-muted-foreground line-through">
												${plan.originalPrice.toFixed(2)}
											</span>
											<span className="text-xs bg-orange-500/20 text-orange-600 dark:text-orange-400 px-2 py-1 rounded">
												{plan.discount}% off
											</span>
										</div>
									)
								)}
							</div>
							<ul className="space-y-3 mb-8">
								{plan.features.map((feature, featureIndex) => (
									<li
										key={featureIndex}
										className="flex items-start gap-3"
									>
										<svg
											className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
										<span className="text-foreground">
											{feature}
										</span>
									</li>
								))}
							</ul>
						</div>

						<div>
							<button
								onClick={() =>
									handleCheckout(plan.priceId, plan.planKey)
								}
								disabled={isLoading !== null}
								className={`w-full font-semibold py-3 px-6 rounded-lg text-center block transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
									plan.highlighted
										? "bg-orange-500 hover:bg-orange-600 text-white hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25"
										: "bg-background-2 hover:bg-background-3 text-foreground border border-border hover:border-orange-500"
								}`}
							>
								{isLoading === plan.planKey
									? "Loading..."
									: `Pick ${plan.name} plan`}
							</button>

							{hasActiveTrial && (
								<p className="text-center text-sm text-muted-foreground mt-4">
									No charge until your free trial ends in{" "}
									{trialDaysRemaining} day
									{trialDaysRemaining !== 1 ? "s" : ""}
								</p>
							)}
						</div>
					</div>
				))}
			</div>
			<FAQ3 />
		</div>
	);
}
