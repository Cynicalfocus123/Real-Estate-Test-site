import { useEffect } from "react";
import { assetPath } from "../utils/assets";
import { Footer } from "./Footer";
import { Header } from "./Header";

const considerationItems = [
  "Land Ownership Restrictions: Foreigners cannot directly own land. Common alternatives include purchasing a condominium in your own name, entering into a renewable 30-year lease, or structuring ownership through a Thai limited company. Firms like Buyhomeforless can assist in navigating compliant structures for villa or land acquisition.",
  "Usufruct Agreement: This legal arrangement allows a foreigner (often a spouse) to retain lifetime usage rights over a property, even if the land is held under a Thai national's name or a company structure.",
  "Due Diligence: It is critical to verify the Chanote (title deed), check for outstanding taxes or debts, and confirm that the property can be legally renovated. Professional services can help manage these checks thoroughly.",
];

const stepItems = [
  "Search & Identify Properties: Explore listings on platforms such as buyhomeforless.com or Mstarproperty.com. Older townhouses, rural villas, and distressed homes, often priced between $30,000 and $100,000, are common opportunities.",
  "Professional Inspection: Tropical conditions can lead to issues like water damage, termites, and structural wear. A certified inspection is essential to assess the true condition of the property.",
  "Renovation Planning: Budget conservatively, as renovation costs can exceed initial estimates. Working with experienced local contractors or project managers helps control quality, timelines, and costs, particularly for foreign investors.",
  "Deposit & Agreement: After completing due diligence, buyers typically place a 10% deposit and sign a detailed Sale and Purchase Agreement (SPA).",
  "Transfer & Closing: Ownership transfer is completed at the Thailand Land Department. Foreign buyers must ensure funds are transferred in foreign currency to comply with legal requirements for property ownership.",
];

const locationItems = [
  "Bangkok: Older townhouses in established or industrial neighborhoods.",
  "Phuket / Koh Samui: Aging villas in prime locations that require modernization.",
  "Rural Areas: Traditional Thai teak homes, often rich in character but in need of significant restoration.",
  "Buyhomeforless.com: Some distressed or off-market properties may appear here before being listed on broader platforms, offering early access to potential deals.",
];

export function FixerUpperPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="px-4 py-6 lg:px-8">
          <img
            src={assetPath("images/page-banners/fixer-upper.png")}
            alt="Fixer-upper"
            className="mx-auto h-auto w-full max-w-5xl"
          />
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl font-normal leading-tight text-brand-dark sm:text-5xl">
              Fixer Upper
            </h1>
            <p className="mt-6 text-lg font-semibold leading-8 text-brand-gray">
              Buying a fixer-upper in Thailand involves sourcing undervalued or distressed
              properties, conducting thorough due diligence, and understanding foreign ownership
              regulations.
            </p>
            <p className="mt-5 text-base leading-8 text-brand-gray">
              While foreigners are generally restricted from owning land directly, they can legally
              purchase freehold condominiums or secure long-term leasehold interests. Careful
              planning, especially around legal structure, renovation costs, and title verification,
              is essential to a successful investment.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">Key Considerations for Foreign Buyers</h2>
              <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                {considerationItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 bg-brand-red" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">Steps to Buying a Fixer-Upper</h2>
              <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                {stepItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 bg-brand-red" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">Where to Find Fixer-Uppers</h2>
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
