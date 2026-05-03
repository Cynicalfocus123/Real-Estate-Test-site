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

const leadingNursingReasons = [
  {
    title: "Affordable Cost of Living",
    text: "Thailand offers excellent value for money. Daily expenses such as housing, utilities, transportation, and food are significantly lower than in many Western countries, allowing retirees to maintain a comfortable lifestyle while maximizing their retirement savings.",
  },
  {
    title: "Excellent Healthcare Services",
    text: "Thailand is home to world-class hospitals and clinics, many of which cater specifically to the elderly. The combination of advanced medical technology and affordable treatment options makes it a global hub for healthcare and medical tourism.",
  },
  {
    title: "Expanding Retirement Communities",
    text: "The country is seeing rapid development in senior living infrastructure, including coastal retreats and city-based residences designed for older adults. These communities often offer specialized services, wellness programs, social activities, and on-site medical support.",
  },
  {
    title: "Tropical Climate and Scenic Beauty",
    text: "From picturesque beaches to lush mountains and historic cities, Thailand's natural beauty and warm weather make it an ideal setting for a relaxing and enjoyable retirement.",
  },
  {
    title: "Long-Term Visa Options",
    text: "Thailand offers various visa programs for retirees, including the popular retirement visa (Non-Immigrant O-A and O-X), allowing extended stays with relative ease for those who meet the requirements.",
  },
  {
    title: "Warm and Welcoming Culture",
    text: "Thai people are known for their friendliness and hospitality, which helps foreign retirees feel at home. The opportunity to engage with the local culture and community adds depth and meaning to everyday life.",
  },
  {
    title: "Wellness and Active Living Focus",
    text: "Retirement in Thailand often includes access to fitness classes, yoga, spa treatments, nature excursions, and group activities, promoting both physical and mental well-being.",
  },
  {
    title: "Government Support and Senior-Focused Initiatives",
    text: "Recognizing the needs of an aging population, the Thai government continues to invest in healthcare services and infrastructure that support senior living, helping retirees feel secure and well cared for.",
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
            <h1 className="font-serif text-4xl font-normal leading-tight text-brand-dark sm:text-5xl">
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
                <ul className="mt-3 space-y-4 text-base leading-7 text-brand-gray">
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

        <section className="mx-auto max-w-5xl border-t border-brand-line px-4 py-14 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="font-serif text-4xl font-normal leading-tight text-brand-dark sm:text-5xl">
              Why Thailand Is the Leading Nursing Home Facility in Asia
            </h2>
          </div>

          <img
            src={assetPath("images/page-banners/why-thailand-leading-nursing-home-facility-asia.png")}
            alt="Why Thailand is the leading nursing home facility in Asia"
            className="mt-8 h-auto w-full"
          />

          <div className="mt-10 max-w-3xl">
            <h3 className="text-2xl font-black text-brand-dark">
              Why Thailand Is a Top Choice for Senior Living in Asia
            </h3>
            <p className="mt-5 text-lg font-semibold leading-8 text-brand-gray">
              Thailand has become one of Asia's most attractive destinations for senior living, thanks
              to its affordable cost of living, high-quality healthcare, and a growing number of
              retirement-friendly communities. With a warm tropical climate, diverse natural
              landscapes, and a rich cultural heritage, Thailand offers retirees a vibrant and
              fulfilling lifestyle.
            </p>
            <p className="mt-5 text-base leading-8 text-brand-gray">
              The availability of long-term visas and an expanding range of senior-focused services
              further enhance its appeal to both local and international retirees.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {leadingNursingReasons.map((reason, index) => (
              <article
                key={reason.title}
                className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]"
              >
                <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-red">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-xl font-black text-brand-dark">{reason.title}</h3>
                <p className="mt-5 text-base leading-7 text-brand-gray">{reason.text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
