import Analytics from "@/components/Analytics";
import SessionProvider from "@/components/SessionProvider";
import { ProgressProvider } from "@/contexts/ProgressContext";
import { lessonMetadata } from "@/features/Workspace/lesson-data/lessons";
import { getSession, setLessonMetadata } from "@/lib/auth";
import type { Metadata } from "next";
import { DM_Sans, Inter } from "next/font/google";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import "./globals.css";
import { prisma } from "@/lib/prisma";

const dmSans = DM_Sans({
	variable: "--font-dm-sans",
	subsets: ["latin"],
});

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "LeetGPT - Master Algorithms & Coding Challenges",
	description:
		"Practice coding problems and master algorithms with AI-powered guidance. Solve challenges, improve your problem-solving skills, and prepare for technical interviews with real-time feedback.",
	keywords: [
		"algorithms",
		"coding challenges",
		"data structures",
		"programming practice",
		"technical interview prep",
		"problem solving",
		"competitive programming",
	],
	authors: [{ name: "LeetGPT" }],
	openGraph: {
		title: "LeetGPT - Master Algorithms & Coding Challenges",
		description:
			"Practice coding problems and master algorithms with AI-powered guidance. Solve challenges and improve your problem-solving skills with real-time feedback.",
		type: "website",
		url: "https://leetgpt.app",
		images: ["https://leetgpt.app/preview-image.png"], // URL to the image for the card
	},
	twitter: {
		card: "summary_large_image",
		title: "LeetGPT - Master Algorithms & Coding Challenges",
		description:
			"Practice coding problems and master algorithms with AI-powered guidance. Solve challenges and improve your problem-solving skills with real-time feedback.",
		images: ["https://leetgpt.app/preview-image.png"], // URL to the image for the card
	},
};

// Set lesson metadata in auth config so it's available in JWT callback
setLessonMetadata(lessonMetadata);

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${inter.variable} ${dmSans.variable} antialiased`}
			>
				<SessionProvider>
					<ProgressProvider
						lessonMetadata={lessonMetadata}
						// session={session}
						// initialAlgoProblemProgress={initialAlgo.problemProgress}
						// initialAlgoLessonProgress={initialAlgo.lessonProgress}
						// initialAlgoSubmissions={initialAlgo.submissions}
					>
						<Analytics />
						<VercelAnalytics />
						<Toaster />
						{children}
					</ProgressProvider>
				</SessionProvider>
			</body>
		</html>
	);
}
