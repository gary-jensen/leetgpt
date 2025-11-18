"use client";

import { useState } from "react";

export default function FAQ() {
	const [openIndex, setOpenIndex] = useState<number | null>(0);

	const faqs = [
		{
			question: "Do I need a CS degree?",
			answer: "No. LeetGPT is designed for self-taught developers and anyone who wants to learn algorithms.",
		},
		{
			question: "Will you give me the answers?",
			answer: "No. We provide hints and guidance to help you think through problems, but you'll solve them yourself.",
		},
		{
			question: "Is it beginner-friendly?",
			answer: "Yes, but you'll still do the work. We explain concepts simply, but you need to practice.",
		},
		{
			question: "Do I need an account?",
			answer: "You can view problems without signing up. But you need an account to run code, and get AI guidance.",
		},
		{
			question: "Can this help with interviews?",
			answer: "Yes. Our problems are similar to what companies ask in technical interviews, and our AI helps you think like an interviewer.",
		},
		{
			question: "Can I cancel anytime?",
			answer: "Yes. Cancel anytime with no questions asked. You'll keep access until the end of your billing period.",
		},
		{
			question: "Do you offer refunds?",
			answer: "Yes. If you're not satisfied within 30 days, we'll refund your payment.",
		},
	];

	return (
		<section id="faq" className="py-20 px-4">
			<div className="max-w-3xl mx-auto">
				<h2 className="text-4xl md:text-5xl font-bold text-foreground mb-12 text-center">
					Frequently Asked Questions
				</h2>

				<div className="space-y-4">
					{faqs.map((faq, index) => (
						<div
							key={index}
							className="bg-background border border-border rounded-lg overflow-hidden"
						>
							<button
								onClick={() =>
									setOpenIndex(
										openIndex === index ? null : index
									)
								}
								className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-background-2 transition-colors"
							>
								<span className="text-lg font-semibold text-foreground">
									{faq.question}
								</span>
								<svg
									className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${
										openIndex === index ? "rotate-180" : ""
									}`}
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M19 9l-7 7-7-7"
									/>
								</svg>
							</button>
							{openIndex === index && (
								<div className="px-6 py-4 border-t border-border bg-background-2">
									<p className="text-muted-foreground leading-relaxed">
										{faq.answer}
									</p>
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
