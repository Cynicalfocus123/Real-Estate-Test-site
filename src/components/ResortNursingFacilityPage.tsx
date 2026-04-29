import { useEffect } from "react";
import { assetPath } from "../utils/assets";
import { Footer } from "./Footer";
import { Header } from "./Header";

const amenityItems = [
  "Full ownership or exclusive use of a private villa without shared rooms or living spaces.",
  "Short- and long-term stay options for seniors who want privacy with resort support.",
  "Meals tailored to individual preferences, including international and Western options.",
  "Dietary plans designed around individual health needs.",
  "Caregiver support, accommodation, daily breakfast, swimming pool access, and fitness center access.",
  "Registered nurse available on-site 24/7, with flexible care from 8 to 24 hours per day.",
  "In-house medical clinic options at some resorts, with nearby hospitals typically 5-10 minutes away.",
];

const lifestyleItems = [
  "Social and recreational activities inside the community hall.",
  "Half-day or full-day outing arrangements, including shopping and dining experiences.",
  "Access to well-equipped nearby hospitals for peace of mind throughout each stay.",
];

export function ResortNursingFacilityPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="px-4 py-6 lg:px-8">
          <img
            src={assetPath("images/page-banners/resort-nursing-facility.png")}
            alt="Resort nursing facility"
            className="mx-auto h-auto w-full max-w-5xl"
          />
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-brand-red">
              Senior Nursing Home
            </p>
            <h1 className="mt-4 font-serif text-4xl font-normal leading-tight text-brand-dark sm:text-5xl">
              Resort Nursing Facility
            </h1>
            <p className="mt-6 text-lg font-semibold leading-8 text-brand-gray">
              This concept combines the privacy of a personal villa with the comfort and amenities of
              a resort environment. Residents enjoy full ownership or exclusive use of their own villa,
              without sharing rooms or living spaces, while still benefiting from hotel-style services
              and a relaxing, vacation-like atmosphere.
            </p>
            <p className="mt-5 text-base leading-8 text-brand-gray">
              At a resort-style nursing villa, both short- and long-term stays are available for
              seniors. You live independently in your private home within the resort, with meals
              tailored to your preferences, including international and Western options. Dietary plans
              are carefully designed to match individual health needs.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">Care & Resort Amenities</h2>
              <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                {amenityItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 bg-brand-red" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">Activities and Lifestyle</h2>
              <p className="mt-5 text-base leading-8 text-brand-gray">
                Residents can enjoy a variety of social and recreational activities within the
                community hall, encouraging engagement and connection with others. For those who wish
                to explore beyond the resort, arrangements can be made for half-day or full-day
                outings, including shopping and dining experiences.
              </p>
              <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                {lifestyleItems.map((item) => (
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
