/**
 * Crypto utilities with fallbacks for older browsers
 *
 * Provides compatible alternatives to crypto.randomUUID() and crypto.subtle
 * for browsers that don't support these APIs.
 */

import { v4 as uuidv4 } from "uuid";

/**
 * Generate a UUID with fallback for older browsers
 */
export function generateUUID(): string {
	// Try native crypto.randomUUID first (modern browsers)
	if (typeof crypto !== "undefined" && crypto.randomUUID) {
		try {
			return crypto.randomUUID();
		} catch (error) {
			// crypto.randomUUID failed, using fallback
		}
	}

	// Fallback to uuid library
	return uuidv4();
}

/**
 * Check if crypto.subtle is available
 */
export function isCryptoSubtleAvailable(): boolean {
	return (
		typeof crypto !== "undefined" &&
		crypto.subtle &&
		typeof crypto.subtle.digest === "function"
	);
}

/**
 * Generate random bytes with fallback
 */
export function getRandomValues(array: Uint8Array): Uint8Array {
	if (typeof crypto !== "undefined" && crypto.getRandomValues) {
		return crypto.getRandomValues(array);
	}

	// Fallback: use Math.random (less secure but works everywhere)
	for (let i = 0; i < array.length; i++) {
		array[i] = Math.floor(Math.random() * 256);
	}
	return array;
}

/**
 * Hash data using SHA-256 with fallback
 */
export async function hashSHA256(data: string): Promise<string> {
	if (isCryptoSubtleAvailable()) {
		try {
			const dataBuffer = new TextEncoder().encode(data);
			const hashBuffer = await crypto.subtle.digest(
				"SHA-256",
				dataBuffer
			);
			const hashArray = Array.from(new Uint8Array(hashBuffer));
			return hashArray
				.map((b) => b.toString(16).padStart(2, "0"))
				.join("");
		} catch (error) {
			// crypto.subtle.digest failed, using fallback
		}
	}

	// Fallback: simple hash function (not cryptographically secure)
	return simpleHash(data);
}

/**
 * Simple hash function fallback (not cryptographically secure)
 */
function simpleHash(str: string): string {
	let hash = 0;
	if (str.length === 0) return hash.toString(16);

	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32-bit integer
	}

	return Math.abs(hash).toString(16);
}

/**
 * Encrypt data with fallback
 */
export async function encryptData(
	data: string,
	password: string
): Promise<{ encrypted: string; iv: string }> {
	if (isCryptoSubtleAvailable()) {
		try {
			return await encryptWithSubtle(data, password);
		} catch (error) {
			// crypto.subtle encryption failed, using fallback
		}
	}

	// Fallback: simple obfuscation (not secure, just for basic obfuscation)
	return simpleObfuscate(data);
}

/**
 * Decrypt data with fallback
 */
export async function decryptData(
	encrypted: string,
	iv: string,
	password: string
): Promise<string> {
	if (isCryptoSubtleAvailable()) {
		try {
			return await decryptWithSubtle(encrypted, iv, password);
		} catch (error) {
			// Fallback to simple deobfuscation
		}
	}

	// Fallback: simple deobfuscation
	return simpleDeobfuscate(encrypted);
}

/**
 * Encrypt using crypto.subtle
 */
async function encryptWithSubtle(
	data: string,
	password: string
): Promise<{ encrypted: string; iv: string }> {
	const dataBuffer = new TextEncoder().encode(data);
	const passwordBuffer = new TextEncoder().encode(password);

	// Hash the password
	const hashBuffer = await crypto.subtle.digest("SHA-256", passwordBuffer);

	// Import the key
	const key = await crypto.subtle.importKey(
		"raw",
		hashBuffer,
		{ name: "AES-GCM" },
		false,
		["encrypt"]
	);

	// Generate IV
	const ivArray = new Uint8Array(12);
	getRandomValues(ivArray);
	const iv = ivArray;

	// Encrypt
	const encryptedBuffer = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		key,
		dataBuffer
	);

	return {
		encrypted: Array.from(new Uint8Array(encryptedBuffer))
			.map((b) => b.toString(16).padStart(2, "0"))
			.join(""),
		iv: Array.from(iv)
			.map((b) => b.toString(16).padStart(2, "0"))
			.join(""),
	};
}

/**
 * Decrypt using crypto.subtle
 */
async function decryptWithSubtle(
	encrypted: string,
	iv: string,
	password: string
): Promise<string> {
	try {
		// Validate input format
		if (!encrypted || !iv || !password) {
			throw new Error("Missing required parameters for decryption");
		}

		// Check if the encrypted string is valid hex
		if (!/^[0-9a-fA-F]+$/.test(encrypted)) {
			throw new Error("Invalid encrypted data format - not hex");
		}

		// Check if the IV string is valid hex
		if (!/^[0-9a-fA-F]+$/.test(iv)) {
			throw new Error("Invalid IV format - not hex");
		}

		// Ensure even length for hex parsing
		if (encrypted.length % 2 !== 0) {
			throw new Error("Invalid encrypted data length - must be even");
		}

		if (iv.length % 2 !== 0) {
			throw new Error("Invalid IV length - must be even");
		}

		const encryptedArray = new Uint8Array(
			encrypted.match(/.{2}/g)!.map((byte) => parseInt(byte, 16))
		);
		const encryptedBuffer = encryptedArray;
		const ivArray = new Uint8Array(
			iv.match(/.{2}/g)!.map((byte) => parseInt(byte, 16))
		);
		const ivBuffer = ivArray;
		const passwordBuffer = new TextEncoder().encode(password);

		// Hash the password
		const hashBuffer = await crypto.subtle.digest(
			"SHA-256",
			passwordBuffer
		);

		// Import the key
		const key = await crypto.subtle.importKey(
			"raw",
			hashBuffer,
			{ name: "AES-GCM" },
			false,
			["decrypt"]
		);

		// Decrypt
		const decryptedBuffer = await crypto.subtle.decrypt(
			{ name: "AES-GCM", iv: ivBuffer },
			key,
			encryptedBuffer
		);

		return new TextDecoder().decode(decryptedBuffer);
	} catch (error) {
		throw error;
	}
}

/**
 * Simple obfuscation fallback (not secure)
 */
function simpleObfuscate(data: string): { encrypted: string; iv: string } {
	const iv = generateUUID().replace(/-/g, "");
	let encrypted = "";

	for (let i = 0; i < data.length; i++) {
		const charCode = data.charCodeAt(i);
		const ivChar = iv.charCodeAt(i % iv.length);
		encrypted += (charCode ^ ivChar).toString(16).padStart(2, "0");
	}

	return { encrypted, iv };
}

/**
 * Simple deobfuscation fallback
 */
function simpleDeobfuscate(encrypted: string): string {
	// This is a placeholder - in practice, you'd need to store the IV
	// For now, just return the original data if we can't decrypt
	return encrypted;
}
