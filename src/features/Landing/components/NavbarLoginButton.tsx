"use client";

import Link from "next/link";
import { trackLandingCTAClick } from "@/lib/analytics";

export default function NavbarLoginButton() {
	return (
		<Link
			href="/login"
			onClick={() => trackLandingCTAClick("navbar")}
			className="bg-background-2 hover:bg-background-3 text-foreground font-medium px-4 py-2 rounded-lg border border-border transition-colors duration-200"
		>
			Log in
		</Link>
	);
}
