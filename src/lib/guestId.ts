"use client";

const GUEST_ID_KEY = "bitschool_guest_id";
const APP_SECRET = "bitschool-v1-secret-2025"; // Application secret for key derivation

// Memory cache for decrypted guest ID (survives component re-renders, not page refreshes)
let cachedGuestId: string | null = null;
let cacheInitialized = false;

/**
 * Generate a secure guest ID
 */
function generateGuestId(): string {
	// Use crypto.randomUUID if available, otherwise fallback
	if (typeof crypto !== "undefined" && crypto.randomUUID) {
		return crypto.randomUUID();
	}

	// Fallback for older browsers
	return (
		"guest_" + Date.now() + "_" + Math.random().toString(36).substring(2)
	);
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
	const encoder = new TextEncoder();
	const dataBuffer = encoder.encode(data);
	const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

	return hashHex;
}

/**
 * Derive an encryption key from browser fingerprint
 */
async function deriveKey(): Promise<CryptoKey> {
	const fingerprint = await getBrowserFingerprint();
	const encoder = new TextEncoder();
	const keyMaterial = encoder.encode(fingerprint);

	// Import the key material
	const key = await crypto.subtle.importKey(
		"raw",
		keyMaterial.slice(0, 32), // Use first 32 bytes for AES-256
		{ name: "AES-GCM" },
		false,
		["encrypt", "decrypt"]
	);

	return key;
}

/**
 * Encrypt the guest ID with AES-GCM
 */
async function encryptGuestId(guestId: string): Promise<string> {
	try {
		const key = await deriveKey();
		const encoder = new TextEncoder();
		const data = encoder.encode(guestId);

		// Generate a random IV (initialization vector)
		const iv = crypto.getRandomValues(new Uint8Array(12));

		// Encrypt the data
		const encryptedBuffer = await crypto.subtle.encrypt(
			{ name: "AES-GCM", iv },
			key,
			data
		);

		// Combine IV and encrypted data
		const encryptedArray = new Uint8Array(encryptedBuffer);
		const combined = new Uint8Array(iv.length + encryptedArray.length);
		combined.set(iv);
		combined.set(encryptedArray, iv.length);

		// Convert to base64
		return btoa(String.fromCharCode(...combined));
	} catch (error) {
		console.error("Encryption failed:", error);
		// Fallback: return the plain guest ID
		return guestId;
	}
}

/**
 * Decrypt the guest ID
 */
async function decryptGuestId(encryptedData: string): Promise<string | null> {
	try {
		const key = await deriveKey();

		// Decode from base64
		const combined = Uint8Array.from(atob(encryptedData), (c) =>
			c.charCodeAt(0)
		);

		// Extract IV and encrypted data
		const iv = combined.slice(0, 12);
		const encryptedArray = combined.slice(12);

		// Decrypt the data
		const decryptedBuffer = await crypto.subtle.decrypt(
			{ name: "AES-GCM", iv },
			key,
			encryptedArray
		);

		// Convert back to string
		const decoder = new TextDecoder();
		return decoder.decode(decryptedBuffer);
	} catch (error) {
		console.error("Decryption failed (possible tampering):", error);
		return null; // Tampering detected or invalid data
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
			cachedGuestId = await decryptGuestId(encrypted);
			if (!cachedGuestId) {
				// Tampering detected, clear it
				console.warn("Guest ID tampering detected");
				clearGuestId();
			}
		}
	} catch (error) {
		console.error("Failed to initialize guest ID cache:", error);
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
		console.error("Failed to get guest ID:", error);
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
		console.error("Failed to get/create guest ID:", error);
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
		console.error("Failed to clear guest ID:", error);
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
