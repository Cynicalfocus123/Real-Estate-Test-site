import { useEffect } from "react";
import { assetPath } from "../utils/assets";
import { Footer } from "./Footer";
import { Header } from "./Header";

const warrantyItems = [
  "General defects such as finishes, fittings, and other non-structural issues are usually covered for 1 year after handover.",
  "Structural defects affecting the foundation, beams, or other load-bearing elements are typically covered for up to 5 years under Thai construction liability rules.",
  "Many new housing projects follow a market-standard 12-month warranty for overall construction issues, with some developers extending coverage for selected components.",
];

const processItems = [
  "Warranty starts from the handover or transfer date, not the move-in date.",
  "Defects should be reported in writing within the warranty period.",
  "Valid defects are normally repaired by the developer at no cost to the owner.",
  "Once the warranty period ends, later repair costs usually become the homeowner's responsibility.",
];

const cautionItems = [
  "Warranty terms vary significantly by developer and by contract.",
  "Appliances, furniture, and normal wear-and-tear may have shorter coverage periods or no coverage at all.",
  "Enforcement depends heavily on keeping clear records, written notices, and photo evidence.",
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

export function HomeWarrantyDurationPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="px-4 py-6 lg:px-8">
          <img
            src={assetPath("images/page-banners/home-warranty-duration-thailand.png")}
            alt="What is the duration of the home warranty provided to homeowners"
            className="mx-auto h-auto w-full max-w-5xl"
          />
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl font-normal leading-tight text-brand-dark sm:text-5xl">
              What is the duration of the home warranty provided to homeowners?
            </h1>
            <p className="mt-6 text-lg font-semibold leading-8 text-brand-gray">
              In Thailand, the home warranty or developer defect liability period is generally
              shorter than many buyers expect, and the exact coverage depends on the type of defect
              and the signed contract.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            <DetailBlock title="Typical home warranty duration in Thailand" items={warrantyItems} />
            <DetailBlock title="How it usually works in practice" items={processItems} />
            <DetailBlock title="Important reality check" items={cautionItems} />

            <article className="border border-brand-line bg-neutral-50 p-6">
              <h2 className="text-xl font-black text-brand-dark">Bottom line</h2>
              <p className="mt-5 text-base leading-8 text-brand-gray">
                Most buyers should expect a 1-year defect period for standard construction issues
                and longer protection only for major structural defects. The contract, the
                handover date, and the quality of your written documentation are what matter most
                if you need the developer to make repairs.
              </p>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
