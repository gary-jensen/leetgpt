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
import {
	trackAuthSignout,
	endSession,
	trackSignInButtonClick,
} from "@/lib/analytics";
import { UserIcon } from "lucide-react";
import SoundToggle from "./SoundToggle";
import { cn } from "@/lib/utils";
import { Session } from "next-auth";

export default function AuthButton({
	size = "md",
	session: serverSession,
}: {
	size?: "sm" | "md" | "lg";
	session?: Session | null;
}) {
	const { data: clientSession, status } = useSession();
	const session = serverSession ?? clientSession;

	// Note: Sign-in tracking is handled in ProgressContext to avoid duplicates
	// and to properly capture guest ID before migration

	const handleSignIn = async () => {
		// Track the signin button click event
		trackSignInButtonClick("navbar");
		await signIn();
	};

	// Handle sign out with tracking
	const handleSignOut = async () => {
		// Track the signout event
		trackAuthSignout();
		// End the session with explicit reason
		endSession("sign_out");
		// Perform the actual sign out
		await signOut();
		// Note: ProgressContext will detect the auth status change and track next signin
	};

	if (status === "loading") {
		return (
			<></>
			// <Button variant="outline" disabled>
			// 	Loading...
			// </Button>
		);
	}

	if (status === "unauthenticated") {
		return (
			<Button variant="correct" onClick={handleSignIn}>
				Sign In
			</Button>
		);
	}

	if (session) {
		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button className="focus:outline-none focus:ring-0 focus:ring-transparent rounded-full">
						<div
							className={cn(
								"w-10 h-10 rounded-full bg-[#455a64] flex items-center justify-center text-white text-xl font-medium cursor-pointer hover:bg-[#3d4e56]  transition-colors",
								size === "sm"
									? "w-7 h-7 text-sm"
									: size === "md"
									? "w-9 h-9 text-base"
									: "w-11 h-11 text-lg"
							)}
						>
							{session.user.name?.charAt(0).toUpperCase() || "U"}
						</div>
						{/* {session.user.image ? (
							<img
								src={session.user.image}
								alt={session.user.name || "User"}
								className="w-10 h-10 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
							/>
						) : (
							<div className="w-10 h-10 rounded-full bg-[#455a64] flex items-center justify-center text-white font-medium cursor-pointer hover:bg-[#3d4e56] transition-colors">
								{session.user.name?.charAt(0).toUpperCase() ||
									"U"}
							</div>
						)} */}
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56">
					<DropdownMenuLabel>
						<div className="flex justify-between">
							<div className="flex flex-col space-y-1">
								<p className="text-sm font-medium leading-none">
									{session.user.name}
								</p>
								<p className="text-xs leading-none text-muted-foreground">
									{session.user.email}
								</p>
							</div>
							<SoundToggle />
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={handleSignOut}
						className="cursor-pointer text-red-600"
					>
						Sign Out
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}

	return (
		<>
			<Button
				className="hidden xs:block"
				variant="run"
				onClick={handleSignIn}
			>
				Sign In
			</Button>
			<Button
				className="block xs:hidden"
				variant="run"
				onClick={handleSignIn}
			>
				<UserIcon size={20} />
			</Button>
		</>
	);
}
