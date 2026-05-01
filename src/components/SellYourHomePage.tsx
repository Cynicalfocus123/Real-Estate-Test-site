import { ArrowDownRight, CheckCircle2 } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { assetPath } from "../utils/assets";
import { cleanNumericText, cleanSearchText, safeHref } from "../utils/security";
import { Footer } from "./Footer";
import { Header } from "./Header";

type SellLeadForm = {
  fullName: string;
  email: string;
  phone: string;
  province: string;
  propertyType: string;
  timeline: string;
  details: string;
};

const defaultSellLeadForm: SellLeadForm = {
  fullName: "",
  email: "",
  phone: "",
  province: "",
  propertyType: "",
  timeline: "",
  details: "",
};

function isValidEmail(value: string) {
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(value.trim());
}

export function SellYourHomePage() {
  const [form, setForm] = useState<SellLeadForm>(defaultSellLeadForm);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  function updateField(field: keyof SellLeadForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.fullName || !form.email || !form.phone || !form.province || !form.propertyType) {
      setSubmitError("Please complete all required fields.");
      setSubmitted(false);
      return;
    }

    if (!isValidEmail(form.email)) {
      setSubmitError("Please enter a valid email address.");
      setSubmitted(false);
      return;
    }

    setSubmitError("");
    setSubmitted(true);
    setForm(defaultSellLeadForm);
  }

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-14">
          <div className="grid gap-6 rounded-[28px] bg-[#f4f5f6] p-4 sm:p-5 lg:grid-cols-[1.06fr_1.2fr] lg:items-center lg:gap-10 lg:rounded-[32px] lg:p-10">
            <div className="relative order-1 overflow-hidden rounded-[24px] lg:order-2 lg:rounded-[30px]">
              <img
                src={assetPath("images/page-banners/sell-your-home-thailand-house.png")}
                alt="Sell your home"
                className="h-[250px] w-full object-cover sm:h-[320px] lg:h-[430px]"
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.25)_100%)]">
                <p className="w-full bg-black/45 px-4 py-3 text-center text-2xl font-black text-white backdrop-blur-[1px] sm:text-3xl">
                  sell your home?
                </p>
              </div>
            </div>

            <div className="order-2 px-1 pb-1 pt-2 lg:order-1 lg:px-0 lg:pb-0 lg:pt-0">
              <h1 className="max-w-xl text-4xl font-black leading-tight text-black sm:text-5xl">
                Sell your home with confidence
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-[#111827] sm:text-xl sm:leading-9">
                We give you multiple options to sell your home with the flexibility to choose what
                works best for your unique situation, timeline and goals.
              </p>
              <a
                href={safeHref("#sell-form")}
                className="mt-7 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-[#0f4cd7] px-7 py-4 text-xl font-black text-white transition hover:bg-[#0c3faf] sm:w-auto sm:justify-start sm:text-2xl"
              >
                <ArrowDownRight className="h-7 w-7" />
                lets start
              </a>
            </div>
          </div>
        </section>

        <section id="sell-form" className="mx-auto max-w-5xl px-4 pb-20 pt-5 lg:px-8">
          <div className="rounded-[28px] border border-brand-line bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.07)] sm:p-8">
            <h2 className="text-3xl font-black text-brand-dark sm:text-4xl">Submit your property</h2>
            <p className="mt-3 text-base leading-7 text-brand-gray">
              Tell us about your property and our team will contact you with your best selling options.
            </p>

            {submitted ? (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#cfe8d5] bg-[#f4fff7] px-4 py-3 text-sm font-semibold text-[#14532d]">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                Received. Our team will reach out soon.
              </div>
            ) : null}

            {submitError ? (
              <div className="mt-6 rounded-2xl border border-[#f8c4c4] bg-[#fff4f4] px-4 py-3 text-sm font-semibold text-[#991b1b]">
                {submitError}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mx-auto mt-7 max-w-3xl grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-black uppercase tracking-wide text-brand-dark">Full name*</span>
                <input
                  value={form.fullName}
                  onChange={(event) => updateField("fullName", cleanSearchText(event.target.value, 80))}
                  className="rounded-xl border border-brand-line px-4 py-3 text-base font-semibold outline-none transition focus:border-brand-red"
                  maxLength={80}
                  required
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black uppercase tracking-wide text-brand-dark">Email*</span>
                <input
                  value={form.email}
                  type="email"
                  onChange={(event) => updateField("email", cleanSearchText(event.target.value, 120))}
                  className="rounded-xl border border-brand-line px-4 py-3 text-base font-semibold outline-none transition focus:border-brand-red"
                  maxLength={120}
                  required
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black uppercase tracking-wide text-brand-dark">Phone*</span>
                <input
                  value={form.phone}
                  onChange={(event) => updateField("phone", cleanNumericText(event.target.value, 15))}
                  className="rounded-xl border border-brand-line px-4 py-3 text-base font-semibold outline-none transition focus:border-brand-red"
                  maxLength={15}
                  inputMode="numeric"
                  required
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black uppercase tracking-wide text-brand-dark">Province*</span>
                <input
                  value={form.province}
                  onChange={(event) => updateField("province", cleanSearchText(event.target.value, 60))}
                  className="rounded-xl border border-brand-line px-4 py-3 text-base font-semibold outline-none transition focus:border-brand-red"
                  maxLength={60}
                  required
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black uppercase tracking-wide text-brand-dark">Property type*</span>
                <input
                  value={form.propertyType}
                  onChange={(event) => updateField("propertyType", cleanSearchText(event.target.value, 60))}
                  className="rounded-xl border border-brand-line px-4 py-3 text-base font-semibold outline-none transition focus:border-brand-red"
                  maxLength={60}
                  required
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-black uppercase tracking-wide text-brand-dark">Preferred timeline</span>
                <input
                  value={form.timeline}
                  onChange={(event) => updateField("timeline", cleanSearchText(event.target.value, 60))}
                  className="rounded-xl border border-brand-line px-4 py-3 text-base font-semibold outline-none transition focus:border-brand-red"
                  maxLength={60}
                  placeholder="Example: within 60 days"
                />
              </label>

              <label className="grid gap-2 sm:col-span-2">
                <span className="text-sm font-black uppercase tracking-wide text-brand-dark">Property details</span>
                <textarea
                  value={form.details}
                  onChange={(event) => updateField("details", cleanSearchText(event.target.value, 600))}
                  className="min-h-32 rounded-xl border border-brand-line px-4 py-3 text-base font-semibold outline-none transition focus:border-brand-red"
                  maxLength={600}
                  placeholder="Beds, baths, sqm, location highlights, asking price..."
                />
              </label>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-xl bg-brand-red px-8 py-3 text-base font-black uppercase tracking-wide text-white transition hover:bg-brand-dark"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
