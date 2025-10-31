export type FilterSortBy = "default" | "difficulty" | "title";

export interface PersistedFilters {
	searchTerm?: string;
	selectedTopics?: string[];
	selectedDifficulties?: string[];
	sortBy?: FilterSortBy;
}

const STORAGE_KEY = "algoProblems:lastFilters";
const UPDATE_EVENT = "algoProblems:filtersUpdated";

export function getPersistedFilters(): PersistedFilters {
	if (typeof window === "undefined") return {};
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw);
		return parsed && typeof parsed === "object" ? parsed : {};
	} catch {
		return {};
	}
}

export function saveFilters(filters: PersistedFilters): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
		window.dispatchEvent(new Event(UPDATE_EVENT));
	} catch {
		// Ignore storage errors
	}
}

export function listenForFilterUpdates(callback: () => void): () => void {
	if (typeof window === "undefined") return () => {};

	const handleCustomStorage = () => {
		callback();
	};

	window.addEventListener(UPDATE_EVENT, handleCustomStorage);
	return () => {
		window.removeEventListener(UPDATE_EVENT, handleCustomStorage);
	};
}
