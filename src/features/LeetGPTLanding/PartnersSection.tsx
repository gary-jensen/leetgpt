export default function PartnersSection() {
	const companies = [
		"Tech Company",
		"Startup Inc",
		"Dev Corp",
		"Code Labs",
		"Build Co",
		"Dev Team",
	];

	return (
		<section className="py-12 px-4 bg-background-2">
			<div className="max-w-6xl mx-auto">
				<p className="text-center text-muted-foreground mb-8 text-sm font-medium">
					Trusted by developers at:
				</p>
				<div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
					{companies.map((company, index) => (
						<div
							key={index}
							className="px-6 py-3 bg-background border border-border rounded-lg text-muted-foreground font-semibold hover:opacity-100 transition-opacity"
						>
							{company}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

