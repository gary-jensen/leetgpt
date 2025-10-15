"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "./ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { trackAuthSignin, trackAuthSignup } from "@/lib/analytics";
import { useEffect, useRef } from "react";

export default function AuthButton() {
	const { data: session, status } = useSession();
	const hasTrackedRef = useRef(false);

	// Track sign in/sign up when user becomes authenticated
	useEffect(() => {
		if (
			session?.user &&
			status === "authenticated" &&
			!hasTrackedRef.current
		) {
			hasTrackedRef.current = true;
			// We can't easily distinguish between signup and signin in NextAuth
			// For MVP, we'll track as signin. Could enhance later with database check
			trackAuthSignin();
		}
	}, [session, status]);

	if (status === "loading") {
		return (
			<></>
			// <Button variant="outline" disabled>
			// 	Loading...
			// </Button>
		);
	}

	if (session) {
		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full">
						{session.user.image ? (
							<img
								src={session.user.image}
								alt={session.user.name || "User"}
								className="w-10 h-10 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
							/>
						) : (
							<div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium cursor-pointer hover:bg-blue-600 transition-colors">
								{session.user.name?.charAt(0).toUpperCase() ||
									"U"}
							</div>
						)}
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56">
					<DropdownMenuLabel>
						<div className="flex flex-col space-y-1">
							<p className="text-sm font-medium leading-none">
								{session.user.name}
							</p>
							<p className="text-xs leading-none text-muted-foreground">
								{session.user.email}
							</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={() => signOut()}
						className="cursor-pointer text-red-600"
					>
						Sign Out
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}

	return (
		<Button variant="run" onClick={() => signIn("google")}>
			Sign In
		</Button>
	);
}
