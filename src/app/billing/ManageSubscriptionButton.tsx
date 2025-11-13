"use client";

import { Button } from "@/components/ui/button";
import { createPortalSessionAction } from "@/lib/actions/billing";
import { toast } from "sonner";
import { useState } from "react";

export function ManageSubscriptionButton() {
	const [isLoading, setIsLoading] = useState(false);

	const handleManageSubscription = async () => {
		setIsLoading(true);
		try {
			const result = await createPortalSessionAction();
			if (result.success && result.url) {
				window.open(result.url, "_blank", "noopener,noreferrer");
				setIsLoading(false);
			} else {
				toast.error(
					result.error || "Failed to open subscription portal"
				);
				setIsLoading(false);
			}
		} catch (error) {
			console.error("Failed to create portal session:", error);
			toast.error("An unexpected error occurred. Please try again.");
			setIsLoading(false);
		}
	};

	return (
		<Button
			type="button"
			variant="default"
			onClick={handleManageSubscription}
			disabled={isLoading}
		>
			{isLoading ? "Loading..." : "Manage Subscription"}
		</Button>
	);
}
