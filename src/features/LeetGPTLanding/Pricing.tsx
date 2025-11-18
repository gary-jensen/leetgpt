"use client";

import Link from "next/link";
import { trackLandingCTAClick } from "@/lib/analytics";

export default function Pricing() {
	const plans = [
		// {
		// 	name: "Free",
		// 	price: "$0",
		// 	period: "/month",
		// 	features: [
		// 		"5 problems per day",
		// 		"Basic AI hints",
		// 		"Submission history",
		// 		"Progress tracking",
		// 	],
		// 	cta: "Start Free",
		// 	ctaLink: "/problems",
		// 	highlighted: false,
		// },
		{
			name: "Monthly",
			price: "$9.99",
			period: "/month",
			originalPrice: "$39.99",
			originalPeriod: "/month",
			features: [
				"Unlimited problems",
				"AI-Powered hints and chat",
				"Submission feedback",
				"Advanced AI guidance",
			],
			cta: "Get Started",
			ctaLink: "/login",
		},
		{
			name: "Yearly",
			price: "$4.17",
			period: "/month",
			annualPrice: "$49.99",
			annualPeriod: "/year",
			badge: "Most Popular",
			highlighted: true,
			features: [
				"All Monthly features",
				"Save 72% vs monthly",
				`Save 90% vs LeetCode Premium`,
				"Only $4.17/month",
			],
			cta: "Start Learning",
			ctaLink: "/login",
		},
	];

	return (
		<section id="pricing" className="py-20 px-4">
			<div className="max-w-5xl mx-auto">
				<h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-center">
					Simple pricing for real learning
				</h2>
				<p className="text-xl text-muted-foreground mb-12 text-center">
					Choose the plan that works for you
				</p>

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
											{plan.price}
										</span>
										<span className="text-muted-foreground">
											{plan.period}
										</span>
									</div>
									{plan.annualPrice && (
										<div className="mt-2 text-sm text-muted-foreground">
											billed annually at{" "}
											<span className="font-semibold text-foreground">
												{plan.annualPrice}
											</span>
											{plan.annualPeriod}
										</div>
									)}
									{plan.originalPrice && (
										<div className="mt-2 text-sm text-muted-foreground">
											<span className="text-muted-foreground line-through">
												{plan.originalPrice}
											</span>
											{plan.originalPeriod}
										</div>
									)}
								</div>
								<ul className="space-y-3 mb-8">
									{plan.features.map(
										(feature, featureIndex) => (
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
										)
									)}
								</ul>
							</div>

							<Link
								href={plan.ctaLink}
								onClick={() =>
									trackLandingCTAClick(
										`pricing_${plan.name.toLowerCase()}`
									)
								}
								className={`w-full font-semibold py-3 px-6 rounded-lg text-center block transition-all duration-200 ${
									plan.highlighted
										? "bg-orange-500 hover:bg-orange-600 text-white hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25"
										: "bg-background-2 hover:bg-background-3 text-foreground border border-border hover:border-orange-500"
								}`}
							>
								{plan.cta}
							</Link>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
