import { ChevronDown, Globe2, Menu, User } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { assetPath } from "../utils/assets";
import { getInitialLanguage, useSiteTranslation } from "../hooks/useSiteTranslation";
import { isValidEmail, sanitizeEmail, useMockAuth } from "../hooks/useMockAuth";
import { type SiteLanguage } from "../services/translationService";
import { safeHref } from "../utils/security";

type NavItem = {
  label: string;
  href: string;
  children?: Array<{ label: string; href: string }>;
};

type AuthModalMode = "login" | "signup";

const navItems: NavItem[] = [
  { label: "Home", href: import.meta.env.BASE_URL },
  { label: "Buy", href: `${import.meta.env.BASE_URL}buy` },
  { label: "Rent", href: `${import.meta.env.BASE_URL}properties-for-rent` },
  { label: "Sell", href: `${import.meta.env.BASE_URL}sell-your-home` },
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
      { label: "Financing for Foreigners", href: `${import.meta.env.BASE_URL}financing-for-foreigners` },
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
      { label: "About Us", href: `${import.meta.env.BASE_URL}about-us` },
      { label: "Contact Us", href: `${import.meta.env.BASE_URL}contact-us` },
      { label: "FAQ", href: `${import.meta.env.BASE_URL}faq` },
    ],
  },
];

const languageOptions: SiteLanguage[] = ["EN", "RU", "ZH", "TH", "AR", "FA"];

const placeholderProfileItems = ["My Profile", "Saved Properties", "Account Settings"];

type HeaderProps = {
  logoClassName?: string;
};

function isValidPassword(password: string) {
  return password.trim().length >= 8;
}

function ProfileMenu({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="absolute right-0 top-full z-50 mt-2 min-w-48 border border-brand-line bg-white py-2 shadow-search">
      {placeholderProfileItems.map((item) => (
        <button
          key={item}
          type="button"
          disabled
          className="block w-full cursor-not-allowed px-4 py-2 text-left text-xs font-bold uppercase tracking-wide text-brand-gray opacity-65"
        >
          {item}
        </button>
      ))}
      <button
        type="button"
        onClick={onLogout}
        className="block w-full px-4 py-2 text-left text-xs font-bold uppercase tracking-wide text-brand-dark hover:bg-neutral-100 hover:text-brand-red"
      >
        Logout
      </button>
    </div>
  );
}

export function Header({ logoClassName = "h-16 w-auto object-contain sm:h-20" }: HeaderProps = {}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [language, setLanguage] = useState<SiteLanguage>(getInitialLanguage);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [signupStep, setSignupStep] = useState<1 | 2 | 3>(1);
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupError, setSignupError] = useState("");
  const [desktopProfileOpen, setDesktopProfileOpen] = useState(false);
  const profileRootRef = useRef<HTMLDivElement | null>(null);
  const homeUrl = import.meta.env.BASE_URL;
  const currentPath = window.location.pathname;
  const { translationError } = useSiteTranslation(language);
  const { mockUser, isSignedIn, loginWithEmail, logout } = useMockAuth();

  const displayName = useMemo(() => mockUser?.displayName ?? "", [mockUser]);

  useEffect(() => {
    function onWindowClick(event: MouseEvent) {
      if (!profileRootRef.current) return;
      if (!profileRootRef.current.contains(event.target as Node)) {
        setDesktopProfileOpen(false);
      }
    }
    window.addEventListener("click", onWindowClick);
    return () => window.removeEventListener("click", onWindowClick);
  }, []);

  function toggleSubmenu(label: string) {
    setOpenSubmenu((current) => (current === label ? null : label));
  }

  function isActiveLink(href: string) {
    const normalizedHref = new URL(href, window.location.origin).pathname;
    const normalizedHome = new URL(homeUrl, window.location.origin).pathname;

    if (normalizedHref === normalizedHome) {
      return currentPath === normalizedHome;
    }

    return currentPath === normalizedHref;
  }

  function closeAuthModal() {
    setAuthModalMode(null);
    setLoginPassword("");
    setSignupPassword("");
    setLoginError("");
    setSignupError("");
  }

  function openLoginModal() {
    setMenuOpen(false);
    setAuthModalMode("login");
    setLoginError("");
  }

  function openSignupModal() {
    setMenuOpen(false);
    setAuthModalMode("signup");
    setSignupStep(1);
    setSignupEmail("");
    setSignupPassword("");
    setSignupError("");
  }

  function completeLogin() {
    const email = sanitizeEmail(loginEmail);
    const password = loginPassword;
    if (!isValidEmail(email)) {
      setLoginError("Please enter a valid email address.");
      return;
    }

    if (!isValidPassword(password)) {
      setLoginError("Password must be at least 8 characters.");
      return;
    }

    const result = loginWithEmail(email);
    if (!result.ok) {
      setLoginError("Unable to sign in. Please try again.");
      return;
    }

    setLoginPassword("");
    setLoginError("");
    setDesktopProfileOpen(false);
    setMenuOpen(false);
    setAuthModalMode(null);
  }

  function completeSignupEmailStep() {
    const email = sanitizeEmail(signupEmail);
    if (!isValidEmail(email)) {
      setSignupError("Please enter a valid email address.");
      return;
    }

    setSignupEmail(email);
    setSignupError("");
    setSignupStep(2);
  }

  function completeSignupPasswordStep() {
    const password = signupPassword;

    if (!isValidPassword(password)) {
      setSignupError("Password must be at least 8 characters.");
      return;
    }

    const result = loginWithEmail(signupEmail);
    if (!result.ok) {
      setSignupError("Unable to complete sign up.");
      return;
    }

    setSignupPassword("");
    setSignupError("");
    setSignupStep(3);
    setDesktopProfileOpen(false);
    setMenuOpen(false);
  }

  function onSignupContinue() {
    closeAuthModal();
  }

  function onLogout() {
    logout();
    setDesktopProfileOpen(false);
    setMenuOpen(false);
    closeAuthModal();
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-brand-line bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          <a href={safeHref(homeUrl)} className="flex items-center gap-3" aria-label="Buy Home For Less home">
            <img
              src={assetPath("images/buy-home-for-less-logo.png")}
              alt="Buy Home For Less"
              className={logoClassName}
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
                  <a
                    href={safeHref(item.href)}
                    className={`inline-flex items-center gap-1 py-3 hover:text-brand-red ${
                      isActiveLink(item.href) ? "text-brand-red" : ""
                    }`}
                  >
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

          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 xl:flex" data-no-translate>
                {isSignedIn && mockUser ? (
                  <div ref={profileRootRef} className="relative">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setDesktopProfileOpen((current) => !current);
                      }}
                      className="inline-flex h-10 items-center gap-2 border border-brand-line px-3 text-sm font-semibold text-brand-dark hover:border-brand-red"
                      aria-expanded={desktopProfileOpen}
                    >
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-dark text-xs font-black text-white">
                        {mockUser.avatarInitial}
                      </span>
                      <span className="max-w-28 truncate lowercase">{displayName}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {desktopProfileOpen ? <ProfileMenu onLogout={onLogout} /> : null}
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={openLoginModal}
                      className="inline-flex h-10 items-center border border-brand-line px-4 text-xs font-bold uppercase tracking-wide text-brand-dark hover:border-brand-red hover:text-brand-red"
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={openSignupModal}
                      className="inline-flex h-10 items-center border border-brand-dark bg-brand-dark px-4 text-xs font-bold uppercase tracking-wide text-white hover:bg-brand-red hover:border-brand-red"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
              <label
                className="inline-flex h-10 items-center gap-2 border border-brand-line px-3 text-sm font-semibold text-brand-dark hover:border-brand-red"
                data-no-translate
              >
                <Globe2 className="h-4 w-4" />
                <span className="sr-only">Language</span>
                <select
                  className="bg-transparent text-sm font-bold uppercase outline-none"
                  value={language}
                  onChange={(event) => setLanguage(event.target.value as SiteLanguage)}
                  aria-label="Language"
                >
                  {languageOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
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
            {language !== "EN" && translationError ? (
              <p className="max-w-[230px] text-right text-[11px] font-semibold leading-4 text-brand-red" data-no-translate>
                Translation API unreachable. Configure `DEEPL_API_KEY` and `DEEPL_API_URL`
                for the DeepL proxy, then restart the dev server.
              </p>
            ) : null}
          </div>
        </div>
        {menuOpen ? (
          <nav className="border-t border-brand-line bg-white px-4 py-4 xl:hidden" data-no-translate>
            {isSignedIn && mockUser ? (
              <div className="mb-4 border border-brand-line p-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-dark text-sm font-black text-white">
                    {mockUser.avatarInitial}
                  </span>
                  <span className="text-sm font-bold lowercase text-brand-dark">{displayName}</span>
                </div>
                <div className="mt-3 grid gap-1 border-t border-brand-line pt-2">
                  {placeholderProfileItems.map((item) => (
                    <button
                      key={item}
                      type="button"
                      disabled
                      className="py-2 text-left text-xs font-bold uppercase tracking-wide text-brand-gray opacity-70"
                    >
                      {item}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={onLogout}
                    className="py-2 text-left text-xs font-bold uppercase tracking-wide text-brand-dark hover:text-brand-red"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="inline-flex h-10 items-center justify-center border border-brand-line text-xs font-bold uppercase tracking-wide text-brand-dark"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={openSignupModal}
                  className="inline-flex h-10 items-center justify-center border border-brand-dark bg-brand-dark text-xs font-bold uppercase tracking-wide text-white"
                >
                  Sign Up
                </button>
              </div>
            )}
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
                    <a
                      href={safeHref(item.href)}
                      className={`block py-2 hover:text-brand-red ${isActiveLink(item.href) ? "text-brand-red" : ""}`}
                    >
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

      {authModalMode ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Authentication"
          data-no-translate
        >
          <div className="w-full max-w-md border border-brand-line bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.32)]">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black text-brand-dark">
                  {authModalMode === "login" ? "Login" : "Sign Up"}
                </h2>
                {authModalMode === "signup" ? (
                  <p className="mt-1 text-sm text-brand-gray">
                    {signupStep === 1 ? "Step 1 of 3: enter your email." : signupStep === 2 ? "Step 2 of 3: create your password." : "Step 3 of 3: account ready."}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={closeAuthModal}
                className="inline-flex h-8 w-8 items-center justify-center border border-brand-line text-brand-dark hover:border-brand-red hover:text-brand-red"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {authModalMode === "login" ? (
              <div className="grid gap-3">
                <label className="grid gap-1 text-sm font-semibold text-brand-dark">
                  Email
                  <input
                    name="loginEmail"
                    type="email"
                    value={loginEmail}
                    onChange={(event) => {
                      setLoginEmail(sanitizeEmail(event.target.value));
                      setLoginError("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        completeLogin();
                      }
                    }}
                    className="h-11 border border-brand-line px-3 outline-none focus:border-brand-red"
                    required
                  />
                </label>
                <label className="grid gap-1 text-sm font-semibold text-brand-dark">
                  Password
                  <input
                    name="loginPassword"
                    type="password"
                    value={loginPassword}
                    onChange={(event) => {
                      setLoginPassword(event.target.value);
                      setLoginError("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        completeLogin();
                      }
                    }}
                    className="h-11 border border-brand-line px-3 outline-none focus:border-brand-red"
                    required
                  />
                </label>
                {loginError ? <p className="text-sm font-semibold text-brand-red">{loginError}</p> : null}
                <button
                  type="button"
                  onClick={completeLogin}
                  className="mt-2 inline-flex h-11 items-center justify-center border border-brand-dark bg-brand-dark px-4 text-sm font-bold uppercase tracking-wide text-white hover:border-brand-red hover:bg-brand-red"
                >
                  Continue
                </button>
              </div>
            ) : null}

            {authModalMode === "signup" && signupStep === 1 ? (
              <div className="grid gap-3">
                <label className="grid gap-1 text-sm font-semibold text-brand-dark">
                  Email
                  <input
                    name="signupEmail"
                    type="email"
                    value={signupEmail}
                    onChange={(event) => {
                      setSignupEmail(sanitizeEmail(event.target.value));
                      setSignupError("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        completeSignupEmailStep();
                      }
                    }}
                    className="h-11 border border-brand-line px-3 outline-none focus:border-brand-red"
                    required
                  />
                </label>
                {signupError ? <p className="text-sm font-semibold text-brand-red">{signupError}</p> : null}
                <button
                  type="button"
                  onClick={completeSignupEmailStep}
                  className="mt-2 inline-flex h-11 items-center justify-center border border-brand-dark bg-brand-dark px-4 text-sm font-bold uppercase tracking-wide text-white hover:border-brand-red hover:bg-brand-red"
                >
                  Continue
                </button>
              </div>
            ) : null}

            {authModalMode === "signup" && signupStep === 2 ? (
              <div className="grid gap-3">
                <div className="inline-flex items-center gap-2 text-sm text-brand-gray">
                  <User className="h-4 w-4" />
                  <span>{signupEmail}</span>
                </div>
                <label className="grid gap-1 text-sm font-semibold text-brand-dark">
                  Create Password
                  <input
                    name="signupPassword"
                    type="password"
                    value={signupPassword}
                    onChange={(event) => {
                      setSignupPassword(event.target.value);
                      setSignupError("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        completeSignupPasswordStep();
                      }
                    }}
                    className="h-11 border border-brand-line px-3 outline-none focus:border-brand-red"
                    required
                  />
                </label>
                <p className="text-xs text-brand-gray">Use at least 8 characters.</p>
                {signupError ? <p className="text-sm font-semibold text-brand-red">{signupError}</p> : null}
                <button
                  type="button"
                  onClick={completeSignupPasswordStep}
                  className="mt-1 inline-flex h-11 items-center justify-center border border-brand-dark bg-brand-dark px-4 text-sm font-bold uppercase tracking-wide text-white hover:border-brand-red hover:bg-brand-red"
                >
                  Create Account
                </button>
              </div>
            ) : null}

            {authModalMode === "signup" && signupStep === 3 ? (
              <div className="grid gap-4">
                <p className="text-sm font-semibold text-brand-dark">
                  Sign up successful. You are now signed in as {displayName || signupEmail.split("@")[0]}.
                </p>
                <button
                  type="button"
                  onClick={onSignupContinue}
                  className="inline-flex h-11 items-center justify-center border border-brand-dark bg-brand-dark px-4 text-sm font-bold uppercase tracking-wide text-white hover:border-brand-red hover:bg-brand-red"
                >
                  Continue
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
