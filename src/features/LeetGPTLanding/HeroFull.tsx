"use client";

import Link from "next/link";
import { trackLandingCTAClick } from "@/lib/analytics";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function HeroFull() {
	const { status } = useSession();
	return (
		<section className="relative min-h-[65vh] flex items-center justify-center px-4 py-20 md:pft-24 mb-0 bg-gradient-to-b from-background via-background to-[#161616]">
			{/* <div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] hero-gradient w-[1000px] h-[1000px] z-[0]"></div> */}

			<div className="max-w-7xl mx-auto flex flex-col justify-center grifd md:gfrid-cols-2 gap-12 items-center z-20">
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
						<span className="text-orange-500 text-center">
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
					<div className="hidden flex-col sm:flex sm:flex-row items-center gap-6 mb-8 text-sm md:text-base">
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
						{/* <Link
							href="/problems"
							onClick={() =>
								trackLandingCTAClick("hero_secondary")
							}
							className="inline-flex items-center gap-2 bg-background-2 hover:bg-background-3 text-foreground font-medium px-8 py-4 rounded-lg  border border-border transition-all duration-200 hover:scale-105"
						>
							See Problems
						</Link> */}
					</div>

					{/* Trust Indicators */}
					<p className="text-sm text-muted-foreground">
						* No credit card required • 3 day free trial
					</p>
				</div>

				{/* Right Side - Visual */}
				<div className="relative  roufnded-2xl mt-4 sm:mt-8 md:mt-8">
					{/* <div className="bg-background-2 w-fit bordefr border-bforder rounded-lg p-6 "> */}
					<div className="aspefct-video w-fit rounded-[20px] bordefr borfder-border flex flex-col bg-white/2 items-center justify-center shadow-[0_0_80px_rgba(249,115,22,0.6)] relative overflow-hidden">
						<div className="w-full h-[32px] flex items-center gap-2 px-4">
							<div className="w-3 h-3 rounded-full bg-[#FF5F57]"></div>
							<div className="w-3 h-3 rounded-full bg-[#FEBC2E]"></div>
							<div className="w-3 h-3 rounded-full bg-[#28C840]"></div>
						</div>
						<Image
							src="/whole-workspace.png"
							alt="LeetGPT Workspace"
							width={3680}
							height={1914}
							className="hidden sm:block overflow-hidden w-[1500px] opacity-95"
						/>
						<Image
							src="/chat-example.png"
							alt="LeetGPT Workspace"
							width={3680}
							height={1914}
							className="block sm:hidden overflow-hidden w-[1500px] opacity-95"
						/>
					</div>
					{/* </div> */}
				</div>
			</div>
		</section>
	);
}
