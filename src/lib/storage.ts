/**
 * Secure localStorage utilities with encryption and validation
 */

import { UserProgress } from "./progressionSystem";
import { isCryptoSubtleAvailable } from "./cryptoUtils";

// Encryption key derivation from environment variable
// In production, this should be a proper secret management solution
const getEncryptionKey = async (): Promise<CryptoKey | null> => {
	// Check if crypto.subtle is available
	if (!isCryptoSubtleAvailable()) {
		console.warn("crypto.subtle not available, encryption disabled");
		return null;
	}
	const secret =
		process.env.LOCAL_STORAGE_SECRET ||
		"bitschool-default-secret-change-in-production";

	// Convert secret to key material
	const encoder = new TextEncoder();
	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "PBKDF2" },
		false,
		["deriveBits", "deriveKey"]
	);

	// Derive AES-GCM key from key material
	const key = await crypto.subtle.deriveKey(
		{
			name: "PBKDF2",
			salt: encoder.encode("bitschool-salt"), // Static salt for deterministic key
			iterations: 100000,
			hash: "SHA-256",
		},
		keyMaterial,
		{ name: "AES-GCM", length: 256 },
		false,
		["encrypt", "decrypt"]
	);

	return key;
};

/**
 * Encrypt data using AES-GCM
 */
const encrypt = async (data: string): Promise<string> => {
	try {
		const key = await getEncryptionKey();
		if (!key) {
			// Fallback: use simple XOR encryption with a derived key
			return encryptWithFallback(data);
		}
		const encoder = new TextEncoder();
		const dataBuffer = encoder.encode(data);

		// Generate random IV (Initialization Vector)
		const iv = crypto.getRandomValues(new Uint8Array(12));

		// Encrypt the data
		const encryptedBuffer = await crypto.subtle.encrypt(
			{ name: "AES-GCM", iv },
			key,
			dataBuffer
		);

		// Combine IV and encrypted data
		const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
		combined.set(iv, 0);
		combined.set(new Uint8Array(encryptedBuffer), iv.length);

		// Convert to base64 for storage
		return btoa(String.fromCharCode(...combined));
	} catch (error) {
		console.error("Encryption failed:", error);
		throw new Error("Failed to encrypt data");
	}
};

/**
 * Decrypt data using AES-GCM
 */
const decrypt = async (encryptedData: string): Promise<string> => {
	try {
		const key = await getEncryptionKey();
		if (!key) {
			// Fallback: use simple XOR decryption
			return decryptWithFallback(encryptedData);
		}

		// Convert from base64
		const combined = Uint8Array.from(atob(encryptedData), (c) =>
			c.charCodeAt(0)
		);

		// Extract IV and encrypted data
		const iv = combined.slice(0, 12);
		const data = combined.slice(12);

		// Decrypt
		const decryptedBuffer = await crypto.subtle.decrypt(
			{ name: "AES-GCM", iv },
			key,
			data
		);

		// Convert back to string
		const decoder = new TextDecoder();
		return decoder.decode(decryptedBuffer);
	} catch (error) {
		console.error("Decryption failed:", error);
		throw new Error("Failed to decrypt data");
	}
};

/**
 * Validate UserProgress data structure
 */
const validateProgress = (data: any): data is UserProgress => {
	if (!data || typeof data !== "object") return false;

	// Check required fields
	if (typeof data.xp !== "number") return false;
	if (typeof data.level !== "number") return false;
	if (typeof data.currentSkillNodeId !== "string") return false;
	if (!Array.isArray(data.completedLessons)) return false;
	if (!Array.isArray(data.skillNodes)) return false;

	// Validate XP and level ranges
	if (data.xp < 0 || data.xp > 1000000) return false;
	if (data.level < 1 || data.level > 100) return false;

	// Validate completedLessons array contains only strings
	if (!data.completedLessons.every((l: any) => typeof l === "string"))
		return false;

	// Validate skillNodes array structure
	if (
		!data.skillNodes.every(
			(node: any) =>
				node &&
				typeof node.id === "string" &&
				typeof node.name === "string" &&
				Array.isArray(node.lessons) &&
				typeof node.completed === "boolean" &&
				typeof node.progress === "number"
		)
	)
		return false;

	return true;
};

/**
 * Create a checksum/signature for data integrity
 */
const createChecksum = async (data: string): Promise<string> => {
	const encoder = new TextEncoder();
	const dataBuffer = encoder.encode(data);
	const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

/**
 * Securely save progress to localStorage with encryption and validation
 */
export const saveProgressToStorage = async (
	progress: UserProgress
): Promise<void> => {
	try {
		// Add timestamp for additional validation
		const dataToSave = {
			...progress,
			_timestamp: Date.now(),
			_version: 1, // Schema version for future migrations
		};

		const jsonData = JSON.stringify(dataToSave);

		// Create checksum before encryption
		const checksum = await createChecksum(jsonData);

		// Encrypt the data
		const encryptedData = await encrypt(jsonData);

		// Store encrypted data and checksum separately
		localStorage.setItem("bitschool-progress", encryptedData);
		localStorage.setItem("bitschool-progress-checksum", checksum);
	} catch (error) {
		console.error("Failed to save progress to storage:", error);
		// Fallback: try to save unencrypted if encryption fails
		try {
			localStorage.setItem(
				"bitschool-progress",
				JSON.stringify(progress)
			);
		} catch (fallbackError) {
			console.error("Fallback save also failed:", fallbackError);
		}
	}
};

/**
 * Securely load progress from localStorage with decryption and validation
 */
export const loadProgressFromStorage =
	async (): Promise<UserProgress | null> => {
		try {
			const encryptedData = localStorage.getItem("bitschool-progress");
			const storedChecksum = localStorage.getItem(
				"bitschool-progress-checksum"
			);

			if (!encryptedData) {
				return null;
			}

			// Try to decrypt
			let jsonData: string;
			try {
				jsonData = await decrypt(encryptedData);
			} catch (decryptError) {
				// If decryption fails, try to parse as unencrypted (for backward compatibility)
				console.warn(
					"Decryption failed, attempting to parse as unencrypted data"
				);
				jsonData = encryptedData;
			}

			// Verify checksum if available
			if (storedChecksum) {
				const calculatedChecksum = await createChecksum(jsonData);
				if (calculatedChecksum !== storedChecksum) {
					console.error(
						"Data integrity check failed - checksum mismatch"
					);
					// Clear corrupted data
					localStorage.removeItem("bitschool-progress");
					localStorage.removeItem("bitschool-progress-checksum");
					return null;
				}
			}

			// Parse JSON
			const parsedData: any = JSON.parse(jsonData);

			// Check if data is too old (optional: 90 days) BEFORE validation
			if (
				parsedData._timestamp &&
				typeof parsedData._timestamp === "number"
			) {
				const age = Date.now() - parsedData._timestamp;
				const maxAge = 90 * 24 * 60 * 60 * 1000; // 90 days
				if (age > maxAge) {
					console.warn(
						"Progress data is older than 90 days, clearing"
					);
					localStorage.removeItem("bitschool-progress");
					localStorage.removeItem("bitschool-progress-checksum");
					return null;
				}
			}

			// Validate structure (validates the progress data, not metadata)
			if (!validateProgress(parsedData)) {
				console.error("Data validation failed - invalid structure");
				// Clear invalid data
				localStorage.removeItem("bitschool-progress");
				localStorage.removeItem("bitschool-progress-checksum");
				return null;
			}

			// Remove metadata before returning (create clean copy)
			const progress: UserProgress = {
				xp: parsedData.xp,
				level: parsedData.level,
				currentSkillNodeId: parsedData.currentSkillNodeId,
				completedLessons: parsedData.completedLessons,
				skillNodes: parsedData.skillNodes,
			};

			return progress;
		} catch (error) {
			console.error("Failed to load progress from storage:", error);
			// Clear corrupted data
			localStorage.removeItem("bitschool-progress");
			localStorage.removeItem("bitschool-progress-checksum");
			return null;
		}
	};

/**
 * Clear all progress data from localStorage
 */
export const clearProgressFromStorage = (): void => {
	localStorage.removeItem("bitschool-progress");
	localStorage.removeItem("bitschool-progress-checksum");
};

/**
 * Fallback encryption using XOR with a derived key
 * This provides basic obfuscation when crypto.subtle is not available
 */
function encryptWithFallback(data: string): string {
	try {
		// Create a simple key from the domain and a fixed salt
		const key = createFallbackKey();
		const keyBytes = new TextEncoder().encode(key);

		// Generate a simple IV from current time and random data
		const iv = createFallbackIV();
		const ivBytes = new TextEncoder().encode(iv);

		let encrypted = "";
		for (let i = 0; i < data.length; i++) {
			const dataChar = data.charCodeAt(i);
			const keyChar = keyBytes[i % keyBytes.length];
			const ivChar = ivBytes[i % ivBytes.length];
			// XOR with both key and IV for better obfuscation
			const encryptedChar = dataChar ^ keyChar ^ ivChar;
			encrypted += encryptedChar.toString(16).padStart(2, "0");
		}

		// Prepend IV to the encrypted data
		return iv + ":" + encrypted;
	} catch (error) {
		console.error("Fallback encryption failed:", error);
		// Ultimate fallback: base64 encoding
		return btoa(data);
	}
}

/**
 * Fallback decryption using XOR with a derived key
 */
function decryptWithFallback(encryptedData: string): string {
	try {
		// Check if it's the new format with IV
		if (encryptedData.includes(":")) {
			const [iv, encrypted] = encryptedData.split(":", 2);
			const key = createFallbackKey();
			const keyBytes = new TextEncoder().encode(key);
			const ivBytes = new TextEncoder().encode(iv);

			let decrypted = "";
			for (let i = 0; i < encrypted.length; i += 2) {
				const encryptedByte = parseInt(encrypted.substr(i, 2), 16);
				const keyChar = keyBytes[(i / 2) % keyBytes.length];
				const ivChar = ivBytes[(i / 2) % ivBytes.length];
				// XOR with both key and IV
				const decryptedChar = encryptedByte ^ keyChar ^ ivChar;
				decrypted += String.fromCharCode(decryptedChar);
			}
			return decrypted;
		} else {
			// Legacy format: try to decode as base64
			return atob(encryptedData);
		}
	} catch (error) {
		console.error("Fallback decryption failed:", error);
		// Ultimate fallback: return as-is
		return encryptedData;
	}
}

/**
 * Create a fallback encryption key
 */
function createFallbackKey(): string {
	// Use domain + a fixed salt + some browser fingerprinting
	const domain =
		typeof window !== "undefined" ? window.location.hostname : "localhost";
	const userAgent =
		typeof navigator !== "undefined" ? navigator.userAgent : "unknown";
	const language =
		typeof navigator !== "undefined" ? navigator.language : "en";

	// Create a deterministic key from available data
	const keyData = `${domain}:${userAgent}:${language}:bitschool_storage_key`;

	// Simple hash function
	let hash = 0;
	for (let i = 0; i < keyData.length; i++) {
		const char = keyData.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32-bit integer
	}

	// Convert to a string and pad to 32 characters
	return Math.abs(hash).toString(16).padStart(32, "0");
}

/**
 * Create a fallback IV (Initialization Vector)
 */
function createFallbackIV(): string {
	// Use current time + some randomness for IV
	const timestamp = Date.now().toString(16);
	const random = Math.random().toString(16).substring(2);
	return (timestamp + random).substring(0, 16);
}
