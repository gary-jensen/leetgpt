import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PaymentCancelPage() {
	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<Card className="max-w-md w-full">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
						<svg
							className="w-8 h-8 text-yellow-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>
					<CardTitle className="text-2xl">Payment Canceled</CardTitle>
					<CardDescription>
						Your payment was canceled. No charges were made.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-sm text-muted-foreground text-center">
						You can try again anytime or continue with your free
						trial.
					</p>
					<div className="pt-4 space-y-2">
						<Link href="/billing" className="block">
							<Button
								className="w-full"
								size="lg"
								variant="correct"
							>
								Try Again
							</Button>
						</Link>
						<Link href="/problems" className="block">
							<Button
								className="w-full"
								variant="outline"
								size="lg"
							>
								Continue to Problems
							</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
