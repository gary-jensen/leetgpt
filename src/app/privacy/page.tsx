import Navbar from "@/features/LeetGPTLanding/Navbar";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Privacy Policy | LeetGPT",
	description:
		"Learn how LeetGPT collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
	return (
		<div className="min-h-screen bg-background font-dm-sans">
			<Navbar />
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<h1 className="text-4xl font-bold text-foreground mb-4">
					Privacy Policy
				</h1>
				<p className="text-muted-foreground mb-8">
					Last updated: November 18, 2025
				</p>

				<div className="prose prose-invert max-w-none space-y-8">
					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							Introduction
						</h2>
						<p className="text-foreground/90 leading-relaxed">
							Welcome to LeetGPT. We respect your privacy and are
							committed to protecting your personal information.
							This Privacy Policy explains how we collect, use,
							and safeguard your data when you use our platform.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							Information We Collect
						</h2>
						<div className="space-y-4">
							<div>
								<h3 className="text-xl font-medium text-foreground mb-2">
									Account Information
								</h3>
								<p className="text-foreground/90 leading-relaxed">
									When you sign up using Google OAuth, we
									collect:
								</p>
								<ul className="list-disc list-inside ml-4 mt-2 text-foreground/90 space-y-1">
									<li>Your email address</li>
									<li>Your name</li>
									<li>Your profile picture</li>
								</ul>
							</div>

							<div>
								<h3 className="text-xl font-medium text-foreground mb-2">
									Usage Information
								</h3>
								<p className="text-foreground/90 leading-relaxed">
									As you use LeetGPT, we collect:
								</p>
								<ul className="list-disc list-inside ml-4 mt-2 text-foreground/90 space-y-1">
									<li>
										Code submissions and practice problem
										solutions
									</li>
									<li>
										Your progress, including XP and
										completed lessons
									</li>
									<li>
										Session data and how you interact with
										the platform
									</li>
									<li>
										Chat history with the AI mentor for your
										learning experience
									</li>
								</ul>
							</div>

							<div>
								<h3 className="text-xl font-medium text-foreground mb-2">
									Payment Information
								</h3>
								<p className="text-foreground/90 leading-relaxed">
									If you subscribe to a paid plan, payment
									processing is handled securely by Stripe. We
									do not store your credit card information on
									our servers.
								</p>
							</div>

							<div>
								<h3 className="text-xl font-medium text-foreground mb-2">
									Analytics Data
								</h3>
								<p className="text-foreground/90 leading-relaxed">
									We use Google Analytics to understand how
									users interact with our platform. This helps
									us improve the user experience.
								</p>
							</div>
						</div>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							How We Use Your Information
						</h2>
						<p className="text-foreground/90 leading-relaxed mb-3">
							We use your information to:
						</p>
						<ul className="list-disc list-inside ml-4 text-foreground/90 space-y-2">
							<li>Provide and improve our services</li>
							<li>
								Track your progress and personalize your
								learning experience
							</li>
							<li>
								Process payments and manage your subscription
							</li>
							<li>
								Communicate with you about updates and new
								features
							</li>
							<li>
								Analyze usage patterns to improve the platform
							</li>
							<li>
								Ensure the security and integrity of our
								services
							</li>
						</ul>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							Third-Party Services
						</h2>
						<p className="text-foreground/90 leading-relaxed mb-3">
							We use the following third-party services:
						</p>
						<ul className="list-disc list-inside ml-4 text-foreground/90 space-y-2">
							<li>
								<strong>Google OAuth:</strong> For secure
								authentication
							</li>
							<li>
								<strong>OpenAI:</strong> To power our AI
								mentoring features
							</li>
							<li>
								<strong>Stripe:</strong> For secure payment
								processing
							</li>
							<li>
								<strong>Supabase:</strong> For database hosting
							</li>
							<li>
								<strong>Google Analytics:</strong> For usage
								analytics
							</li>
							<li>
								<strong>Vercel:</strong> For hosting our
								platform
							</li>
						</ul>
						<p className="text-foreground/90 leading-relaxed mt-3">
							These services have their own privacy policies and
							data handling practices.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							Data Security
						</h2>
						<p className="text-foreground/90 leading-relaxed">
							We take reasonable measures to protect your personal
							information from unauthorized access, disclosure, or
							destruction. We use industry-standard security
							practices, including encryption for data
							transmission and secure database storage.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							Your Rights
						</h2>
						<p className="text-foreground/90 leading-relaxed mb-3">
							You have the right to:
						</p>
						<ul className="list-disc list-inside ml-4 text-foreground/90 space-y-2">
							<li>Access your personal information</li>
							<li>Correct inaccurate data</li>
							<li>Request deletion of your account and data</li>
							<li>
								Opt-out of marketing communications (if
								applicable)
							</li>
							<li>
								Export your data in a machine-readable format
							</li>
						</ul>
						<p className="text-foreground/90 leading-relaxed mt-3">
							To exercise any of these rights, please contact us
							at{" "}
							<a
								href="mailto:gary.leetgpt@gmail.com"
								className="text-white hover:text-orange-500 underline"
							>
								gary.leetgpt@gmail.com
							</a>
							.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							Data Retention
						</h2>
						<p className="text-foreground/90 leading-relaxed">
							We retain your personal information for as long as
							your account is active or as needed to provide you
							services. If you request account deletion, we will
							delete your personal information within a reasonable
							timeframe, except where we are required to retain it
							for legal purposes.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							Children&apos;s Privacy
						</h2>
						<p className="text-foreground/90 leading-relaxed">
							We do not knowingly collect personal information
							from children. If you believe we have inadvertently
							collected information from a child, please contact
							us immediately.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							Changes to This Policy
						</h2>
						<p className="text-foreground/90 leading-relaxed">
							We may update this Privacy Policy from time to time.
							We will notify you of any significant changes by
							posting the new policy on this page and updating the
							&quot;Last updated&quot; date.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							Contact Us
						</h2>
						<p className="text-foreground/90 leading-relaxed">
							If you have any questions about this Privacy Policy
							or our data practices, please contact us at:
						</p>
						<p className="text-foreground/90 leading-relaxed mt-3">
							<strong>Email:</strong>{" "}
							<a
								href="mailto:gary.leetgpt@gmail.com"
								className="text-white hover:text-orange-500 underline"
							>
								gary.leetgpt@gmail.com
							</a>
							<br />
							<strong>Location:</strong> Canada
						</p>
					</section>
				</div>
			</div>
		</div>
	);
}
