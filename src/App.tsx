import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { MapPreview } from "./components/MapPreview";
import { PropertyCard } from "./components/PropertyCard";
import { SearchPanel } from "./components/SearchPanel";
import { StatsBand } from "./components/StatsBand";
import { TopLocations } from "./components/TopLocations";
import { WhyChooseUs } from "./components/WhyChooseUs";
import { featuredProperties } from "./data/mockProperties";

export function App() {
  useEffect(() => {
    function scrollToHash() {
      const id = window.location.hash.slice(1);
      if (!id) return;
      const scroll = () => {
        document.getElementById(id)?.scrollIntoView({ block: "start" });
      };

      window.requestAnimationFrame(scroll);
      window.setTimeout(scroll, 100);
      window.setTimeout(scroll, 500);
      window.setTimeout(scroll, 1000);
    }

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="relative min-h-[680px] overflow-hidden bg-neutral-100">
          <div className="absolute inset-0">
            <div className="h-full w-full bg-[linear-gradient(110deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.78)_42%,rgba(23,23,23,0.08)_42%,rgba(23,23,23,0.08)_100%)]" />
          </div>
          <div className="absolute right-0 top-0 hidden h-full w-[58%] bg-neutral-300 lg:block">
            <div className="grid h-full grid-cols-3 gap-3 p-8">
              <div className="mt-24 bg-neutral-400" />
              <div className="mb-24 bg-neutral-500" />
              <div className="mt-44 bg-neutral-600" />
            </div>
          </div>
          <div className="relative mx-auto flex max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
            <div className="max-w-2xl">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-brand-red">
                Buy Home For Less
              </p>
              <h1 className="mt-5 text-5xl font-black leading-[1.02] text-brand-dark sm:text-6xl lg:text-7xl">
                Find your next home for less.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-brand-gray">
                Your trusted real estate partner for buying, renting, and leasing. Specializing in luxury
                homes, distressed properties, and exclusive long-term visa packages for foreign buyers.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href="#listings"
                  className="inline-flex items-center gap-2 bg-brand-red px-7 py-4 text-sm font-bold uppercase text-white hover:bg-brand-dark"
                >
                  Browse Listings
                  <ArrowRight className="h-5 w-5" />
                </a>
                <a
                  href="#map"
                  className="inline-flex items-center gap-2 border border-brand-dark px-7 py-4 text-sm font-bold uppercase text-brand-dark hover:border-brand-red hover:text-brand-red"
                >
                  Search Map
                </a>
              </div>
            </div>
          </div>
        </section>

        <div className="relative z-10 px-4 lg:px-8">
          <SearchPanel />
        </div>

        <StatsBand />

        <WhyChooseUs />

        <section id="listings" className="mx-auto max-w-7xl scroll-mt-28 px-4 pb-20 lg:px-8">
          <div className="mx-auto mb-12 max-w-4xl text-center">
            <h2 className="font-serif text-5xl font-normal leading-tight text-[#1f1f1f] sm:text-6xl">
              Best Deals
            </h2>
            <p className="mt-5 text-base leading-8 text-brand-gray sm:text-lg">
              Hand-picked homes and investment properties prepared for live listing data.
            </p>
          </div>
          <div className="mb-8 flex justify-end">
            <a href="#listings" className="inline-flex items-center gap-2 font-bold text-brand-red">
              View All
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>

        <TopLocations />

        <MapPreview />
      </main>
      <Footer />
    </div>
  );
}
