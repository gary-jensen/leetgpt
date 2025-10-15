"use client";

import { Session } from "next-auth";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export default function SessionProvider({
	session,
	children,
}: {
	session?: Session | null;
	children: ReactNode;
}) {
	return (
		<NextAuthSessionProvider session={session}>
			{children}
		</NextAuthSessionProvider>
	);
}
