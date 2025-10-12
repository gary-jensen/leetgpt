// Progression system for XP, levels, and skill tree

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
	completedLessons: string[];
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
	completedLessons: string[],
	node: SkillNode
): number {
	const completedInNode = node.lessons.filter((lessonId) =>
		completedLessons.includes(lessonId)
	).length;

	return completedInNode / node.lessons.length;
}

export function isSkillNodeCompleted(
	completedLessons: string[],
	node: SkillNode
): boolean {
	return node.lessons.every((lessonId) =>
		completedLessons.includes(lessonId)
	);
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
			const name =
				skillNodeId.charAt(0).toUpperCase() + skillNodeId.slice(1);
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
		completedLessons: [],
		skillNodes: skillTree.map((node) => ({ ...node })),
	};
}

export function updateProgressAfterLesson(
	currentProgress: UserProgress,
	lessonId: string,
	skillNodeId: string,
	xpReward: number
): UserProgress {
	const newXP = currentProgress.xp + xpReward;
	const newLevel = getLevelFromXP(newXP);
	const newCompletedLessons = [...currentProgress.completedLessons];

	if (!newCompletedLessons.includes(lessonId)) {
		newCompletedLessons.push(lessonId);
	}

	// Update skill nodes
	const updatedSkillNodes = currentProgress.skillNodes.map((node) => {
		if (node.id === skillNodeId) {
			const progress = calculateSkillNodeProgress(
				newCompletedLessons,
				node
			);
			const completed = isSkillNodeCompleted(newCompletedLessons, node);
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
		completedLessons: newCompletedLessons,
		skillNodes: updatedSkillNodes,
	};
}

export function updateProgressAfterStep(
	currentProgress: UserProgress,
	stepXpReward: number
): UserProgress {
	const newXP = currentProgress.xp + stepXpReward;
	const newLevel = getLevelFromXP(newXP);

	return {
		...currentProgress,
		xp: newXP,
		level: newLevel,
	};
}

// Local storage helpers
const PROGRESS_STORAGE_KEY = "bitschool-progress";

export function saveProgressToStorage(progress: UserProgress): void {
	try {
		localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
	} catch (error) {
		console.error("Failed to save progress to localStorage:", error);
	}
}

export function loadProgressFromStorage(): UserProgress | null {
	try {
		const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
		if (stored) {
			return JSON.parse(stored) as UserProgress;
		}
	} catch (error) {
		console.error("Failed to load progress from localStorage:", error);
	}
	return null;
}
