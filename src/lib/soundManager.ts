import { Howl } from "howler";

// Sound file paths
const SOUND_PATHS = {
	success: "/sounds/success.mp3",
	error: "/sounds/error.mp3",
	levelup: "/sounds/levelup.mp3",
} as const;

// Sound instances
const sounds: {
	success: Howl | null;
	error: Howl | null;
	levelup: Howl | null;
} = {
	success: null,
	error: null,
	levelup: null,
};

// Mute state
let isMuted = false;

// Initialize sounds
function initializeSounds() {
	// Check if sounds are already initialized
	if (sounds.success || sounds.error || sounds.levelup) {
		return;
	}

	// Load mute preference from localStorage
	const savedMuteState = localStorage.getItem("bitschool-sound-muted");
	isMuted = savedMuteState === "true";

	// Initialize each sound with error handling
	sounds.success = new Howl({
		src: [SOUND_PATHS.success],
		volume: 0.5,
		onloaderror: () => {
			console.warn("Failed to load success sound");
		},
	});

	sounds.error = new Howl({
		src: [SOUND_PATHS.error],
		volume: 0.5,
		onloaderror: () => {
			console.warn("Failed to load error sound");
		},
	});

	// sounds.levelup = new Howl({
	// 	src: [SOUND_PATHS.levelup],
	// 	volume: 0.7,
	// 	onloaderror: () => {
	// 		console.warn("Failed to load level up sound");
	// 	},
	// });
}

// Play sound function with mute check
function playSound(soundName: keyof typeof sounds) {
	if (isMuted) return;

	const sound = sounds[soundName];
	if (sound && sound.state() === "loaded") {
		sound.play();
	}
}

// Public API
export function playSuccessSound() {
	initializeSounds();
	playSound("success");
}

export function playErrorSound() {
	initializeSounds();
	playSound("error");
}

// export function playLevelUpSound() {
// 	initializeSounds();
// 	playSound("levelup");
// }

export function toggleMute(): boolean {
	isMuted = !isMuted;
	localStorage.setItem("bitschool-sound-muted", isMuted.toString());
	return isMuted;
}

export function isSoundMuted(): boolean {
	return isMuted;
}

export function setMute(muted: boolean) {
	isMuted = muted;
	localStorage.setItem("bitschool-sound-muted", muted.toString());
}

// Initialize sounds on module load
if (typeof window !== "undefined") {
	initializeSounds();
}
