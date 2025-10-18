"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { initGA, startTimeTracking, trackSessionStart } from "@/lib/analytics";
import { getOrCreateGuestId } from "@/lib/guestId";

export default function Analytics() {
	const { status } = useSession();

	useEffect(() => {
		// Initialize Google Analytics
		initGA();

		// Track session start
		trackSessionStart();

		// Start time tracking
		startTimeTracking();
	}, []);

	useEffect(() => {
		// Create guest ID for unauthenticated users only
		if (status === "unauthenticated") {
			getOrCreateGuestId().catch((error) => {
				// console.error("Failed to initialize guest ID:", error);
			});
		}
	}, [status]);

	return null;
}
