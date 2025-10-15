import { getServerSession } from "next-auth/next";
import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const authOptions: AuthOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
			return session;
		},
		async jwt({ token, user }) {
			if (user) {
				token.sub = user.id;
			}
			return token;
		},
	},
	pages: {
		signIn: "/",
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
