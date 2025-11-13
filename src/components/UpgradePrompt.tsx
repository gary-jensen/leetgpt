"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface UpgradePromptProps {
	title?: string;
	message?: string;
	showTrialInfo?: boolean;
	trialDaysRemaining?: number;
}

export default function UpgradePrompt({
	title = "Upgrade to Continue",
	message = "You've reached your limit. Upgrade to PRO or Expert for higher limits.",
	showTrialInfo = false,
	trialDaysRemaining,
}: UpgradePromptProps) {
	return (
		<Card className="border-yellow-500/20 bg-yellow-500/5">
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{message}</CardDescription>
			</CardHeader>
			<CardContent>
				{showTrialInfo && trialDaysRemaining !== undefined && trialDaysRemaining > 0 && (
					<p className="text-sm text-muted-foreground mb-4">
						You have {trialDaysRemaining} day{trialDaysRemaining !== 1 ? "s" : ""} left in your free trial.
					</p>
				)}
				<ul className="space-y-2 text-sm">
					<li className="flex items-center gap-2">
						<svg
							className="w-4 h-4 text-green-500 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
						<span>Higher limits for hints and chat</span>
					</li>
					<li className="flex items-center gap-2">
						<svg
							className="w-4 h-4 text-green-500 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
						<span>Higher limits for submission feedback</span>
					</li>
					<li className="flex items-center gap-2">
						<svg
							className="w-4 h-4 text-green-500 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
						<span>All algorithm problems and lessons</span>
					</li>
				</ul>
			</CardContent>
			<CardFooter className="flex gap-2">
				<Link href="/billing" className="flex-1">
					<Button className="w-full">Pick a Plan</Button>
				</Link>
				<Link href="/billing/two-plans" className="flex-1">
					<Button className="w-full" variant="outline">
						View All Plans
					</Button>
				</Link>
			</CardFooter>
		</Card>
	);
}

