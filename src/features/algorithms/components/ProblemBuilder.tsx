"use client";

import { useEffect, useState } from "react";
import { ProblemBuilderForm } from "./ProblemBuilderForm";
import { ProblemBuilderCard } from "./ProblemBuilderCard";
import { getBuilderState } from "@/lib/actions/adminProblemBuilderActions";
import { BuilderState } from "@/lib/utils/problemBuilderUtils";
import { Separator } from "@/components/ui/separator";

export function ProblemBuilder() {
	const [builderIds, setBuilderIds] = useState<string[]>([]);
	const [builderStates, setBuilderStates] = useState<
		Map<string, BuilderState>
	>(new Map());

	// Poll for builder state updates
	useEffect(() => {
		if (builderIds.length === 0) {
			return;
		}

		const pollInterval = setInterval(async () => {
			const newStates = new Map<string, BuilderState>();

			for (const builderId of builderIds) {
				const state = await getBuilderState(builderId);
				if (state) {
					newStates.set(builderId, state);
				}
			}

			setBuilderStates(newStates);

			// Remove completed/failed builders from polling after a delay
			const allFinished = Array.from(newStates.values()).every(
				(state) =>
					state.phase === "completed" || state.phase === "failed"
			);

			if (allFinished && builderIds.length > 0) {
				// Keep polling for a bit longer, then stop
				setTimeout(() => {
					clearInterval(pollInterval);
				}, 5000);
			}
		}, 2500); // Poll every 2.5 seconds

		return () => clearInterval(pollInterval);
	}, [builderIds]);

	const handleStartBuilders = (newBuilderIds: string[]) => {
		setBuilderIds((prev) => [...prev, ...newBuilderIds]);
	};

	const activeBuilders = Array.from(builderStates.values()).filter(
		(state) => state.phase !== "completed" && state.phase !== "failed"
	);

	const completedBuilders = Array.from(builderStates.values()).filter(
		(state) => state.phase === "completed"
	);

	const failedBuilders = Array.from(builderStates.values()).filter(
		(state) => state.phase === "failed"
	);

	return (
		<div className="space-y-6">
			<ProblemBuilderForm onStartBuilders={handleStartBuilders} />

			{/* Active Builders */}
			{activeBuilders.length > 0 && (
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">
						Active Builders ({activeBuilders.length})
					</h3>
					<div className="space-y-4">
						{activeBuilders.map((state) => (
							<ProblemBuilderCard
								key={state.builderId}
								state={state}
							/>
						))}
					</div>
				</div>
			)}

			{/* Completed Builders */}
			{completedBuilders.length > 0 && (
				<div className="space-y-4">
					<Separator />
					<h3 className="text-lg font-semibold text-green-600">
						Completed ({completedBuilders.length})
					</h3>
					<div className="space-y-4">
						{completedBuilders.map((state) => (
							<ProblemBuilderCard
								key={state.builderId}
								state={state}
							/>
						))}
					</div>
				</div>
			)}

			{/* Failed Builders */}
			{failedBuilders.length > 0 && (
				<div className="space-y-4">
					<Separator />
					<h3 className="text-lg font-semibold text-destructive">
						Failed ({failedBuilders.length})
					</h3>
					<div className="space-y-4">
						{failedBuilders.map((state) => (
							<ProblemBuilderCard
								key={state.builderId}
								state={state}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
