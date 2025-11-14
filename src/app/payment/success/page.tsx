import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSubscriptionStatusFromSession } from "@/lib/utils/subscription";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function PaymentSuccessPage({
	searchParams,
}: {
	searchParams: Promise<{ session_id?: string }>;
}) {
	const session = await getSession();
	const params = await searchParams;

	if (!session?.user) {
		redirect("/login");
	}

	const subscriptionStatus = getSubscriptionStatusFromSession(session);

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<Card className="max-w-md w-full">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
						<svg
							className="w-8 h-8 text-green-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>
					<CardTitle className="text-2xl">
						Thank you for subscribing!
					</CardTitle>
					<CardDescription>
						Your subscription has been successfully activated.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{subscriptionStatus && (
						<div className="space-y-2">
							<div>
								<p className="text-sm text-muted-foreground">
									Plan
								</p>
								<p className="font-semibold">
									{subscriptionStatus.planTier || "PRO"}{" "}
									{subscriptionStatus.isYearly
										? "Yearly"
										: "Monthly"}
								</p>
							</div>
							{subscriptionStatus.stripeCurrentPeriodEnd && (
								<div>
									<p className="text-sm text-muted-foreground">
										{subscriptionStatus.subscriptionStatus ===
										"stripe_trialing"
											? "Trial ends"
											: "Next billing date"}
									</p>
									<p className="font-semibold">
										{new Date(
											subscriptionStatus.stripeCurrentPeriodEnd
										).toLocaleDateString()}
									</p>
								</div>
							)}
						</div>
					)}
					<div className="pt-4">
						<Link href="/problems" className="block">
							<Button
								variant="correct"
								className="w-full"
								size="lg"
							>
								Start Learning
							</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
