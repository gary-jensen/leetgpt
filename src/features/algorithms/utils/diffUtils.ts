interface DiffResult {
	output: string;
	expected: string;
	hasDiff: boolean;
}

export function createDiff(output: any, expected: any): DiffResult {
	// If either is not an array, return simple comparison
	if (!Array.isArray(output) || !Array.isArray(expected)) {
		const outputStr = JSON.stringify(output);
		const expectedStr = JSON.stringify(expected);
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

	// Both are arrays - do element-by-element comparison
	const maxLength = Math.max(output.length, expected.length);
	let outputHtml = "[";
	let expectedHtml = "[";
	let hasDiff = false;

	for (let i = 0; i < maxLength; i++) {
		const outputItem = output[i];
		const expectedItem = expected[i];
		const outputExists = i < output.length;
		const expectedExists = i < expected.length;

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
