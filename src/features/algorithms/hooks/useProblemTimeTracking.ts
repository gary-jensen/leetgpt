"use client";

import { useEffect, useRef, useState } from "react";
import { trackAlgoProblemTimeTracked, trackAlgoProblemSessionEnd } from "@/lib/analytics";

interface UseProblemTimeTrackingProps {
	problemId: string;
	isActive: boolean;
	completionStatus: "completed" | "in_progress" | "not_started";
	submissionCount: number;
}

export function useProblemTimeTracking({
	problemId,
	isActive,
	completionStatus,
	submissionCount,
}: UseProblemTimeTrackingProps) {
	const [activeTime, setActiveTime] = useState(0);
	const [totalTime, setTotalTime] = useState(0);
	const sessionStartTimeRef = useRef<number | null>(null);
	const lastActivityTimeRef = useRef<number | null>(null);
	const isPageVisibleRef = useRef(true);
	const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const hasTrackedSessionEndRef = useRef(false);

	// Initialize session start time
	useEffect(() => {
		if (isActive && !sessionStartTimeRef.current) {
			sessionStartTimeRef.current = Date.now();
			lastActivityTimeRef.current = Date.now();
		}
	}, [isActive]);

	// Track page visibility
	useEffect(() => {
		const handleVisibilityChange = () => {
			isPageVisibleRef.current = !document.hidden;
			if (isPageVisibleRef.current) {
				lastActivityTimeRef.current = Date.now();
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, []);

	// Track activity
	useEffect(() => {
		const updateActivity = () => {
			if (isPageVisibleRef.current) {
				lastActivityTimeRef.current = Date.now();
			}
		};

		document.addEventListener("mousemove", updateActivity);
		document.addEventListener("keydown", updateActivity);
		document.addEventListener("click", updateActivity);
		document.addEventListener("scroll", updateActivity);

		return () => {
			document.removeEventListener("mousemove", updateActivity);
			document.removeEventListener("keydown", updateActivity);
			document.removeEventListener("click", updateActivity);
			document.removeEventListener("scroll", updateActivity);
		};
	}, []);

	// Send periodic heartbeats (every 60 seconds)
	useEffect(() => {
		if (!isActive) {
			if (heartbeatIntervalRef.current) {
				clearInterval(heartbeatIntervalRef.current);
				heartbeatIntervalRef.current = null;
			}
			return;
		}

		heartbeatIntervalRef.current = setInterval(() => {
			if (
				sessionStartTimeRef.current &&
				lastActivityTimeRef.current &&
				isPageVisibleRef.current
			) {
				const currentTime = Date.now();
				const timeSinceLastActivity =
					currentTime - lastActivityTimeRef.current;

				// Only count as active if there was recent activity (within 1 minute)
				if (timeSinceLastActivity < 60000) {
					const newActiveTime = activeTime + 60;
					const newTotalTime = Math.floor(
						(currentTime - sessionStartTimeRef.current) / 1000
					);
					setActiveTime(newActiveTime);
					setTotalTime(newTotalTime);

					// Send heartbeat
					trackAlgoProblemTimeTracked(
						problemId,
						newActiveTime,
						newTotalTime,
						isPageVisibleRef.current
					);
				}
			}
		}, 60000);

		return () => {
			if (heartbeatIntervalRef.current) {
				clearInterval(heartbeatIntervalRef.current);
				heartbeatIntervalRef.current = null;
			}
		};
	}, [isActive, problemId, activeTime]);

	// Track session end on unmount or when problem changes
	useEffect(() => {
		return () => {
			if (
				sessionStartTimeRef.current &&
				!hasTrackedSessionEndRef.current
			) {
				const finalTotalTime = Math.floor(
					(Date.now() - sessionStartTimeRef.current) / 1000
				);
				hasTrackedSessionEndRef.current = true;

				trackAlgoProblemSessionEnd(
					problemId,
					finalTotalTime,
					activeTime,
					submissionCount,
					completionStatus
				);
			}
		};
	}, [problemId]); // Only track when problemId changes (problem switch)

	// Manual session end tracking (for when user navigates away)
	const endSession = () => {
		if (
			sessionStartTimeRef.current &&
			!hasTrackedSessionEndRef.current
		) {
			const finalTotalTime = Math.floor(
				(Date.now() - sessionStartTimeRef.current) / 1000
			);
			hasTrackedSessionEndRef.current = true;

			trackAlgoProblemSessionEnd(
				problemId,
				finalTotalTime,
				activeTime,
				submissionCount,
				completionStatus
			);
		}
	};

	return {
		activeTime,
		totalTime,
		endSession,
	};
}

