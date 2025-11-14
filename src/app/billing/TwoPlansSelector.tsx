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

	const monthlyPriceText = hasActiveTrial
		? `$0 then $${monthlyPrice.toFixed(
				2
		  )}/month in ${trialDaysRemaining} day${
				trialDaysRemaining !== 1 ? "s" : ""
		  }`
		: `$${monthlyPrice.toFixed(2)}/month`;

	const yearlyPriceText = hasActiveTrial
		? `$0 then $${yearlyPrice.toFixed(
				2
		  )}/year in ${trialDaysRemaining} day${
				trialDaysRemaining !== 1 ? "s" : ""
		  }`
		: `$${yearlyPrice.toFixed(2)}/year`;

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
			<div className="grid sm-2:grid-cols-2 gap-6 relative">
				{/* Monthly Plan Card */}
				<div className="max-w-lg w-full mx-auto flex flex-col justify-between gap-4 bg-background-2 border border-white/50 rounded-lg p-8 hover:border-orange-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/10">
					<div>
						{/* Header with Title */}
						<div className="flex items-center justify-start gap-3 mb-6">
							<h3 className="text-2xl font-bold text-foreground">
								Monthly
							</h3>
						</div>
						{/* Price Display */}
						<div className="mb-8 flex items-center gap-2">
							<div className="flex items-baseline gap-2 mb-1">
								<span className="text-5xl font-bold text-white">
									{hasActiveTrial
										? "$0"
										: `$${monthlyPrice.toFixed(2)}`}
								</span>
							</div>
							<div className="flex flex-col items-start justify-between gap-1">
								<div className="flex gap-2 items-center">
									<span className="text-sm text-muted-foreground line-through">
										${monthlyOriginalPrice.toFixed(2)}
									</span>
									<span className="text-xs bg-orange-500/20 text-orange-600 dark:text-orange-400 px-2 py-1 rounded">
										{monthlyDiscount}% off
									</span>
								</div>
								{hasActiveTrial ? (
									<p className="text-sm text-muted-foreground">
										then ${monthlyPrice.toFixed(2)}/month in{" "}
										{trialDaysRemaining} day
										{trialDaysRemaining !== 1 ? "s" : ""}
									</p>
								) : (
									<p className="text-sm text-muted-foreground">
										/month
									</p>
								)}
							</div>
						</div>
						{/* Features List */}
						<div className="space-y-4 mb-16">
							<div className="flex items-center gap-3">
								<svg
									className="w-5 h-5 text-green-500 flex-shrink-0"
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
									AI-powered hints and chat
								</span>
							</div>
							<div className="flex items-center gap-3">
								<svg
									className="w-5 h-5 text-green-500 flex-shrink-0"
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
									Submission feedback
								</span>
							</div>
							<div className="flex items-center gap-3">
								<svg
									className="w-5 h-5 text-green-500 flex-shrink-0"
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
									All algorithm problems and lessons
								</span>
							</div>
							<div className="flex items-center gap-3">
								<svg
									className="w-5 h-5 text-green-500 flex-shrink-0"
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
									Progress tracking
								</span>
							</div>
						</div>
					</div>
					<div>
						{/* CTA Button */}
						<button
							onClick={() =>
								handleCheckout(
									STRIPE_PRICE_PRO_MONTHLY,
									"MONTHLY"
								)
							}
							disabled={isLoading !== null}
							className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-lg text-center block transition-all duration-200 mb-4 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
						>
							{isLoading === "MONTHLY"
								? "Loading..."
								: `Pick Monthly plan`}
						</button>

						{/* Reassurance */}
						{hasActiveTrial && (
							<p className="text-center text-sm text-muted-foreground">
								No charge until your free trial ends in{" "}
								{trialDaysRemaining} day
								{trialDaysRemaining !== 1 ? "s" : ""}
							</p>
						)}
					</div>
				</div>

				{/* Yearly Plan Card */}
				<div className="max-w-lg w-full mx-auto flex flex-col justify-between gap-4 bg-background border border-orange-500/50 rounded-lg p-8 hover:border-orange-500 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25 relative overflow-hidden">
					{/* Glow effect background - extends beyond card */}
					<div className="absolute -inset-16 bg-gradient-to-b from-orange-500/60 via-orange-500/30 to-orange-500/10 rounded-lg blur-3xl opacity-15 z-0"></div>
					{/* <div className="absolute -inset-2 bg-gradient-to-tr from-orange-500/40 via-orange-500/20 to-transparent rounded-lg blur-2xl opacity-30 z-0"></div>
					<div className="absolute inset-0 bg-gradient-to-br from-orange-500/15 via-orange-500/5 to-transparent rounded-lg opacity-30 z-0"></div> */}
					{/* Card content wrapper */}
					<div className="relative z-10 flex flex-col flex-1 justify-between gap-4">
						<div>
							{/* Header with Title */}
							<div className="flex items-center justify-start gap-3 mb-6">
								<h3 className="text-2xl font-bold text-foreground">
									Yearly
								</h3>
								<span className="text-xs bg-orange-500/20 text-orange-600 dark:text-orange-400 px-2 py-1 rounded">
									Best Value
								</span>
							</div>
							{/* Price Display */}
							<div className="mb-8 flex items-center gap-2">
								<div className="flex items-baseline gap-2 mb-1">
									<span className="text-5xl font-bold text-white">
										{hasActiveTrial
											? "$0"
											: `$${yearlyPrice.toFixed(2)}`}
									</span>
								</div>
								<div className="flex flex-col items-start justify-between gap-1">
									<div className="flex gap-2 items-center">
										<span className="text-sm text-muted-foreground line-through">
											${yearlyOriginalPrice.toFixed(2)}
										</span>
										<span className="text-xs bg-orange-500/20 text-orange-600 dark:text-orange-400 px-2 py-1 rounded">
											{yearlyDiscount}% off
										</span>
									</div>
									{hasActiveTrial ? (
										<p className="text-sm text-muted-foreground">
											then ${yearlyPrice.toFixed(2)}/year
											in {trialDaysRemaining} day
											{trialDaysRemaining !== 1
												? "s"
												: ""}
										</p>
									) : (
										<p className="text-sm text-muted-foreground">
											/year
										</p>
									)}
								</div>
							</div>
							{/* Features List */}
							<div className="space-y-4 mb-16">
								<div className="flex items-center gap-3">
									<svg
										className="w-5 h-5 text-green-500 flex-shrink-0"
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
										All Monthly features
									</span>
								</div>
								<div className="flex items-center gap-3">
									<svg
										className="w-5 h-5 text-green-500 flex-shrink-0"
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
										Save {yearlyDiscount}% vs monthly
									</span>
								</div>
								<div className="flex items-center gap-3">
									<svg
										className="w-5 h-5 text-green-500 flex-shrink-0"
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
										Only ${(yearlyPrice / 12).toFixed(2)}
										/month
									</span>
								</div>
							</div>
						</div>
						<div>
							{/* CTA Button */}
							<button
								onClick={() =>
									handleCheckout(
										STRIPE_PRICE_PRO_YEARLY,
										"YEARLY"
									)
								}
								disabled={isLoading !== null}
								className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-lg text-center block transition-all duration-200 mb-4 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
							>
								{isLoading === "YEARLY"
									? "Loading..."
									: `Pick Yearly plan`}
							</button>
							{/* Reassurance */}
							{hasActiveTrial && (
								<p className="text-center text-sm text-muted-foreground">
									No charge until your free trial ends in{" "}
									{trialDaysRemaining} day
									{trialDaysRemaining !== 1 ? "s" : ""}
								</p>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
