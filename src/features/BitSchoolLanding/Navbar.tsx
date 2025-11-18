"use client";

import Link from "next/link";
import { Button } from "../../components/ui/button";
import { redirect } from "next/navigation";
import Image from "next/image";
import NavbarLoginButton from "./components/NavbarLoginButton";
import { useSession } from "next-auth/react";

export default function Navbar() {
	const { data: session } = useSession();
	// if (session?.user) {
	// 	redirect("/learn");
	// }
	return (
		<nav className="fifxed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<Link href="/" className="flex items-center gap-3">
						{/* <div className="flex items-center gap-1">
							<div className="w-2 h-4 bg-orange-500 rounded-sm"></div>
							<div className="w-2 h-6 bg-orange-500 rounded-sm"></div>
							<div className="w-2 h-8 bg-orange-500 rounded-sm"></div>
						</div> */}
						<Image
							src="/LeetGPT Logo.png"
							alt="LeetGPT"
							width={48}
							height={48}
						/>
						<span className="text-lg font-extrabold text-foreground">
							LeetGPT
						</span>
					</Link>

					{/* Navigation Links - Hidden on mobile */}
					<div className="hidden md:flex items-center space-x-8">
						<Link
							href="#demo"
							className="text-foreground hover:text-foreground transition-colors duration-200"
						>
							Demo
						</Link>
						<Link
							href="#features"
							className="text-foreground hover:text-foreground transition-colors duration-200"
						>
							Features
						</Link>
						<Link
							href="#pricing"
							className="text-foreground hover:text-foreground transition-colors duration-200"
						>
							Pricing
						</Link>
					</div>

					{/* Login Button */}
					{session?.user ? (
						<Button variant="correct">
							<Link href="/learn">Learn</Link>
						</Button>
					) : (
						<NavbarLoginButton />
					)}
				</div>
			</div>
		</nav>
	);
}
