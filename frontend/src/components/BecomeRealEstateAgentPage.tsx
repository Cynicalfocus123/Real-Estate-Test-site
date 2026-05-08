import { useEffect } from "react";
import { assetPath } from "../utils/assets";
import { Footer } from "./Footer";
import { Header } from "./Header";

const joinReasons = [
  "Gain access to a global network of qualified buyers and professional sales agents.",
  "Earn high commission rates with fast and reliable payouts.",
  "Receive exclusive access to our extensive customer lead database.",
  "Build and manage your own sales territory with flexibility and independence.",
  "Connect with our international network of experienced real estate professionals.",
  "Access thousands of properties available for sale across multiple markets worldwide.",
  "Receive full support with legal documentation and trusted escrow coordination services.",
  "Benefit from our strong relationships with leading financial institutions to help clients secure mortgage approvals.",
  "Participate in professional real estate training and business development programs.",
  "Utilize our advanced mobile application designed to increase productivity and boost sales performance.",
];

export function BecomeRealEstateAgentPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="px-4 py-6 lg:px-8">
          <img
            src={assetPath("images/page-banners/become-real-estate-agent.png")}
            alt="Become a real estate partner with us"
            className="mx-auto h-auto w-full max-w-5xl rounded-[18px] object-cover"
          />
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="font-serif text-4xl font-normal leading-tight text-brand-dark sm:text-5xl">
              Become a Real Estate Partner With Us
            </h1>
          </div>

          <article className="mt-10 border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)] sm:p-8">
            <h2 className="text-2xl font-black text-brand-dark">Why Join Our Team</h2>
            <ol className="mt-6 space-y-4 text-base leading-8 text-brand-gray">
              {joinReasons.map((reason, index) => (
                <li key={reason} className="flex gap-3">
                  <span className="min-w-6 font-black text-brand-red">{index + 1}.</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ol>
          </article>
        </section>
      </main>
      <Footer />
    </div>
  );
}
