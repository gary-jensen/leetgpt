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
	title: "BitSchool - Learn JavaScript Through Interactive Coding",
	description:
		"Master JavaScript through hands-on, interactive lessons. Learn by doing with real-time code execution, AI-powered guidance, and gamified progression.",
	keywords: [
		"JavaScript",
		"learn to code",
		"programming",
		"web development",
		"coding tutorial",
		"interactive learning",
	],
	authors: [{ name: "BitSchool" }],
	openGraph: {
		title: "BitSchool - Learn JavaScript Through Interactive Coding",
		description:
			"Master JavaScript through hands-on, interactive lessons. Learn by doing with real-time code execution and gamified progression.",
		type: "website",
		url: "https://thebitschool.com",
		images: ["https://thebitschool.com/preview-image.png"], // URL to the image for the card
	},
	twitter: {
		card: "summary_large_image",
		title: "BitSchool - Learn JavaScript Through Interactive Coding",
		description:
			"Master JavaScript through hands-on, interactive lessons. Learn by doing with real-time code execution and gamified progression.",
		images: ["https://thebitschool.com/preview-image.png"], // URL to the image for the card
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
