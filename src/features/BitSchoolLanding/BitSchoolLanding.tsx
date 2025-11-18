import Demo from "./Demo";
import Features from "./Features";
import FinalCTA from "./FinalCTA";
import Footer from "./Footer";
import Hero from "./Hero";
import Landing from "./Landing";
import Navbar from "./Navbar";
import Pricing from "./Pricing";

const BitSchoolLanding = () => {
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
};
export default BitSchoolLanding;
