import { ChevronDown, Globe2, Menu } from "lucide-react";
import { useState } from "react";
import { assetPath } from "../utils/assets";
import { safeHref } from "../utils/security";

type NavItem = {
  label: string;
  href: string;
  children?: Array<{ label: string; href: string }>;
};

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "For Sale",
    href: "#for-sale",
    children: [
      { label: "Distress Property", href: `${import.meta.env.BASE_URL}distress-property` },
      { label: "Foreclosure", href: "#foreclosure" },
      { label: "Pre-Foreclosure", href: "#pre-foreclosure" },
      { label: "Fixer Upper", href: "#fixer-upper" },
      { label: "Urgent Sales", href: "#urgent-sales" },
    ],
  },
  { label: "For Rent", href: "#for-rent" },
  { label: "Lease to Own", href: `${import.meta.env.BASE_URL}lease-to-own` },
  {
    label: "Senior Nursing Home",
    href: "#senior-nursing-home",
    children: [
      { label: "Why Retire in Thailand", href: `${import.meta.env.BASE_URL}why-retire-in-thailand` },
      { label: "Why Seniorcare.net?", href: `${import.meta.env.BASE_URL}why-seniorcare-net` },
      { label: "Nursing Home Facility", href: `${import.meta.env.BASE_URL}nursing-home-facility` },
      { label: "Private Villa Nursing Care", href: `${import.meta.env.BASE_URL}private-villa-nursing-care` },
      { label: "Resort Nursing Facility", href: `${import.meta.env.BASE_URL}resort-nursing-facility` },
    ],
  },
  {
    label: "Financing",
    href: "#financing",
    children: [
      { label: "Finacing for Foreigners", href: `${import.meta.env.BASE_URL}financing-for-foreigners` },
      { label: "Own Property in Thailand", href: `${import.meta.env.BASE_URL}own-property-in-thailand` },
    ],
  },
  {
    label: "Immigration / Visa",
    href: "#immigration-visa",
    children: [
      { label: "Retirement Visa", href: `${import.meta.env.BASE_URL}retirement-visa` },
      { label: "Long Term Visa", href: `${import.meta.env.BASE_URL}long-term-visa` },
      { label: "Real Estate Laws for Foreigner", href: `${import.meta.env.BASE_URL}real-estate-laws-for-foreigner` },
    ],
  },
  {
    label: "More",
    href: "#more",
    children: [
      { label: "News", href: "#news" },
      { label: "Abouts", href: "#abouts" },
      { label: "Contact Us", href: "#contact-us" },
      { label: "FAQ", href: `${import.meta.env.BASE_URL}faq` },
    ],
  },
];

const languageOptions = ["EN", "RU", "ZH", "TH", "AR", "FA"];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const homeUrl = import.meta.env.BASE_URL;

  function toggleSubmenu(label: string) {
    setOpenSubmenu((current) => (current === label ? null : label));
  }

  return (
    <header className="sticky top-0 z-50 border-b border-brand-line bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <a href={safeHref(homeUrl)} className="flex items-center gap-3" aria-label="Buy Home For Less home">
          <img
            src={assetPath("images/buy-home-for-less-logo.png")}
            alt="Buy Home For Less"
            className="h-14 w-auto object-contain sm:h-16"
          />
        </a>

        <nav className="hidden items-center gap-5 text-xs font-semibold uppercase tracking-wide text-brand-dark xl:flex xl:gap-6">
          {navItems.map((item) => (
            <div key={item.label} className="relative">
              {item.children ? (
                <button
                  type="button"
                  onClick={() => toggleSubmenu(item.label)}
                  className="inline-flex items-center gap-1 py-3 uppercase hover:text-brand-red"
                  aria-expanded={openSubmenu === item.label}
                >
                  {item.label}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              ) : (
                <a href={safeHref(item.href)} className="inline-flex items-center gap-1 py-3 hover:text-brand-red">
                  {item.label}
                </a>
              )}
              {item.children ? (
                openSubmenu === item.label ? (
                  <div className="absolute left-0 top-full min-w-52 border border-brand-line bg-white py-2 shadow-search">
                    {item.children.map((child) => (
                      <a
                        key={child.label}
                        href={safeHref(child.href)}
                        className="block px-4 py-3 text-xs font-bold uppercase tracking-wide text-brand-dark hover:bg-neutral-100 hover:text-brand-red"
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                ) : null
              ) : null}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <label className="inline-flex h-10 items-center gap-2 border border-brand-line px-3 text-sm font-semibold text-brand-dark hover:border-brand-red">
            <Globe2 className="h-4 w-4" />
            <span className="sr-only">Language</span>
            <select
              className="bg-transparent text-sm font-bold uppercase outline-none"
              defaultValue="EN"
              aria-label="Language"
            >
              {languageOptions.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center border border-brand-line xl:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
      {menuOpen ? (
        <nav className="border-t border-brand-line bg-white px-4 py-4 xl:hidden">
          <div className="grid gap-3 text-sm font-semibold uppercase tracking-wide text-brand-dark">
            {navItems.map((item) => (
              <div key={item.label}>
                {item.children ? (
                  <button
                    type="button"
                    onClick={() => toggleSubmenu(item.label)}
                    className="flex w-full items-center justify-between py-2 text-left uppercase hover:text-brand-red"
                    aria-expanded={openSubmenu === item.label}
                  >
                    {item.label}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                ) : (
                  <a href={safeHref(item.href)} className="block py-2 hover:text-brand-red">
                    {item.label}
                  </a>
                )}
                {item.children && openSubmenu === item.label ? (
                  <div className="ml-4 grid gap-1 border-l border-brand-line pl-4">
                    {item.children.map((child) => (
                      <a key={child.label} href={safeHref(child.href)} className="block py-2 text-xs text-brand-gray hover:text-brand-red">
                        {child.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
