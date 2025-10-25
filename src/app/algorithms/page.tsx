import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { BookOpen, Code, Lightbulb, Target } from "lucide-react";

export default function AlgorithmsPage() {
	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<div className="border-b border-border bg-background">
				<div className="container mx-auto px-4 py-16">
					<div className="text-center max-w-3xl mx-auto">
						<h1 className="text-5xl font-bold mb-6">
							Master Algorithm Problems
						</h1>
						<p className="text-xl text-muted-foreground mb-8">
							Learn core algorithmic concepts through interactive
							lessons and practice with real coding problems. Get
							AI-powered hints and feedback to accelerate your
							learning.
						</p>

						<div className="flex gap-4 justify-center">
							<Link href="/algorithms/problems">
								<Button
									size="lg"
									className="flex items-center gap-2"
								>
									<Code className="w-5 h-5" />
									Start Solving Problems
								</Button>
							</Link>

							<Link href="/algorithms/lessons">
								<Button
									size="lg"
									variant="outline"
									className="flex items-center gap-2"
								>
									<BookOpen className="w-5 h-5" />
									Browse Lessons
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</div>

			{/* Features Section */}
			<div className="container mx-auto px-4 py-16">
				<div className="text-center mb-12">
					<h2 className="text-3xl font-bold mb-4">
						Why Choose Our Platform?
					</h2>
					<p className="text-muted-foreground max-w-2xl mx-auto">
						Our algorithm learning platform combines structured
						lessons with hands-on practice and AI-powered guidance
						to help you master coding interviews.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<Card>
						<CardHeader>
							<BookOpen className="w-8 h-8 text-primary mb-2" />
							<CardTitle>Structured Lessons</CardTitle>
							<CardDescription>
								Learn core concepts with comprehensive,
								easy-to-follow lessons
							</CardDescription>
						</CardHeader>
					</Card>

					<Card>
						<CardHeader>
							<Code className="w-8 h-8 text-primary mb-2" />
							<CardTitle>Hands-on Practice</CardTitle>
							<CardDescription>
								Solve real coding problems with instant feedback
								and test results
							</CardDescription>
						</CardHeader>
					</Card>

					<Card>
						<CardHeader>
							<Lightbulb className="w-8 h-8 text-primary mb-2" />
							<CardTitle>AI-Powered Hints</CardTitle>
							<CardDescription>
								Get personalized hints and guidance when
								you&apos;re stuck
							</CardDescription>
						</CardHeader>
					</Card>

					<Card>
						<CardHeader>
							<Target className="w-8 h-8 text-primary mb-2" />
							<CardTitle>Interview Ready</CardTitle>
							<CardDescription>
								Practice with problems commonly asked in
								technical interviews
							</CardDescription>
						</CardHeader>
					</Card>
				</div>
			</div>

			{/* Quick Start Section */}
			<div className="bg-muted">
				<div className="container mx-auto px-4 py-16">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold mb-4">
							Get Started Today
						</h2>
						<p className="text-muted-foreground max-w-2xl mx-auto">
							Choose your learning path and start building your
							algorithmic thinking skills.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
						<Card className="p-6">
							<div className="text-center">
								<BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
								<h3 className="text-xl font-semibold mb-2">
									Learn the Fundamentals
								</h3>
								<p className="text-muted-foreground mb-6">
									Start with our comprehensive lessons
									covering essential algorithmic concepts like
									hash maps, two pointers, and sliding window
									techniques.
								</p>
								<Link href="/algorithms/lessons">
									<Button className="w-full">
										Browse Lessons
									</Button>
								</Link>
							</div>
						</Card>

						<Card className="p-6">
							<div className="text-center">
								<Code className="w-12 h-12 text-primary mx-auto mb-4" />
								<h3 className="text-xl font-semibold mb-2">
									Practice with Problems
								</h3>
								<p className="text-muted-foreground mb-6">
									Jump straight into solving coding problems
									with our interactive workspace, AI hints,
									and real-time feedback.
								</p>
								<Link href="/algorithms/problems">
									<Button className="w-full">
										Start Solving
									</Button>
								</Link>
							</div>
						</Card>
					</div>
				</div>
			</div>

			{/* Stats Section */}
			<div className="container mx-auto px-4 py-16">
				<div className="text-center">
					<h2 className="text-3xl font-bold mb-12">
						Platform Statistics
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
						<div className="text-center">
							<div className="text-4xl font-bold text-primary mb-2">
								10+
							</div>
							<div className="text-muted-foreground">
								Algorithm Problems
							</div>
						</div>

						<div className="text-center">
							<div className="text-4xl font-bold text-primary mb-2">
								3
							</div>
							<div className="text-muted-foreground">
								Core Lessons
							</div>
						</div>

						<div className="text-center">
							<div className="text-4xl font-bold text-primary mb-2">
								AI
							</div>
							<div className="text-muted-foreground">
								Powered Hints
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
