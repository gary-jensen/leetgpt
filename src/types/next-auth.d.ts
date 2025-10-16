import "next-auth";
import { UserProgress } from "@/lib/progressionSystem";

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			email: string;
			name?: string | null;
			image?: string | null;
		};
		progress?: UserProgress | null;
	}

	interface User {
		id: string;
		email: string;
		name?: string | null;
		image?: string | null;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		progress?: UserProgress | null;
	}
}
