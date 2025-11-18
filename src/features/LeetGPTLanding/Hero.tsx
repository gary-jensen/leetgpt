"use client";

import Link from "next/link";
import { trackLandingCTAClick } from "@/lib/analytics";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function Hero() {
	const { status } = useSession();
	return (
		<section className="relative min-h-[65vh] flex items-center justify-center px-4 py-20 md:pft-24 mb-0">
			{/* <div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] hero-gradient w-[1000px] h-[1000px] z-[0]"></div> */}

			<div className="max-w-7xl mx-auto flex justify-center grifd md:gfrid-cols-2 gap-12 items-center z-20">
				{/* Left Side - Content */}
				<div className="flex flex-col items-center">
					{/* Social Proof Badge */}
					{/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background-2 border border-border mb-6">
						<span className="text-sm font-semibold text-orange-500">
							1,200+
						</span>
						<span className="text-sm text-muted-foreground">
							developers practicing daily
						</span>
						<div className="flex -space-x-2">
							{[1, 2, 3].map((i) => (
								<div
									key={i}
									className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-background flex items-center justify-center text-white font-semibold text-xs"
								>
									{i}
								</div>
							))}
						</div>
					</div> */}

					{/* Main Headline */}
					<h1 className="flex flex-col items-center text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight leading-tight">
						{/* Master Algorithms with{" "}
						<span className="text-orange-500">AI-Powered</span>{" "}
						Guidance */}
						<span>LeetCode for</span>
						<span className="text-orange-500">
							&gt; Self-Taught{" "}
							<span className="text-white">Devs</span>
						</span>
					</h1>

					{/* Subheadline */}
					<p className="max-w-[80%] text-center text-lg md:text-xl text-[#c5c5c5] mb-8 leading-relaxed">
						You can build{" "}
						<span className="font-medium italic">
							full-stack apps
						</span>
						, but LeetCode problems are confusing: LeetGPT is for
						you.
					</p>
					{/* <p className="max-w-[80%] text-center text-base text-orange-400/70 mb-8 font-medium">
						ChatGPT + LeetCode ={" "}
						<span className="font-medium italic">LeetGPT</span>
					</p> */}
					{/* What makes us different */}
					<div className="flex flex-col sm:flex-row items-center gap-6 mb-8 text-sm md:text-base">
						<div className="flex items-center gap-2">
							<span className="text-orange-500 text-lg">📝</span>
							<span className="text-foreground">
								LeetCode problems
							</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-orange-500 text-lg">🤖</span>
							<span className="text-foreground">AI tutor</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-orange-500 text-lg">💡</span>
							<span className="text-foreground">
								Hints, not answers
							</span>
						</div>
					</div>

					{/* CTA Buttons */}
					<div className="flex flex-col sm:flex-row items-center gap-2 mb-3">
						<Link
							href={
								status === "authenticated"
									? "/problems"
									: "/login"
							}
							onClick={() => trackLandingCTAClick("hero")}
							className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25"
						>
							Start Learning
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
						<Link
							href="/problems"
							onClick={() =>
								trackLandingCTAClick("hero_secondary")
							}
							className="inline-flex items-center gap-2 bg-background-2 hover:bg-background-3 text-foreground font-medium px-8 py-4 rounded-lg  border border-border transition-all duration-200 hover:scale-105"
						>
							See Problems
						</Link>
					</div>

					{/* Trust Indicators */}
					<p className="text-sm text-muted-foreground">
						* No credit card required • 3 day free trial
					</p>
				</div>

				{/* Right Side - Visual */}
				<div className="relative">
					{/* <div className="bg-background-2 w-fit bordefr border-bforder rounded-lg p-6 "> */}
					<div className="aspect-video w-fit rounded-[25px] bordefr borfder-border flex items-center justify-center shadow-2xl relative">
						<div className="absolute left-[1px] top-[2px] right-[1px] bottom-[2px] bg-white rounded-[23px] opacity-95"></div>
						{/* <div className="text-center">
								<svg
									className="w-16 h-16 mx-auto mb-4 text-orange-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
									/>
								</svg>
								<p className="text-muted-foreground">
									Product Screenshot
								</p>
								<p className="text-sm text-muted-foreground mt-2">
									Algorithm workspace preview
								</p>
							</div> */}
						<Image
							src="/chat-example.png"
							alt="LeetGPT Workspace"
							width={500}
							height={428}
							className="rounded-lg overflow-hidden w-[600px] opacity-95"
						/>
					</div>
					{/* </div> */}
				</div>
			</div>
		</section>
	);
}
