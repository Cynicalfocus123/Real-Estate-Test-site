import { useEffect } from "react";
import { assetPath } from "../utils/assets";
import { Footer } from "./Footer";
import { Header } from "./Header";

const buildMethodItems = [
  "Lease the land: You can secure a long-term lease, usually up to 30 years and often with renewal options, and build your home on that land. You may legally own the structure, even if you do not own the land.",
  "Thai company structure: Some foreigners use a Thai-registered company to hold the land. This must be set up properly and comply with Thai law. Nominee arrangements are illegal.",
  "Through a Thai spouse: If married to a Thai national, the land can be registered under your spouse's name. However, you will typically need to sign a declaration confirming the funds used are not yours.",
];

const considerationItems = [
  "Building permits: You must obtain construction permits from the local authority before building.",
  "Ownership clarity: Ensure contracts clearly separate ownership of the building and land rights, especially under a lease.",
  "Legal protection: Have a qualified lawyer draft or review all agreements, particularly lease terms, renewal clauses, and inheritance rights.",
  "Exit strategy: Consider what happens if you sell or leave Thailand. Transferring a house without land ownership can be more complex.",
];

export function CustomHomeNonThaiPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="px-4 py-6 lg:px-8">
          <img
            src={assetPath("images/page-banners/custom-home-non-thai-national.png")}
            alt="Am I allowed to build a custom home in Thailand as a non-Thai national"
            className="mx-auto h-auto w-full max-w-5xl"
          />
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl font-normal leading-tight text-brand-dark sm:text-5xl">
              Am I allowed to build a custom home in Thailand as a non-Thai national?
            </h1>
            <p className="mt-6 text-lg font-semibold leading-8 text-brand-gray">
              Yes, but not in the way you might expect. As a non-Thai national, you are allowed to
              build a custom home in Thailand, but you cannot own the land it sits on in your own
              name. That is the key limitation.
            </p>
          </div>

          <div className="mt-10 space-y-6">
            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">How foreigners typically build a home</h2>
              <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                {buildMethodItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 bg-brand-red" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="border border-brand-line bg-white p-6 shadow-[0_10px_30px_rgba(23,23,23,0.05)]">
              <h2 className="text-xl font-black text-brand-dark">Important considerations before building</h2>
              <ul className="mt-5 space-y-4 text-base leading-7 text-brand-gray">
                {considerationItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 bg-brand-red" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="border border-brand-line bg-neutral-50 p-6">
              <h2 className="text-xl font-black text-brand-dark">Bottom line</h2>
              <p className="mt-5 text-base leading-8 text-brand-gray">
                You can build and own a house structure in Thailand, but you will need a legally
                sound arrangement for the land, most commonly a long-term lease.
              </p>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
