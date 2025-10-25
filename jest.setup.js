import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/navigation", () => ({
	useRouter() {
		return {
			push: jest.fn(),
			replace: jest.fn(),
			prefetch: jest.fn(),
			back: jest.fn(),
			forward: jest.fn(),
			refresh: jest.fn(),
		};
	},
	useParams() {
		return {};
	},
	useSearchParams() {
		return new URLSearchParams();
	},
	usePathname() {
		return "";
	},
}));

// Mock console methods to avoid noise in tests
global.console = {
	...console,
	// Uncomment to ignore a specific log level
	// log: jest.fn(),
	// debug: jest.fn(),
	// info: jest.fn(),
	// warn: jest.fn(),
	// error: jest.fn(),
};

// Mock cryptoUtils to avoid UUID ES module issues
jest.mock("@/lib/cryptoUtils", () => ({
	generateUUID: jest.fn(() => "mock-uuid-123"),
	isCryptoSubtleAvailable: jest.fn(() => false),
	getRandomValues: jest.fn((array) => {
		for (let i = 0; i < array.length; i++) {
			array[i] = Math.floor(Math.random() * 256);
		}
		return array;
	}),
	hashSHA256: jest.fn(() => Promise.resolve("mock-hash")),
	encryptData: jest.fn(() =>
		Promise.resolve({ encrypted: "mock-encrypted", iv: "mock-iv" })
	),
	decryptData: jest.fn(() => Promise.resolve("mock-decrypted")),
}));

// Mock auth module to avoid NextAuth/jose ES module issues
jest.mock("@/lib/auth", () => ({
	getServerSession: jest.fn(() => Promise.resolve(null)),
}));

// Mock useConsole hook
jest.mock("@/hooks/workspace/useConsole", () => ({
	__esModule: true,
	default: jest.fn(() => ({
		iframeRef: { current: null },
		handleTest: jest.fn(),
		isExecuting: false,
		handleRun: jest.fn(),
		lastResult: null,
	})),
}));
