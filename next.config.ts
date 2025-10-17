import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	eslint: {
		// Enable ESLint during builds
		ignoreDuringBuilds: false,
	},
	typescript: {
		// Keep TypeScript checks enabled
		ignoreBuildErrors: false,
	},
};

export default nextConfig;
