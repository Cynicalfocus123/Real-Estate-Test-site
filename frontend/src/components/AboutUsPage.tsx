import { useEffect } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";

const aboutParagraphs = [
  "Buyhomeforless.com operates as an affiliate of Mstar (Asia) Co., Ltd, an established real estate developer and brokerage firm in Thailand since 2015. Over the years, we have successfully facilitated the sale of more than 15,000 properties to both Thai residents and international clients.",
  "We specialize in high-value opportunities within the distressed property market, including bank-owned assets, foreclosures, pre-foreclosures, and fixer-upper properties offered at significantly below market value. Our expertise allows clients to access investment opportunities that are often unavailable through conventional channels.",
  "Understanding the unique challenges faced by international buyers, we provide tailored mortgage solutions for foreign investors and ensure every transaction is securely managed through a structured escrow process, protecting all parties involved. We collaborate with licensed real estate professionals worldwide to deliver seamless, transparent, and worry-free closings.",
  "Every property we offer undergoes strict quality and safety checks prior to transfer, and all legal documentation is handled with precision and professionalism to ensure full compliance and peace of mind.",
  "When it comes to safeguarding your investment and securing the right property, choosing the right partner is critical. Buyhomeforless.com is committed to delivering not just properties, but certainty, value, and results.",
];

export function AboutUsPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="mx-auto max-w-5xl px-4 py-16 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-brand-red">
              Company Profile
            </p>
            <h1 className="mt-4 font-serif text-4xl font-normal leading-tight text-brand-dark sm:text-5xl">
              About Us
            </h1>
            <p className="mt-6 text-lg font-semibold leading-8 text-brand-gray">
              Buyhomeforless.com connects Thai and international buyers with secure, high-value real
              estate opportunities across Thailand.
            </p>
          </div>

          <div className="mt-10 max-w-4xl">
            <div className="text-base leading-8 text-brand-gray">
              {aboutParagraphs.map((paragraph) => (
                <p key={paragraph} className="mb-6 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
