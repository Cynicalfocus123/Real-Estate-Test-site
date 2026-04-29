import { useEffect } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { assetPath } from "../utils/assets";

const lawSections = [
  {
    title: "Land Ownership Restrictions",
    items: [
      "Prohibition: The Land Code Act prohibits foreigners from directly owning land in Thailand.",
      "Exceptions: Inheritance: Foreigners can inherit land from a Thai national, but must dispose of it within one year if they don't receive permission from the Minister of Interior to retain it.",
      "Investment: Foreigners who invest a minimum of 40 million Baht in Thailand can own up to 1 rai (approximately 1,600 square meters) of land for residential purposes, subject to approval by the Ministry of Interior.",
      "Board of Investment (BOI): Foreigners with BOI investment may have special privileges and exemptions for land ownership.",
      "Thai Company: A foreigner may own land in Thailand in the name of a Thai company (at least 51% of shares are Thai and 49% are foreign).",
      "Thai Spouse: A foreigner married to a Thai national can register land under their spouse's name.",
    ],
  },
  {
    title: "Condominium Ownership",
    items: [
      "Permitted: Foreigners can own condominium units, but foreign ownership in a building cannot exceed 49% of the total saleable square footage.",
      "Registration: To register ownership, you need a Foreign Exchange Transaction form (FET form), ID cards or passports, and a letter from the seller guaranteeing that the condominium complies with the foreign ownership quota.",
    ],
  },
  {
    title: "Leasehold",
    items: [
      "Permitted: Foreigners can lease land from Thai owners for up to 30 years, with the possibility of renewal for additional 30-year periods.",
      "Building Ownership: Foreigners can own buildings on leased land, but it's crucial to agree on what happens to the building when the lease ends.",
    ],
  },
  {
    title: "Other Considerations",
    items: [
      "Foreign Business Act: Forming a Thai company with a Thai majority meets the requirements of the Foreign Business Act.",
      "Sap-Ing-Sith: Foreigners can acquire a long-term land use right called Sap-Ing-Sith, which can be granted for up to 30 years and can be renewed.",
      "Due Diligence: Conduct thorough due diligence before purchasing property in Thailand.",
      "Legal Advice: Seek legal advice from a qualified Thai lawyer to ensure compliance with the law.",
      "Real Estate Agents: Engage a reputable real estate agent who is familiar with the local market and legal requirements.",
    ],
  },
];

export function RealEstateLawsPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="relative h-[240px] overflow-hidden bg-brand-dark sm:h-[300px] lg:h-[340px]">
          <img
            src={assetPath("images/page-banners/real-estate-laws-for-foreigner.png")}
            alt="Real estate laws for foreigner"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/35" />
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-brand-red">
              Thailand Property Guide
            </p>
            <h1 className="mt-4 font-serif text-4xl font-normal leading-tight text-brand-dark sm:text-5xl">
              Real Estate Laws for Foreigner
            </h1>
            <p className="mt-6 text-lg font-semibold leading-8 text-brand-gray">
              In Thailand, foreigners are generally prohibited from directly owning land, but can own
              condominium units and buildings, and can lease land for up to 30 years, with potential
              renewals.
            </p>
            <p className="mt-5 text-base font-semibold leading-7 text-brand-dark">
              Here's a more detailed explanation:
            </p>
          </div>

          <div className="mt-10 space-y-6">
            {lawSections.map((section) => (
              <article key={section.title} className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
                <h2 className="text-xl font-black text-brand-dark">{section.title}</h2>
                <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 bg-brand-red" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
