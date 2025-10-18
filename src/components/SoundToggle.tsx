"use client";

import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isSoundMuted, toggleMute } from "@/lib/soundManager";

interface SoundToggleProps {
	className?: string;
}

export default function SoundToggle({ className = "" }: SoundToggleProps) {
	const [muted, setMuted] = useState(false); // Default to unMuted until we check localStorage

	useEffect(() => {
		// Check initial mute state from localStorage
		setMuted(isSoundMuted());
	}, []);

	const handleToggle = () => {
		const newMutedState = toggleMute();
		setMuted(newMutedState);
	};

	return (
		<button
			onClick={handleToggle}
			className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
			title={muted ? "Unmute sounds" : "Mute sounds"}
			aria-label={muted ? "Unmute sounds" : "Mute sounds"}
		>
			{muted ? (
				<VolumeX className="w-5 h-5 text-gray-500" />
			) : (
				<Volume2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
			)}
		</button>
	);
}
