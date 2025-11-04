/**
 * Round numbers to 5 decimal places (recursively for nested structures)
 * This helps prevent floating point precision issues in comparisons and display
 */
export function roundTo5Decimals(value: any): any {
	if (value === null || value === undefined) {
		return value;
	}

	if (typeof value === "number") {
		// Check if it's a valid finite number
		if (!Number.isFinite(value)) {
			return value;
		}
		// Round to 5 decimal places
		return Math.round(value * 100000) / 100000;
	}

	if (Array.isArray(value)) {
		return value.map(roundTo5Decimals);
	}

	if (typeof value === "object") {
		const rounded: any = {};
		for (const key in value) {
			if (Object.prototype.hasOwnProperty.call(value, key)) {
				rounded[key] = roundTo5Decimals(value[key]);
			}
		}
		return rounded;
	}

	return value;
}

