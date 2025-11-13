"use client";

import { useEffect, useState } from "react";
import { getCurrentPlanTier } from "@/lib/actions/billing";
import { getSubscriptionStatus, SubscriptionStatusValue } from "@/lib/actions/billing";

export default function ProBadge() {
	const [planTier, setPlanTier] = useState<"PRO" | "EXPERT" | null>(null);
	const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatusValue>(
		null
	);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchBadgeInfo() {
			try {
				const [tier, status] = await Promise.all([
					getCurrentPlanTier(),
					getSubscriptionStatus(),
				]);
				setPlanTier(tier);
				setSubscriptionStatus(status?.subscriptionStatus || null);
			} catch (error) {
				console.error("Failed to fetch badge info:", error);
			} finally {
				setIsLoading(false);
			}
		}

		fetchBadgeInfo();
	}, []);

	// Only show badge for active subscribers (not trial)
	if (
		isLoading ||
		subscriptionStatus !== "active" ||
		!planTier
	) {
		return null;
	}

	return (
		<span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-primary/20 text-primary border border-primary/20">
			{planTier === "EXPERT" ? "Expert" : "PRO"}
		</span>
	);
}

