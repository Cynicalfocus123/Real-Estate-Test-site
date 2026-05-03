import { useEffect } from "react";
import { assetPath } from "../utils/assets";
import { Footer } from "./Footer";
import { Header } from "./Header";

const limitationItems = [
  "Property type restriction: Loans are usually only available for condominiums, since foreigners cannot own land directly.",
  "High down payment: Typically, around 30-50% of the property value.",
  "Strict eligibility: Banks prefer applicants with a work permit, long-term visa, or stable income, local or overseas.",
  "Lower loan amounts: Loan-to-value ratios are usually lower, around 50-70%.",
  "Shorter loan terms: Often 15-20 years, shorter than for Thai buyers.",
  "Low approval rates: Many applications are rejected unless the borrower has strong financial credentials.",
];

const bankItems = ["Bangkok Bank", "UOB", "ICBC"];

const alternativeItems = [
  "Developer installment plans",
  "Rent-to-own schemes",
  "Financing from overseas banks",
];

export function MortgageFinancingForeignersPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="px-4 py-6 lg:px-8">
          <img
            src={assetPath("images/page-banners/mortgage-financing-foreigners-thailand.png")}
            alt="Is mortgage financing available to foreigners"
            className="mx-auto h-auto w-full max-w-5xl"
          />
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl font-normal leading-tight text-brand-dark sm:text-5xl">
              Is mortgage financing available to foreigners?
            </h1>
            <p className="mt-6 text-lg font-semibold leading-8 text-brand-gray">
              Yes, mortgage financing is available to foreigners in Thailand, but it is quite limited
              and comes with strict conditions.
            </p>
            <p className="mt-5 text-base leading-8 text-brand-gray">
              Foreigners can apply for mortgages from certain Thai or international banks, but
              approval is much harder compared to Thai nationals.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">Key limitations you should expect</h2>
              <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                {limitationItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 bg-brand-red" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">Which banks offer loans?</h2>
              <p className="mt-5 text-base leading-8 text-brand-gray">
                Only a few banks provide mortgages to foreigners, such as:
              </p>
              <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                {bankItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 bg-brand-red" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">Common reality</h2>
              <p className="mt-5 text-base leading-8 text-brand-gray">
                Because of these restrictions, many foreign buyers pay cash or use alternatives like:
              </p>
              <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                {alternativeItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 bg-brand-red" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="border border-brand-line bg-neutral-50 p-6">
              <h2 className="text-xl font-black text-brand-dark">Bottom line</h2>
              <p className="mt-5 text-base leading-8 text-brand-gray">
                Mortgage financing for foreigners in Thailand is possible, but it is not easy, not
                common, and usually limited to condos with strict financial requirements.
              </p>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
