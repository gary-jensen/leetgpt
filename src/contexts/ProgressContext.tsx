"use client";

import { generateUUID } from "@/lib/cryptoUtils";
import React, {
	createContext,
	useContext,
	useReducer,
	useEffect,
	useCallback,
	ReactNode,
	useRef,
	useState,
} from "react";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";
import {
	UserProgress,
	SkillNode,
	createInitialProgress,
	updateProgressAfterLesson,
	updateProgressAfterStep,
	saveProgressToStorage,
	loadProgressFromStorage,
	getXPProgressForLevel,
	recalculateSkillNodes,
	calculateCurrentSkillNodeId,
	getCompletedLessons,
	isLessonCompleted,
	getCurrentStep,
	setLessonProgress,
} from "../lib/progressionSystem";
import {
	saveUserProgress,
	migrateLocalStorageData,
} from "@/lib/actions/progress";
import {
	trackLevelUp,
	trackSkillNodeComplete,
	trackLessonComplete,
	trackStepComplete,
	trackAuthSignin,
} from "@/lib/analytics";
// import { playLevelUpSound } from "@/lib/soundManager";
import { clearGuestId } from "@/lib/guestId";
import {
	AlgoProblemProgress,
	AlgoLessonProgress,
	AlgoProblemSubmission,
	ChatSession,
} from "@/types/algorithm-types";
import { getAlgoProgress } from "@/lib/actions/algoProgress";

interface ProgressContextType {
	progress: UserProgress;
	isProgressLoading: boolean;
	isAlgoProgressLoading: boolean;
	addStepXP: (xp: number, lessonId: string, newStepIndex: number) => void;
	addLessonXP: (
		lessonId: string,
		lessonTitle: string,
		skillNodeId: string,
		xp: number,
		timeTaken: number,
		totalSteps?: number
	) => void;
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
	// Lesson progress helpers
	getCompletedLessons: () => string[];
	isLessonCompleted: (lessonId: string) => boolean;
	getCurrentStep: (lessonId: string) => number;
	// Algorithm progress
	algoProblemProgress: AlgoProblemProgress[];
	algoLessonProgress: AlgoLessonProgress[];
	algoSubmissions: AlgoProblemSubmission[];
	getAlgoProblemProgress: (
		problemId: string,
		language: string
	) => AlgoProblemProgress | null;
	getAlgoLessonProgress: (lessonId: string) => AlgoLessonProgress | null;
	getAlgoSubmissions: (problemId: string) => AlgoProblemSubmission[];
	updateAlgoLessonProgressLocal: (
		lessonId: string,
		status: "not_started" | "in_progress" | "completed"
	) => void;
	updateAlgoProblemProgressLocal: (
		problemId: string,
		language: "javascript",
		updates: {
			status?: "not_started" | "in_progress" | "completed";
			currentCode?: string;
			chatHistory?: ChatSession[];
			completedAt?: Date;
		}
	) => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(
	undefined
);

type ProgressAction =
	| {
			type: "ADD_STEP_XP";
			xp: number;
			lessonId: string;
			newStepIndex: number;
	  }
	| {
			type: "ADD_LESSON_XP";
			lessonId: string;
			skillNodeId: string;
			xp: number;
			totalSteps?: number;
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
			const newProgress = updateProgressAfterStep(
				state,
				action.xp,
				action.lessonId,
				action.newStepIndex
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

		case "ADD_LESSON_XP": {
			const newProgress = updateProgressAfterLesson(
				state,
				action.lessonId,
				action.skillNodeId,
				action.xp,
				action.totalSteps
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
				id: generateUUID(),
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
	session?: Session | null;
	initialAlgoProblemProgress?: AlgoProblemProgress[];
	initialAlgoLessonProgress?: AlgoLessonProgress[];
	initialAlgoSubmissions?: AlgoProblemSubmission[];
}

function getInitialProgress(
	session: Session | null,
	lessonMetadata?: { id: string; skillNodeId: string }[]
): ProgressState {
	// Logged in with progress -> use it directly
	if (
		session?.progress &&
		session.progress.lessonProgress &&
		Object.keys(session.progress.lessonProgress).length > 0
	) {
		return {
			xp: session.progress.xp,
			level: session.progress.level,
			currentSkillNodeId: session.progress.currentSkillNodeId,
			lessonProgress: session.progress.lessonProgress,
			skillNodes: session.progress.skillNodes,
			isLevelUp: false,
			xpGainQueue: [],
			nodeCompleteQueue: [],
			showSkillTree: false,
			animationQueue: [],
			isAnimationPlaying: false,
			justLeveledUp: false,
		};
	}

	// Otherwise use empty initial state
	return {
		...createInitialProgress(lessonMetadata),
		isLevelUp: false,
		xpGainQueue: [],
		nodeCompleteQueue: [],
		showSkillTree: false,
		animationQueue: [],
		isAnimationPlaying: false,
		justLeveledUp: false,
	};
}

export function ProgressProvider({
	children,
	lessonMetadata,
	session: serverSession,
	initialAlgoProblemProgress,
	initialAlgoLessonProgress,
	initialAlgoSubmissions,
}: ProgressProviderProps) {
	const { data: session, status } = useSession();
	// Use server session for initial render, then client session after hydration
	const activeSession = serverSession ?? session;

	const [state, dispatch] = useReducer(
		progressReducer,
		getInitialProgress(activeSession, lessonMetadata)
	);

	const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const hasMigratedRef = useRef(false);
	const prevLevelRef = useRef(state.level);
	const hasInitializedLevelTracking = useRef(false);
	const hasLoadedAlgoProgressRef = useRef(false);

	// Algorithm progress state
	const [algoProblemProgress, setAlgoProblemProgress] = useState<
		AlgoProblemProgress[]
	>(initialAlgoProblemProgress || []);
	const [algoLessonProgress, setAlgoLessonProgress] = useState<
		AlgoLessonProgress[]
	>(initialAlgoLessonProgress || []);
	const [algoSubmissions, setAlgoSubmissions] = useState<
		AlgoProblemSubmission[]
	>(initialAlgoSubmissions || []);

	// Compute loading state based on whether we need to check migration/localStorage
	const needsAsyncLoad = activeSession?.user?.id
		? !(
				activeSession.progress?.lessonProgress &&
				Object.keys(activeSession.progress.lessonProgress).length > 0
		  ) // Logged in, no progress -> check migration
		: true; // Guest -> check localStorage

	const [isProgressLoading, setIsProgressLoading] = useState(needsAsyncLoad);
	const [isAlgoProgressLoading, setIsAlgoProgressLoading] = useState(
		initialAlgoProblemProgress === undefined
	);

	// Load algo progress when session becomes available
	useEffect(() => {
		// Wait for session to load
		if (status === "loading") return;

		// Skip if we already loaded algo progress (from initial props or previous fetch)
		if (hasLoadedAlgoProgressRef.current) {
			setIsAlgoProgressLoading(false);
			return;
		}

		// If we have initial props, mark as loaded immediately
		if (
			initialAlgoProblemProgress ||
			initialAlgoLessonProgress ||
			initialAlgoSubmissions
		) {
			hasLoadedAlgoProgressRef.current = true;
			setIsAlgoProgressLoading(false);
			return;
		}

		// If user is not authenticated, no algo progress to load
		if (!activeSession?.user?.id) {
			setIsAlgoProgressLoading(false);
			return;
		}

		// Fetch algo progress for authenticated user
		hasLoadedAlgoProgressRef.current = true;
		setIsAlgoProgressLoading(true);
		getAlgoProgress(activeSession.user.id)
			.then((algoData) => {
				setAlgoProblemProgress(algoData.problemProgress);
				setAlgoLessonProgress(algoData.lessonProgress);
				setAlgoSubmissions(algoData.submissions);
				setIsAlgoProgressLoading(false);
			})
			.catch((error) => {
				// console.error("Error loading algorithm progress:", error);
				hasLoadedAlgoProgressRef.current = false; // Allow retry on error
				setIsAlgoProgressLoading(false);
			});
	}, [
		status,
		activeSession?.user?.id,
		initialAlgoProblemProgress,
		initialAlgoLessonProgress,
		initialAlgoSubmissions,
	]);

	// Load progress from database or localStorage on mount
	useEffect(() => {
		if (status === "loading") return;

		// Track sign-in events
		const lastAuthStatus = sessionStorage.getItem(
			"bitschool-last-auth-status"
		);
		const wasUnauthenticated =
			lastAuthStatus === "unauthenticated" || lastAuthStatus === null;
		const isNowAuthenticated = status === "authenticated";

		if (
			wasUnauthenticated &&
			isNowAuthenticated &&
			activeSession?.user?.id
		) {
			trackAuthSignin();
		}
		sessionStorage.setItem("bitschool-last-auth-status", status);

		// Skip if we already have progress loaded
		if (
			activeSession?.progress &&
			activeSession.progress.lessonProgress &&
			Object.keys(activeSession.progress.lessonProgress).length > 0
		) {
			setIsProgressLoading(false);
			// clear local storage
			localStorage.removeItem("bitschool-progress");
			localStorage.removeItem("bitschool-progress-checksum");
			clearGuestId();

			// Algorithm progress is preloaded in layout when available
			return;
		}

		const loadProgress = async () => {
			if (activeSession?.user?.id) {
				// Logged in, no progress -> check for migration
				// If user has progress in session, they're already migrated
				const hasProgress =
					!!activeSession.progress?.lessonProgress &&
					Object.keys(activeSession.progress.lessonProgress).length >
						0;

				if (!hasProgress && !hasMigratedRef.current) {
					const localProgress = await loadProgressFromStorage();
					if (localProgress) {
						hasMigratedRef.current = true;

						// Retry migration with a small delay to ensure user is created
						let migrationResult;
						let retries = 0;
						const maxRetries = 3;

						do {
							migrationResult = await migrateLocalStorageData(
								activeSession.user.id,
								localProgress
							);

							if (migrationResult.success) {
								break;
							}

							retries++;
							if (retries < maxRetries) {
								await new Promise((resolve) =>
									setTimeout(resolve, 500)
								);
							}
						} while (
							retries < maxRetries &&
							!migrationResult.success
						);

						if (migrationResult.success) {
							localStorage.removeItem("bitschool-progress");
							localStorage.removeItem(
								"bitschool-progress-checksum"
							);
							clearGuestId();

							// Update local state with migrated progress
							dispatch({
								type: "LOAD_PROGRESS",
								progress: localProgress,
							});
						}

						setIsProgressLoading(false);

						// Load algorithm progress after migration
						if (
							activeSession?.user?.id &&
							!hasLoadedAlgoProgressRef.current
						) {
							hasLoadedAlgoProgressRef.current = true;
							setIsAlgoProgressLoading(true);
							getAlgoProgress(activeSession.user.id)
								.then((algoData) => {
									setAlgoProblemProgress(
										algoData.problemProgress
									);
									setAlgoLessonProgress(
										algoData.lessonProgress
									);
									setAlgoSubmissions(algoData.submissions);
									setIsAlgoProgressLoading(false);
								})
								.catch((error) => {
									// console.error(
									// 	"Error loading algorithm progress:",
									// 	error
									// );
									hasLoadedAlgoProgressRef.current = false; // Allow retry
									setIsAlgoProgressLoading(false);
								});
						}
						return;
					}
				}
			} else {
				// Guest -> load from localStorage
				const savedProgress = await loadProgressFromStorage();
				if (
					savedProgress &&
					savedProgress.lessonProgress &&
					Object.keys(savedProgress.lessonProgress).length > 0
				) {
					const currentSkillNodeId = calculateCurrentSkillNodeId(
						savedProgress.lessonProgress,
						lessonMetadata || []
					);
					const updatedSkillNodes = recalculateSkillNodes(
						savedProgress.skillNodes,
						savedProgress.lessonProgress
					);
					dispatch({
						type: "LOAD_PROGRESS",
						progress: {
							...savedProgress,
							currentSkillNodeId,
							skillNodes: updatedSkillNodes,
						},
					});
				}
			}

			setIsProgressLoading(false);
		};

		loadProgress();
	}, [activeSession?.user?.id, status, lessonMetadata]);

	// Save progress (debounced)
	useEffect(() => {
		// Skip saving during initial load
		if (isProgressLoading) return;

		// Clear existing timeout
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current);
		}

		// Set new timeout for saving
		saveTimeoutRef.current = setTimeout(async () => {
			if (activeSession?.user?.id) {
				// Authenticated: save to database
				// State is source of truth - just save to DB
				// On next page load, JWT will load fresh data from DB
				await saveUserProgress(activeSession.user.id, state);
			} else {
				// Guest: save to localStorage (encrypted)
				await saveProgressToStorage(state);
			}
		}, 1000); // Debounce for 1 second

		return () => {
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current);
			}
		};
	}, [state, activeSession?.user?.id, isProgressLoading]);

	// Track level ups (only after initial load completes)
	useEffect(() => {
		// During initial load, just initialize the ref without tracking
		if (isProgressLoading) {
			prevLevelRef.current = state.level;
			hasInitializedLevelTracking.current = false;
			return;
		}

		// On first run after loading completes, just set the initialized flag
		if (!hasInitializedLevelTracking.current) {
			hasInitializedLevelTracking.current = true;
			prevLevelRef.current = state.level;
			return;
		}

		// Only track if level actually increased after initialization
		if (state.level > prevLevelRef.current) {
			trackLevelUp(state.level);
			// Play level up sound
			// playLevelUpSound();
		}
		prevLevelRef.current = state.level;
	}, [state.level, isProgressLoading]);

	const addStepXP = useCallback(
		(xp: number, lessonId: string, newStepIndex: number) => {
			dispatch({ type: "ADD_STEP_XP", xp, lessonId, newStepIndex });
		},
		[]
	);

	const addLessonXP = useCallback(
		(
			lessonId: string,
			lessonTitle: string,
			skillNodeId: string,
			xp: number,
			timeTaken: number,
			totalSteps?: number
		) => {
			dispatch({
				type: "ADD_LESSON_XP",
				lessonId,
				skillNodeId,
				xp,
				totalSteps,
			});
			// Track lesson completion (can be used as Google Ads conversion)
			trackLessonComplete(lessonId, lessonTitle, xp, timeTaken);
		},
		[]
	);

	const addStepXPWithTracking = useCallback(
		(
			xp: number,
			lessonId: string,
			newStepIndex: number,
			stepId?: string
		) => {
			dispatch({ type: "ADD_STEP_XP", xp, lessonId, newStepIndex });
			// Track step completion if stepId provided
			if (stepId) {
				trackStepComplete("current", stepId, xp);
			}
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
		const id = generateUUID();
		dispatch({ type: "SHOW_XP_GAIN", xp, id });
	}, []);

	const showNodeComplete = useCallback((nodeName: string) => {
		const id = generateUUID();
		dispatch({ type: "SHOW_NODE_COMPLETE", nodeName, id });
		// Track skill node completion
		trackSkillNodeComplete(nodeName);
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

	// Lesson progress helpers
	const getCompletedLessonsHelper = useCallback(() => {
		return getCompletedLessons(state.lessonProgress);
	}, [state.lessonProgress]);

	const isLessonCompletedHelper = useCallback(
		(lessonId: string) => {
			return isLessonCompleted(state.lessonProgress, lessonId);
		},
		[state.lessonProgress]
	);

	const getCurrentStepHelper = useCallback(
		(lessonId: string) => {
			return getCurrentStep(state.lessonProgress, lessonId);
		},
		[state.lessonProgress]
	);

	// Algorithm progress helpers
	const getAlgoProblemProgressHelper = useCallback(
		(problemId: string, language: string) => {
			return (
				algoProblemProgress.find(
					(p) => p.problemId === problemId && p.language === language
				) || null
			);
		},
		[algoProblemProgress]
	);

	const getAlgoLessonProgressHelper = useCallback(
		(lessonId: string) => {
			return (
				algoLessonProgress.find((l) => l.lessonId === lessonId) || null
			);
		},
		[algoLessonProgress]
	);

	const getAlgoSubmissionsHelper = useCallback(
		(problemId: string) => {
			return algoSubmissions.filter((s) => s.problemId === problemId);
		},
		[algoSubmissions]
	);

	// Update lesson progress locally (optimistic update)
	const updateAlgoLessonProgressLocal = useCallback(
		(
			lessonId: string,
			status: "not_started" | "in_progress" | "completed"
		) => {
			setAlgoLessonProgress((prev) => {
				const existingIndex = prev.findIndex(
					(l) => l.lessonId === lessonId
				);
				if (existingIndex >= 0) {
					// Update existing progress
					const updated = [...prev];
					updated[existingIndex] = {
						...updated[existingIndex],
						status,
						completedAt:
							status === "completed"
								? new Date()
								: updated[existingIndex].completedAt,
						updatedAt: new Date(),
					};
					return updated;
				} else {
					// Add new progress entry (will be properly saved by server action)
					// For optimistic update, create a temporary entry with minimal required fields
					const tempId = `temp-${Date.now()}`;
					return [
						...prev,
						{
							id: tempId,
							userId: activeSession?.user?.id || "",
							lessonId,
							status,
							completedAt:
								status === "completed" ? new Date() : undefined,
							createdAt: new Date(),
							updatedAt: new Date(),
						},
					];
				}
			});
		},
		[activeSession?.user?.id]
	);

	// Update problem progress locally (optimistic update)
	const updateAlgoProblemProgressLocal = useCallback(
		(
			problemId: string,
			language: "javascript",
			updates: {
				status?: "not_started" | "in_progress" | "completed";
				currentCode?: string;
				chatHistory?: ChatSession[];
				completedAt?: Date;
			}
		) => {
			setAlgoProblemProgress((prev) => {
				const existingIndex = prev.findIndex(
					(p) => p.problemId === problemId && p.language === language
				);
				if (existingIndex >= 0) {
					// Update existing progress
					const updated = [...prev];
					updated[existingIndex] = {
						...updated[existingIndex],
						...updates,
						updatedAt: new Date(),
					};
					return updated;
				} else {
					// Add new progress entry (will be properly saved by server action)
					// For optimistic update, create a temporary entry with minimal required fields
					const tempId = `temp-${Date.now()}`;
					return [
						...prev,
						{
							id: tempId,
							userId: activeSession?.user?.id || "",
							problemId,
							language,
							status: updates.status || "in_progress",
							currentCode: updates.currentCode || "",
							chatHistory: updates.chatHistory || [],
							completedAt: updates.completedAt || undefined,
							createdAt: new Date(),
							updatedAt: new Date(),
						},
					];
				}
			});
		},
		[activeSession?.user?.id]
	);

	const value: ProgressContextType = {
		progress: state,
		isProgressLoading,
		isAlgoProgressLoading,
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
		getCompletedLessons: getCompletedLessonsHelper,
		isLessonCompleted: isLessonCompletedHelper,
		getCurrentStep: getCurrentStepHelper,
		// Algorithm progress
		algoProblemProgress,
		algoLessonProgress,
		algoSubmissions,
		getAlgoProblemProgress: getAlgoProblemProgressHelper,
		getAlgoLessonProgress: getAlgoLessonProgressHelper,
		getAlgoSubmissions: getAlgoSubmissionsHelper,
		updateAlgoLessonProgressLocal,
		updateAlgoProblemProgressLocal,
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
