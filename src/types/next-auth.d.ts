import "next-auth";
import { UserProgress } from "@/lib/progressionSystem";
import { SubscriptionStatusValue } from "@/lib/actions/billing";

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			email: string;
			name?: string | null;
			image?: string | null;
			role?: string | null;
			emailNotifications?: boolean;
			subscriptionStatus?: SubscriptionStatusValue;
			stripePriceId?: string | null;
			stripeCurrentPeriodEnd?: Date | null;
			stripeSubscriptionId?: string | null;
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
