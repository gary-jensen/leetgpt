"use client";

import { getSubscriptionStatusFromSession } from "@/lib/utils/subscription";
import { getSession, useSession } from "next-auth/react";
import { AlgoNavbar } from "./AlgoNavbar";
import { AlgoSidebar } from "./AlgoSidebar";
import { ProblemsList } from "./ProblemsList";
import { AlgoProblemMeta } from "@/types/algorithm-types";

interface ProblemsPageProps {
	problems: AlgoProblemMeta[];
	lessonsTotal: number;
	allTopics: string[];
}

function ProblemsPage({
	problems,
	lessonsTotal,
	allTopics,
}: ProblemsPageProps) {
	const { data: session } = useSession();
	// Check and expire trial if needed (handles everything internally)
	getSubscriptionStatusFromSession(session);

	return (
		<div className="min-h-screen bg-background-4">
			<AlgoNavbar />
			<AlgoSidebar
				problems={problems.map((p) => ({
					id: p.id,
					difficulty: p.difficulty as "easy" | "medium" | "hard",
				}))}
				lessonsTotal={lessonsTotal}
			/>
			<div className="max-w-7xl md:ml-[250px] 3xl:mx-auto pt-20 mx-auto px-4 py-4 ">
				<ProblemsList problems={problems} allTopics={allTopics} />
			</div>
		</div>
	);
}

export default ProblemsPage;
