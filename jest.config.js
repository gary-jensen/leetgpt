const nextJest = require("next/jest");

const createJestConfig = nextJest({
	// Provide the path to your Next.js app to load next.config.js and .env files
	dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
	setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
	testEnvironment: "jest-environment-jsdom",
	testMatch: [
		"<rootDir>/src/lib/__tests__/**/*.test.ts",
		"<rootDir>/src/lib/__tests__/**/*.test.tsx",
		"<rootDir>/src/features/**/__tests__/**/*.test.ts",
		"<rootDir>/src/features/**/__tests__/**/*.test.tsx",
	],
	collectCoverageFrom: [
		"src/lib/**/*.{js,jsx,ts,tsx}",
		"src/features/**/*.{js,jsx,ts,tsx}",
		"!src/lib/**/*.d.ts",
		"!src/lib/__tests__/**",
		"!src/features/**/__tests__/**",
	],
	coverageThreshold: {
		"src/lib/rateLimit.ts": {
			branches: 65,
			functions: 85,
			lines: 80,
			statements: 80,
		},
		"src/lib/lessonValidation.ts": {
			branches: 90,
			functions: 100,
			lines: 95,
			statements: 95,
		},
		"src/lib/serverUtils.ts": {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100,
		},
		"src/lib/validation.ts": {
			branches: 60,
			functions: 65,
			lines: 60,
			statements: 60,
		},
	},
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1",
	},
	transformIgnorePatterns: ["node_modules/(?!(uuid)/)"],
	testTimeout: 10000,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
