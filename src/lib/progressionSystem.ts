// Progression system for XP, levels, and skill tree

import getNodeName from "@/features/Workspace/lesson-data/nodes";

export interface SkillNode {
	id: string;
	name: string;
	lessons: string[];
	completed: boolean;
	progress: number; // 0-1, how many lessons completed in this node
}

export interface UserProgress {
	xp: number;
	level: number;
	currentSkillNodeId: string;
	lessonProgress: Record<string, { currentStep: number; completed: boolean }>;
	skillNodes: SkillNode[];
}

// XP calculation:
// Derived from: Σ(i=1 to level-1) floor((i + 400 × 2^(i/7)) / 4)
// Mathematical derivation gives us a direct formula without loops
export function getXPRequiredForLevel(level: number): number {
	if (level <= 1) return 0;

	const n = level - 1;

	// Sum of integers from 1 to n: n * (n + 1) / 2
	const sumOfIntegers = (n * (n + 1)) / 2;

	// Sum of geometric series: 2^(1/7) * (2^(n/7) - 1) / (2^(1/7) - 1)
	const r = Math.pow(2, 1 / 7); // 2^(1/7)
	const geometricSum = (r * (Math.pow(2, n / 7) - 1)) / (r - 1);

	// Total XP = (sumOfIntegers + 361.38 * geometricSum) / 4
	// Multiplier adjusted so level 2 requires exactly 100 XP
	const totalXP = (sumOfIntegers + 361.3837420412988 * geometricSum) / 4;

	return Math.floor(totalXP);
}

export function getLevelFromXP(xp: number): number {
	let level = 1;
	while (getXPRequiredForLevel(level) <= xp) {
		level++;
	}
	return level - 1;
}

export function getXPProgressForLevel(xp: number, level: number): number {
	const currentLevelXP = getXPRequiredForLevel(level);
	const nextLevelXP = getXPRequiredForLevel(level + 1);
	const progressXP = xp - currentLevelXP;
	const totalXPNeeded = nextLevelXP - currentLevelXP;

	return Math.max(0, Math.min(1, progressXP / totalXPNeeded));
}

export function calculateSkillNodeProgress(
	lessonProgress: Record<string, { currentStep: number; completed: boolean }>,
	node: SkillNode
): number {
	const completedInNode = node.lessons.filter((lessonId) =>
		isLessonCompleted(lessonProgress, lessonId)
	).length;

	return completedInNode / node.lessons.length;
}

export function isSkillNodeCompleted(
	lessonProgress: Record<string, { currentStep: number; completed: boolean }>,
	node: SkillNode
): boolean {
	return node.lessons.every((lessonId) =>
		isLessonCompleted(lessonProgress, lessonId)
	);
}

// Recalculate progress and completed status for all skill nodes
export function recalculateSkillNodes(
	skillNodes: SkillNode[],
	lessonProgress: Record<string, { currentStep: number; completed: boolean }>
): SkillNode[] {
	return skillNodes.map((node) => ({
		...node,
		progress: calculateSkillNodeProgress(lessonProgress, node),
		completed: isSkillNodeCompleted(lessonProgress, node),
	}));
}

// Calculate current skill node ID from lesson progress and lesson metadata
export function calculateCurrentSkillNodeId(
	lessonProgress: Record<string, { currentStep: number; completed: boolean }>,
	lessonMetadata: { id: string; skillNodeId: string }[]
): string {
	// Find the first incomplete lesson
	const firstIncompleteLesson = lessonMetadata.find(
		(lesson) => !isLessonCompleted(lessonProgress, lesson.id)
	);

	// If found, return its skill node
	if (firstIncompleteLesson) {
		return firstIncompleteLesson.skillNodeId;
	}

	// If all lessons are complete, return the last skill node
	const lastLesson = lessonMetadata[lessonMetadata.length - 1];
	return lastLesson?.skillNodeId || "variables";
}

// Build skill tree dynamically from lesson metadata
export function buildSkillTreeFromLessons(
	lessonMetadata: { id: string; skillNodeId: string }[]
): SkillNode[] {
	const skillNodeMap = new Map<string, { lessons: string[]; name: string }>();

	// Group lessons by skillNodeId
	lessonMetadata.forEach((lesson) => {
		const skillNodeId = lesson.skillNodeId;
		if (!skillNodeMap.has(skillNodeId)) {
			// Capitalize the skill node name
			// const name =
			// 	(skillNodeId.charAt(0).toUpperCase() + skillNodeId.slice(1));
			const name = getNodeName(skillNodeId);

			skillNodeMap.set(skillNodeId, { lessons: [], name });
		}
		skillNodeMap.get(skillNodeId)!.lessons.push(lesson.id);
	});

	// Convert map to array of SkillNodes
	return Array.from(skillNodeMap.entries()).map(
		([id, { lessons, name }]) => ({
			id,
			name,
			lessons,
			completed: false,
			progress: 0,
		})
	);
}

// Default skill tree structure (fallback if no lessons provided)
export const defaultSkillTree: SkillNode[] = [
	{
		id: "variables",
		name: "Variables",
		lessons: [],
		completed: false,
		progress: 0,
	},
];

export function createInitialProgress(
	lessonMetadata?: { id: string; skillNodeId: string }[]
): UserProgress {
	const skillTree = lessonMetadata
		? buildSkillTreeFromLessons(lessonMetadata)
		: defaultSkillTree;
	const firstNodeId = skillTree[0]?.id || "variables";

	return {
		xp: 0,
		level: 1,
		currentSkillNodeId: firstNodeId,
		lessonProgress: {},
		skillNodes: skillTree.map((node) => ({ ...node })),
	};
}

export function updateProgressAfterLesson(
	currentProgress: UserProgress,
	lessonId: string,
	skillNodeId: string,
	xpReward: number,
	totalSteps?: number
): UserProgress {
	const newXP = currentProgress.xp + xpReward;
	const newLevel = getLevelFromXP(newXP);

	// Mark lesson as completed with final step
	// Use totalSteps if provided, otherwise use a high number to indicate completion
	const finalStep = totalSteps !== undefined ? totalSteps : 999;
	const newLessonProgress = setLessonProgress(
		currentProgress.lessonProgress,
		lessonId,
		finalStep,
		true
	);

	// Update skill nodes
	const updatedSkillNodes = currentProgress.skillNodes.map((node) => {
		if (node.id === skillNodeId) {
			const progress = calculateSkillNodeProgress(
				newLessonProgress,
				node
			);
			const completed = isSkillNodeCompleted(newLessonProgress, node);
			return {
				...node,
				progress,
				completed,
			};
		}
		return node;
	});

	// Find next incomplete skill node
	const nextIncompleteNode = updatedSkillNodes.find(
		(node) => !node.completed
	);
	const currentSkillNodeId =
		nextIncompleteNode?.id || currentProgress.currentSkillNodeId;

	return {
		xp: newXP,
		level: newLevel,
		currentSkillNodeId,
		lessonProgress: newLessonProgress,
		skillNodes: updatedSkillNodes,
	};
}

export function updateProgressAfterStep(
	currentProgress: UserProgress,
	stepXpReward: number,
	lessonId: string,
	newStepIndex: number
): UserProgress {
	const newXP = currentProgress.xp + stepXpReward;
	const newLevel = getLevelFromXP(newXP);

	// Update the current step for the lesson
	const newLessonProgress = setLessonProgress(
		currentProgress.lessonProgress,
		lessonId,
		newStepIndex,
		false // Not completed yet
	);

	return {
		...currentProgress,
		xp: newXP,
		level: newLevel,
		lessonProgress: newLessonProgress,
	};
}

// Helper functions for lessonProgress
export function getCompletedLessons(
	lessonProgress: Record<string, { currentStep: number; completed: boolean }>
): string[] {
	return Object.entries(lessonProgress)
		.filter(([_, progress]) => progress.completed)
		.map(([lessonId, _]) => lessonId);
}

export function isLessonCompleted(
	lessonProgress: Record<string, { currentStep: number; completed: boolean }>,
	lessonId: string
): boolean {
	return lessonProgress[lessonId]?.completed ?? false;
}

export function getCurrentStep(
	lessonProgress: Record<string, { currentStep: number; completed: boolean }>,
	lessonId: string
): number {
	return lessonProgress[lessonId]?.currentStep ?? 0;
}

export function setLessonProgress(
	lessonProgress: Record<string, { currentStep: number; completed: boolean }>,
	lessonId: string,
	currentStep: number,
	completed: boolean
): Record<string, { currentStep: number; completed: boolean }> {
	return {
		...lessonProgress,
		[lessonId]: { currentStep, completed },
	};
}

// Export secure storage functions from storage.ts
export {
	saveProgressToStorage,
	loadProgressFromStorage,
	clearProgressFromStorage,
} from "./storage";
