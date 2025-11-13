"use client";

import { useState } from "react";
import {
	STRIPE_PRICE_PRO_MONTHLY,
	STRIPE_PRICE_PRO_YEARLY,
	STRIPE_PRICE_EXPERT_MONTHLY,
	STRIPE_PRICE_EXPERT_YEARLY,
} from "@/lib/stripeConfig";
import { createCheckoutSessionAction } from "@/lib/actions/billing";
import { cn } from "@/lib/utils";
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
	const [isYearly, setIsYearly] = useState(false);
	const [isLoading, setIsLoading] = useState<string | null>(null);

	const proPriceId = isYearly
		? STRIPE_PRICE_PRO_YEARLY
		: STRIPE_PRICE_PRO_MONTHLY;
	const expertPriceId = isYearly
		? STRIPE_PRICE_EXPERT_YEARLY
		: STRIPE_PRICE_EXPERT_MONTHLY;

	const proMonthlyPrice = 9.99;
	const proYearlyPrice = 29.99;
	const expertMonthlyPrice = 19.99;
	const expertYearlyPrice = 59.99;

	const proOriginalMonthlyPrice = 29.99;
	const proOriginalYearlyPrice = 99.99;
	const expertOriginalMonthlyPrice = 59.99;
	const expertOriginalYearlyPrice = 179.99;

	const proDisplayPrice = isYearly ? proYearlyPrice : proMonthlyPrice;
	const expertDisplayPrice = isYearly
		? expertYearlyPrice
		: expertMonthlyPrice;
	const proOriginalPrice = isYearly
		? proOriginalYearlyPrice
		: proOriginalMonthlyPrice;
	const expertOriginalPrice = isYearly
		? expertOriginalYearlyPrice
		: expertOriginalMonthlyPrice;
	const discount = isYearly ? 67 : 67;

	// Only show "$0 then..." if trial is active AND has days remaining
	const hasActiveTrial = isTrialing && trialDaysRemaining > 0;

	const proPriceText = hasActiveTrial
		? `$0 then $${proDisplayPrice.toFixed(2)}/${
				isYearly ? "year" : "month"
		  } in ${trialDaysRemaining} day${trialDaysRemaining !== 1 ? "s" : ""}`
		: `$${proDisplayPrice.toFixed(2)}/${isYearly ? "year" : "month"}`;

	const expertPriceText = hasActiveTrial
		? `$0 then $${expertDisplayPrice.toFixed(2)}/${
				isYearly ? "year" : "month"
		  } in ${trialDaysRemaining} day${trialDaysRemaining !== 1 ? "s" : ""}`
		: `$${expertDisplayPrice.toFixed(2)}/${isYearly ? "year" : "month"}`;

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
			{/* Monthly/Yearly Toggle */}
			<div className="flex items-end justify-between">
				{/* Header */}
				<div className="flex flex-col gap-2">
					<Link href="/algorithms/problems">
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
				{/* {isYearly && (
					<span className="text-sm text-green-600 dark:text-green-400 font-medium">
						Save 67%
					</span>
				)} */}
				<div className="relative inline-flex bg-white/10 border border-border rounded-lg p-1">
					<div className="absolute -top-4 right-6 flex -translate-y-full animate-pulse items-center gap-2 md:right-10">
						<span className="sm whitespace-nowrap text-xs font-medium text-orange-500 md:text-sm">
							4x cheaper
						</span>
						<svg
							className="mt-3 w-6 rotate-[32deg] -scale-x-100 fill-orange-500 md:w-8"
							viewBox="0 0 219 41"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<g clipPath="url(#clip0_3_248)">
								<path d="M21.489 29.4305C36.9333 31.3498 51.3198 33.0559 65.7063 34.9753C66.7641 35.1885 67.6104 36.4681 69.9376 38.3875C63.1675 39.2406 57.8783 40.3069 52.5892 40.5201C38.6259 40.9467 24.8741 40.9467 10.9107 40.9467C9.21821 40.9467 7.5257 41.1599 5.83317 40.7334C0.332466 39.6671 -1.57164 36.0416 1.39028 31.1365C2.87124 28.7906 4.56377 26.658 6.46786 24.7386C13.6611 17.4876 21.0659 10.4499 28.4707 3.41224C29.7401 2.13265 31.6442 1.49285 34.183 0C34.6061 10.8765 23.8162 13.8622 21.489 22.3927C23.3931 21.9662 25.0856 21.7529 26.5666 21.3264C83.6894 5.54486 140.601 7.25099 197.3 22.606C203.224 24.0988 208.936 26.4447 214.649 28.5773C217.61 29.6437 220.149 31.9896 218.457 35.6151C216.976 39.2406 214.014 39.2406 210.629 37.7477C172.759 20.6866 132.561 18.7672 91.9404 19.407C70.7838 19.6203 50.0504 21.9662 29.5285 26.8713C26.9897 27.5111 24.4509 28.3641 21.489 29.4305Z"></path>
							</g>
							<defs>
								<clipPath id="clip0_3_248">
									<rect width="219" height="41"></rect>
								</clipPath>
							</defs>
						</svg>
					</div>
					<button
						type="button"
						onClick={() => setIsYearly(false)}
						className={cn(
							"w-20 px-2 py-2 text-sm font-medium rounded-md transition-all duration-200",
							!isYearly
								? "bg-background text-foreground"
								: "text-muted-foreground hover:text-foreground"
						)}
					>
						Monthly
					</button>
					<button
						type="button"
						onClick={() => setIsYearly(true)}
						className={cn(
							"w-20 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
							isYearly
								? "bg-background text-foreground"
								: "text-muted-foreground hover:text-foreground"
						)}
					>
						Yearly
					</button>
				</div>
			</div>

			{/* Plan Cards */}
			<div className="grid sm-2:grid-cols-2 gap-6 px-4">
				{/* PRO Plan Card */}
				<div className="max-w-lg w-full mx-auto flex flex-col justify-between gap-4 bg-background-2 border border-border rounded-lg p-8 hover:border-orange-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/10">
					<div>
						{/* Header with Title, Old Price, and Badge */}
						<div className="flex items-center justify-start gap-3 mb-6">
							<h3 className="text-2xl font-bold text-foreground">
								PRO
							</h3>
							<div className="flex items-center gap-2">
								{/* <span className="text-xs bg-orange-500/20 text-orange-600 dark:text-orange-400 px-2 py-1 rounded">
									Most Popular
								</span> */}
							</div>
						</div>
						{/* Price Display */}
						<div className="mb-8 flex items-center gap-2">
							<div className="flex items-baseline gap-2 mb-1">
								<span className="text-5xl font-bold text-white">
									{hasActiveTrial
										? "$0"
										: `$${proDisplayPrice.toFixed(2)}`}
								</span>
							</div>
							<div className="flex flex-col items-start justify-between gap-1">
								<div className="flex gap-2 items-center">
									<span className="text-sm text-muted-foreground line-through">
										${proOriginalPrice.toFixed(2)}
									</span>
									<span className="text-xs bg-orange-500/20 text-orange-600 dark:text-orange-400 px-2 py-1 rounded">
										{discount}% off
									</span>
								</div>
								{hasActiveTrial ? (
									<p className="text-sm text-muted-foreground">
										then ${proDisplayPrice.toFixed(2)}/
										{isYearly ? "year" : "month"} in{" "}
										{trialDaysRemaining} day
										{trialDaysRemaining !== 1 ? "s" : ""}
									</p>
								) : (
									<p className="text-sm text-muted-foreground">
										/{isYearly ? "year" : "month"}
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
							{/* <div className="flex items-center gap-3">
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
									Priority support
								</span>
							</div> */}
						</div>
					</div>
					<div>
						{/* CTA Button */}
						<button
							onClick={() => handleCheckout(proPriceId, "PRO")}
							disabled={isLoading !== null}
							className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-lg text-center block transition-all duration-200 mb-4 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
						>
							{isLoading === "PRO"
								? "Loading..."
								: `Pick PRO plan`}
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

				{/* EXPERT Plan Card */}
				<div className="max-w-lg w-full mx-auto flex flex-col justify-between gap-4 bg-background border border-orange-500/50 rounded-lg p-8 hover:border-orange-500 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25">
					<div>
						{/* Header with Title, Old Price, and Badge */}
						<div className="flex items-center justify-start gap-3 mb-6">
							<h3 className="text-2xl font-bold text-foreground">
								Expert
							</h3>
							<div className="flex items-center gap-2">
								{/* <span className="text-xs bg-orange-500/20 text-orange-600 dark:text-orange-400 px-2 py-1 rounded">
									Most Popular
								</span> */}
							</div>
						</div>
						{/* Price Display */}
						<div className="mb-8 flex items-center gap-2">
							<div className="flex items-baseline gap-2 mb-1">
								<span className="text-5xl font-bold text-white">
									{hasActiveTrial
										? "$0"
										: `$${expertDisplayPrice.toFixed(2)}`}
								</span>
							</div>
							<div className="flex flex-col items-start justify-between gap-1">
								<div className="flex gap-2 items-center">
									<span className="text-sm text-muted-foreground line-through">
										${expertOriginalPrice.toFixed(2)}
									</span>
									<span className="text-xs bg-orange-500/20 text-orange-600 dark:text-orange-400 px-2 py-1 rounded">
										{discount}% off
									</span>
								</div>
								{hasActiveTrial ? (
									<p className="text-sm text-muted-foreground">
										then ${expertDisplayPrice.toFixed(2)}/
										{isYearly ? "year" : "month"} in{" "}
										{trialDaysRemaining} day
										{trialDaysRemaining !== 1 ? "s" : ""}
									</p>
								) : (
									<p className="text-sm text-muted-foreground">
										/{isYearly ? "year" : "month"}
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
									All PRO features
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
									Higher limits for hints and chat
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
									Higher limits for submission feedback
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
									Priority support
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
									First access to new features
								</span>
							</div>
						</div>
					</div>

					<div>
						{/* CTA Button */}
						<button
							onClick={() =>
								handleCheckout(expertPriceId, "EXPERT")
							}
							disabled={isLoading !== null}
							className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-lg text-center block transition-all duration-200 mb-4 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
						>
							{isLoading === "EXPERT"
								? "Loading..."
								: `Pick Expert plan`}
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
	);
}
