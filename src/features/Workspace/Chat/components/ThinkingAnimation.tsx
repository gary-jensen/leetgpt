import React from "react";

const ThinkingAnimation = () => {
	return (
		<div className="flex items-center gap-2 text-gray-500 text-sm">
			<span>thinking</span>
			<div className="flex gap-1">
				<div
					className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
					style={{ animationDelay: "0ms" }}
				></div>
				<div
					className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
					style={{ animationDelay: "150ms" }}
				></div>
				<div
					className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
					style={{ animationDelay: "300ms" }}
				></div>
			</div>
		</div>
	);
};

export default ThinkingAnimation;
