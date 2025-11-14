"use client";

import {
	generateUUID,
	hashSHA256,
	encryptData,
	decryptData,
} from "@/lib/cryptoUtils";

const GUEST_ID_KEY = "leetgpt_guest_id";
const APP_SECRET = "leetgpt-v1-secret-2025"; // Application secret for key derivation

// Memory cache for decrypted guest ID (survives component re-renders, not page refreshes)
let cachedGuestId: string | null = null;
let cacheInitialized = false;

/**
 * Generate a secure guest ID
 */
function generateGuestId(): string {
	// Use our crypto utility with fallback
	return generateUUID();
}

/**
 * Generate a browser fingerprint for key derivation
 * This makes the encrypted data browser-specific
 */
async function getBrowserFingerprint(): Promise<string> {
	const data = [
		navigator.userAgent,
		navigator.language,
		screen.colorDepth.toString(),
		screen.width.toString(),
		screen.height.toString(),
		new Date().getTimezoneOffset().toString(),
		APP_SECRET,
	].join("|");

	// Hash the fingerprint data
	const hashHex = await hashSHA256(data);

	return hashHex;
}

/**
 * Derive an encryption key from browser fingerprint
 */
async function deriveKey(): Promise<string> {
	const fingerprint = await getBrowserFingerprint();
	return fingerprint;
}

/**
 * Encrypt the guest ID with AES-GCM
 */
async function encryptGuestId(guestId: string): Promise<string> {
	try {
		const key = await deriveKey();
		const result = await encryptData(guestId, key);

		// Combine IV and encrypted data for compatibility
		const combined = result.iv + ":" + result.encrypted;
		return btoa(combined);
	} catch (error) {
		// console.error("Encryption failed:", error);
		// Fallback: return the plain guest ID
		return guestId;
	}
}

/**
 * Decrypt the guest ID
 */
async function decryptGuestId(encryptedData: string): Promise<string | null> {
	try {
		// Check if the data looks like it might be corrupted or from a different format
		if (!encryptedData || encryptedData.length < 10) {
			return null;
		}

		const key = await deriveKey();

		// Decode from base64
		const combined = atob(encryptedData);
		const [iv, encrypted] = combined.split(":");

		if (!iv || !encrypted) {
			return null;
		}

		// Decrypt the data
		const decrypted = await decryptData(encrypted, iv, key);

		// Check if decryption returned the fallback deobfuscation result
		// (which means the real decryption failed)
		if (decrypted === encrypted) {
			clearGuestId();
			return null;
		}

		return decrypted;
	} catch (error) {
		// Clear the corrupted data - this will trigger regeneration of a new guest ID
		clearGuestId();
		return null;
	}
}

/**
 * Initialize the cache by decrypting guest ID from localStorage
 */
async function initializeCache(): Promise<void> {
	if (cacheInitialized) return;

	try {
		const encrypted = localStorage.getItem(GUEST_ID_KEY);
		if (encrypted) {
			// Check if the data looks like it might be from the old format
			// Look for the specific pattern we saw in the error logs
			if (
				encrypted.length > 100 &&
				encrypted.includes("3399aeb540064a70cf19")
			) {
				// Silently clear corrupted data from old format
				clearGuestId();
				cachedGuestId = null;
				return; // Exit early to prevent further processing
			}

			// Try to decrypt normally
			cachedGuestId = await decryptGuestId(encrypted);
			if (!cachedGuestId) {
				// Decryption failed - silently handle
			}
		}
	} catch (error) {
		// console.error("Failed to initialize guest ID cache:", error);
		// Clear any potentially corrupted data
		clearGuestId();
	}

	cacheInitialized = true;
}

// Auto-initialize cache on module load
if (typeof window !== "undefined") {
	initializeCache();
}

/**
 * Get existing guest ID from localStorage (doesn't create new one)
 * Use getOrCreateGuestId() if you want to create one for unauthenticated users
 * Returns empty string if not initialized yet or no guest ID exists
 */
export function getGuestId(): string {
	if (typeof window === "undefined") {
		return "";
	}

	// Return cached value (will be null/empty on first call until cache initializes)
	return cachedGuestId || "";
}

/**
 * Get existing guest ID (async version with decryption)
 */
export async function getGuestIdAsync(): Promise<string> {
	if (typeof window === "undefined") {
		return "";
	}

	try {
		const encrypted = localStorage.getItem(GUEST_ID_KEY);
		if (!encrypted) return "";

		// Try to decrypt
		const decrypted = await decryptGuestId(encrypted);
		if (decrypted) {
			return decrypted;
		}

		// If decryption fails (tampering detected), clear and return empty
		console.warn("Guest ID tampering detected, clearing...");
		clearGuestId();
		return "";
	} catch (error) {
		// Failed to get guest ID
		return "";
	}
}

/**
 * Get or create a guest ID from localStorage (only for unauthenticated users)
 */
export async function getOrCreateGuestId(): Promise<string> {
	if (typeof window === "undefined") {
		return "";
	}

	try {
		// Ensure cache is initialized
		await initializeCache();

		// Check if we already have a cached guest ID
		if (cachedGuestId) {
			return cachedGuestId;
		}

		const encrypted = localStorage.getItem(GUEST_ID_KEY);

		if (encrypted) {
			// Try to decrypt existing ID
			const decrypted = await decryptGuestId(encrypted);
			if (decrypted) {
				cachedGuestId = decrypted; // Update cache
				return decrypted;
			}

			// Tampering detected, create new ID
			console.warn("Guest ID tampering detected, creating new...");
		}

		// Create new guest ID
		const guestId = generateGuestId();
		const encryptedId = await encryptGuestId(guestId);
		localStorage.setItem(GUEST_ID_KEY, encryptedId);

		// Update cache
		cachedGuestId = guestId;

		return guestId;
	} catch (error) {
		// console.error("Failed to get/create guest ID:", error);
		// Return a session-based ID as fallback
		return "guest_" + Date.now();
	}
}

/**
 * Clear the guest ID (useful when user signs in)
 */
export function clearGuestId(): void {
	if (typeof window === "undefined") return;

	try {
		localStorage.removeItem(GUEST_ID_KEY);
		// Clear the cache
		cachedGuestId = null;
		cacheInitialized = false;
	} catch (error) {
		// console.error("Failed to clear guest ID:", error);
	}
}

/**
 * Check if a guest ID exists
 */
export function hasGuestId(): boolean {
	if (typeof window === "undefined") return false;

	try {
		return localStorage.getItem(GUEST_ID_KEY) !== null;
	} catch (error) {
		return false;
	}
}
