import { useEffect } from "react";
import { assetPath } from "../utils/assets";
import { Footer } from "./Footer";
import { Header } from "./Header";

const saleTypeItems = [
  "Fire Sale (Owner-Driven): The seller has equity but needs quick liquidity. This is generally a straightforward transaction, with full ownership in place and the ability to transfer the Chanote (title deed) immediately at the Land Department.",
  "Short Sale (Bank-Involved): The outstanding loan exceeds the property's market value. The bank must approve the discounted sale, which can slow the process despite the urgent label.",
  "Bank Foreclosure (REO): The property has been repossessed by the bank after loan default. These are often sold via auction at discounted prices and typically require full cash payment.",
];

const characteristicItems = [
  "Discounted Pricing: The main incentive is a lower-than-market price to secure a fast sale.",
  "Fast Closing: Transactions are usually completed within one to two weeks.",
  "Highly Motivated Sellers: Owners are keen to sell quickly to resolve financial issues or release capital.",
  "Desirable Locations: Many urgent listings are found in sought-after areas such as Sukhumvit in Bangkok, Phuket, and Pattaya.",
];

const buyerTipItems = [
  "Cash Advantage: Having funds readily available allows for a quick transfer of the Chanote at the Land Department.",
  "Conduct Due Diligence: Always check for outstanding debts, liens, or legal complications.",
  "Work with Professionals: Experienced real estate agents can help identify genuine urgent sales and manage the fast transaction process.",
  "Verify Title Deed: Ensure the property has a Chanote (full ownership title), especially for houses or villas, to avoid legal complications.",
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
              An urgent property sale in Thailand typically refers to a residential listing that
              must be sold quickly, often within 7 to 14 days, because the owner needs immediate
              cash due to financial pressure, business difficulties, or relocation.
            </p>
            <p className="mt-5 text-base leading-8 text-brand-gray">
              These properties are usually priced well below market value, sometimes reduced by
              millions of Baht to attract fast, ready buyers.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">Types of Urgent Sales</h2>
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
              <h2 className="text-xl font-black text-brand-dark">Common Characteristics</h2>
              <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                {characteristicItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 bg-brand-red" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">Tips for Buyers</h2>
              <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                {buyerTipItems.map((item) => (
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
