import { useEffect } from "react";
import { assetPath } from "../utils/assets";
import { Footer } from "./Footer";
import { Header } from "./Header";

const propertyTypeItems = [
  "Condominiums (Freehold Ownership): This is the most straightforward option. Foreigners are legally allowed to own condo units outright, provided foreign ownership in the building does not exceed 49% of the total floor area. Ownership is registered under the buyer's name with a full title deed (Chanote).",
  "Buildings (Without Land Ownership): Foreigners may own structures such as houses or villas, but not the land they sit on. In practice, this is usually paired with a long-term land lease.",
  "Leasehold Property: Foreigners can lease land or property for up to 30 years, with options to renew. This is commonly used for villas, houses, or land plots and can sometimes be structured with additional renewal clauses.",
  "Property via Thai Company (With Caution): Some foreigners acquire land through a Thai-registered company. However, the company must be legitimately structured and not used solely as a nominee arrangement, which is illegal under Thai law.",
  "Investment-Based Ownership (Limited Cases): In rare cases, foreigners may be permitted to own land if they invest a significant amount in Thailand under specific government-approved schemes.",
];

export function ForeignerPropertyTypesPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="px-4 py-6 lg:px-8">
          <img
            src={assetPath("images/page-banners/foreigner-property-types-thailand.png")}
            alt="What types of property can foreigners own in Thailand"
            className="mx-auto h-auto w-full max-w-5xl"
          />
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl font-normal leading-tight text-brand-dark sm:text-5xl">
              What type of property can foreigners own in Thailand?
            </h1>
            <p className="mt-6 text-lg font-semibold leading-8 text-brand-gray">
              Foreigners can own certain types of property in Thailand, but the rules vary depending
              on the asset.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">Permitted property types</h2>
              <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                {propertyTypeItems.map((item) => (
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
