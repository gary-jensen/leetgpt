"use client";

import { useProgress } from "@/contexts/ProgressContext";
import {
	BookOpen,
	Clock,
	Star,
	Trophy,
	LogIn,
	Mail,
	CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import {
	updateEmailNotifications,
	getEmailNotificationStatus,
} from "@/lib/actions/emailNotifications";

export default function MoreLessonsComingSoon() {
	const { progress } = useProgress();
	const { data: session, status } = useSession();
	const [emailNotifications, setEmailNotifications] = useState<
		boolean | null
	>(null);
	const [isUpdating, setIsUpdating] = useState(false);
	const [updateMessage, setUpdateMessage] = useState<string | null>(null);

	// Load email notification status when user is logged in
	useEffect(() => {
		if (session?.user?.id && emailNotifications === null) {
			getEmailNotificationStatus().then((result) => {
				if (result.success) {
					setEmailNotifications(result.emailNotifications);
				}
			});
		}
	}, [session, emailNotifications]);

	const handleLogin = () => {
		signIn();
	};

	const handleToggleEmailNotifications = async () => {
		if (!session?.user?.id) return;

		setIsUpdating(true);
		setUpdateMessage(null);

		try {
			const newStatus = !emailNotifications;
			const result = await updateEmailNotifications(newStatus);

			if (result.success) {
				setEmailNotifications(newStatus);
				setUpdateMessage(
					newStatus
						? "Email notifications enabled! You'll be notified when new lessons are available."
						: "Email notifications disabled."
				);
			} else {
				setUpdateMessage(
					"Failed to update notification preferences. Please try again."
				);
			}
		} catch (error) {
			setUpdateMessage("An error occurred. Please try again.");
		} finally {
			setIsUpdating(false);
			// Clear message after 3 seconds
			setTimeout(() => setUpdateMessage(null), 3000);
		}
	};

	return (
		<div className="w-screen h-fit md:h-screen md:max-h-screen flex flex-col bg-background-4">
			{/* Progress Bar */}
			<div className="h-24 bg-background-1 border-b border-border-1 flex items-center justify-center">
				<div className="flex items-center gap-4">
					<Trophy className="h-8 w-8 text-yellow-500" />
					<div className="text-center">
						<h1 className="text-2xl font-bold text-text-1">
							Congratulations!
						</h1>
						<p className="text-text-2">
							You&apos;ve completed all available lessons
						</p>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 flex items-center justify-center p-8">
				<div className="max-w-2xl mx-auto text-center space-y-8">
					{/* Achievement Stats */}
					<div className="bg-background-2 rounded-xl p-8 border border-border-1">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
							<div className="flex flex-col items-center space-y-2">
								<div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
									<BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
								</div>
								<div className="text-2xl font-bold text-text-1">
									{progress.completedLessons.length}
								</div>
								<div className="text-sm text-text-2">
									Lessons Completed
								</div>
							</div>
							<div className="flex flex-col items-center space-y-2">
								<div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
									<Star className="h-8 w-8 text-green-600 dark:text-green-400" />
								</div>
								<div className="text-2xl font-bold text-text-1">
									{progress.level}
								</div>
								<div className="text-sm text-text-2">
									Level Reached
								</div>
							</div>
							<div className="flex flex-col items-center space-y-2">
								<div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full">
									<Trophy className="h-8 w-8 text-purple-600 dark:text-purple-400" />
								</div>
								<div className="text-2xl font-bold text-text-1">
									{progress.xp.toLocaleString()}
								</div>
								<div className="text-sm text-text-2">
									Total XP Earned
								</div>
							</div>
						</div>
					</div>

					{/* Coming Soon Message */}
					<div className="space-y-6">
						<div className="flex items-center justify-center gap-3">
							<Clock className="h-8 w-8 text-yellow-500" />
							<h2 className="text-3xl font-bold text-text-1">
								More Lessons Coming Soon!
							</h2>
						</div>

						<p className="text-lg text-text-2 leading-relaxed">
							Amazing work! You&apos;ve mastered the fundamentals
							of JavaScript. Our team is working hard to bring you
							more exciting lessons covering:
						</p>

						{/* Upcoming Topics */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
							<div className="bg-background-2 rounded-lg p-4 border border-border-1">
								<h3 className="font-semibold text-text-1 mb-2">
									🔄 Control Flow
								</h3>
								<p className="text-sm text-text-2">
									if/else statements, loops, and conditional
									logic
								</p>
							</div>
							<div className="bg-background-2 rounded-lg p-4 border border-border-1">
								<h3 className="font-semibold text-text-1 mb-2">
									📦 Functions
								</h3>
								<p className="text-sm text-text-2">
									Creating reusable code blocks and parameters
								</p>
							</div>
							<div className="bg-background-2 rounded-lg p-4 border border-border-1">
								<h3 className="font-semibold text-text-1 mb-2">
									📋 Arrays
								</h3>
								<p className="text-sm text-text-2">
									Working with lists of data and array methods
								</p>
							</div>
							<div className="bg-background-2 rounded-lg p-4 border border-border-1">
								<h3 className="font-semibold text-text-1 mb-2">
									🏗️ Objects
								</h3>
								<p className="text-sm text-text-2">
									Structuring data with properties and methods
								</p>
							</div>
						</div>

						<p className="text-text-2">
							Stay tuned for updates! In the meantime, feel free
							to review previous lessons or practice your skills.
						</p>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						{!session ? (
							<Button
								variant="correct"
								onClick={handleLogin}
								className="px-8 py-3 flex items-center gap-2"
							>
								<LogIn className="h-4 w-4" />
								Log In to Save Progress
							</Button>
						) : (
							<Button
								onClick={handleToggleEmailNotifications}
								disabled={
									isUpdating || emailNotifications === null
								}
								variant="correct"
								className="px-8 py-3 flex items-center gap-2"
								// size={emailNotifications ? "xs" : "default"}
							>
								{isUpdating ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
										Updating...
									</>
								) : emailNotifications ? (
									<>
										<CheckCircle className="h-4 w-4" />
										Email Notifications On
									</>
								) : (
									<>
										<Mail className="h-4 w-4" />
										Enable Email Notifications
									</>
								)}
							</Button>
						)}
					</div>

					{/* Update Message */}
					{updateMessage && (
						<div
							className={`text-center p-4 rounded-lg ${
								updateMessage.includes("enabled") ||
								updateMessage.includes("disabled")
									? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
									: "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
							}`}
						>
							{updateMessage}
						</div>
					)}

					{/* Additional Info */}
					{/* <div className="pt-8 border-t border-border-1">
						{session ? (
							<div className="text-center">
								<p className="text-sm text-text-2 mb-2">
									Welcome back,{" "}
									{session.user.name || session.user.email}!
								</p>
								<p className="text-sm text-text-2">
									{emailNotifications
										? "You&apos;ll receive email updates when new lessons are available."
										: "Enable email notifications above to stay updated on new lessons."}
								</p>
							</div>
						) : (
							<p className="text-sm text-text-2 text-center">
								Log in to save your progress and enable email
								notifications for new lessons!
							</p>
						)}
					</div> */}
				</div>
			</div>
		</div>
	);
}
