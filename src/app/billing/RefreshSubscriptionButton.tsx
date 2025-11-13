"use client";

import { Button } from "@/components/ui/button";
import { syncMySubscriptionAction } from "@/lib/actions/billing";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function RefreshSubscriptionButton() {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleRefresh = async () => {
		setIsLoading(true);
		try {
			const result = await syncMySubscriptionAction();
			if (result.success) {
				toast.success("Subscription status updated!");
				// Refresh the page to show updated status
				router.refresh();
			} else {
				toast.error(
					result.error || "Failed to refresh subscription status"
				);
			}
		} catch (error) {
			console.error("Failed to sync subscription:", error);
			toast.error("An unexpected error occurred. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button
			type="button"
			variant="outline"
			onClick={handleRefresh}
			disabled={isLoading}
		>
			{isLoading ? "Refreshing..." : "Refresh Status"}
		</Button>
	);
}

