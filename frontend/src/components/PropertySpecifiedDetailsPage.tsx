import { useEffect } from "react";
import { assetPath } from "../utils/assets";
import { Footer } from "./Footer";
import { Header } from "./Header";

const spaItems = [
  "Exact unit/plot details, including size, layout, floor, and unit number.",
  "Materials, finishes, and fixtures, including brand/model if possible.",
  "Furniture package, if included.",
  "Completion date and penalties for delays.",
  "Payment schedule tied to construction milestones.",
];

const titleItems = [
  "The seller is the legal owner.",
  "Boundaries and size match what is being sold.",
  "There are no mortgages, liens, or legal encumbrances.",
];

const lawyerItems = [
  "Review contracts and clauses.",
  "Conduct due diligence.",
  "Ensure compliance with foreign ownership rules.",
  "Oversee the transfer at the Land Department.",
];

const inspectionItems = [
  "Check workmanship, fittings, and appliances.",
  "Ensure all agreed items are delivered and functional.",
  "Document defects and require fixes before transfer.",
];

const paymentItems = [
  "Link payments to construction progress.",
  "Use escrow services where possible to protect funds.",
];

const permitItems = [
  "Approved building plans.",
  "Construction permits.",
  "Environmental or zoning compliance, if relevant.",
];

const guaranteeItems = [
  "Structural warranty, often 1-5 years.",
  "Defects liability period.",
  "Clear responsibility for repairs.",
];

const recordItems = [
  "Contracts and receipts.",
  "Floor plans and specifications.",
  "Emails and communication with the seller.",
];

function DetailBlock({ items, title }: { items: string[]; title: string }) {
  return (
    <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
      <h2 className="text-xl font-black text-brand-dark">{title}</h2>
      <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 h-2 w-2 shrink-0 bg-brand-red" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function PropertySpecifiedDetailsPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="px-4 py-6 lg:px-8">
          <img
            src={assetPath("images/page-banners/property-specified-details.png")}
            alt="How can I ensure that the property I receive matches the specified details"
            className="mx-auto h-auto w-full max-w-5xl"
          />
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl font-normal leading-tight text-brand-dark sm:text-5xl">
              How can I ensure that the property I receive matches the specified details?
            </h1>
            <p className="mt-6 text-lg font-semibold leading-8 text-brand-gray">
              Ensuring that the property you receive in Thailand matches what you agreed to buy comes
              down to clear documentation, legal checks, and proper inspections before and at
              transfer.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            <DetailBlock title="Use a Detailed Sale & Purchase Agreement (SPA)" items={spaItems} />
            <DetailBlock title="Verify the Title Deed (Chanote)" items={titleItems} />
            <DetailBlock title="Work with an Independent Lawyer" items={lawyerItems} />
            <DetailBlock title="Inspect Before Transfer" items={inspectionItems} />
            <DetailBlock title="Use Escrow or Staged Payments" items={paymentItems} />
            <DetailBlock title="Confirm Approved Plans & Permits" items={permitItems} />
            <DetailBlock title="Get Written Guarantees" items={guaranteeItems} />
            <DetailBlock title="Record Everything" items={recordItems} />

            <article className="border border-brand-line bg-neutral-50 p-6">
              <h2 className="text-xl font-black text-brand-dark">Bottom line</h2>
              <p className="mt-5 text-base leading-8 text-brand-gray">
                In Thailand, what protects you is not verbal promises. It is a precise contract,
                proper legal due diligence, and a thorough inspection before transfer. Skipping any of
                these steps is where most buyers run into problems.
              </p>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
