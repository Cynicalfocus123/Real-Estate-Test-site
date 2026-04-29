import { useEffect } from "react";
import { assetPath } from "../utils/assets";
import { Footer } from "./Footer";
import { Header } from "./Header";

const serviceItems = [
  "Medical Care: supervision by registered nurses, personalized rehabilitation programs, and full medication management.",
  "Accommodation: Fully equipped private villas with modern amenities, en-suite bathrooms, and accessibility-friendly design.",
  "Personal Care: Daily housekeeping, laundry services, and well-balanced meals, often including international cuisine options.",
  "Lifestyle & Activities: Recreational programs, memory care exercises, and social activities designed to support mental and emotional well-being.",
  "Security: CCTV systems installed within the property, along with 24/7 on-site security patrols for added safety.",
];

const benefitItems = [
  "Cost Efficiency: Significantly more affordable than Western alternatives, often saving 50-60% compared to private hospital or institutional care, while still offering the comfort of living in your own private home.",
  "High Standards: Many villas are located close to internationally accredited hospitals, ensuring quick access to advanced medical care.",
  "Community Access: While maintaining full privacy, residents can choose to engage in shared activities at community halls, fostering social connections with other residents.",
  "Personalized Attention: High staff-to-resident ratios allow for truly customized care plans tailored to individual health and lifestyle needs.",
];

export function PrivateVillaNursingCarePage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="px-4 py-6 lg:px-8">
          <img
            src={assetPath("images/page-banners/private-villa-nursing-care.png")}
            alt="Private villa nursing care"
            className="mx-auto h-auto w-full max-w-5xl"
          />
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-brand-red">
              Senior Nursing Home
            </p>
            <h1 className="mt-4 font-serif text-4xl font-normal leading-tight text-brand-dark sm:text-5xl">
              Private Villa Nursing Care
            </h1>
            <p className="mt-6 text-lg font-semibold leading-8 text-brand-gray">
              Private villa nursing care in Thailand provides a premium, highly personalized form of
              assisted living within a private home setting. Residents enjoy their own space, typically
              including a private bedroom, living area, guest room, and en-suite bathroom, paired with
              24/7 medical supervision.
            </p>
            <p className="mt-5 text-base leading-8 text-brand-gray">
              Unlike traditional care facilities, there is no need to share accommodation, offering
              complete privacy and comfort. Many top providers feature private pool villas or luxury
              suites, with specialized programs for dementia care, stroke rehabilitation, and
              post-hospital recovery, often at 50-80% lower costs than comparable services in Western
              countries.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">Key Services & Features</h2>
              <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                {serviceItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 bg-brand-red" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">Benefits of Villa Care in Thailand</h2>
              <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                {benefitItems.map((item) => (
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
