const nextJest = require("next/jest");

const createJestConfig = nextJest({
	// Provide the path to your Next.js app to load next.config.js and .env files
	dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
	setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
	testEnvironment: "jsdom",
	testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1",
	},
	transformIgnorePatterns: ["node_modules/(?!(uuid|jose|openid-client)/)"],
	collectCoverageFrom: [
		"src/**/*.{js,jsx,ts,tsx}",
		"!src/**/*.d.ts",
		"!src/**/__tests__/**",
		"!src/**/node_modules/**",
	],
	coverageReporters: ["text", "lcov", "html"],
	coverageDirectory: "coverage",
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
