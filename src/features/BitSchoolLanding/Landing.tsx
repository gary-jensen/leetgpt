"use client";

import { trackEvent } from "@/lib/analytics";
import { useEffect } from "react";
import { useScrollTracking } from "./hooks/useScrollTracking";

const Landing = ({ children }: { children: React.ReactNode }) => {
	useScrollTracking();

	useEffect(() => {
		trackEvent("Landing", "page_view");
	}, []);

	return children;
};
export default Landing;
