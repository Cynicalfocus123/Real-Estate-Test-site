import { useEffect } from "react";
import { assetPath } from "../utils/assets";
import { Footer } from "./Footer";
import { Header } from "./Header";

const buyerStepItems = [
  "Confirm the Reason for Sale: Understand whether the urgency is caused by relocation, debt pressure, estate settlement, business needs, or a fixed closing deadline.",
  "Move Quickly on Documents: Review title, ownership records, encumbrances, building details, and sale terms early so the transaction speed does not weaken due diligence.",
  "Prepare Proof of Funds: Sellers of urgent-sale properties often prioritize buyers who can show clear financing, cash availability, or a reliable closing plan.",
  "Negotiate with Discipline: A discounted price can be attractive, but the offer should still account for condition, transfer costs, taxes, and any legal or occupancy risks.",
];

const riskItems = [
  "As-Is Condition: Urgent-sale homes may have deferred maintenance or limited time for inspection, so professional checks remain important.",
  "Title and Debt Issues: Existing mortgages, liens, unpaid fees, or unclear ownership can delay transfer even when both parties want a fast closing.",
  "Pressure Tactics: Buyers should avoid rushing into deposits without written terms, verified documents, and clear refund conditions.",
  "Foreign Buyer Rules: Foreign buyers should confirm condo quota status, lease structure, company setup, or other compliant ownership options before signing.",
];

export function UrgentSalePage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="px-4 py-6 lg:px-8">
          <img
            src={assetPath("images/page-banners/urgent-sale.png")}
            alt="Urgent sale"
            className="mx-auto h-auto w-full max-w-5xl"
          />
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl font-normal leading-tight text-brand-dark sm:text-5xl">
              Urgent Sale
            </h1>
            <p className="mt-6 text-lg font-semibold leading-8 text-brand-gray">
              Urgent-sale properties are listed by owners who need a faster transaction timeline,
              which can create negotiation opportunities for prepared buyers who can move quickly
              without skipping legal and property checks.
            </p>
            <p className="mt-5 text-base leading-8 text-brand-gray">
              The strongest urgent-sale purchases balance speed with discipline. Buyers should
              verify the reason for sale, inspect the property, confirm transfer requirements, and
              document every agreement before deposits or closing payments are made.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">How to Approach an Urgent Sale</h2>
              <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                {buyerStepItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 bg-brand-red" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">Risks to Review Before Closing</h2>
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
