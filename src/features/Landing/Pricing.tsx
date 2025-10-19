import Link from "next/link";
import { trackLandingCTAClick } from "@/lib/analytics";

export default function Pricing() {
	const features = [
		"Unlimited AI-powered lessons",
		"Interactive code workspace",
		"Real-time feedback & hints",
		"Progress tracking & achievements",
		"Community support",
		"Mobile-friendly learning",
	];

	return (
		<section id="pricing" className="pt-8 mt-16 pb-12 px-4 bg-background-2">
			<div className="max-w-4xl mx-auto">
				<div className="text-center mb-12">
					<div className="inline-block px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-sm font-medium mb-4">
						PRICING
					</div>
					<h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
						Start learning for free
					</h2>
					<p className="text-xl text-muted-foreground">
						Early access pricing - no credit card required
					</p>
				</div>

				{/* Pricing Card */}
				<div className="bg-background border border-border rounded-lg p-8 max-w-md mx-auto">
					{/* Price Display */}
					<div className="text-center mb-8">
						<div className="flex items-center justify-center gap-3 mb-2">
							<span className="text-2xl text-muted-foreground line-through">
								$49/month
							</span>
							<span className="text-5xl font-bold text-orange-500">
								FREE
							</span>
						</div>
						<p className="text-muted-foreground">
							Early access • Limited time
						</p>
					</div>

					{/* Features List */}
					<div className="space-y-4 mb-8">
						{features.map((feature, index) => (
							<div
								key={index}
								className="flex items-center gap-3"
							>
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
									{feature}
								</span>
							</div>
						))}
					</div>

					{/* CTA Button */}
					<Link
						href="/login"
						onClick={() => trackLandingCTAClick("pricing")}
						className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-lg text-center block transition-all duration-200 mb-4 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25"
					>
						Start learning free
					</Link>

					{/* Reassurance */}
					<p className="text-center text-sm text-muted-foreground">
						No credit card required
					</p>
				</div>

				{/* Social Proof */}
				<div className="text-center mt-12">
					<div className="flex items-center justify-center gap-4 mb-4">
						{/* <div className="flex -space-x-2">
							{[1, 2, 3, 4, 5].map((i) => (
								<div
									key={i}
									className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-background flex items-center justify-center text-white font-semibold text-xs"
								>
									{i}
								</div>
							))}
						</div> */}
						<span className="text-muted-foreground">
							Join{" "}
							<span className="text-foreground font-semibold">
								1,200+
							</span>{" "}
							learners
						</span>
					</div>
				</div>
			</div>
		</section>
	);
}
