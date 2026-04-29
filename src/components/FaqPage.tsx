import { Clock3 } from "lucide-react";
import { useEffect } from "react";
import { assetPath } from "../utils/assets";
import { safeHref } from "../utils/security";
import { Footer } from "./Footer";
import { Header } from "./Header";

type FaqCard = {
  title: string;
  minutes: string;
  image: string;
  href: string;
};

const buyingCards: FaqCard[] = [
  {
    title: "Financing for Foreigners",
    minutes: "7 min read",
    image: "images/page-banners/financing-for-foreigners.png",
    href: `${import.meta.env.BASE_URL}financing-for-foreigners`,
  },
  {
    title: "Own Property in Thailand",
    minutes: "9 min read",
    image: "images/page-banners/own-property-in-thailand.png",
    href: `${import.meta.env.BASE_URL}own-property-in-thailand`,
  },
];

const forSaleCards: FaqCard[] = [
  {
    title: "Distress Property",
    minutes: "8 min read",
    image: "images/page-banners/distressed-property.png",
    href: `${import.meta.env.BASE_URL}distress-property`,
  },
  {
    title: "Foreclosure",
    minutes: "6 min read",
    image: "images/page-banners/distressed-property.png",
    href: "#foreclosure",
  },
  {
    title: "Pre-Foreclosure",
    minutes: "6 min read",
    image: "images/page-banners/distressed-property.png",
    href: "#pre-foreclosure",
  },
  {
    title: "Fixer Upper",
    minutes: "5 min read",
    image: "images/page-banners/distressed-property.png",
    href: "#fixer-upper",
  },
  {
    title: "Urgent Sale",
    minutes: "5 min read",
    image: "images/page-banners/distressed-property.png",
    href: "#urgent-sale",
  },
];

const leaseToOwnCards: FaqCard[] = [
  {
    title: "Lease to Own",
    minutes: "6 min read",
    image: "images/page-banners/lease-to-own.png",
    href: `${import.meta.env.BASE_URL}lease-to-own`,
  },
];

const retirementCards: FaqCard[] = [
  {
    title: "Why Retire in Thailand",
    minutes: "8 min read",
    image: "images/page-banners/why-retire-in-thailand.png",
    href: `${import.meta.env.BASE_URL}why-retire-in-thailand`,
  },
  {
    title: "Why Seniorcare.net?",
    minutes: "7 min read",
    image: "images/page-banners/why-seniorcare-net-best-choice-thailand.png",
    href: `${import.meta.env.BASE_URL}why-seniorcare-net`,
  },
];

function FaqSection({ cards, title }: { cards: FaqCard[]; title: string }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h2 className="text-3xl font-black text-[#003c96]">{title}</h2>
        <a href={safeHref("#top")} className="text-base font-black text-[#0047d9] hover:text-brand-red">
          See all
        </a>
      </div>
      <div className="grid gap-7 lg:grid-cols-2">
        {cards.map((card) => (
          <a
            key={card.title}
            href={safeHref(card.href)}
            className="grid min-h-[150px] overflow-hidden bg-white shadow-[0_18px_45px_rgba(15,23,42,0.12)] transition hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(15,23,42,0.16)] sm:grid-cols-[48%_1fr]"
          >
            <img src={assetPath(card.image)} alt="" className="h-52 w-full object-cover sm:h-full" />
            <div className="flex flex-col justify-center px-7 py-6">
              <p className="inline-flex items-center gap-2 text-base text-slate-600">
                <Clock3 className="h-4 w-4" />
                {card.minutes}
              </p>
              <h3 className="mt-4 text-xl font-black leading-snug text-black">{card.title}</h3>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export function FaqPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <div id="top" className="min-h-screen bg-[#f8fafc] text-brand-dark">
      <Header />
      <main>
        <section className="mx-auto max-w-7xl px-4 pb-6 pt-14 lg:px-8">
          <h1 className="font-serif text-5xl font-normal leading-tight text-brand-dark sm:text-6xl">
            FAQ & Learning Center
          </h1>
          <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-brand-gray">
            Quick guides for buying, financing, lease-to-own options, senior living, and property
            ownership in Thailand.
          </p>
        </section>

        <FaqSection title="Lease to Own" cards={leaseToOwnCards} />
        <FaqSection title="For Sale" cards={forSaleCards} />
        <FaqSection title="Buying" cards={buyingCards} />
        <FaqSection title="Senior Living" cards={retirementCards} />
      </main>
      <Footer />
    </div>
  );
}
