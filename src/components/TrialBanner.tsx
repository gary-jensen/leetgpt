"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";
import Link from "next/link";

export default function TrialBanner() {
	const { data: session, status } = useSession();

	const trialInfo = useMemo(() => {
		// Only show banner for app_trialing status (app-managed trial)
		if (
			status !== "authenticated" ||
			session?.user?.subscriptionStatus !== "app_trialing" ||
			!session.user.stripeCurrentPeriodEnd
		) {
			return null;
		}

		const now = new Date();
		const trialEnd = new Date(session.user.stripeCurrentPeriodEnd);
		const daysRemaining = Math.ceil(
			(trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
		);
		return Math.max(0, daysRemaining);
	}, [session, status]);

	if (status === "loading" || trialInfo === null || trialInfo <= 0) {
		return null;
	}

	return (
		<div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-1 text-center">
			<p className="text-yellow-600 dark:text-yellow-400 text-[13px] font-medium">
				You have {trialInfo} day
				{trialInfo !== 1 ? "s" : ""} left in your free trial -{" "}
				<Link
					href="/billing"
					className="underline hover:no-underline font-semibold"
				>
					Pick a plan for $0 to keep using without interruption
				</Link>
			</p>
		</div>
	);
}
