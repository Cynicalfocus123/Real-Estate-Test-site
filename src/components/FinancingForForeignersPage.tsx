import { useEffect } from "react";
import { assetPath } from "../utils/assets";
import { Footer } from "./Footer";
import { Header } from "./Header";

const financingSections = [
  {
    title: "Traditional Financing in Thailand",
    paragraphs: [
      "Foreign buyers in Thailand can obtain mortgage financing, mainly for freehold condominiums, typically requiring a 30-50% down payment. Loan approvals are generally offered by institutions such as UOB, MBK Guarantee, Bangkok Bank, and TISCO Bank, which cater to foreign borrowers with stable income profiles.",
      "Eligibility criteria usually include at least two years of continuous employment, a steady income of no less than three times the monthly repayment amount, and an age limit of approximately 55-60 years by the end of the loan term.",
    ],
    items: [],
  },
  {
    title: "Top Financing Options for Foreigners",
    paragraphs: [],
    items: [
      "MBK Guarantee: Known for being very foreigner-friendly, offering loans without requiring a work permit or permanent residence, often focusing on condo purchases.",
      "UOB International Home Loan: A popular choice for non-residents, particularly citizens from Singapore or Malaysia, which allows foreign income and uses SBLC (Standby Letter of Credit) to facilitate lending.",
      "Bangkok Bank: Offers property loans to foreigners, especially those with work permits.",
      "Tisco Bank: Offers lending for condominiums up to 70% of market value, with loans available for foreigners.",
      "Developer Financing: Some developers offer in-house, flexible financing for their projects, bypassing traditional bank strictures, though sometimes at higher interest rates.",
    ],
  },
  {
    title: "Key Approval Requirements",
    paragraphs: [],
    items: [
      "Down Payment: Prepare for a 30% to 50% down payment.",
      "Condo Title: The property must be a freehold condominium unit that falls within the 49% foreign ownership quota.",
      "Income Requirement: Monthly income must be 3 times higher than the installment repayment.",
      "Age and Tenure: The applicant's age plus loan term should not exceed 60-65 years.",
      "Documentation: Passport, visa, work permit (if available), work certificate, and 3-6 months of bank statements.",
    ],
  },
  {
    title: "Common Challenges",
    paragraphs: [],
    items: [
      "High Interest Rates: Loans for foreigners often come with higher interest rates than those for Thai citizens.",
      "Short Terms: Loan repayment terms are often shorter, usually around 10-15 years, rather than the 30-year terms for locals.",
      "No Land Ownership: Loans to buy land or landed property (houses/villas) are generally not available unless applying jointly with a Thai spouse.",
    ],
  },
];

export function FinancingForForeignersPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="px-4 py-6 lg:px-8">
          <img
            src={assetPath("images/page-banners/financing-for-foreigners.png")}
            alt="Financing for foreigners"
            className="mx-auto h-auto w-full max-w-5xl"
          />
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-brand-red">
              Thailand Financing Guide
            </p>
            <h1 className="mt-4 font-serif text-4xl font-normal leading-tight text-brand-dark sm:text-5xl">
              Financing for Foreigners
            </h1>
            <p className="mt-6 text-lg font-semibold leading-8 text-brand-gray">
              What sets Buyhomeforless apart is our access to financing from over 80 financial
              institutions worldwide. We partner with lenders who understand the needs of
              expatriates and foreign buyers relocating to Thailand, and we can even coordinate with
              your home-country bank to support your approval.
            </p>
            <p className="mt-5 text-base leading-8 text-brand-gray">
              Having helped thousands of foreigners secure homes in Thailand, we offer competitive
              interest rates, extended repayment terms, and more flexible qualification criteria. For
              eligible clients, we also provide in-house mortgage solutions.
            </p>
            <p className="mt-5 text-base leading-8 text-brand-gray">
              Even with a lower down payment, we can assist you in securing a property, whether it's
              a villa, condominium, or commercial asset.
            </p>
            <p className="mt-5 text-base leading-8 text-brand-gray">
              With Buyhomeforless, you can expect a fast approval process and highly competitive
              financing options. We are confident in our ability to close escrow and have you settled
              into your new home in as little as 30 days.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            {financingSections.map((section) => (
              <article
                key={section.title}
                className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]"
              >
                <h2 className="text-xl font-black text-brand-dark">{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-4 text-base leading-7 text-brand-gray">
                    {paragraph}
                  </p>
                ))}
                {section.items.length > 0 ? (
                  <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 shrink-0 bg-brand-red" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
