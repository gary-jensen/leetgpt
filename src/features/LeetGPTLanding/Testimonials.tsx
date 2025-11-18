export default function Testimonials() {
	const testimonials = [
		{
			rating: 5,
			quote: "I finally understand algorithms. The AI hints are perfect - they guide without giving away the answer.",
			author: "Sarah Chen",
			role: "Full-Stack Developer",
		},
		{
			rating: 5,
			quote: "This is how I always wanted to learn. Clear, helpful, and actually works.",
			author: "Marcus Johnson",
			role: "Self-Taught Developer",
		},
		{
			rating: 5,
			quote: "I feel ready for interviews for the first time. The practice problems are exactly what companies ask.",
			author: "Alex Rivera",
			role: "Software Engineer",
		},
	];

	return (
		<section id="testimonials" className="py-30 px-4 bg-[#212121]">
			<div className="max-w-7xl mx-auto">
				<h2 className="text-4xl md:text-5xl font-bold text-foreground mb-12 text-center">
					Loved by developers worldwide
				</h2>

				<div className="grid md:grid-cols-3 gap-8">
					{testimonials.map((testimonial, index) => (
						<div
							key={index}
							className="bg-background border border-border rounded-lg p-8"
						>
							{/* Stars */}
							<div className="flex gap-1 mb-4">
								{[...Array(testimonial.rating)].map((_, i) => (
									<svg
										key={i}
										className="w-5 h-5 text-orange-500"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
									</svg>
								))}
							</div>

							{/* Quote */}
							<p className="text-foreground mb-6 leading-relaxed italic">
								&quot;{testimonial.quote}&quot;
							</p>

							{/* Author */}
							<div>
								<p className="font-semibold text-foreground">
									{testimonial.author}
								</p>
								<p className="text-sm text-muted-foreground">
									{testimonial.role}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
