import { Helmet } from "react-helmet-async";

export function HomePage() {
  return (
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
  );
}
