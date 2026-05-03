import { useEffect } from "react";
import { assetPath } from "../utils/assets";
import { Footer } from "./Footer";
import { Header } from "./Header";

const ownershipSections = [
  {
    title: "Land Ownership",
    items: [
      "Prohibited for Foreigners: Under Thai law, foreigners cannot directly own land in Thailand.",
      "Leasehold Arrangements: A common workaround is to lease the land for a maximum of 30 years, with the possibility of renewal.",
      "Thai Company Ownership: Another option is to establish a Thai company with majority Thai ownership, which can then purchase the land.",
    ],
  },
  {
    title: "Structures and Buildings",
    items: [
      "Foreign Ownership Allowed: Foreigners can own buildings and structures, such as houses, villas, or apartments, even if they don't own the land.",
      "Condominium Ownership: Foreigners can own freehold condominium units, but with a foreign ownership quota of 49% of the total saleable area of each condominium project.",
      "Leasehold Condominiums: If the foreign freehold ownership quota is reached, foreigners can still buy a unit under leasehold status, with no limitation on foreign ownership.",
      "Building Permits: To build a house on leased land, foreigners need to obtain a construction permit in their name.",
    ],
  },
  {
    title: "Key Considerations",
    items: [
      "Legal Advice: Due to the complexities of Thai property law, it's highly recommended to seek legal advice from a qualified lawyer specializing in Thai real estate.",
      "Title Deed Search: Before purchasing any property, it's crucial to conduct a title deed search to ensure there are no outstanding liens or issues with the property.",
      "Foreign Business Act (FBA): Foreign companies can only own land for specific purposes, such as promoting investment or tourism, as authorized by the Board of Investment (BOI).",
      "Tax Implications: Foreign investors in Thai property pay the same tax rates as Thai citizens.",
    ],
  },
];

export function OwnPropertyInThailandPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="px-4 py-6 lg:px-8">
          <img
            src={assetPath("images/page-banners/own-property-in-thailand.png")}
            alt="Own property in Thailand"
            className="mx-auto h-auto w-full max-w-5xl"
          />
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-brand-red">
              Thailand Property Guide
            </p>
            <h1 className="mt-4 font-serif text-4xl font-normal leading-tight text-brand-dark sm:text-5xl">
              Own Property in Thailand
            </h1>
            <p className="mt-6 text-lg font-semibold leading-8 text-brand-gray">
              Foreigners can own property in Thailand, but with restrictions: they can own buildings
              and structures, like houses or villas, but not the land itself, typically through
              long-term leases or by owning a condominium unit.
            </p>
            <p className="mt-5 text-base font-semibold leading-7 text-brand-dark">
              Here's a more detailed breakdown:
            </p>
          </div>

          <div className="mt-10 space-y-6">
            {ownershipSections.map((section) => (
              <article
                key={section.title}
                className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]"
              >
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
