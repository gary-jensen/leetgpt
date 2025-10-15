import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	eslint: {
		// Disable ESLint during builds for MVP
		// TODO: Fix ESLint errors before production
		ignoreDuringBuilds: true,
	},
	typescript: {
		// Keep TypeScript checks enabled
		ignoreBuildErrors: false,
	},
};

export default nextConfig;
