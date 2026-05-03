import { useEffect } from "react";
import { assetPath } from "../utils/assets";
import { Footer } from "./Footer";
import { Header } from "./Header";

const stepItems = [
  "Find Listings: Browse listings through Buyhomeforless.com or major bank platforms such as Bangkok Bank and SCB.",
  "Due Diligence: Always verify the title deed (Chanote) at the Land Department to check for liens or encumbrances. Buyhomeforless can handle comprehensive title and legal checks on your behalf.",
  "Property Inspection: Visit the property to assess its condition, as foreclosure homes are sold as-is. Buyhomeforless works with professional inspection companies to ensure the property is safe and suitable for habitation.",
  "Submit Offer or Bid: Buyhomeforless can represent you in submitting offers directly to banks or participating in auctions, based on your specified budget.",
  "Payment & Transfer: Auction purchases typically require immediate full payment in cash, although some bank-owned (REO) properties may offer financing options.",
];

const riskItems = [
  "Occupied Properties: Some homes may still be occupied by previous owners or tenants, requiring legal eviction. Buyhomeforless manages this process before closing.",
  "Property Condition: Properties are evaluated before being offered, and major structural issues are either addressed or excluded from sale.",
  "Transaction Costs: Expect transfer fees of approximately 2% and withholding tax around 0.5%, in addition to any agency fees.",
  "Title Verification: While banks usually clear outstanding debts, it remains essential to confirm a clean title. Buyhomeforless's escrow and title specialists conduct thorough checks to ensure a secure transaction.",
];

export function ForeclosurePage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="px-4 py-6 lg:px-8">
          <img
            src={assetPath("images/page-banners/foreclosure.png")}
            alt="Foreclosure"
            className="mx-auto h-auto w-full max-w-5xl"
          />
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl font-normal leading-tight text-brand-dark sm:text-5xl">
              Foreclosure
            </h1>
            <p className="mt-6 text-lg font-semibold leading-8 text-brand-gray">
              Purchasing a foreclosure property in Thailand, commonly referred to as a
              Non-Performing Asset (NPA), is typically conducted through bank sales or auctions,
              including those organized by institutions such as the Government Housing Bank.
            </p>
            <p className="mt-5 text-base leading-8 text-brand-gray">
              These properties are often offered at substantial discounts. Foreign buyers are
              generally limited to purchasing condominiums within the 49% foreign ownership quota and
              cannot directly own land. However, firms like Buyhomeforless can provide legal guidance
              on structuring the purchase of villas or land through compliant arrangements.
            </p>
            <p className="mt-5 text-base leading-8 text-brand-gray">
              Most auction purchases require full cash payment, and properties are sold as-is, which
              may involve renovations and resolving any existing occupancy.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">Key Steps to Buying Foreclosures</h2>
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
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
