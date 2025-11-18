"use client";

import Link from "next/link";
import { trackLandingCTAClick } from "@/lib/analytics";
import { useSession } from "next-auth/react";

export default function FinalCTA() {
	const { status } = useSession();
	return (
		<section
			className="py-40 px-4 bg-orfange-500 radial-gradient
		from-orange-500/80 to-orange-500/20"
			style={{
				backgroundImage:
					"radial-gradient(circle, #ff6900ee 20%, #ff690080 70%)",
			}}
		>
			<div className="max-w-4xl mx-auto text-center">
				<h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
					Ready to master algorithms?
				</h2>
				<p className="text-xl text-orange-50 mb-8 max-w-2xl mx-auto">
					Join 1,200+ developers improving their problem-solving
					skills
				</p>

				<Link
					href={status === "authenticated" ? "/problems" : "/login"}
					onClick={() => trackLandingCTAClick("final_cta")}
					className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-orange-500 font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
				>
					Get Started Free
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
				<p className="text-sm text-orange-50 mt-4">
					No credit card required • 3 day free trial
				</p>
			</div>
		</section>
	);
}
