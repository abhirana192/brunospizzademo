import { Helmet } from "react-helmet-async";
import { LocationHours } from "../components/home/LocationHours";
import { RESTAURANT } from "../constants";
import { PageHero } from "../components/PageHero";

export function ContactPage() {
  return (
    <div className="bg-charcoal-950">
      <Helmet>
        <title>Contact — Bruno's Deli & Pizza</title>
        <meta name="description" content="Get in touch with Bruno's Deli & Pizza — phone, email, address, and opening hours." />
      </Helmet>
      <PageHero eyebrow="Get in touch" title={`Contact ${RESTAURANT.shortName}`} subtitle="We'd love to hear from you — or just call in your order." image="/images/food/hero-pizza.jpg" />

      <div className="section -mt-8 relative z-10 pb-16 sm:pb-20">
        <a
          href={RESTAURANT.phoneHref}
          className="rounded-xl2 bg-white/10 backdrop-blur-xl border border-white/15 shadow-premium flex items-center justify-between gap-4 p-5 sm:p-6 max-w-lg mx-auto hover:-translate-y-1 hover:bg-white/15 transition-all duration-200"
        >
          <div className="flex items-center gap-4">
            <span className="h-12 w-12 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-2xl" aria-hidden>📞</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white/50">Call to order</p>
              <p className="font-display font-bold text-xl text-cream-50">{RESTAURANT.phone}</p>
            </div>
          </div>
          <span className="btn-primary !px-4 !py-2 text-xs shrink-0">Call Now</span>
        </a>
      </div>

      <LocationHours />
    </div>
  );
}
