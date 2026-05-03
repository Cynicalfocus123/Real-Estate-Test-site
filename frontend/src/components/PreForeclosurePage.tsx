import { useEffect } from "react";
import { assetPath } from "../utils/assets";
import { Footer } from "./Footer";
import { Header } from "./Header";

const stepItems = [
  "Identify Distressed Assets: Search listings on major bank platforms such as Bangkok Bank or SCB, monitor upcoming auction announcements, or work with agencies specializing in non-performing loans (NPLs), such as Buyhomeforless.com.",
  "Verify Title and Liens: Conduct a thorough review of the Chanote at the Land Department to confirm ownership status and uncover any existing mortgages, liens, or \"Kai Faak\" (redemption) arrangements. Professional firms like Buyhomeforless can manage this process to ensure there are no hidden liabilities.",
  "Negotiate with Owner or Bank: Engage the property owner or lender to structure a short sale that partially satisfies the outstanding debt and prevents foreclosure. Always secure written confirmation from the bank stating the agreed settlement amount.",
  "Execute the Sale Agreement: Sign a Sale and Purchase Agreement (S&P), typically prepared in both Thai and English.",
  "Payment and Transfer: Be prepared to place a deposit, often around 20% depending on the agreement, and complete the ownership transfer, usually within 30-45 days, especially for bank-related transactions.",
];

const considerationItems = [
  "Property Condition: These homes are sold as-is, and may still be occupied. A professional inspection is strongly recommended before committing to purchase.",
  "Foreign Ownership Rules: Foreign buyers cannot directly own land but may purchase condominiums within the 49% foreign ownership quota. Alternative legal structures may be required for land or villa purchases.",
  "Required Documentation: Buyers typically need a valid passport or Thai ID, house registration documents, and, if purchasing through a company, a recent company affidavit. Assistance may be required for foreign buyers setting up a compliant structure.",
  "Legal Support: Engaging a local legal team is essential to verify debts, manage contracts, and handle the title transfer process. They can also assist with eviction procedures if the property is still occupied.",
];

const comparisonItems = [
  "Price: Pre-foreclosures are usually below market value, while auctions may offer deeper discounts but with higher competition.",
  "Speed: Pre-foreclosure deals can close faster, whereas auction purchases may take 30-90 days or more to finalize title clearance.",
  "Inspection: Buyers can often inspect pre-foreclosure properties, while auction properties are typically not accessible beforehand.",
  "Financing: Pre-foreclosure purchases may allow bank financing, whereas auctions usually require full cash payment.",
];

export function PreForeclosurePage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="px-4 py-6 lg:px-8">
          <img
            src={assetPath("images/page-banners/pre-foreclosure.png")}
            alt="Pre-foreclosure"
            className="mx-auto h-auto w-full max-w-5xl"
          />
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl font-normal leading-tight text-brand-dark sm:text-5xl">
              Pre-Foreclosure
            </h1>
            <p className="mt-6 text-lg font-semibold leading-8 text-brand-gray">
              Buying pre-foreclosure properties, often referred to as short sales, in Thailand
              involves negotiating directly with distressed owners or their lenders before the
              property reaches public auction.
            </p>
            <p className="mt-5 text-base leading-8 text-brand-gray">
              This approach can offer attractive pricing, but it requires careful due diligence, a
              deposit typically around 1-5%, and verification of outstanding mortgages, liens, and
              the title deed (Chanote) at the Land Department. In most cases, buyers need cash or
              access to specialized financing.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">Steps to Purchase Pre-Foreclosure Properties in Thailand</h2>
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
              <h2 className="text-xl font-black text-brand-dark">Key Considerations and Tips</h2>
              <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                {considerationItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 bg-brand-red" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">Pre-Foreclosure vs. Auction: Key Differences</h2>
              <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                {comparisonItems.map((item) => (
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
