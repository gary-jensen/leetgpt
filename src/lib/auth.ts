import { getServerSession } from "next-auth/next";
import { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";
import {
	buildSkillTreeFromLessons,
	recalculateSkillNodes,
	calculateCurrentSkillNodeId,
} from "@/lib/progressionSystem";

// Lightweight lesson metadata for calculating progress
// This will be replaced with actual lesson metadata when available
let cachedLessonMetadata: { id: string; skillNodeId: string }[] = [];

export function setLessonMetadata(
	metadata: { id: string; skillNodeId: string }[]
) {
	cachedLessonMetadata = metadata;
}

export const authOptions: AuthOptions = {
	adapter: PrismaAdapter(prisma),
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
		GitHubProvider({
			clientId: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!,
		}),
	],
	callbacks: {
		async signIn({ user }) {
			if (!user.email) return false;
			return true; // Let the adapter handle user creation
		},
		async session({ session, user }) {
			if (session.user && user) {
				// Load fresh user data from database
				const userWithProgress = await prisma.user.findUnique({
					where: { id: user.id },
					include: { progress: true },
				});

				if (!userWithProgress) {
					// User deleted - return session without user ID
					session.user.id = "";
					session.progress = null;
					return session;
				}

				session.user.id = userWithProgress.id;
				session.user.role = userWithProgress.role;

				// Load and calculate progress
				if (userWithProgress.progress) {
					const completedLessons = userWithProgress.progress
						.completedLessons as unknown as string[];

					// Calculate current skill node from completed lessons
					const currentSkillNodeId = calculateCurrentSkillNodeId(
						completedLessons,
						cachedLessonMetadata
					);

					// Build skill tree and calculate progress
					const skillNodes =
						buildSkillTreeFromLessons(cachedLessonMetadata);
					const calculatedSkillNodes = recalculateSkillNodes(
						skillNodes,
						completedLessons
					);

					session.progress = {
						xp: userWithProgress.progress.xp,
						level: userWithProgress.progress.level,
						currentSkillNodeId,
						completedLessons,
						skillNodes: calculatedSkillNodes,
					};
				} else {
					session.progress = null;
				}
			}
			return session;
		},
	},
	events: {
		async createUser({ user }) {
			// Set default role when user is created by adapter
			await prisma.user.update({
				where: { id: user.id },
				data: { role: "BASIC" },
			});
		},
	},
	pages: {
		signIn: "/login",
	},
	session: {
		strategy: "database",
	},
};

export async function getSession() {
	return await getServerSession(authOptions);
}

export async function getCurrentUser() {
	const session = await getSession();
	return session?.user;
}

export async function requireAuth() {
	const session = await getSession();
	if (!session?.user) {
		throw new Error("Unauthorized");
	}
	return session.user;
}

export async function isAdmin(): Promise<boolean> {
	const session = await getSession();
	return session?.user?.role === "ADMIN";
}

export async function requireAdmin() {
	const session = await getSession();
	if (!session?.user) {
		throw new Error("Unauthorized");
	}
	if (session.user.role !== "ADMIN") {
		throw new Error("Admin access required");
	}
	return session.user;
}
