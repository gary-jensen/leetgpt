export default function Features() {
	const features = [
		{
			icon: (
				<svg
					className="w-8 h-8"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
					/>
				</svg>
			),
			title: "AI-Powered Guidance",
			description:
				"Get instant, personalized feedback on your code. Our AI understands your learning style and provides targeted help when you need it most.",
		},
		{
			icon: (
				<svg
					className="w-8 h-8"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
					/>
				</svg>
			),
			title: "Interactive Code Execution",
			description:
				"Write and run JavaScript code in real-time. See your results instantly and experiment with different approaches in a safe environment.",
		},
		{
			icon: (
				<svg
					className="w-8 h-8"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M13 10V3L4 14h7v7l9-11h-7z"
					/>
				</svg>
			),
			title: "Gamified Learning",
			description:
				"Earn XP, unlock achievements, and track your progress through skill trees. Make learning addictive with our progression system.",
		},
	];

	return (
		<section id="features" className="pt-16 px-4">
			<div className="max-w-6xl mx-auto">
				<div className="text-center mb-16">
					<h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
						Why learn with AI?
					</h2>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
						Traditional coding courses are one-size-fits-all. Our AI
						adapts to you.
					</p>
				</div>

				<div className="grid md:grid-cols-3 gap-8">
					{features.map((feature, index) => (
						<div
							key={index}
							className="bg-background-2 border border-border rounded-lg p-8 hover:border-orange-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/10"
						>
							<div className="text-orange-500 mb-4">
								{feature.icon}
							</div>
							<h3 className="text-xl font-semibold text-foreground mb-3">
								{feature.title}
							</h3>
							<p className="text-muted-foreground leading-relaxed">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
