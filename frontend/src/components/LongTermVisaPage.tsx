import { useEffect } from "react";
import { assetPath } from "../utils/assets";
import { Footer } from "./Footer";
import { Header } from "./Header";

const ltrSections = [
  {
    title: "Eligibility Requirements for the Thailand Long-Term Resident (LTR) Visa",
    intro:
      "Approved applicants are required to make a one-time payment of 50,000 THB for their 10-year visa. Eligibility for the LTR visa depends on the applicant's category, with specific criteria that must be met to qualify.",
    items: [],
  },
  {
    title: "Highly-Skilled Professional Eligibility Criteria",
    items: [
      "Must have a personal annual income of at least $80,000 over the past two years.",
      "If earning between $40,000 and $80,000 annually in the past two years, applicants must hold a Master's degree or higher in science, technology, or possess specialized expertise relevant to their job in Thailand.",
      "No minimum income requirement for professionals employed by Thai government agencies.",
      "Must be employed by a business in a targeted industry, a higher education institution, a research or specialized training institution, or a Thai government agency.",
      "Must have at least five years of work experience in a targeted industry, unless holding a PhD or higher in a relevant field or working for a Thai government agency.",
      "Must have health insurance with a minimum coverage of $50,000, social security benefits covering treatment in Thailand, or a bank deposit of at least $100,000.",
    ],
  },
  {
    title: "Work-from-Thailand Professional Eligibility Criteria",
    items: [
      "Must have a personal annual income of at least $80,000 over the past two years.",
      "If earning between $40,000 and $80,000 annually in the past two years, applicants must hold a Master's degree or higher, own intellectual property, or have received Series A funding.",
      "Must be employed by a publicly listed company on a stock exchange, or a private company that has been in operation for at least three years with a combined revenue of at least $150 million USD in the past three years.",
      "Must have at least five years of cumulative work experience in a relevant field within the past ten years.",
      "Must have health insurance with a minimum coverage of $50,000, social security benefits covering treatment in Thailand, or a bank deposit of at least $100,000.",
    ],
  },
  {
    title: "Wealthy Global Citizen Eligibility Criteria",
    items: [
      "Must have a minimum of $1 million USD in assets.",
      "Must have a personal annual income of at least $80,000 over the past two years.",
      "Must invest at least $500,000 in Thai government bonds, foreign direct investment, or Thai real estate.",
      "Must have health insurance with a minimum coverage of $50,000, social security benefits covering treatment in Thailand, or a bank deposit of at least $100,000.",
    ],
  },
  {
    title: "Wealthy Pensioner Eligibility Criteria",
    items: [
      "Must have a personal income of at least $80,000 USD at the time of application, or a minimum of $40,000 USD.",
      "Must invest at least $250,000 in Thai government bonds, foreign direct investment, or Thai real estate.",
    ],
  },
];

export function LongTermVisaPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="px-4 py-6 lg:px-8">
          <img
            src={assetPath("images/page-banners/long-term-visa.png")}
            alt="Long-term visa"
            className="mx-auto h-auto w-full max-w-5xl"
          />
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-brand-red">
              Thailand Immigration Guide
            </p>
            <h1 className="mt-4 font-serif text-4xl font-normal leading-tight text-brand-dark sm:text-5xl">
              Thai LTR Visa: A Convenient and Affordable Way to Live and Work in Thailand
            </h1>
            <p className="mt-6 text-lg font-semibold leading-8 text-brand-gray">
              The Thailand Long-Term Resident (LTR) Visa offers an easy and cost-effective way to
              stay in Thailand for an extended period while also allowing you to work if desired.
              Unlike other residency visas that require annual renewals and 90-day immigration
              reporting, the LTR visa only needs renewal every five years and requires reporting just
              once a year.
            </p>
            <p className="mt-5 text-base leading-8 text-brand-gray">
              With this visa, you can travel freely without the hassle of obtaining a re-entry permit
              and enjoy expedited immigration services at the airport.
            </p>
            <p className="mt-5 text-base leading-8 text-brand-gray">
              One of its key advantages is the ability to obtain a work permit and secure employment
              with a Thai company. Additionally, LTR visa holders are exempt from the 4:1
              Thai-to-foreigner employment ratio rule, making them more attractive to potential
              employers compared to other visa holders.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            {ltrSections.map((section) => (
              <article
                key={section.title}
                className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]"
              >
                <h2 className="text-xl font-black text-brand-dark">{section.title}</h2>
                {section.intro ? (
                  <p className="mt-4 text-base leading-7 text-brand-gray">{section.intro}</p>
                ) : null}
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
