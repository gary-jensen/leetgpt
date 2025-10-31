import { useState, useEffect, useRef, useCallback } from "react";
import {
	getPersistedFilters,
	saveFilters,
	listenForFilterUpdates,
	type FilterSortBy,
} from "../utils/filterStorage";

interface UseAlgoFiltersOptions {
	/**
	 * If true, saves filters on unmount using refs (for ProblemsList)
	 * If false, listens for updates from other components (for WorkspaceNavbar)
	 */
	saveOnUnmount?: boolean;
	/**
	 * If true, automatically persists when filters change (for WorkspaceNavbar)
	 * If false, requires manual persistence (for ProblemsList)
	 */
	autoPersist?: boolean;
	/**
	 * Reload filters when this value changes (e.g., pathname for WorkspaceNavbar)
	 */
	reloadTrigger?: string | null;
	/**
	 * Reload filters when this boolean is true (e.g., drawerOpen for WorkspaceNavbar)
	 */
	reloadOnOpen?: boolean;
}

export function useAlgoFilters(options: UseAlgoFiltersOptions = {}) {
	const {
		saveOnUnmount = false,
		autoPersist = false,
		reloadTrigger,
		reloadOnOpen,
	} = options;

	const [searchTerm, setSearchTerm] = useState("");
	const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
	const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
	const [sortBy, setSortBy] = useState<FilterSortBy>("default");

	// Use refs to store current filter values so they persist across unmounts
	const filtersRef = useRef({
		searchTerm: "",
		selectedTopics: [] as string[],
		selectedDifficulties: [] as string[],
		sortBy: "default" as FilterSortBy,
	});

	// Keep refs in sync with state
	useEffect(() => {
		filtersRef.current = {
			searchTerm,
			selectedTopics,
			selectedDifficulties,
			sortBy,
		};
	}, [searchTerm, selectedTopics, selectedDifficulties, sortBy]);

	// Track if filters have been loaded initially (for WorkspaceNavbar to prevent overwriting)
	const filtersLoadedRef = useRef(false);
	const isUpdatingRef = useRef(false);

	// Load filters function
	const loadFilters = useCallback(() => {
		const persisted = getPersistedFilters();
		if (persisted.searchTerm !== undefined) {
			setSearchTerm(persisted.searchTerm || "");
		}
		if (persisted.selectedTopics !== undefined) {
			setSelectedTopics(persisted.selectedTopics || []);
		}
		if (persisted.selectedDifficulties !== undefined) {
			setSelectedDifficulties(persisted.selectedDifficulties || []);
		}
		if (persisted.sortBy !== undefined) {
			setSortBy(persisted.sortBy || "default");
		}
	}, []);

	// Load persisted filters on mount
	useEffect(() => {
		const persisted = getPersistedFilters();
		if (persisted && typeof persisted === "object") {
			const loadedFilters = {
				searchTerm: persisted.searchTerm ?? "",
				selectedTopics: persisted.selectedTopics ?? [],
				selectedDifficulties: persisted.selectedDifficulties ?? [],
				sortBy: (persisted.sortBy ?? "default") as FilterSortBy,
			};

			setSearchTerm(loadedFilters.searchTerm);
			setSelectedTopics(loadedFilters.selectedTopics);
			setSelectedDifficulties(loadedFilters.selectedDifficulties);
			setSortBy(loadedFilters.sortBy);
			filtersRef.current = loadedFilters;
		}
		
		if (!saveOnUnmount) {
			// For WorkspaceNavbar, mark as loaded after initial load
			setTimeout(() => {
				filtersLoadedRef.current = true;
			}, 0);
		}
	}, []);

	// Reload when trigger changes (e.g., pathname)
	useEffect(() => {
		if (reloadTrigger !== undefined) {
			if (!saveOnUnmount) {
				filtersLoadedRef.current = false;
			}
			loadFilters();
			if (!saveOnUnmount) {
				const timeoutId = setTimeout(() => {
					filtersLoadedRef.current = true;
				}, 0);
				return () => clearTimeout(timeoutId);
			}
		}
	}, [reloadTrigger, loadFilters, saveOnUnmount]);

	// Reload when drawer/panel opens
	useEffect(() => {
		if (reloadOnOpen) {
			loadFilters();
		}
	}, [reloadOnOpen, loadFilters]);

	// Listen for filter updates from other components (for WorkspaceNavbar)
	useEffect(() => {
		if (saveOnUnmount || typeof window === "undefined") return;

		const handleUpdate = () => {
			if (!isUpdatingRef.current) {
				loadFilters();
			}
		};

		return listenForFilterUpdates(handleUpdate);
	}, [saveOnUnmount, loadFilters]);

	// Auto-persist when filters change (for WorkspaceNavbar)
	useEffect(() => {
		if (!autoPersist || !filtersLoadedRef.current) return;

		isUpdatingRef.current = true;
		saveFilters({
			searchTerm,
			selectedTopics,
			selectedDifficulties,
			sortBy,
		});
		setTimeout(() => {
			isUpdatingRef.current = false;
		}, 0);
	}, [autoPersist, searchTerm, selectedTopics, selectedDifficulties, sortBy]);

	// Save on unmount (for ProblemsList)
	useEffect(() => {
		if (!saveOnUnmount) return;
		return () => {
			saveFilters({
				searchTerm: filtersRef.current.searchTerm,
				selectedTopics: filtersRef.current.selectedTopics,
				selectedDifficulties: filtersRef.current.selectedDifficulties,
				sortBy: filtersRef.current.sortBy,
			});
		};
	}, [saveOnUnmount]);

	// Manual persist function (for ProblemsList to call on user interaction)
	const persistFilters = useCallback(
		(
			newSearchTerm?: string,
			newSelectedTopics?: string[],
			newSelectedDifficulties?: string[],
			newSortBy?: FilterSortBy
		) => {
			saveFilters({
				searchTerm:
					newSearchTerm !== undefined
						? newSearchTerm
						: filtersRef.current.searchTerm,
				selectedTopics:
					newSelectedTopics !== undefined
						? newSelectedTopics
						: filtersRef.current.selectedTopics,
				selectedDifficulties:
					newSelectedDifficulties !== undefined
						? newSelectedDifficulties
						: filtersRef.current.selectedDifficulties,
				sortBy:
					newSortBy !== undefined
						? newSortBy
						: filtersRef.current.sortBy,
			});
		},
		[]
	);

	return {
		searchTerm,
		setSearchTerm,
		selectedTopics,
		setSelectedTopics,
		selectedDifficulties,
		setSelectedDifficulties,
		sortBy,
		setSortBy,
		persistFilters,
		loadFilters,
	};
}

