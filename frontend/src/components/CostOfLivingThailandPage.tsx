import { useEffect } from "react";
import { assetPath } from "../utils/assets";
import { Footer } from "./Footer";
import { Header } from "./Header";

const housingItems = [
  "Studio or 1-bedroom condo in Bangkok city center: 15,000 - 35,000 THB per month.",
  "Outside city center: 8,000 - 18,000 THB per month.",
  "Luxury condo or serviced apartment: 40,000 - 100,000+ THB per month.",
  "House in the suburbs: 15,000 - 50,000 THB per month.",
];

const foodItems = [
  "Street food meal: 50 - 120 THB.",
  "Local restaurant: 80 - 200 THB per dish.",
  "Mid-range restaurant: 300 - 800 THB per meal.",
  "Western restaurant: 400 - 1,500+ THB per meal.",
  "Monthly food budget for a moderate lifestyle: 8,000 - 20,000 THB.",
];

const transportItems = [
  "BTS or MRT in Bangkok: 16 - 60 THB per trip.",
  "Grab or taxi for a short trip: 60 - 200 THB.",
  "Motorbike taxi: 20 - 80 THB.",
  "Monthly transport budget: 1,500 - 5,000 THB.",
];

const utilityItems = [
  "Electricity: 1,500 - 4,000 THB per month, usually higher with regular AC use.",
  "Water: 100 - 300 THB per month.",
  "Internet: 500 - 1,000 THB per month.",
  "Mobile plan: 300 - 800 THB per month.",
];

const healthcareItems = [
  "Private clinic visit: 500 - 1,500 THB.",
  "Private hospital visit: 1,500 - 5,000+ THB.",
  "International health insurance: 3,000 - 15,000 THB per month, depending on age and coverage.",
];

const lifestyleItems = [
  "Budget lifestyle: 25,000 - 40,000 THB per month.",
  "Comfortable expat lifestyle: 40,000 - 80,000 THB per month.",
  "High-end lifestyle: 100,000 - 300,000+ THB per month.",
];

function DetailBlock({ items, title }: { items: string[]; title: string }) {
  return (
    <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
      <h2 className="text-xl font-black text-brand-dark">{title}</h2>
      <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 h-2 w-2 shrink-0 bg-brand-red" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function CostOfLivingThailandPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="px-4 py-6 lg:px-8">
          <img
            src={assetPath("images/page-banners/cost-of-living-thailand.png")}
            alt="Cost of Living in Thailand"
            className="mx-auto h-auto w-full max-w-5xl"
          />
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl font-normal leading-tight text-brand-dark sm:text-5xl">
              Cost of living in Thailand
            </h1>
            <p className="mt-6 text-lg font-semibold leading-8 text-brand-gray">
              The cost of living in Thailand is generally much lower than in many Western
              countries and usually lower than Singapore, but real monthly spending varies a lot by
              city and lifestyle, especially in Bangkok, Phuket, Chiang Mai, and Pattaya.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            <DetailBlock title="Housing" items={housingItems} />
            <DetailBlock title="Food & Dining" items={foodItems} />
            <DetailBlock title="Transport" items={transportItems} />
            <DetailBlock title="Utilities" items={utilityItems} />
            <DetailBlock title="Healthcare" items={healthcareItems} />
            <DetailBlock title="Lifestyle Summary" items={lifestyleItems} />

            <article className="border border-brand-line bg-neutral-50 p-6">
              <h2 className="text-xl font-black text-brand-dark">Key takeaway</h2>
              <p className="mt-5 text-base leading-8 text-brand-gray">
                Thailand can be very affordable, especially outside tourist-heavy areas or when you
                live more like a local. Imported goods, Western dining, and luxury condos can raise
                monthly costs quickly, so location and day-to-day habits make a big difference.
              </p>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
