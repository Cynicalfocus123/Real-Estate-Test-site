import { useEffect } from "react";
import { assetPath } from "../utils/assets";
import { Footer } from "./Footer";
import { Header } from "./Header";

const canOwnItems = [
  "Condominiums: Foreigners can legally own condo units outright (freehold), as long as foreign ownership in the building does not exceed 49% of the total floor area. This is the most straightforward and common option.",
];

const cannotOwnItems = [
  "Land: Thai law generally prohibits foreigners from owning land. This means you cannot directly own houses or villas in your own name if they sit on land.",
];

const alternativeItems = [
  "Long-term lease: You can lease land or property for up to 30 years, often renewable.",
  "Thai company structure: Some investors set up a Thai company to hold land, but this must be done carefully to comply with legal requirements.",
  "Ownership of building only: In some cases, a foreigner can own the structure (house) but lease the land it sits on.",
  "BOI or special investment schemes: Rare cases allow land ownership with significant investment and government approval.",
];

export function ForeignerOwnPropertyPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="px-4 py-6 lg:px-8">
          <img
            src={assetPath("images/page-banners/foreigner-own-property-thailand.png")}
            alt="Is it possible for a foreigner to own property in Thailand"
            className="mx-auto h-auto w-full max-w-5xl"
          />
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl font-normal leading-tight text-brand-dark sm:text-5xl">
              Is it possible for a foreigner to own property in Thailand?
            </h1>
          </div>

          <div className="mt-10 space-y-6">
            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">What foreigners can own</h2>
              <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                {canOwnItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 bg-brand-red" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">What foreigners cannot directly own</h2>
              <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                {cannotOwnItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 bg-brand-red" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">Common alternatives</h2>
              <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                {alternativeItems.map((item) => (
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
