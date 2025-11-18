"use client";

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
	return (
		<footer className="bg-background-2 border-t border-border">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					{/* Brand & Description */}
					<div className="md:col-span-1">
						<div className="flex items-center gap-3 mb-4">
							<Image
								src="/LeetGPT Logo.png"
								alt="LeetGPT"
								width={48}
								height={48}
							/>
							<span className="text-xl font-bold text-foreground">
								LeetGPT
							</span>
						</div>
						<p className="text-muted-foreground mb-4 text-sm">
							Master algorithms with AI-powered guidance. Practice
							problems, improve your skills, and ace technical
							interviews.
						</p>
						<div className="flex items-center gap-4">
							<Link
								href="https://x.com/GaryJensen_"
								target="_blank"
								className="text-muted-foreground hover:text-foreground transition-colors"
							>
								<svg
									className="w-5 h-5"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
								</svg>
							</Link>
							{/* <Link
								href="#"
								className="text-muted-foreground hover:text-foreground transition-colors"
							>
								<svg
									className="w-5 h-5"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
								</svg>
							</Link> */}
						</div>
					</div>

					{/* Product Links */}
					<div>
						<h3 className="text-foreground font-semibold mb-4">
							Product
						</h3>
						<ul className="space-y-2">
							<li>
								<Link
									href="#features"
									className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
								>
									Features
								</Link>
							</li>
							<li>
								<Link
									href="#testimonials"
									className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
								>
									Testimonials
								</Link>
							</li>
							<li>
								<Link
									href="#pricing"
									className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
								>
									Pricing
								</Link>
							</li>

							<li>
								<Link
									href="#faq"
									className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
								>
									FAQ
								</Link>
							</li>
							<li>
								<Link
									href="/billing"
									className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
								>
									Get Started
								</Link>
							</li>
						</ul>
					</div>

					{/* Resources */}
					<div>
						<h3 className="text-foreground font-semibold mb-4">
							Resources
						</h3>
						<ul className="space-y-2">
							{/* <li>
								<Link
									href="#"
									className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
								>
									Help Center
								</Link>
							</li>
							<li>
								<Link
									href="#"
									className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
								>
									Documentation
								</Link>
							</li> */}
							<li>
								<Link
									href="mailto:gary.leetgpt@gmail.com"
									className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
								>
									Contact
								</Link>
							</li>
						</ul>
					</div>

					{/* Legal */}
					<div>
						<h3 className="text-foreground font-semibold mb-4">
							Legal
						</h3>
						<ul className="space-y-2">
							<li>
								<Link
									href="/privacy"
									className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
								>
									Privacy Policy
								</Link>
							</li>
							<li>
								<Link
									href="/terms"
									className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
								>
									Terms of Service
								</Link>
							</li>
							{/* <li>
								<Link
									href="#"
									className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm"
								>
									Cookie Policy
								</Link>
							</li> */}
						</ul>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
					<p className="text-muted-foreground text-sm">
						© 2025 LeetGPT. All rights reserved.
					</p>
					<div className="mt-4 sm:mt-0">
						<p className="text-sm text-muted-foreground">
							Stay updated with new problems and features
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
