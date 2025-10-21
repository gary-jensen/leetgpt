import Demo from "@/features/Landing/Demo";
import Features from "@/features/Landing/Features";
import FinalCTA from "@/features/Landing/FinalCTA";
import Footer from "@/features/Landing/Footer";
import Hero from "@/features/Landing/Hero";
import Landing from "@/features/Landing/Landing";
import Navbar from "@/features/Landing/Navbar";
import Pricing from "@/features/Landing/Pricing";

export default function Home() {
	return (
		<Landing>
			<main className="min-h-screen bg-background font-dm-sans">
				<Navbar />
				<Hero />
				<Demo />
				<Features />
				<Pricing />
				<FinalCTA />
				<Footer />
			</main>
		</Landing>
	);
}
