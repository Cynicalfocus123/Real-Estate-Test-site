import { useEffect } from "react";
import { assetPath } from "../utils/assets";
import { Footer } from "./Footer";
import { Header } from "./Header";

const featureItems = [
  "Structure: A lease-to-purchase agreement fixes the property price at the outset. If the buyer proceeds with the purchase at the end of the term, the initial deposit and part of the monthly payments are deducted from the agreed price. If not, the deposit and premium payments are typically forfeited.",
  "Deposit/Option Fee: Approximately 20-30% of the property value.",
  "Duration: Usually 2-5 years.",
  "Monthly Payments: Slightly above market rent, with a portion allocated toward the purchase.",
  "Ideal For: This option suits expatriates who face challenges with large upfront payments or financing restrictions, as well as sellers seeking committed buyers in a competitive market.",
];

const propertyTypeItems = [
  "Condominiums: Foreign buyers can directly own leasehold condos, provided the 49% foreign ownership quota has not been exceeded.",
  "Villas/Land: Foreigners cannot directly own land. Lease-to-own structures for villas are often set up through long-term leases, typically 30 years, with a purchase option, or via a Thai company structure.",
];

const considerationItems = [
  "Legal Framework: These agreements are legally recognized in Thailand and are often structured similarly to hire-purchase contracts, where ownership transfers only after full payment.",
  "Risk Management: It is essential to engage a qualified lawyer to review the contract. Key elements to verify include the fixed purchase price, how much of each payment is credited, and the obligations of both buyer and seller.",
];

export function LeaseToOwnPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="px-4 py-6 lg:px-8">
          <img
            src={assetPath("images/page-banners/lease-to-own.png")}
            alt="Lease to own"
            className="mx-auto h-auto w-full max-w-5xl"
          />
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl font-normal leading-tight text-brand-dark sm:text-5xl">
              Lease to Own
            </h1>
            <p className="mt-6 text-lg font-semibold leading-8 text-brand-gray">
              Lease-to-own arrangements in Thailand let buyers occupy a property while gradually
              building equity toward eventual ownership, typically over a 2-5 year period.
            </p>
            <p className="mt-5 text-base leading-8 text-brand-gray">
              Buyers usually make an upfront payment of around 20-30% and pay a slightly higher
              monthly rent, with a portion credited toward the final purchase price. This model is
              especially common in markets like Bangkok, Phuket, and Pattaya, offering added
              flexibility.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">Key Features of Lease-to-Own in Thailand</h2>
              <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                {featureItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 bg-brand-red" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">Eligible Property Types</h2>
              <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                {propertyTypeItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 bg-brand-red" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">Important Considerations</h2>
              <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                {considerationItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 bg-brand-red" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="mx-auto max-w-5xl border-t border-brand-line px-4 py-14 lg:px-8">
          <img
            src={assetPath("images/page-banners/what-is-lease-to-own.png")}
            alt="What is lease to own"
            className="h-auto w-full"
          />

          <div className="mt-10 max-w-3xl">
            <h2 className="font-serif text-4xl font-normal leading-tight text-brand-dark sm:text-5xl">
              What Is Lease to Own?
            </h2>
            <p className="mt-6 text-lg font-semibold leading-8 text-brand-gray">
              Lease-to-own is an arrangement where a tenant rents a property with the option to
              purchase it later. During the lease period, part of the rent, and often an upfront fee,
              goes toward the future purchase price.
            </p>
            <p className="mt-5 text-base leading-8 text-brand-gray">
              At the end of the agreed term, the tenant can choose to buy the property at a
              pre-agreed price or walk away, usually forfeiting any extra payments made toward the
              purchase.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
