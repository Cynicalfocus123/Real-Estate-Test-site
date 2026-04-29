import { useEffect } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { assetPath } from "../utils/assets";

const retirementSections = [
  {
    title: "Eligibility and Requirements",
    items: [
      "Age: You must be 50 years of age or older.",
      "Financial Requirements: You must meet one of the following: maintain a deposit of at least 800,000 Thai Baht (THB) in a Thai bank account for at least 2 months before applying; demonstrate a monthly income of at least 65,000 THB; or show a combination of bank deposit and yearly income totaling 800,000 THB.",
      "Health Insurance: You need to provide proof of health insurance with coverage that meets the Thai government's criteria, including inpatient coverage of at least 400,000 THB and outpatient coverage of at least 40,000 THB.",
      "Other Requirements: A valid passport, a police clearance certificate from your home country, and proof of residence in Thailand, such as a lease agreement.",
      "Visa Type: The retirement visa is known as a Non-Immigrant OA (Long Stay) Visa.",
    ],
  },
  {
    title: "Important Notes",
    items: [
      "Employment of any kind is strictly prohibited while holding this visa.",
      "The visa is typically valid for one year and can be renewed annually, provided you continue to meet the requirements.",
      "You can apply for the visa in Thailand or at a Royal Thai Embassy or Consulate outside of Thailand.",
      "The process for applying for the visa can be complex, so it's advisable to seek guidance from legal Planets.",
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
              To obtain a retirement visa in Thailand, you must be at least 50 years old and meet
              specific financial requirements, including a minimum deposit in a Thai bank account or a
              regular monthly income, along with proof of health insurance.
            </p>
            <p className="mt-5 text-base font-semibold leading-7 text-brand-dark">
              Here's a more detailed breakdown:
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
