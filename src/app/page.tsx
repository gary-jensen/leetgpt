"use client";

import { useEffect } from "react";
import Demo from "@/features/Landing/Demo";
import Features from "@/features/Landing/Features";
import FinalCTA from "@/features/Landing/FinalCTA";
import Footer from "@/features/Landing/Footer";
import Hero from "@/features/Landing/Hero";
import Navbar from "@/features/Landing/Navbar";
import Pricing from "@/features/Landing/Pricing";
import { useScrollTracking } from "@/features/Landing/hooks/useScrollTracking";
import { trackEvent } from "@/lib/analytics";

export default function Home() {
	useScrollTracking();

	useEffect(() => {
		trackEvent("Landing", "page_view");
	}, []);

	return (
		<main className="min-h-screen bg-background font-dm-sans">
			<Navbar />
			<Hero />
			<Demo />
			<Features />
			<Pricing />
			<FinalCTA />
			<Footer />
		</main>
	);
}
