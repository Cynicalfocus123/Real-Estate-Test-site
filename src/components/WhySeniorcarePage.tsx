import { useEffect } from "react";
import { assetPath } from "../utils/assets";
import { Footer } from "./Footer";
import { Header } from "./Header";

const seniorcareReasons = [
  "Modern, Spotless Facilities Surrounded by Nature - A clean, peaceful environment designed to promote well-being.",
  "Fully Accessible Design - Handicap-friendly fixtures throughout every room and common area.",
  "Multilingual, Experienced Caregivers - Staff fluent in English, Chinese, Russian, and Spanish ensure smooth communication and quality care.",
  "Certified and Screened Professionals - All caregivers are certified nurses who have passed rigorous training and background checks.",
  "Smart Technology Integration - High-end tech ensures maximum convenience, safety, and care efficiency.",
  "24/7 Security - Constant monitoring via CCTV and on-site security personnel for total peace of mind.",
  "On-Site Medical and Emergency Support - A fully staffed nursing station is available around the clock.",
  "Private Rooms - Each resident enjoys a private room with a single bed, offering a true sense of home.",
  "Personalized Meals - All meals are tailored to individual dietary needs under close supervision.",
  "On-Site Nutritionist - A professional nutritionist ensures each resident's health and dietary balance.",
  "In-House Physical Therapy - Full access to professional physical therapy for rehabilitation and mobility support.",
  "Beauty Salon and Mini-Mart - Added convenience and comfort without leaving the facility.",
  "Home-Like Atmosphere - Designed to feel warm and inviting, not institutional.",
  "Affordable, High-Quality Care - Top-tier service at a fraction of the cost compared to Western countries.",
  "Engaging Community Activities - A wide range of daily programs to encourage socialization and joy.",
  "Limited Occupancy - A low resident-to-staff ratio ensures personalized attention.",
  "In-House Chef and Kitchen - Fresh, delicious meals are prepared daily by professional chefs.",
  "Dedicated Housekeeping - Each resident receives individualized housekeeping services.",
  "Guest Accommodation Available - Private guest homes are located nearby for visiting family members.",
];

export function WhySeniorcarePage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="px-4 py-6 lg:px-8">
          <img
            src={assetPath("images/page-banners/why-seniorcare-net-best-choice-thailand.png")}
            alt="Why Seniorcare.net is the best choice in Thailand"
            className="mx-auto h-auto w-full max-w-5xl"
          />
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl font-normal leading-tight text-brand-dark sm:text-5xl">
              Why Seniorcare.net?
            </h1>
            <p className="mt-6 text-lg font-semibold leading-8 text-brand-gray">
              Senior Care stands out as Thailand's premier nursing home facility, offering a perfect
              balance of comfort, safety, and personalized care.
            </p>
            <p className="mt-5 text-base leading-8 text-brand-gray">
              Here is what makes it the ideal choice for you or your loved ones.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {seniorcareReasons.map((reason, index) => (
              <article
                key={reason}
                className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]"
              >
                <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-red">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-3 text-base font-semibold leading-7 text-brand-gray">{reason}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
