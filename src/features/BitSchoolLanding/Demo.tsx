"use client";

import WorkspaceDemo from "./components/WorkspaceDemo";

export default function Demo() {
	return (
		<section id="demo" className="pt-16 px-4 pb-20">
			<div className="max-w-7xl mx-auto">
				<div className="text-center mb-12">
					<h2 className="text-4xl md:text-5xl font-bold text-foreground">
						Interactive Demo
					</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
						Experience AI-powered coding in action. No sign up
						required.
					</p>
				</div>

				{/* Demo Container */}
				<div className="relative">
					<div className="bg-background-3 border border-border rounded-lg p-4 md:p-6 h-fit hf-[85vh] md:h-[70vh]">
						<WorkspaceDemo />
					</div>
				</div>
			</div>
		</section>
	);
}

const ComingSoon = () => {
	return (
		<div className="text-center">
			<div className="w-16 h-16 mx-auto mb-4 bg-orange-500/10 rounded-full flex items-center justify-center">
				<svg
					className="w-8 h-8 text-orange-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			</div>
			<h3 className="text-xl font-semibold text-foreground mb-2">
				Interactive Workspace Demo
			</h3>
			<p className="text-muted-foreground">
				Coming soon: Live coding environment with AI assistance
			</p>
		</div>
	);
};
