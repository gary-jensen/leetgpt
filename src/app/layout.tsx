import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { ProgressProvider } from "@/contexts/ProgressContext";
import { mockLessons } from "@/features/Workspace/mock-lessons";
import SessionProvider from "@/components/SessionProvider";
import Analytics from "@/components/Analytics";
import { getSession } from "@/lib/auth";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
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
	},
	twitter: {
		card: "summary_large_image",
		title: "BitSchool - Learn JavaScript Through Interactive Coding",
		description:
			"Master JavaScript through hands-on, interactive lessons. Learn by doing with real-time code execution and gamified progression.",
	},
};

// Extract only the metadata we need (id and skillNodeId) from lessons
const lessonMetadata = mockLessons.map((lesson) => ({
	id: lesson.id,
	skillNodeId: lesson.skillNodeId,
}));

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await getSession();

	return (
		<html lang="en">
			<body className={`${inter.variable} antialiased`}>
				<SessionProvider session={session}>
					<ProgressProvider lessonMetadata={lessonMetadata}>
						<Analytics />
						{children}
					</ProgressProvider>
				</SessionProvider>
			</body>
		</html>
	);
}
