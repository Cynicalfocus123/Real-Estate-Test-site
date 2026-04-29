import { useEffect } from "react";
import { assetPath } from "../utils/assets";
import { Footer } from "./Footer";
import { Header } from "./Header";

const saleTypeItems = [
  "Bank NPA / Foreclosure: Financial institutions repossess properties following loan defaults and resell them, often at below-market prices.",
  "\"Kai Faak\" (Sale with Right of Redemption): A higher-risk, short-term arrangement where ownership transfers to the buyer, but the original owner retains the right to repurchase. If they fail to do so, the asset becomes an NPA.",
  "Fire Sales: Owners facing financial pressure may sell privately at reduced prices for immediate liquidity.",
];

const listingSourceItems = [
  "Bank NPA platforms, such as Krungsri Property and Bangkok Bank.",
  "Property portals such as PropertyHub.",
  "Auction platforms and agencies like Property Auction House.",
  "Specialized firms such as Buyhomeforless.com and Mstar Property Thailand.",
];

const riskItems = [
  "Property Condition: Many NPAs are sold as-is, and may require substantial renovation or repair.",
  "Occupancy Issues: Some properties may still be occupied by former owners or tenants, requiring legal proceedings for vacant possession.",
  "Foreign Ownership Rules: Foreign buyers can own condominiums within quota limits, but land ownership is generally restricted and may require leasehold or structured arrangements.",
  "Legal Due Diligence: Engaging a qualified Thai lawyer is strongly recommended to verify title, check for encumbrances, and ensure compliance with local regulations.",
];

export function DistressedPropertyPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="px-4 py-6 lg:px-8">
          <img
            src={assetPath("images/page-banners/distressed-property.png")}
            alt="Distressed property"
            className="mx-auto h-auto w-full max-w-5xl"
          />
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl font-normal leading-tight text-brand-dark sm:text-5xl">
              Distressed Property
            </h1>
            <p className="mt-6 text-lg font-semibold leading-8 text-brand-gray">
              Distressed properties in Thailand, commonly sold as Non-Performing Assets (NPAs) or
              bank foreclosures (REOs), are becoming more prevalent due to rising household debt,
              high mortgage rejection rates exceeding 40%, and developer loan defaults.
            </p>
            <p className="mt-5 text-base leading-8 text-brand-gray">
              These conditions create opportunities to acquire condominiums, houses, and land at
              significant discounts. Listings are often available through bank platforms such as
              Krungsri Property and Bangkok Bank, marketplaces like PropertyHub, and specialized
              agencies including Buyhomeforless and Mstar Property Thailand.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">Types of Distressed Sales</h2>
              <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                {saleTypeItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 bg-brand-red" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">Where to Find Listings</h2>
              <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                {listingSourceItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 bg-brand-red" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">Risks and Considerations</h2>
              <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                {riskItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 bg-brand-red" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="border border-brand-line bg-neutral-50 p-6">
              <p className="text-base leading-8 text-brand-gray">
                When purchasing through firms such as Buyhomeforless.com or Mstar Property Thailand,
                the legal process, including title checks, documentation, and eviction procedures, is
                typically managed on your behalf prior to closing. This provides added assurance that
                all legal matters have been properly addressed, allowing buyers to proceed with
                confidence.
              </p>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
