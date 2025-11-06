"use client";

import { useState } from "react";
import { ProblemBuilderForm } from "./ProblemBuilderForm";
import { ProblemBuilderCard } from "./ProblemBuilderCard";
import { useProblemBuilder } from "../hooks/useProblemBuilder";

interface BuilderInstance {
	builderId: string;
	problemName: string;
}

export function ProblemBuilder() {
	const [builders, setBuilders] = useState<BuilderInstance[]>([]);

	const handleStartBuilders = (
		newBuilders: { builderId: string; problemName: string }[]
	) => {
		setBuilders((prev) => [...prev, ...newBuilders]);
	};

	return (
		<div className="space-y-6">
			<ProblemBuilderForm onStartBuilders={handleStartBuilders} />

			{/* All Builders */}
			{builders.length > 0 && (
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">
						Builders ({builders.length})
					</h3>
					<div className="space-y-4">
						{builders.map((builder, index) => (
							<BuilderCardWrapper
								key={`${builder.builderId}-${index}`}
								builderId={builder.builderId}
								problemName={builder.problemName}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

function BuilderCardWrapper({
	builderId,
	problemName,
}: {
	builderId: string;
	problemName: string;
}) {
	const { state, cancel, finishManually } = useProblemBuilder(
		builderId,
		problemName
	);

	return (
		<ProblemBuilderCard
			state={state}
			onCancel={cancel}
			onFinishManually={finishManually}
		/>
	);
}
