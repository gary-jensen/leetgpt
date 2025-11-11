import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { BookOpen, Code, Lightbulb, Target, ArrowRight } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getAlgoProgress } from "@/lib/actions/algoProgress";
import { getAlgoProblems, getAlgoLessons } from "@/features/algorithms/data";

export default async function AlgorithmsPage() {
	const session = await getSession();

	// Get user progress if authenticated
	let recentProblem = null;
	let recentLesson = null;
	const stats = {
		problemsCompleted: 0,
		problemsInProgress: 0,
		lessonsCompleted: 0,
		totalSubmissions: 0,
	};

	if (session?.user?.id) {
		const userProgress = await getAlgoProgress(session.user.id);
		stats.problemsCompleted = userProgress.problemProgress.filter(
			(p) => p.status === "completed"
		).length;
		stats.problemsInProgress = userProgress.problemProgress.filter(
			(p) => p.status === "in_progress"
		).length;
		stats.lessonsCompleted = userProgress.lessonProgress.filter(
			(l) => l.status === "completed"
		).length;
		stats.totalSubmissions = userProgress.submissions.length;

		// Get most recently accessed problem
		if (userProgress.problemProgress.length > 0) {
			const recent = userProgress.problemProgress[0];
			const problemMeta = await getAlgoProblems();
			recentProblem = problemMeta.find((p) => p.id === recent.problemId);
		}

		// Get most recently accessed lesson
		if (userProgress.lessonProgress.length > 0) {
			const recent = userProgress.lessonProgress[0];
			const lessonMeta = await getAlgoLessons();
			recentLesson = lessonMeta.find((l) => l.id === recent.lessonId);
		}
	}

	// Get recommended problems
	const allProblems = await getAlgoProblems();
	const recommendedProblems = allProblems.slice(0, 3);
	// Render personalized dashboard for authenticated users
	if (session?.user?.id) {
		return (
			<div className="min-h-screen bg-background">
				{/* Header */}
				<div className="border-b border-border bg-background">
					<div className="container mx-auto px-4 py-8">
						<h1 className="text-4xl font-bold mb-2">
							Welcome back, {session.user.name || "User"}!
						</h1>
						<p className="text-muted-foreground">
							Continue your algorithm learning journey
						</p>
					</div>
				</div>

				<div className="container mx-auto px-4 py-8">
					{/* Stats Section */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
						<Card>
							<CardHeader className="pb-2">
								<CardDescription>Completed</CardDescription>
								<CardTitle className="text-3xl">
									{stats.problemsCompleted}
								</CardTitle>
							</CardHeader>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardDescription>In Progress</CardDescription>
								<CardTitle className="text-3xl">
									{stats.problemsInProgress}
								</CardTitle>
							</CardHeader>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardDescription>Lessons</CardDescription>
								<CardTitle className="text-3xl">
									{stats.lessonsCompleted}
								</CardTitle>
							</CardHeader>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardDescription>Submissions</CardDescription>
								<CardTitle className="text-3xl">
									{stats.totalSubmissions}
								</CardTitle>
							</CardHeader>
						</Card>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{/* Continue Section */}
						<div>
							<h2 className="text-2xl font-bold mb-4">
								Continue Learning
							</h2>
							{recentProblem ? (
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Code className="w-5 h-5 text-primary" />
											{recentProblem.title}
										</CardTitle>
										<CardDescription>
											Last accessed problem
										</CardDescription>
									</CardHeader>
									<CardContent>
										<Link
											href={`/algorithms/workspace/${recentProblem.slug}`}
										>
											<Button className="w-full">
												Continue Problem
												<ArrowRight className="w-4 h-4 ml-2" />
											</Button>
										</Link>
									</CardContent>
								</Card>
							) : recentLesson ? (
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<BookOpen className="w-5 h-5 text-primary" />
											{recentLesson.title}
										</CardTitle>
										<CardDescription>
											Last accessed lesson
										</CardDescription>
									</CardHeader>
									<CardContent>
										<Link
											href={`/algorithms/lessons/${recentLesson.slug}`}
										>
											<Button className="w-full">
												Continue Lesson
												<ArrowRight className="w-4 h-4 ml-2" />
											</Button>
										</Link>
									</CardContent>
								</Card>
							) : (
								<Card>
									<CardHeader>
										<CardTitle>Get Started</CardTitle>
										<CardDescription>
											Start your learning journey
										</CardDescription>
									</CardHeader>
									<CardContent className="flex gap-2">
										<Link href="/algorithms/problems">
											<Button
												variant="outline"
												className="flex-1"
											>
												Browse Problems
											</Button>
										</Link>
										<Link href="/algorithms/lessons">
											<Button
												variant="outline"
												className="flex-1"
											>
												Browse Lessons
											</Button>
										</Link>
									</CardContent>
								</Card>
							)}
						</div>

						{/* Recommended Problems */}
						<div>
							<h2 className="text-2xl font-bold mb-4">
								Recommended Problems
							</h2>
							<div className="space-y-3">
								{recommendedProblems.map((problem) => (
									<Card key={problem.id}>
										<CardContent className="p-4">
											<div className="flex items-center justify-between">
												<div>
													<h3 className="font-semibold">
														{problem.title}
													</h3>
													<p className="text-sm text-muted-foreground">
														{problem.topics.join(
															", "
														)}
													</p>
												</div>
												<Link
													href={`/algorithms/workspace/${problem.slug}`}
												>
													<Button
														size="sm"
														variant="outline"
													>
														Start
													</Button>
												</Link>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Render public landing page for unauthenticated users
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
							<Link href="/login">
								<Button
									size="lg"
									className="flex items-center gap-2"
								>
									<Code className="w-5 h-5" />
									Sign In to Start
								</Button>
							</Link>

							<Link href="/algorithms/problems">
								<Button
									size="lg"
									variant="outline"
									className="flex items-center gap-2"
								>
									<BookOpen className="w-5 h-5" />
									Browse Problems
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
		</div>
	);
}
