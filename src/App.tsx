import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { LongTermVisaPage } from "./components/LongTermVisaPage";
import { MapPreview } from "./components/MapPreview";
import { PropertyCard } from "./components/PropertyCard";
import { RealEstateLawsPage } from "./components/RealEstateLawsPage";
import { RetirementVisaPage } from "./components/RetirementVisaPage";
import { SearchPanel } from "./components/SearchPanel";
import { StatsBand } from "./components/StatsBand";
import { TopLocations } from "./components/TopLocations";
import { WhyChooseUs } from "./components/WhyChooseUs";
import { featuredProperties } from "./data/mockProperties";

export function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const isRealEstateLawsPage =
    currentPath.endsWith("/real-estate-laws-for-foreigner") ||
    currentHash === "#/real-estate-laws-for-foreigner";
  const isRetirementVisaPage =
    currentPath.endsWith("/retirement-visa") || currentHash === "#/retirement-visa";
  const isLongTermVisaPage =
    currentPath.endsWith("/long-term-visa") || currentHash === "#/long-term-visa";

  useEffect(() => {
    function syncPath() {
      setCurrentPath(window.location.pathname);
    }

    function syncHash() {
      setCurrentHash(window.location.hash);
    }

    function scrollToHash() {
      const id = window.location.hash.slice(1);
      if (!id || id.startsWith("/")) return;
      const scroll = () => {
        document.getElementById(id)?.scrollIntoView({ block: "start" });
      };

      window.requestAnimationFrame(scroll);
      window.setTimeout(scroll, 100);
      window.setTimeout(scroll, 500);
      window.setTimeout(scroll, 1000);
    }

    scrollToHash();
    window.addEventListener("popstate", syncPath);
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("hashchange", scrollToHash);
    return () => {
      window.removeEventListener("popstate", syncPath);
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, []);

  if (isRealEstateLawsPage) {
    return <RealEstateLawsPage />;
  }

  if (isRetirementVisaPage) {
    return <RetirementVisaPage />;
  }

  if (isLongTermVisaPage) {
    return <LongTermVisaPage />;
  }

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="relative min-h-[680px] overflow-hidden bg-neutral-900">
          <iframe
            className="pointer-events-none absolute left-1/2 top-1/2 h-[145%] w-[360%] -translate-x-1/2 -translate-y-1/2 sm:w-[240%] md:w-[180%] lg:h-[145%] lg:w-[115%]"
            src="https://www.youtube.com/embed/DjHBEF6derw?autoplay=1&mute=1&loop=1&playlist=DjHBEF6derw&controls=0&rel=0&modestbranding=1&playsinline=1"
            title="Mstar Property Emperor Grand View | Newest Krabi Thailand Luxury Township"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
          <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(0,0,0,0.54)_0%,rgba(0,0,0,0.34)_48%,rgba(0,0,0,0.12)_100%)]" />
          <div className="relative mx-auto flex max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
            <div className="max-w-2xl">
              <h1 className="text-5xl font-black leading-[1.02] text-white drop-shadow-[0_5px_18px_rgba(0,0,0,0.9)] sm:text-6xl lg:text-7xl">
                Find your next home for less.
              </h1>
              <p className="mt-6 max-w-lg text-lg font-extrabold leading-8 text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]">
                Your trusted real estate partner for buying, renting, and leasing. Specializing in luxury
                homes, distressed properties, and exclusive long-term visa packages for foreign buyers.
              </p>
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
