import { Helmet } from "react-helmet-async";
import { Hero } from "../components/home/Hero";
import { MenuTicker } from "../components/home/MenuTicker";
import { QuickOrder } from "../components/home/QuickOrder";
import { PopularPizzas } from "../components/home/PopularPizzas";
import { DealsPreview } from "../components/home/DealsPreview";
import { WhyBruno } from "../components/home/WhyBruno";
import { AboutSection } from "../components/home/AboutSection";
import { Reviews } from "../components/home/Reviews";
import { LocationHours } from "../components/home/LocationHours";

export function HomePage() {
  return (
    <>
      <Helmet>
        <title>Bruno's Deli & Pizza — Hot. Fresh. Open Late.</title>
        <meta name="description" content="Handcrafted pizza, Chinese food, and diner classics made fresh for every order. Order online for pickup or delivery, open til 3AM." />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Restaurant",
            name: "Bruno's Deli & Pizza",
            servesCuisine: ["Pizza", "Chinese", "American"],
            priceRange: "$$",
          })}
        </script>
      </Helmet>
      <Hero />
      <MenuTicker />
      <QuickOrder />
      <PopularPizzas />
      <DealsPreview />
      <WhyBruno />
      <AboutSection />
      <Reviews />
      <LocationHours />
    </>
  );
}
