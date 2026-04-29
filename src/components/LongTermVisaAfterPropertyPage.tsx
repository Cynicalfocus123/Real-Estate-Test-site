import { useEffect } from "react";
import { assetPath } from "../utils/assets";
import { Footer } from "./Footer";
import { Header } from "./Header";

const visaOptionItems = [
  "Thailand Elite Visa (Privilege Visa): A long-term visa (5-20 years) obtained through a membership program. It is not tied to property ownership, but many property buyers choose it for convenience.",
  "Long-Term Resident (LTR) Visa: Designed for high-net-worth individuals, retirees, remote workers, and professionals. Property ownership can support your financial profile, but eligibility depends on income, assets, and investment criteria, not just buying real estate.",
  "Retirement Visa (Non-Immigrant O-A / O): Available for those aged 50+, requiring proof of funds or monthly income. Renting or owning property helps demonstrate accommodation but is not the qualifying factor.",
  "Business or Work Visa (Non-Immigrant B): Requires employment or running a business in Thailand. Property ownership is unrelated.",
];

export function LongTermVisaAfterPropertyPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="px-4 py-6 lg:px-8">
          <img
            src={assetPath("images/page-banners/long-term-visa-after-property-thailand.png")}
            alt="Can I obtain a long-term visa after purchasing or renting property in Thailand"
            className="mx-auto h-auto w-full max-w-5xl"
          />
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl font-normal leading-tight text-brand-dark sm:text-5xl">
              Can I obtain a long-term visa after renting property in Thailand?
            </h1>
            <p className="mt-6 text-lg font-semibold leading-8 text-brand-gray">
              Owning or renting property in Thailand does not automatically grant you a long-term
              visa. Property and immigration are treated separately under Thai law.
            </p>
            <p className="mt-5 text-base leading-8 text-brand-gray">
              Buying or leasing a condo or house can support your stay, for example as proof of
              address, but it does not provide residency rights on its own.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">
                Long-term visa options that may relate indirectly to property
              </h2>
              <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                {visaOptionItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 bg-brand-red" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">Important note</h2>
              <p className="mt-5 text-base leading-8 text-brand-gray">
                There have been discussions in Thailand about offering visas linked to property
                investment, but as of now, no standard program grants residency simply for purchasing
                real estate.
              </p>
            </article>

            <article className="border border-brand-line bg-neutral-50 p-6">
              <h2 className="text-xl font-black text-brand-dark">Bottom line</h2>
              <p className="mt-5 text-base leading-8 text-brand-gray">
                You can buy or rent property in Thailand, but you will still need to qualify for a
                visa through retirement, investment, employment, or special programs.
              </p>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
