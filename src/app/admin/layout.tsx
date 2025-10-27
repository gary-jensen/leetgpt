import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const adminCheck = await isAdmin();
	
	if (!adminCheck) {
		redirect("/login");
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="border-b">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<h1 className="text-2xl font-bold">Admin Panel</h1>
						<nav className="flex gap-4">
							<Link
								href="/admin/problems"
								className="text-sm font-medium hover:underline"
							>
								Problems
							</Link>
							<Link
								href="/admin/lessons"
								className="text-sm font-medium hover:underline"
							>
								Lessons
							</Link>
						</nav>
					</div>
				</div>
			</div>
			<div className="container mx-auto px-4 py-8">{children}</div>
		</div>
	);
}

