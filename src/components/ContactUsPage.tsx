import { Mail, MessageCircleMore, MessagesSquare, PhoneCall } from "lucide-react";
import { useEffect } from "react";
import { assetPath } from "../utils/assets";
import { safeMailtoHref, safeTelHref } from "../utils/security";
import { Footer } from "./Footer";
import { Header } from "./Header";

const contactItems = [
  { label: "Tel", value: "+66-973924632", href: safeTelHref("+66-973924632"), icon: PhoneCall },
  { label: "Whatsapp", value: "+66-973924632", href: safeTelHref("+66-973924632"), icon: MessageCircleMore },
  { label: "Wechat", value: "+66-973924632", href: safeTelHref("+66-973924632"), icon: MessagesSquare },
  { label: "Email", value: "Info@buyhomeforless.com", href: safeMailtoHref("Info@buyhomeforless.com"), icon: Mail },
] as const;

export function ContactUsPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand-dark">
      <Header />
      <main>
        <section className="px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[28px] border border-brand-line bg-white shadow-[0_18px_44px_rgba(15,23,42,0.12)]">
            <div className="relative">
              <img
                src={assetPath("images/page-banners/contact-us-banner.jfif")}
                alt="Contact Buy Home For Less"
                className="h-[230px] w-full object-cover sm:h-[300px] lg:h-[360px]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.14)_0%,rgba(0,0,0,0.52)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p className="text-sm font-black uppercase tracking-[0.22em] text-white/90">Contact Us</p>
                <h1 className="mt-2 text-4xl font-black leading-tight text-white sm:text-5xl">
                  We are here to help
                </h1>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 pt-7 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black text-brand-dark sm:text-4xl">Get in touch with our team</h2>
            <p className="mt-3 text-base leading-7 text-brand-gray">
              Reach us through your preferred channel below and our team will get back to you quickly.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {contactItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="group rounded-2xl border border-brand-line bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-brand-red"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#f8f2ef] text-brand-red">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm font-black uppercase tracking-[0.16em] text-brand-gray">{item.label}</p>
                  <p className="mt-2 text-lg font-black text-brand-dark transition group-hover:text-brand-red">
                    {item.value}
                  </p>
                </a>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
