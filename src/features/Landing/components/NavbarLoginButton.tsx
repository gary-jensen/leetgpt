"use client";

import Link from "next/link";
import { trackLandingCTAClick } from "@/lib/analytics";
import { Button } from "@/components/ui/button";

export default function NavbarLoginButton() {
	return (
		<Button variant="correct">
			<Link href="/login" onClick={() => trackLandingCTAClick("navbar")}>
				Log in
			</Link>
		</Button>
	);
}
