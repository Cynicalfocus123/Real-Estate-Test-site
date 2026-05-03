import { useEffect } from "react";
import { assetPath } from "../utils/assets";
import { Footer } from "./Footer";
import { Header } from "./Header";

const featureItems = [
  "Comprehensive Care: 24/7 nursing and caregiving support, including services for dementia and Alzheimer's patients.",
  "Modern Facilities: Fully furnished residences designed with universal design principles to ensure safety and comfort.",
  "Rehabilitation Services: Tailored programs for stroke recovery, Parkinson's disease, and post-surgical care.",
  "Affordability: Significantly lower costs compared to many Western countries, with inclusive care packages available.",
];

const locationItems = [
  "Bangkok: Offers a wide range of specialized care facilities, including providers like Doctor P Nursing Care and Camillian Home for the Aged.",
  "Chiang Mai: Known for its peaceful environment and resort-style care homes.",
  "Hua Hin: A popular destination for retirement communities with assisted living services.",
  "Koh Samui: Features specialized retirement villages catering to foreign residents.",
  "Pattaya / Chonburi: Ideal for retirees seeking proximity to entertainment and urban amenities.",
  "Krabi: Offers tranquil settings with access to scenic beaches and island views, ideal for a relaxed retirement lifestyle.",
];

export function NursingHomeFacilityPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="px-4 py-6 lg:px-8">
          <img
            src={assetPath("images/page-banners/nursing-home-facility.png")}
            alt="Nursing home facility"
            className="mx-auto h-auto w-full max-w-5xl"
          />
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-brand-red">
              Senior Nursing Home
            </p>
            <h1 className="mt-4 font-serif text-4xl font-normal leading-tight text-brand-dark sm:text-5xl">
              Nursing Home Facility
            </h1>
            <p className="mt-6 text-lg font-semibold leading-8 text-brand-gray">
              Nursing homes in Thailand provide high-quality, round-the-clock care, with private
              accommodations and experienced medical staff starting from approximately THB
              25,000-35,000 per month. Many facilities also offer physiotherapy, dementia care, and
              specialized post-hospitalization rehabilitation programs.
            </p>
            <p className="mt-5 text-base leading-8 text-brand-gray">
              Accommodation options range from luxury villas and resort-style residences to fully
              integrated communities that include dedicated nursing care services.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">Key Features of Nursing Homes in Thailand</h2>
              <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                {featureItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 bg-brand-red" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">Popular Locations</h2>
              <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                {locationItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 bg-brand-red" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
