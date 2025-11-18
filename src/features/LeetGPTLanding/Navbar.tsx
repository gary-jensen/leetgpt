"use client";

import { trackLandingCTAClick } from "@/lib/analytics";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
	const { status } = useSession();
	return (
		<nav className="sticky top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<Link href="/" className="flex items-center gap-3">
						<Image
							src="/leetgpt_icon.svg"
							alt="LeetGPT"
							width={40}
							height={40}
						/>
						<span className="text-xl font-extrabold text-foreground">
							LeetGPT
						</span>
					</Link>

					{/* Navigation Links - Hidden on mobile */}
					<div className="hidden md:flex items-center space-x-8">
						<Link
							href="#features"
							className="text-foreground hover:text-orange-500 transition-colors duration-200"
						>
							Features
						</Link>
						<Link
							href="#testimonials"
							className="text-foreground hover:text-orange-500 transition-colors duration-200"
						>
							Testimonials
						</Link>
						<Link
							href="#pricing"
							className="text-foreground hover:text-orange-500 transition-colors duration-200"
						>
							Pricing
						</Link>
						<Link
							href="#faq"
							className="text-foreground hover:text-orange-500 transition-colors duration-200"
						>
							FAQ
						</Link>
					</div>

					{/* Login Button */}
					{/* {session?.user ? (
						<Button variant="correct">
							<Link href="/problems">Problems</Link>
						</Button>
					) : (
						<NavbarLoginButton />
					)} */}
					<Link
						href={
							status === "authenticated" ? "/problems" : "/login"
						}
						onClick={() => trackLandingCTAClick("hero")}
						className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg tefxt-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25"
					>
						Learn Now
						{/* <svg
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
						</svg> */}
					</Link>
				</div>
			</div>
		</nav>
	);
}
