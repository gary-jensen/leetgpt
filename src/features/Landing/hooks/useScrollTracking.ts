"use client";

import { useEffect, useRef } from "react";
import { trackLandingSectionView } from "@/lib/analytics";

export const useScrollTracking = () => {
	const trackedSections = useRef<Set<string>>(new Set());

	useEffect(() => {
		const sections = [
			{ id: "hero", selector: "main > section:first-of-type" },
			{ id: "demo", selector: "#demo" },
			{ id: "features", selector: "#features" },
			{ id: "pricing", selector: "#pricing" },
			{ id: "cta", selector: "main > section:last-of-type" },
			{ id: "footer", selector: "footer" },
		];

		const totalSections = sections.length;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const sectionId =
							entry.target.getAttribute("data-section") ||
							entry.target.id ||
							"unknown";

						if (!trackedSections.current.has(sectionId)) {
							trackedSections.current.add(sectionId);

							// Calculate percentage viewed based on number of sections viewed
							const sectionIndex =
								sections.findIndex(
									(section) => section.id === sectionId
								) + 1;
							const percentViewed =
								Math.round(
									((sectionIndex / totalSections) * 100) / 10
								) * 10;

							trackLandingSectionView(sectionId, percentViewed);
						}
					}
				});
			},
			{ threshold: 0.5 } // Track when 50% visible
		);

		// Observe all sections
		sections.forEach(({ id, selector }) => {
			const element = document.querySelector(selector);
			if (element) {
				element.setAttribute("data-section", id);
				observer.observe(element);
			}
		});

		return () => observer.disconnect();
	}, []);
};
