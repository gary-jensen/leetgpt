import Navbar from "@/features/LeetGPTLanding/Navbar";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Terms of Service | LeetGPT",
	description:
		"Read LeetGPT's Terms of Service to understand your rights and responsibilities when using our platform.",
};

export default function TermsOfServicePage() {
	return (
		<div className="min-h-screen bg-background font-dm-sans">
			<Navbar />
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<h1 className="text-4xl font-bold text-foreground mb-4">
					Terms of Service
				</h1>
				<p className="text-muted-foreground mb-8">
					Last updated: November 18, 2025
				</p>

				<div className="prose prose-invert max-w-none space-y-8">
					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							Agreement to Terms
						</h2>
						<p className="text-foreground/90 leading-relaxed">
							By accessing or using LeetGPT, you agree to be bound
							by these Terms of Service and our Privacy Policy. If
							you do not agree with any part of these terms,
							please do not use our platform.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							Description of Service
						</h2>
						<p className="text-foreground/90 leading-relaxed">
							LeetGPT is an AI-powered platform designed to help
							you learn algorithms and prepare for technical
							interviews. We provide practice problems, AI
							mentoring, progress tracking, and educational
							content to support your learning journey.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							User Accounts
						</h2>
						<div className="space-y-3">
							<p className="text-foreground/90 leading-relaxed">
								To use certain features of LeetGPT, you must
								create an account. You agree to:
							</p>
							<ul className="list-disc list-inside ml-4 text-foreground/90 space-y-2">
								<li>
									Provide accurate and complete information
									during registration
								</li>
								<li>
									Maintain the security of your account
									credentials
								</li>
								<li>
									Notify us immediately of any unauthorized
									access
								</li>
								<li>
									Be responsible for all activities under your
									account
								</li>
							</ul>
						</div>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							Acceptable Use
						</h2>
						<div className="space-y-3">
							<p className="text-foreground/90 leading-relaxed">
								You agree to use LeetGPT only for lawful
								purposes. You will not:
							</p>
							<ul className="list-disc list-inside ml-4 text-foreground/90 space-y-2">
								<li>
									Use the platform to violate any laws or
									regulations
								</li>
								<li>
									Attempt to gain unauthorized access to our
									systems
								</li>
								<li>
									Interfere with or disrupt the service or
									servers
								</li>
								<li>
									Use automated systems to access the platform
									without permission
								</li>
								<li>
									Share your account with others or create
									multiple accounts
								</li>
								<li>
									Reverse engineer, decompile, or attempt to
									extract source code
								</li>
								<li>
									Use the service to harm, harass, or
									impersonate others
								</li>
							</ul>
						</div>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							Subscriptions and Payments
						</h2>
						<div className="space-y-3">
							<p className="text-foreground/90 leading-relaxed">
								LeetGPT offers both free and paid subscription
								plans.
							</p>
							<ul className="list-disc list-inside ml-4 text-foreground/90 space-y-2">
								<li>
									Subscription fees are billed in advance on a
									monthly or yearly basis
								</li>
								<li>
									All payments are processed securely through
									Stripe
								</li>
								<li>
									You are responsible for providing current
									and accurate billing information
								</li>
								<li>
									Subscriptions automatically renew unless
									cancelled
								</li>
								<li>
									You can cancel your subscription at any time
									through your account settings
								</li>
								<li>
									Refunds are handled on a case-by-case basis
									at our discretion
								</li>
							</ul>
						</div>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							Intellectual Property
						</h2>
						<div className="space-y-3">
							<p className="text-foreground/90 leading-relaxed">
								All content on LeetGPT, including problems,
								lessons, code, design, and text, is owned by
								LeetGPT or its licensors and is protected by
								copyright and other intellectual property laws.
							</p>
							<p className="text-foreground/90 leading-relaxed">
								You retain ownership of the code you write on
								our platform. By using LeetGPT, you grant us a
								limited license to store and process your code
								to provide our services.
							</p>
						</div>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							AI-Generated Content
						</h2>
						<p className="text-foreground/90 leading-relaxed">
							LeetGPT uses AI (powered by OpenAI) to provide
							mentoring and educational guidance. While we strive
							for accuracy, AI-generated responses may
							occasionally contain errors or inaccuracies. You
							should use your own judgment when relying on
							AI-generated content.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							Disclaimers
						</h2>
						<div className="space-y-3">
							<p className="text-foreground/90 leading-relaxed">
								LeetGPT is provided &quot;as is&quot; without
								warranties of any kind, either express or
								implied. We do not guarantee that:
							</p>
							<ul className="list-disc list-inside ml-4 text-foreground/90 space-y-2">
								<li>
									The service will be uninterrupted or
									error-free
								</li>
								<li>
									All content will be accurate, complete, or
									current
								</li>
								<li>
									Using our platform will guarantee interview
									success or employment
								</li>
								<li>
									AI-generated content will be free from
									errors
								</li>
							</ul>
						</div>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							Limitation of Liability
						</h2>
						<p className="text-foreground/90 leading-relaxed">
							To the maximum extent permitted by law, LeetGPT
							shall not be liable for any indirect, incidental,
							special, consequential, or punitive damages, or any
							loss of profits or revenues, whether incurred
							directly or indirectly, or any loss of data, use, or
							other intangible losses resulting from your use of
							the service.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							Termination
						</h2>
						<p className="text-foreground/90 leading-relaxed">
							We reserve the right to suspend or terminate your
							account at any time, with or without notice, for
							violating these Terms of Service or for any other
							reason at our discretion. You may also terminate
							your account at any time by contacting us.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							Changes to Terms
						</h2>
						<p className="text-foreground/90 leading-relaxed">
							We may modify these Terms of Service at any time. We
							will notify you of significant changes by posting
							the updated terms on this page and updating the
							&quot;Last updated&quot; date. Your continued use of
							LeetGPT after changes constitutes acceptance of the
							new terms.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							Governing Law
						</h2>
						<p className="text-foreground/90 leading-relaxed">
							These Terms of Service are governed by the laws of
							Canada. Any disputes arising from these terms or
							your use of LeetGPT will be resolved in accordance
							with Canadian law.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							Contact Information
						</h2>
						<p className="text-foreground/90 leading-relaxed">
							If you have any questions about these Terms of
							Service, please contact us:
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

					<section>
						<h2 className="text-2xl font-semibold text-foreground mb-4">
							Entire Agreement
						</h2>
						<p className="text-foreground/90 leading-relaxed">
							These Terms of Service, together with our Privacy
							Policy, constitute the entire agreement between you
							and LeetGPT regarding your use of the platform.
						</p>
					</section>
				</div>
			</div>
		</div>
	);
}
