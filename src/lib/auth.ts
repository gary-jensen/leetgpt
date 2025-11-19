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
import type { SubscriptionStatusValue } from "@/lib/actions/billing";

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
					// disabled progress. this will disable the /learn page
					// include: { progress: true },
				});
				if (!userWithProgress) {
					// User deleted - return session without user ID
					session.user.id = "";
					session.progress = null;
					return session;
				}

				// Check if user has never had a subscription
				// Start trial for users who:
				// - Have no stripeSubscriptionId (never subscribed to a paid plan)
				// - Have no subscriptionStatus or it's null (not currently trialing/active/expired)
				// - Role is NOT BASIC (if role is BASIC, their trial already expired)
				// This allows both new users and past users who never subscribed to get a trial
				// BUT prevents restarting trials for users whose trial already expired
				const shouldStartTrial =
					!userWithProgress.stripeSubscriptionId &&
					(!userWithProgress.subscriptionStatus ||
						userWithProgress.subscriptionStatus === null) &&
					userWithProgress.subscriptionStatus !== "expired" && // Don't restart if trial expired
					userWithProgress.role !== "BASIC"; // Don't restart if trial already expired

				if (shouldStartTrial) {
					// Start 3-day free trial (app-managed trial)
					const trialEndDate = new Date();
					trialEndDate.setDate(trialEndDate.getDate() + 3);

					await prisma.user.update({
						where: { id: user.id },
						data: {
							role: "PRO",
							subscriptionStatus: "app_trialing",
							stripeCurrentPeriodEnd: trialEndDate,
						},
					});

					// Update userWithProgress to reflect the new trial
					userWithProgress.role = "PRO";
					userWithProgress.subscriptionStatus = "app_trialing";
					userWithProgress.stripeCurrentPeriodEnd = trialEndDate;
				}

				session.user.id = userWithProgress.id;
				session.user.role = userWithProgress.role;
				session.user.emailNotifications =
					userWithProgress.emailNotifications;
				// Add subscription data to session
				session.user.subscriptionStatus =
					userWithProgress.subscriptionStatus as SubscriptionStatusValue;
				session.user.stripePriceId = userWithProgress.stripePriceId;
				session.user.stripeCurrentPeriodEnd =
					userWithProgress.stripeCurrentPeriodEnd;
				session.user.stripeSubscriptionId =
					userWithProgress.stripeSubscriptionId;

				// Load and calculate progress
				// if (userWithProgress?.progress) {
				// 	const lessonProgress = userWithProgress.progress
				// 		.lessonProgress as unknown as Record<
				// 		string,
				// 		{ currentStep: number; completed: boolean }
				// 	>;

				// 	// Calculate current skill node from lesson progress
				// 	const currentSkillNodeId = calculateCurrentSkillNodeId(
				// 		lessonProgress,
				// 		cachedLessonMetadata
				// 	);

				// 	// Build skill tree and calculate progress
				// 	const skillNodes =
				// 		buildSkillTreeFromLessons(cachedLessonMetadata);
				// 	const calculatedSkillNodes = recalculateSkillNodes(
				// 		skillNodes,
				// 		lessonProgress
				// 	);

				// 	session.progress = {
				// 		xp: userWithProgress.progress.xp,
				// 		level: userWithProgress.progress.level,
				// 		currentSkillNodeId,
				// 		lessonProgress,
				// 		skillNodes: calculatedSkillNodes,
				// 	};
				// } else {
				// 	session.progress = null;
				// }
			}
			return session;
		},
	},
	events: {
		async createUser({ user }) {
			// Automatically start 3-day free trial for new users (app-managed trial)
			const trialEndDate = new Date();
			trialEndDate.setDate(trialEndDate.getDate() + 3);

			await prisma.user.update({
				where: { id: user.id },
				data: {
					role: "PRO",
					subscriptionStatus: "app_trialing",
					stripeCurrentPeriodEnd: trialEndDate,
				},
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
