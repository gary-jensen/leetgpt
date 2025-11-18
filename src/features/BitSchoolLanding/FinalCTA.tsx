"use client";

import Link from "next/link";
import { trackLandingCTAClick } from "@/lib/analytics";

export default function FinalCTA() {
	return (
		<section className="py-20 px-4">
			<div className="max-w-4xl mx-auto text-center">
				<h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
					Ready to start coding?
				</h2>
				<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
					Join thousands of learners who are already mastering
					JavaScript with AI-powered guidance.
				</p>

				<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
					<Link
						href="/login"
						onClick={() => trackLandingCTAClick("final_cta")}
						className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-200 inline-flex items-center gap-2 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25"
					>
						Get started free
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
					<p className="text-sm text-muted-foreground">
						No credit card required • Start in 30 seconds
					</p>
				</div>
			</div>
		</section>
	);
}
