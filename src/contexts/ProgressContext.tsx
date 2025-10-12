"use client";

import React, {
	createContext,
	useContext,
	useReducer,
	useEffect,
	useCallback,
	ReactNode,
} from "react";
import {
	UserProgress,
	SkillNode,
	createInitialProgress,
	updateProgressAfterLesson,
	updateProgressAfterStep,
	saveProgressToStorage,
	loadProgressFromStorage,
	getXPProgressForLevel,
} from "../lib/progressionSystem";

interface ProgressContextType {
	progress: UserProgress;
	addStepXP: (xp: number) => void;
	addLessonXP: (lessonId: string, skillNodeId: string, xp: number) => void;
	getCurrentSkillNode: () => SkillNode | undefined;
	getXPProgress: () => number;
	isLevelUp: boolean;
	clearLevelUp: () => void;
	showXPGain: (xp: number) => void;
	showNodeComplete: (nodeName: string) => void;
	xpGainQueue: { xp: number; id: string }[];
	nodeCompleteQueue: { nodeName: string; id: string }[];
	removeXPGain: (id: string) => void;
	removeNodeComplete: (id: string) => void;
	showSkillTree: boolean;
	openSkillTree: () => void;
	closeSkillTree: () => void;
	showSkillTreeForDuration: (duration?: number) => void;
	// Animation queue system
	animationQueue: { type: string; data?: any; id: string }[];
	isAnimationPlaying: boolean;
	queueAnimation: (
		type: "levelUp" | "nodeComplete" | "skillTree",
		data?: any
	) => void;
	completeCurrentAnimation: () => void;
	// Progress bar level up handling
	justLeveledUp: boolean;
	clearJustLeveledUp: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(
	undefined
);

type ProgressAction =
	| { type: "ADD_STEP_XP"; xp: number }
	| {
			type: "ADD_LESSON_XP";
			lessonId: string;
			skillNodeId: string;
			xp: number;
	  }
	| { type: "LOAD_PROGRESS"; progress: UserProgress }
	| { type: "CLEAR_LEVEL_UP" }
	| { type: "SHOW_XP_GAIN"; xp: number; id: string }
	| { type: "SHOW_NODE_COMPLETE"; nodeName: string; id: string }
	| { type: "REMOVE_XP_GAIN"; id: string }
	| { type: "REMOVE_NODE_COMPLETE"; id: string }
	| { type: "OPEN_SKILL_TREE" }
	| { type: "CLOSE_SKILL_TREE" }
	| { type: "QUEUE_ANIMATION"; animationType: string; data?: any }
	| { type: "START_ANIMATION" }
	| { type: "COMPLETE_ANIMATION" }
	| { type: "CLEAR_JUST_LEVELED_UP" };

interface ProgressState extends UserProgress {
	isLevelUp: boolean;
	xpGainQueue: { xp: number; id: string }[];
	nodeCompleteQueue: { nodeName: string; id: string }[];
	showSkillTree: boolean;
	animationQueue: { type: string; data?: any; id: string }[];
	isAnimationPlaying: boolean;
	justLeveledUp: boolean;
}

function progressReducer(
	state: ProgressState,
	action: ProgressAction
): ProgressState {
	switch (action.type) {
		case "ADD_STEP_XP": {
			const newProgress = updateProgressAfterStep(state, action.xp);
			const wasLevelUp = newProgress.level > state.level;

			return {
				...newProgress,
				isLevelUp: false, // Don't use isLevelUp state anymore
				xpGainQueue: state.xpGainQueue,
				nodeCompleteQueue: state.nodeCompleteQueue,
				showSkillTree: state.showSkillTree,
				animationQueue: state.animationQueue,
				isAnimationPlaying: state.isAnimationPlaying,
				justLeveledUp: wasLevelUp, // Set flag when leveling up
			};
		}

		case "ADD_LESSON_XP": {
			const newProgress = updateProgressAfterLesson(
				state,
				action.lessonId,
				action.skillNodeId,
				action.xp
			);
			const wasLevelUp = newProgress.level > state.level;

			return {
				...newProgress,
				isLevelUp: false, // Don't use isLevelUp state anymore
				xpGainQueue: state.xpGainQueue,
				nodeCompleteQueue: state.nodeCompleteQueue,
				showSkillTree: state.showSkillTree,
				animationQueue: state.animationQueue,
				isAnimationPlaying: state.isAnimationPlaying,
				justLeveledUp: wasLevelUp, // Set flag when leveling up
			};
		}

		case "LOAD_PROGRESS": {
			return {
				...action.progress,
				isLevelUp: false,
				xpGainQueue: [],
				nodeCompleteQueue: [],
				showSkillTree: false,
				animationQueue: [],
				isAnimationPlaying: false,
				justLeveledUp: false,
			};
		}

		case "CLEAR_LEVEL_UP": {
			return {
				...state,
				isLevelUp: false,
			};
		}

		case "SHOW_XP_GAIN": {
			return {
				...state,
				xpGainQueue: [
					...state.xpGainQueue,
					{ xp: action.xp, id: action.id },
				],
			};
		}

		case "SHOW_NODE_COMPLETE": {
			return {
				...state,
				nodeCompleteQueue: [
					...state.nodeCompleteQueue,
					{ nodeName: action.nodeName, id: action.id },
				],
			};
		}

		case "REMOVE_XP_GAIN": {
			return {
				...state,
				xpGainQueue: state.xpGainQueue.filter(
					(item) => item.id !== action.id
				),
			};
		}

		case "REMOVE_NODE_COMPLETE": {
			return {
				...state,
				nodeCompleteQueue: state.nodeCompleteQueue.filter(
					(item) => item.id !== action.id
				),
			};
		}

		case "OPEN_SKILL_TREE": {
			return {
				...state,
				showSkillTree: true,
			};
		}

		case "CLOSE_SKILL_TREE": {
			return {
				...state,
				showSkillTree: false,
			};
		}

		case "QUEUE_ANIMATION": {
			const newAnimation = {
				type: action.animationType,
				data: action.data,
				id: crypto.randomUUID(),
			};
			return {
				...state,
				animationQueue: [...state.animationQueue, newAnimation],
			};
		}

		case "START_ANIMATION": {
			return {
				...state,
				isAnimationPlaying: true,
			};
		}

		case "COMPLETE_ANIMATION": {
			const [currentAnimation, ...remainingQueue] = state.animationQueue;
			return {
				...state,
				animationQueue: remainingQueue,
				isAnimationPlaying: false,
			};
		}

		case "CLEAR_JUST_LEVELED_UP": {
			return {
				...state,
				justLeveledUp: false,
			};
		}

		default:
			return state;
	}
}

interface ProgressProviderProps {
	children: ReactNode;
	lessonMetadata?: { id: string; skillNodeId: string }[];
}

export function ProgressProvider({
	children,
	lessonMetadata,
}: ProgressProviderProps) {
	const [state, dispatch] = useReducer(progressReducer, {
		...createInitialProgress(lessonMetadata),
		isLevelUp: false,
		xpGainQueue: [],
		nodeCompleteQueue: [],
		showSkillTree: false,
		animationQueue: [],
		isAnimationPlaying: false,
		justLeveledUp: false,
	});

	// Load progress from localStorage on mount
	useEffect(() => {
		// const savedProgress = loadProgressFromStorage();
		// if (savedProgress) {
		// 	dispatch({ type: "LOAD_PROGRESS", progress: savedProgress });
		// }
	}, []);

	// Save progress to localStorage whenever it changes
	useEffect(() => {
		// saveProgressToStorage(state);
	}, [state]);

	const addStepXP = useCallback((xp: number) => {
		dispatch({ type: "ADD_STEP_XP", xp });
	}, []);

	const addLessonXP = useCallback(
		(lessonId: string, skillNodeId: string, xp: number) => {
			dispatch({ type: "ADD_LESSON_XP", lessonId, skillNodeId, xp });
		},
		[]
	);

	const getCurrentSkillNode = (): SkillNode | undefined => {
		return state.skillNodes.find(
			(node) => node.id === state.currentSkillNodeId
		);
	};

	const getXPProgress = (): number => {
		return getXPProgressForLevel(state.xp, state.level);
	};

	const clearLevelUp = useCallback(() => {
		dispatch({ type: "CLEAR_LEVEL_UP" });
	}, []);

	const showXPGain = useCallback((xp: number) => {
		const id = crypto.randomUUID();
		dispatch({ type: "SHOW_XP_GAIN", xp, id });
		console.log("Showing XP gain: ", xp);
	}, []);

	const showNodeComplete = useCallback((nodeName: string) => {
		const id = crypto.randomUUID();
		dispatch({ type: "SHOW_NODE_COMPLETE", nodeName, id });
	}, []);

	const removeXPGain = useCallback((id: string) => {
		dispatch({ type: "REMOVE_XP_GAIN", id });
	}, []);

	const removeNodeComplete = useCallback((id: string) => {
		dispatch({ type: "REMOVE_NODE_COMPLETE", id });
	}, []);

	const openSkillTree = useCallback(() => {
		dispatch({ type: "OPEN_SKILL_TREE" });
	}, []);

	const closeSkillTree = useCallback(() => {
		dispatch({ type: "CLOSE_SKILL_TREE" });
	}, []);

	const showSkillTreeForDuration = useCallback((duration: number = 3000) => {
		dispatch({ type: "OPEN_SKILL_TREE" });
		setTimeout(() => {
			dispatch({ type: "CLOSE_SKILL_TREE" });
		}, duration);
	}, []);

	const queueAnimation = useCallback(
		(type: "levelUp" | "nodeComplete" | "skillTree", data?: any) => {
			dispatch({ type: "QUEUE_ANIMATION", animationType: type, data });
		},
		[]
	);

	const completeCurrentAnimation = useCallback(() => {
		dispatch({ type: "COMPLETE_ANIMATION" });
	}, []);

	const clearJustLeveledUp = useCallback(() => {
		dispatch({ type: "CLEAR_JUST_LEVELED_UP" });
	}, []);

	const value: ProgressContextType = {
		progress: state,
		addStepXP,
		addLessonXP,
		getCurrentSkillNode,
		getXPProgress,
		isLevelUp: state.isLevelUp,
		clearLevelUp,
		showXPGain,
		showNodeComplete,
		xpGainQueue: state.xpGainQueue,
		nodeCompleteQueue: state.nodeCompleteQueue,
		removeXPGain,
		removeNodeComplete,
		showSkillTree: state.showSkillTree,
		openSkillTree,
		closeSkillTree,
		showSkillTreeForDuration,
		animationQueue: state.animationQueue,
		isAnimationPlaying: state.isAnimationPlaying,
		queueAnimation,
		completeCurrentAnimation,
		justLeveledUp: state.justLeveledUp,
		clearJustLeveledUp,
	};

	return (
		<ProgressContext.Provider value={value}>
			{children}
		</ProgressContext.Provider>
	);
}

export function useProgress(): ProgressContextType {
	const context = useContext(ProgressContext);
	if (context === undefined) {
		throw new Error("useProgress must be used within a ProgressProvider");
	}
	return context;
}
