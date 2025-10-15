"use client";

import { useEffect } from "react";
import { initGA, startTimeTracking, trackSessionStart } from "@/lib/analytics";

export default function Analytics() {
	useEffect(() => {
		// Initialize Google Analytics
		initGA();

		// Track session start
		trackSessionStart();

		// Start time tracking
		startTimeTracking();
	}, []);

	return null;
}
