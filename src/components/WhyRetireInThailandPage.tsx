import { useEffect } from "react";
import { assetPath } from "../utils/assets";
import { Footer } from "./Footer";
import { Header } from "./Header";

const retirementReasons = [
  {
    title: "Low Cost of Living",
    points: [
      "Thailand is known for its affordability, making it possible to stretch retirement savings further.",
      "Housing, food, transportation, and healthcare are significantly less expensive than in many Western countries.",
      "This allows retirees to enjoy a comfortable lifestyle without depleting their savings quickly.",
    ],
  },
  {
    title: "Quality Healthcare",
    points: [
      "Thailand boasts a well-developed healthcare system offering high-quality medical services at a fraction of the cost of Western countries.",
      "This is a major draw for retirees seeking peace of mind regarding their health.",
    ],
  },
  {
    title: "Warm and Welcoming Culture",
    points: [
      "Thais are known for their friendly and outgoing nature, making it easy for expats to make connections and feel at home.",
      "A large expat community further fosters a sense of belonging and support.",
    ],
  },
  {
    title: "Natural Beauty and Diverse Landscapes",
    points: [
      "Thailand offers a wide range of natural attractions, from stunning beaches and islands to lush jungles and mountains.",
      "This provides opportunities for retirees to explore, relax, and enjoy the outdoors.",
    ],
  },
  {
    title: "Delicious and Diverse Cuisine",
    points: [
      "Thai cuisine is renowned for its flavorful and healthy dishes, offering a wide variety of options for retirees to enjoy.",
      "Fresh produce and high-quality ingredients are readily available, contributing to a healthier lifestyle.",
    ],
  },
  {
    title: "Ideal Climate",
    points: [
      "The year-round warm and sunny climate is a major draw for retirees seeking to escape cold winters.",
      "This allows for outdoor activities and a more relaxed lifestyle.",
    ],
  },
  {
    title: "Affordable Leisure Activities",
    points: [
      "Thailand offers a wide range of affordable leisure activities, such as exploring temples, visiting markets, and taking day trips to nearby attractions.",
      "This allows retirees to stay active and engaged in their retirement years.",
    ],
  },
  {
    title: "Long-term visa available for foreign retirees",
    points: [
      "For long-term residency in Thailand for retirees, the Long-Term Resident (LTR) Visa and the Retirement Visa are two primary options.",
      "The LTR Visa offers a 10-year validity with the option to extend for another five years.",
      "The Retirement Visa is typically valid for one year but can be renewed annually.",
    ],
  },
];

export function WhyRetireInThailandPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="px-4 py-6 lg:px-8">
          <img
            src={assetPath("images/page-banners/why-retire-in-thailand.png")}
            alt="Why retire in Thailand"
            className="mx-auto h-auto w-full max-w-5xl"
          />
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-brand-red">
              Senior Nursing Home
            </p>
            <h1 className="mt-4 font-serif text-4xl font-normal leading-tight text-brand-dark sm:text-5xl">
              Why Retire in Thailand
            </h1>
            <p className="mt-6 text-lg font-semibold leading-8 text-brand-gray">
              Thailand attracts retirees with its low cost of living, access to quality healthcare,
              and a warm, welcoming culture, allowing them to enjoy a comfortable and fulfilling
              retirement on a smaller budget.
            </p>
            <p className="mt-5 text-base leading-8 text-brand-gray">
              Here is a more detailed look at why Thailand is a popular retirement destination.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {retirementReasons.map((reason, index) => (
              <article
                key={reason.title}
                className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]"
              >
                <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-red">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-3 text-xl font-black text-brand-dark">{reason.title}</h2>
                <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                  {reason.points.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 bg-brand-red" />
                      <span>{point}</span>
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
