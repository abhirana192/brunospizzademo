import { Helmet } from "react-helmet-async";
import { AboutSection } from "../components/home/AboutSection";
import { WhyBruno } from "../components/home/WhyBruno";
import { Reviews } from "../components/home/Reviews";
import { PageHero } from "../components/PageHero";

export function AboutPage() {
  return (
    <div className="bg-charcoal-950">
      <Helmet>
        <title>About Us — Bruno's Deli & Pizza</title>
        <meta name="description" content="Learn about Bruno's Deli & Pizza — handcrafted pizza made fresh from real ingredients." />
      </Helmet>
      <PageHero
        eyebrow="Our Story"
        title="About Bruno's"
        subtitle="Handcrafted pizza, a full Chinese kitchen, and diner classics — made fresh, served late, for real neighbors."
        image="/images/food/about-oven.jpg"
      />
      <AboutSection />
      <WhyBruno />
      <Reviews />
    </div>
  );
}
