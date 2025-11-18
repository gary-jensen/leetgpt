export default function HowItWorks() {
	const steps = [
		{
			number: "1",
			title: "Choose a Problem",
			description: "Browse our curated problem library",
			icon: (
				<svg
					className="w-12 h-12"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
					/>
				</svg>
			),
		},
		{
			number: "2",
			title: "Code & Test",
			description: "Write your solution and run tests instantly",
			icon: (
				<svg
					className="w-12 h-12"
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
		},
		{
			number: "3",
			title: "Learn & Improve",
			description: "Get AI feedback and track your progress",
			icon: (
				<svg
					className="w-12 h-12"
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
		},
	];

	return (
		<section id="how-it-works" className="py-20 px-4 bg-background-2">
			<div className="max-w-6xl mx-auto">
				<h2 className="text-4xl md:text-5xl font-bold text-foreground mb-12 text-center">
					Get started in 3 simple steps
				</h2>

				<div className="grid md:grid-cols-3 gap-8">
					{steps.map((step, index) => (
						<div
							key={index}
							className="bg-background border border-border rounded-lg p-8 text-center"
						>
							<div className="w-20 h-20 mx-auto mb-6 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500">
								{step.icon}
							</div>
							<div className="text-4xl font-bold text-orange-500 mb-4">
								{step.number}
							</div>
							<h3 className="text-xl font-semibold text-foreground mb-3">
								{step.title}
							</h3>
							<p className="text-muted-foreground leading-relaxed">
								{step.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

