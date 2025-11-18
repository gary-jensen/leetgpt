import Navbar from "./Navbar";
import Benefits from "./Benefits";
import Pricing from "./Pricing";
import Testimonials from "./Testimonials";
import FAQ from "./FAQ";
import FinalCTA from "./FinalCTA";
import Footer from "./Footer";
import Landing from "./Landing";
import HeroFull from "./HeroFull";

const LeetGPTLanding = () => {
	return (
		<Landing>
			<main className="min-h-screen bg-background font-dm-sans">
				<Navbar />
				<HeroFull />
				<Benefits />
				<Pricing />
				<Testimonials />
				<FAQ />
				<FinalCTA />
				<Footer />
			</main>
		</Landing>
	);
};
export default LeetGPTLanding;
