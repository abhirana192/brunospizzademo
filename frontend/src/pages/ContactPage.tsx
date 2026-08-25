import { Helmet } from "react-helmet-async";
import { LocationHours } from "../components/home/LocationHours";
import { RESTAURANT } from "../constants";

export function ContactPage() {
  return (
    <div>
      <Helmet>
        <title>Contact — Bruno's Deli & Pizza</title>
        <meta name="description" content="Get in touch with Bruno's Deli & Pizza — phone, email, address, and opening hours." />
      </Helmet>
      <div className="section pt-14 pb-2 text-center">
        <h1 className="font-display text-4xl font-bold text-charcoal-900">Contact {RESTAURANT.name}</h1>
        <p className="text-charcoal-500 mt-2">We'd love to hear from you.</p>
      </div>
      <LocationHours />
    </div>
  );
}
