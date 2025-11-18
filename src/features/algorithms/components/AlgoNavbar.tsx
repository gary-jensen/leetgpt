"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import AuthButton from "@/components/AuthButton";

export function AlgoNavbar() {
	const pathname = usePathname();

	const links = [
		{ href: "/problems", label: "Problems" },
		// { href: "/learn", label: "Courses" },
	];

	return (
		<div className="fixed top-0 left-0 right-0 z-10 w-full border-b border-border bg-background bafckdrop-blur supports-[backdrop-filter]:bg-background">
			<div className="mx-auto px-4 h-12 flex items-center justify-between">
				<div className="flex items-center gap-6">
					<Link href="/" className="flex items-center gap-2">
						<Image
							src="/leetgpt_icon.svg"
							alt="LeetGPT"
							width={32}
							height={32}
						/>
						<span className="text-lg font-extrabold text-foreground">
							LeetGPT
						</span>
					</Link>
					<nav className="hidden md:flex items-center gap-4 text-sm">
						{links.map((l) => (
							<Link
								key={l.href}
								href={l.href}
								className={cn(
									"px-2 py-1 rounded-md hover:bg-white/10 transition-colors",
									pathname?.startsWith(
										`/${l.href.split("/")[1]}`
									)
										? "bg-white/10"
										: ""
								)}
							>
								{l.label}
							</Link>
						))}
					</nav>
				</div>
				<AuthButton size="sm" />
			</div>
		</div>
	);
}
