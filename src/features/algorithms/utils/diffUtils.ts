import { roundTo5Decimals } from "@/utils/numberUtils";
import { normalizeArrayOfArrays } from "@/lib/execution/algoTestExecutor";

interface DiffResult {
	output: string;
	expected: string;
	hasDiff: boolean;
}

/**
 * Helper function to create a frequency map of array elements
 * Used to track which elements are present and how many times
 */
function createElementFrequencyMap(arr: any[]): Map<string, number> {
	const map = new Map<string, number>();
	for (const item of arr) {
		const key = JSON.stringify(item);
		map.set(key, (map.get(key) || 0) + 1);
	}
	return map;
}

export function createDiff(
	output: any,
	expected: any,
	outputOrderMatters: boolean = true
): DiffResult {
	// Handle undefined/null values explicitly
	// If output is undefined/null, show it as such
	if (output === undefined || output === null) {
		const outputStr = output === undefined ? "undefined" : "null";
		const expectedStr = JSON.stringify(roundTo5Decimals(expected));
		const hasDiff = true; // undefined/null always differs from expected (unless expected is also undefined/null)

		return {
			output: `<span class="text-red-400">${outputStr}</span>`,
			expected: `<span class="text-green-400">${expectedStr}</span>`,
			hasDiff: expected !== undefined && expected !== null,
		};
	}

	// Round both values to 5 decimal places before comparison and display
	const roundedOutput = roundTo5Decimals(output);
	const roundedExpected = roundTo5Decimals(expected);

	// If either is not an array, return simple comparison
	if (!Array.isArray(roundedOutput) || !Array.isArray(roundedExpected)) {
		const outputStr = JSON.stringify(roundedOutput);
		const expectedStr = JSON.stringify(roundedExpected);
		const hasDiff = outputStr !== expectedStr;

		return {
			output: hasDiff
				? `<span class="text-red-400">${outputStr}</span>`
				: outputStr,
			expected: hasDiff
				? `<span class="text-green-400">${expectedStr}</span>`
				: expectedStr,
			hasDiff,
		};
	}

	// Handle empty arrays
	if (roundedOutput.length === 0 && roundedExpected.length === 0) {
		return {
			output: "[]",
			expected: "[]",
			hasDiff: false,
		};
	}
	if (roundedOutput.length === 0) {
		return {
			output: '<span class="text-red-400">[]</span>',
			expected: `<span class="text-green-400">${JSON.stringify(
				roundedExpected
			)}</span>`,
			hasDiff: true,
		};
	}
	if (roundedExpected.length === 0) {
		return {
			output: `<span class="text-red-400">${JSON.stringify(
				roundedOutput
			)}</span>`,
			expected: '<span class="text-green-400">[]</span>',
			hasDiff: true,
		};
	}

	// Handle single-element arrays - use JSON.stringify to avoid comma issues
	// If output has exactly 1 element, use JSON.stringify for it (regardless of expected length)
	// This prevents comma issues in the manual string building
	if (roundedOutput.length === 1) {
		const outputStr = JSON.stringify(roundedOutput);
		// If expected also has 1 element, handle both
		if (roundedExpected.length === 1) {
			const expectedStr = JSON.stringify(roundedExpected);
			const hasDiff = outputStr !== expectedStr;

			return {
				output: hasDiff
					? `<span class="text-red-400">${outputStr}</span>`
					: outputStr,
				expected: hasDiff
					? `<span class="text-green-400">${expectedStr}</span>`
					: expectedStr,
				hasDiff,
			};
		}
		// Output has 1 element but expected has more - need to compare properly
		// For now, use JSON.stringify for output to avoid comma issues
		// and let the normal comparison handle expected
		const expectedStr = JSON.stringify(roundedExpected);
		const hasDiff = outputStr !== expectedStr;

		return {
			output: hasDiff
				? `<span class="text-red-400">${outputStr}</span>`
				: outputStr,
			expected: hasDiff
				? `<span class="text-green-400">${expectedStr}</span>`
				: expectedStr,
			hasDiff,
		};
	}
	// If expected has 1 element but output has more
	if (roundedExpected.length === 1) {
		const outputStr = JSON.stringify(roundedOutput);
		const expectedStr = JSON.stringify(roundedExpected);
		const hasDiff = outputStr !== expectedStr;

		return {
			output: hasDiff
				? `<span class="text-red-400">${outputStr}</span>`
				: outputStr,
			expected: hasDiff
				? `<span class="text-green-400">${expectedStr}</span>`
				: expectedStr,
			hasDiff,
		};
	}

	// Both are arrays
	if (!outputOrderMatters) {
		// Normalize both arrays for comparison
		const normalizedOutput = normalizeArrayOfArrays(roundedOutput);
		const normalizedExpected = normalizeArrayOfArrays(roundedExpected);

		// Compare normalized versions to see if they match
		const normalizedMatch =
			JSON.stringify(normalizedOutput) ===
			JSON.stringify(normalizedExpected);

		if (normalizedMatch) {
			// Arrays match when normalized - show originals without highlighting
			// All elements are present, just in different order
			return {
				output: JSON.stringify(roundedOutput),
				expected: JSON.stringify(roundedExpected),
				hasDiff: false,
			};
		} else {
			// Arrays don't match even when normalized - need to highlight differences
			// Create frequency maps to track which elements are missing/extra
			const outputFreq = createElementFrequencyMap(roundedOutput);
			const expectedFreq = createElementFrequencyMap(roundedExpected);

			// Build HTML for output (original order)
			let outputHtml = "[";
			let expectedHtml = "[";
			let hasDiff = false;

			// Track which elements we've accounted for in expected
			const expectedUsed = new Map<string, number>();

			// Display output array with original order
			for (let i = 0; i < roundedOutput.length; i++) {
				if (i > 0) outputHtml += ",";
				const item = roundedOutput[i];
				const itemKey = JSON.stringify(item);
				const outputCount = outputFreq.get(itemKey) || 0;
				const expectedCount = expectedFreq.get(itemKey) || 0;
				const usedCount = expectedUsed.get(itemKey) || 0;

				if (expectedCount === 0) {
					// Extra element not in expected
					outputHtml += `<span class="text-red-400">${itemKey}</span>`;
					hasDiff = true;
				} else if (usedCount >= expectedCount) {
					// More of this element than expected
					outputHtml += `<span class="text-red-400">${itemKey}</span>`;
					hasDiff = true;
				} else {
					// Element exists in expected
					outputHtml += itemKey;
					expectedUsed.set(itemKey, usedCount + 1);
				}
			}

			// Display expected array with original order
			for (let i = 0; i < roundedExpected.length; i++) {
				if (i > 0) expectedHtml += ",";
				const item = roundedExpected[i];
				const itemKey = JSON.stringify(item);
				const outputCount = outputFreq.get(itemKey) || 0;
				const expectedCount = expectedFreq.get(itemKey) || 0;
				const usedInOutput = Math.min(
					outputCount,
					expectedCount - (expectedUsed.get(itemKey) || 0)
				);

				if (outputCount === 0) {
					// Missing element not in output
					expectedHtml += `<span class="text-green-400">${itemKey}</span>`;
					hasDiff = true;
					expectedUsed.set(
						itemKey,
						(expectedUsed.get(itemKey) || 0) + 1
					);
				} else if (usedInOutput === 0) {
					// More of this element than in output
					expectedHtml += `<span class="text-green-400">${itemKey}</span>`;
					hasDiff = true;
					expectedUsed.set(
						itemKey,
						(expectedUsed.get(itemKey) || 0) + 1
					);
				} else {
					// Element exists in output
					expectedHtml += itemKey;
					expectedUsed.set(
						itemKey,
						(expectedUsed.get(itemKey) || 0) + 1
					);
				}
			}

			outputHtml += "]";
			expectedHtml += "]";

			return {
				output: outputHtml,
				expected: expectedHtml,
				hasDiff,
			};
		}
	} else {
		// Order matters - do element-by-element comparison on original arrays
		const maxLength = Math.max(
			roundedOutput.length,
			roundedExpected.length
		);
		let outputHtml = "[";
		let expectedHtml = "[";
		let hasDiff = false;

		for (let i = 0; i < maxLength; i++) {
			const outputItem = roundedOutput[i];
			const expectedItem = roundedExpected[i];
			const outputExists = i < roundedOutput.length;
			const expectedExists = i < roundedExpected.length;

			// Add comma if not first element
			if (i > 0) {
				outputHtml += ",";
				expectedHtml += ",";
			}

			if (!outputExists) {
				// Missing in output - only show in expected
				expectedHtml += `<span class="text-green-400">${JSON.stringify(
					expectedItem
				)}</span>`;
				hasDiff = true;
			} else if (!expectedExists) {
				// Extra in output - only show in output
				outputHtml += `<span class="text-red-400">${JSON.stringify(
					outputItem
				)}</span>`;
				hasDiff = true;
			} else if (
				JSON.stringify(outputItem) !== JSON.stringify(expectedItem)
			) {
				// Different values
				outputHtml += `<span class="text-red-400">${JSON.stringify(
					outputItem
				)}</span>`;
				expectedHtml += `<span class="text-green-400">${JSON.stringify(
					expectedItem
				)}</span>`;
				hasDiff = true;
			} else {
				// Same values - no color
				outputHtml += JSON.stringify(outputItem);
				expectedHtml += JSON.stringify(expectedItem);
			}
		}

		outputHtml += "]";
		expectedHtml += "]";

		return {
			output: outputHtml,
			expected: expectedHtml,
			hasDiff,
		};
	}
}
