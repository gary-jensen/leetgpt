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
				// New user - create in database with default USER role
				await prisma.user.create({
					data: {
						id: user.id,
						email: user.email,
						name: user.name,
						image: user.image,
						role: "BASIC",
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
			// If token.role is null, it means the user was deleted
			// Don't set user ID, which will make the session appear as not logged in
			if (token.role === null) {
				// Don't set user ID, making the session appear as not logged in
				session.progress = null;
				return session;
			}

			if (session.user && token.sub) {
				session.user.id = token.sub;
				session.user.role = token.role || "BASIC";
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

			// Load user role and progress, attach to token
			// Always load fresh data from database to ensure consistency
			if (token.sub) {
				try {
					// FIRST: Check if user still exists in database
					const user = await prisma.user.findUnique({
						where: { id: token.sub },
						select: { role: true },
					});

					// If user deleted, invalidate token by setting it to expire immediately
					if (!user) {
						console.warn(
							`JWT token for deleted user: ${token.sub}`
						);
						return {
							...token,
							role: null,
							progress: null,
							exp: Math.floor(Date.now() / 1000) - 1,
						};
					}

					// User exists, set role
					token.role = user.role || "BASIC";

					// Now safe to load progress
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
					console.error("Failed to load user data in JWT:", error);
					// On error, invalidate token to force re-authentication
					return { ...token, role: null, progress: null };
				}
			}

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
