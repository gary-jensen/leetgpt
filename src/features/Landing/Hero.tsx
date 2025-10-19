import Link from "next/link";

export default function Hero() {
	return (
		<section className="relative min-h-scrfeen flex items-center justify-center px-4 pt-12 md:pt-24 mb-0">
			<div className="max-w-4xl mx-auto text-center">
				{/* Badge */}
				<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background-2 border border-border mb-8">
					<span className="text-sm font-semibold text-orange-500">
						Free
					</span>
					<span className="text-sm font-medium text-muted-foreground">
						Early Access
					</span>
				</div>

				{/* Main Headline */}
				<h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
					Learn JavaScript with{" "}
					<span className="text-orange-500">AI</span>
				</h1>

				{/* Subheadline */}
				<p className="text-lg md:text-lg text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
					AI tutor that adapts to your learning style. <br />
					Master coding 10x faster with personalized feedback.
				</p>

				{/* CTA Button with Pricing Badge */}
				<div className="relative inline-block mb-4 group">
					{/* Pricing Badge */}
					<div className="absolute -top-4 -right-7 bg-background-2 border border-border rounded-full px-3 py-1 text-sm z-50 group-hover:scale-110 group-hover:-top-5 group-hover:-right-8 transition-all duration-200">
						<span className="text-muted-foreground line-through mr-1">
							$49
						</span>
						<span className="text-orange-500 font-bold">FREE</span>
					</div>

					<Link
						href="/login"
						className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25"
					>
						Sign up for FREE
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</Link>
				</div>

				{/* Reassurance Text */}
				<p className="text-sm text-muted-foreground mb-4">
					*No card required
				</p>

				{/* Social Proof */}
				<div className="flex items-center justify-center gap-4">
					{/* Avatar placeholders */}
					{/* <div className="flex -space-x-2">
						
						{[1, 2, 3, 4, 5].map((i) => (
							<div
								key={i}
								className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-background flex items-center justify-center text-white font-semibold text-sm"
							>
								{i}
							</div>
						))}
					</div> */}
					<span className="font-light text-muted-foreground">
						Loved by{" "}
						<span className="text-foreground font-semibold">
							1,152
						</span>{" "}
						learners
					</span>
				</div>
			</div>
		</section>
	);
}
