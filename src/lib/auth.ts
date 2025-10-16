import { getServerSession } from "next-auth/next";
import { AuthOptions } from "next-auth";
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

			// Create or update user in database
			const existingUser = await prisma.user.findUnique({
				where: { email: user.email },
			});

			if (!existingUser) {
				// New user - create in database
				await prisma.user.create({
					data: {
						id: user.id,
						email: user.email,
						name: user.name,
						image: user.image,
					},
				});
			} else {
				// Existing user - update info if changed
				await prisma.user.update({
					where: { email: user.email },
					data: {
						name: user.name,
						image: user.image,
					},
				});
			}

			return true;
		},
		async session({ session, token }) {
			if (session.user && token.sub) {
				session.user.id = token.sub;
			}
			// Include progress in the session
			if (token.progress) {
				session.progress = token.progress;
			}
			return session;
		},
		async jwt({ token, user, trigger }) {
			if (user) {
				token.sub = user.id;
			}

			// Load progress and attach to token
			// Refresh progress on sign-in, explicit update, or if not already in token
			const shouldLoadProgress =
				token.sub && (user || trigger === "update" || !token.progress);

			if (shouldLoadProgress) {
				try {
					const progress = await prisma.userProgress.findUnique({
						where: { userId: token.sub },
					});

					if (progress) {
						const completedLessons =
							progress.completedLessons as unknown as string[];

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

						token.progress = {
							xp: progress.xp,
							level: progress.level,
							currentSkillNodeId,
							completedLessons,
							skillNodes: calculatedSkillNodes,
						};
					} else {
						token.progress = null;
					}
				} catch (error) {
					console.error("Failed to load progress in JWT:", error);
					token.progress = null;
				}
			}
			// If progress already exists in token and we don't need to refresh, keep it

			return token;
		},
	},
	pages: {
		signIn: "/login",
	},
	session: {
		strategy: "jwt",
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
