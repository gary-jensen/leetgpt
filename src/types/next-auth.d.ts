import "next-auth";
import { UserProgress } from "@/lib/progressionSystem";

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			email: string;
			name?: string | null;
			image?: string | null;
			role?: string | null;
			emailNotifications?: boolean;
		};
		progress?: UserProgress | null;
	}

	interface User {
		id: string;
		email: string;
		name?: string | null;
		image?: string | null;
		role?: string | null;
		emailNotifications?: boolean;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		progress?: UserProgress | null;
		role?: string | null;
	}
}
