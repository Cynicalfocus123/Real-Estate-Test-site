import { useEffect } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { assetPath } from "../utils/assets";

const retirementSections = [
  {
    title: "Retirement Visa Overview",
    items: [
      "Thailand retirement visa options are designed for foreign nationals who want to stay in Thailand long term after retirement.",
      "Applicants commonly prepare proof of age, passport validity, financial qualification, Thai address details, and health or insurance documents when required.",
      "Visa rules and document requirements can change, so applicants should confirm current requirements before submitting an application.",
    ],
  },
  {
    title: "Common Requirements",
    items: [
      "Applicants are generally expected to meet the minimum age requirement for retirement visa categories.",
      "Financial proof may include Thai bank deposits, monthly income, pension documentation, or a combination that meets the required threshold.",
      "A valid passport, application forms, photographs, and local address documents are usually required.",
    ],
  },
  {
    title: "Property and Long-Term Stay Planning",
    items: [
      "Many retirees combine visa planning with condominium purchases, long-term rentals, or leasehold homes.",
      "Housing choice should match lifestyle needs, medical access, transportation, budget, and long-term renewal plans.",
      "Foreign buyers should review ownership rules, lease terms, and transfer documentation before committing funds.",
    ],
  },
  {
    title: "Important Notes",
    items: [
      "Retirement visa holders may need to complete periodic reporting, renewal filings, or address notifications.",
      "Professional legal and immigration advice can help reduce delays, missing documents, and compliance issues.",
      "Buy Home For Less can help connect property search, long-term stay planning, and local service support.",
    ],
  },
];

export function RetirementVisaPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="px-4 py-6 lg:px-8">
          <img
            src={assetPath("images/page-banners/retirement-visa.png")}
            alt="Retirement visa"
            className="mx-auto h-auto w-full max-w-5xl"
          />
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-brand-red">
              Thailand Immigration Guide
            </p>
            <h1 className="mt-4 font-serif text-4xl font-normal leading-tight text-brand-dark sm:text-5xl">
              Retirement Visa
            </h1>
            <p className="mt-6 text-lg font-semibold leading-8 text-brand-gray">
              Thailand offers long-term stay options for foreign retirees who want a comfortable base
              for property ownership planning, rentals, healthcare access, and everyday living.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            {retirementSections.map((section) => (
              <article key={section.title} className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
                <h2 className="text-xl font-black text-brand-dark">{section.title}</h2>
                <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 bg-brand-red" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
