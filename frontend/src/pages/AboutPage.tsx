import { Helmet } from "react-helmet-async";
import { AboutSection } from "../components/home/AboutSection";
import { WhyBruno } from "../components/home/WhyBruno";
import { Reviews } from "../components/home/Reviews";

export function AboutPage() {
  return (
    <div>
      <Helmet>
        <title>About Us — Bruno's Deli & Pizza</title>
        <meta name="description" content="Learn about Bruno's Deli & Pizza — handcrafted pizza made fresh from real ingredients." />
      </Helmet>
      <div className="section pt-14 pb-2 text-center">
        <h1 className="font-display text-4xl font-bold text-charcoal-900">About Bruno's Deli & Pizza</h1>
      </div>
      <AboutSection />
      <WhyBruno />
      <Reviews />
    </div>
  );
}
