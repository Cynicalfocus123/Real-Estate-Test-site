import { useEffect } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { assetPath } from "../utils/assets";

const ownershipNotes = [
  "Foreign buyers can legally own condominium units in Thailand when the foreign ownership quota in a building is available.",
  "Foreigners generally cannot own Thai land directly, but long-term lease structures are commonly used for houses and villas.",
  "Due diligence should confirm title deed type, seller authority, zoning, access roads, building permits, and existing encumbrances.",
  "Lease, company, usufruct, superficies, and other structures should be reviewed by a qualified Thai legal professional before signing.",
];

const legalChecklist = [
  "Verify title deed and registered owner",
  "Review condominium foreign quota or lease terms",
  "Check taxes, transfer fees, and maintenance obligations",
  "Confirm funds transfer documentation for condominium purchases",
  "Use escrow or controlled payment milestones where available",
  "Translate and review all Thai-language contracts before signing",
];

export function RealEstateLawsPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="relative min-h-[460px] overflow-hidden bg-brand-dark">
          <img
            src={assetPath("images/page-banners/real-estate-laws-for-foreigner.png")}
            alt="Real estate laws for foreigner"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/35" />
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-brand-red">
              Thailand Property Guide
            </p>
            <h1 className="mt-4 font-serif text-4xl font-normal leading-tight text-brand-dark sm:text-5xl">
              Real Estate Laws for Foreigner
            </h1>
            <p className="mt-6 text-lg font-semibold leading-8 text-brand-gray">
              Thailand offers clear paths for foreign buyers, renters, and long-term residents, but the
              right structure depends on the property type, location, ownership goal, and visa plan.
            </p>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <article className="space-y-6 text-base leading-8 text-brand-gray">
              <p>
                Foreign nationals most commonly purchase condominium units, lease landed homes, or use
                carefully reviewed legal structures for villas and long-term occupancy. Each option has
                different registration steps, payment documentation, and risk controls.
              </p>
              <p>
                Before placing a deposit, buyers should understand what can be owned directly, what must
                be leased, and which documents must be registered with the Land Department. Contract
                review is important because marketing materials and legal documents may not always match.
              </p>
              <p>
                This page is a practical overview for planning. Final decisions should be reviewed with
                licensed legal counsel in Thailand before funds are transferred or contracts are signed.
              </p>
            </article>

            <aside className="border border-brand-line bg-neutral-50 p-6">
              <h2 className="text-sm font-black uppercase tracking-wide text-brand-dark">
                Common Legal Checks
              </h2>
              <ul className="mt-5 space-y-3 text-sm font-semibold text-brand-gray">
                {legalChecklist.map((item) => (
                  <li key={item} className="border-b border-brand-line pb-3 last:border-b-0 last:pb-0">
                    {item}
                  </li>
                ))}
              </ul>
            </aside>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {ownershipNotes.map((note) => (
              <div key={note} className="border border-brand-line p-6">
                <p className="text-base font-semibold leading-7 text-brand-dark">{note}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
