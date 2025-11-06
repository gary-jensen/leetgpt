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
	experimental: {
		serverActions: {
			bodySizeLimit: "10mb", // Increased from default 1mb to handle large test case arrays
		},
	},
};

export default nextConfig;
