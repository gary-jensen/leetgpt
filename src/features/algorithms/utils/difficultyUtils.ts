export function getDifficultyColor(difficulty: string): string {
	switch (difficulty) {
		case "easy":
			return "text-emerald-400";
		case "medium":
			return "text-yellow-400";
		case "hard":
			return "text-red-500";
		default:
			return "text-muted-foreground";
	}
}

