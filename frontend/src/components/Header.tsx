import { ChevronDown, Eye, EyeOff, Globe2, Menu, User, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { assetPath } from "../utils/assets";
import { getInitialLanguage, useSiteTranslation } from "../hooks/useSiteTranslation";
import {
  getDisplayNameFromIdentifier,
  isValidEmailOrPhone,
  isValidPhoneNumber,
  sanitizeAuthIdentifier,
  setMockUser,
  useMockAuth,
} from "../hooks/useMockAuth";
import {
  DEV_ONLY_MOCK_PHONE_NUMBER,
  DEV_ONLY_MOCK_OTP_CODE,
  isValidOtpCode,
  sanitizeOtpCode,
  sendMockOtpCode,
  verifyMockOtpCode,
} from "../services/mockOtpService";
import { type SiteLanguage } from "../services/translationService";
import { type AuthModalMode, OPEN_AUTH_MODAL_EVENT } from "../utils/authModal";
import { safeHref } from "../utils/security";

type NavItem = {
  label: string;
  href: string;
  children?: Array<{ label: string; href: string }>;
};

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

const staticProfileItems = ["My Profile"];

function SocialAuthButtons() {
  return (
    <div className="mt-3 grid gap-2">
      <button
        type="button"
        disabled
        className="inline-flex h-11 items-center justify-center gap-2 border border-brand-line bg-white px-4 text-sm font-bold text-brand-dark opacity-70"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-brand-line text-xs font-black">G</span>
        Continue with Google
      </button>
      <button
        type="button"
        disabled
        className="inline-flex h-11 items-center justify-center gap-2 border border-brand-line bg-white px-4 text-sm font-bold text-brand-dark opacity-70"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-brand-line text-xs font-black">f</span>
        Continue with Facebook
      </button>
    </div>
  );
}

type HeaderProps = {
  logoClassName?: string;
};

function isValidPassword(password: string) {
  return password.trim().length >= 8;
}

type SignupStep = "identifier" | "verifyPhone" | "profile";
type IdentifierMode = "email" | "phone";

const COUNTRY_DIAL_CODES = [
  { flag: "🇹🇭", code: "+66", name: "Thailand" },
  { flag: "🇺🇸", code: "+1", name: "United States" },
  { flag: "🇬🇧", code: "+44", name: "United Kingdom" },
  { flag: "🇦🇺", code: "+61", name: "Australia" },
  { flag: "🇨🇦", code: "+1", name: "Canada" },
  { flag: "🇩🇪", code: "+49", name: "Germany" },
  { flag: "🇫🇷", code: "+33", name: "France" },
  { flag: "🇨🇳", code: "+86", name: "China" },
  { flag: "🇯🇵", code: "+81", name: "Japan" },
  { flag: "🇮🇳", code: "+91", name: "India" },
];

function sanitizeAreaCode(value: string) {
  const cleaned = value.replace(/[^\d+]/g, "");
  if (!cleaned) return "+";
  if (cleaned.startsWith("+")) return cleaned;
  return `+${cleaned.replace(/\+/g, "")}`;
}

function sanitizeLocalPhoneNumber(value: string) {
  return value.replace(/\D/g, "").slice(0, 15);
}

function composePhoneIdentifier(areaCode: string, localNumber: string) {
  return sanitizeAuthIdentifier(`${sanitizeAreaCode(areaCode)}${sanitizeLocalPhoneNumber(localNumber)}`);
}

function ProfileMenu({
  onLogout,
  accountSettingsHref,
  favoritesHref,
}: {
  onLogout: () => void;
  accountSettingsHref: string;
  favoritesHref: string;
}) {
  return (
    <div className="absolute right-0 top-full z-50 mt-2 min-w-48 border border-brand-line bg-white py-2 shadow-search">
      {staticProfileItems.map((item) => (
        <button
          key={item}
          type="button"
          disabled
          className="block w-full cursor-not-allowed px-4 py-2 text-left text-xs font-bold uppercase tracking-wide text-brand-gray opacity-65"
        >
          {item}
        </button>
      ))}
      <a
        href={safeHref(favoritesHref)}
        className="block w-full px-4 py-2 text-left text-xs font-bold uppercase tracking-wide text-brand-dark hover:bg-neutral-100 hover:text-brand-red"
      >
        Favorites
      </a>
      <a
        href={safeHref(accountSettingsHref)}
        className="block w-full px-4 py-2 text-left text-xs font-bold uppercase tracking-wide text-brand-dark hover:bg-neutral-100 hover:text-brand-red"
      >
        Account Settings
      </a>
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
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginIdentifierMode, setLoginIdentifierMode] = useState<IdentifierMode>("phone");
  const [loginCountryCode, setLoginCountryCode] = useState("+66");
  const [loginLocalPhone, setLoginLocalPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginOtpCode, setLoginOtpCode] = useState("");
  const [loginPhoneChallengeId, setLoginPhoneChallengeId] = useState("");
  const [loginInfo, setLoginInfo] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [signupStep, setSignupStep] = useState<SignupStep>("identifier");
  const [signupIdentifier, setSignupIdentifier] = useState("");
  const [signupIdentifierMode, setSignupIdentifierMode] = useState<IdentifierMode>("phone");
  const [signupCountryCode, setSignupCountryCode] = useState("+66");
  const [signupLocalPhone, setSignupLocalPhone] = useState("");
  const [signupProfileName, setSignupProfileName] = useState("");
  const [signupOtpCode, setSignupOtpCode] = useState("");
  const [signupPhoneChallengeId, setSignupPhoneChallengeId] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupInfo, setSignupInfo] = useState("");
  const [signupBusy, setSignupBusy] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [desktopProfileOpen, setDesktopProfileOpen] = useState(false);
  const profileRootRef = useRef<HTMLDivElement | null>(null);
  const homeUrl = import.meta.env.BASE_URL;
  const dashboardUrl = `${import.meta.env.BASE_URL}dashboard`;
  const accountSettingsUrl = `${import.meta.env.BASE_URL}account-settings`;
  const favoritesUrl = `${import.meta.env.BASE_URL}favorites`;
  const currentPath = window.location.pathname;
  const { translationError } = useSiteTranslation(language);
  const { mockUser, isSignedIn, loginWithIdentifier, logout } = useMockAuth();

  const displayName = useMemo(() => mockUser?.displayName ?? "", [mockUser]);
  const canUsePortal = typeof document !== "undefined";

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

  useEffect(() => {
    function onOpenAuthModal(event: Event) {
      const customEvent = event as CustomEvent<{ mode: AuthModalMode }>;
      const mode = customEvent.detail?.mode;
      if (mode !== "login" && mode !== "signup") {
        return;
      }

      setMenuOpen(false);
      if (mode === "login") {
        resetLoginState();
      } else {
        resetSignupState();
      }
      setAuthModalMode(mode);
    }

    window.addEventListener(OPEN_AUTH_MODAL_EVENT, onOpenAuthModal);
    return () => window.removeEventListener(OPEN_AUTH_MODAL_EVENT, onOpenAuthModal);
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

  function resetLoginState() {
    setLoginIdentifier("");
    setLoginIdentifierMode("phone");
    setLoginCountryCode("+66");
    setLoginLocalPhone("");
    setLoginPassword("");
    setLoginOtpCode("");
    setLoginPhoneChallengeId("");
    setLoginInfo("");
    setLoginError("");
    setLoginBusy(false);
    setShowLoginPassword(false);
  }

  function resetSignupState() {
    setSignupStep("identifier");
    setSignupIdentifier("");
    setSignupIdentifierMode("phone");
    setSignupCountryCode("+66");
    setSignupLocalPhone("");
    setSignupProfileName("");
    setSignupOtpCode("");
    setSignupPhoneChallengeId("");
    setSignupPassword("");
    setSignupInfo("");
    setSignupError("");
    setSignupBusy(false);
    setShowSignupPassword(false);
  }

  function closeAuthModal() {
    setAuthModalMode(null);
    resetLoginState();
    resetSignupState();
  }

  function openLoginModal() {
    setMenuOpen(false);
    resetLoginState();
    setAuthModalMode("login");
  }

  function openSignupModal() {
    setMenuOpen(false);
    resetSignupState();
    setAuthModalMode("signup");
  }

  function loginIdentifierType(value: string) {
    const identifier = sanitizeAuthIdentifier(value);
    if (!identifier) return "unknown" as const;
    if (identifier.includes("@")) return "email" as const;
    return isValidPhoneNumber(identifier) ? ("phone" as const) : ("unknown" as const);
  }

  function setLoginPhoneFromParts(nextAreaCode: string, nextLocalPhone: string) {
    const areaCode = sanitizeAreaCode(nextAreaCode);
    const localPhone = sanitizeLocalPhoneNumber(nextLocalPhone);
    setLoginCountryCode(areaCode);
    setLoginLocalPhone(localPhone);
    setLoginIdentifier(composePhoneIdentifier(areaCode, localPhone));
    setLoginError("");
    setLoginInfo("");
    setLoginPhoneChallengeId("");
    setLoginOtpCode("");
  }

  function setSignupPhoneFromParts(nextAreaCode: string, nextLocalPhone: string) {
    const areaCode = sanitizeAreaCode(nextAreaCode);
    const localPhone = sanitizeLocalPhoneNumber(nextLocalPhone);
    setSignupCountryCode(areaCode);
    setSignupLocalPhone(localPhone);
    setSignupIdentifier(composePhoneIdentifier(areaCode, localPhone));
    setSignupError("");
    setSignupInfo("");
  }

  function goToDashboard() {
    window.location.assign(safeHref(dashboardUrl));
  }

  async function onSendLoginCode() {
    const phoneNumber = sanitizeAuthIdentifier(loginIdentifier);
    if (!isValidPhoneNumber(phoneNumber)) {
      setLoginError("Please enter a valid phone number.");
      return;
    }

    setLoginBusy(true);
    setLoginError("");
    const response = await sendMockOtpCode(phoneNumber, "login");
    setLoginBusy(false);
    if (!response.ok) {
      setLoginError(response.error);
      return;
    }

    setLoginIdentifier(phoneNumber);
    setLoginPhoneChallengeId(response.challengeId);
    setLoginOtpCode("");
    setLoginInfo(response.devMessage);
  }

  async function onVerifyLoginCode() {
    const phoneNumber = sanitizeAuthIdentifier(loginIdentifier);
    if (!isValidPhoneNumber(phoneNumber)) {
      setLoginError("Please enter a valid phone number.");
      return;
    }
    if (!isValidOtpCode(loginOtpCode)) {
      setLoginError("Verification code must be 6 digits.");
      return;
    }

    setLoginBusy(true);
    setLoginError("");
    const verifyResult = await verifyMockOtpCode(loginPhoneChallengeId, phoneNumber, loginOtpCode, "login");
    setLoginBusy(false);
    if (!verifyResult.ok) {
      setLoginError(verifyResult.error);
      return;
    }

    const result = loginWithIdentifier(phoneNumber);
    if (!result.ok) {
      setLoginError("Unable to sign in. Please try again.");
      return;
    }

    setDesktopProfileOpen(false);
    setMenuOpen(false);
    goToDashboard();
  }

  function onCompleteEmailLogin() {
    const identifier = sanitizeAuthIdentifier(loginIdentifier);
    if (!isValidEmailOrPhone(identifier) || !identifier.includes("@")) {
      setLoginError("Please enter a valid email address.");
      return;
    }
    if (!isValidPassword(loginPassword)) {
      setLoginError("Password must be at least 8 characters.");
      return;
    }

    const result = loginWithIdentifier(identifier);
    if (!result.ok) {
      setLoginError("Unable to sign in. Please try again.");
      return;
    }

    setDesktopProfileOpen(false);
    setMenuOpen(false);
    goToDashboard();
  }

  async function completeLogin() {
    const type = loginIdentifierType(loginIdentifier);
    if (type === "email") {
      onCompleteEmailLogin();
      return;
    }
    if (type === "phone") {
      if (!loginPhoneChallengeId) {
        await onSendLoginCode();
        return;
      }
      await onVerifyLoginCode();
      return;
    }
    setLoginError("Please enter a valid email or phone number.");
  }

  async function onContinueSignupIdentifier() {
    const identifier = sanitizeAuthIdentifier(signupIdentifier);
    if (!isValidEmailOrPhone(identifier)) {
      setSignupError("Please enter a valid email or phone number.");
      return;
    }

    if (identifier.includes("@")) {
      setSignupIdentifier(identifier);
      setSignupStep("profile");
      setSignupError("");
      setSignupInfo("");
      return;
    }

    setSignupBusy(true);
    setSignupError("");
    const response = await sendMockOtpCode(identifier, "signup");
    setSignupBusy(false);
    if (!response.ok) {
      setSignupError(response.error);
      return;
    }

    setSignupIdentifier(identifier);
    setSignupPhoneChallengeId(response.challengeId);
    setSignupOtpCode("");
    setSignupInfo(response.devMessage);
    setSignupStep("verifyPhone");
  }

  async function onVerifySignupPhoneCode() {
    const phoneNumber = sanitizeAuthIdentifier(signupIdentifier);
    if (!isValidPhoneNumber(phoneNumber)) {
      setSignupError("Please enter a valid phone number.");
      return;
    }
    if (!isValidOtpCode(signupOtpCode)) {
      setSignupError("Verification code must be 6 digits.");
      return;
    }

    setSignupBusy(true);
    setSignupError("");
    const verifyResult = await verifyMockOtpCode(signupPhoneChallengeId, phoneNumber, signupOtpCode, "signup");
    setSignupBusy(false);
    if (!verifyResult.ok) {
      setSignupError(verifyResult.error);
      return;
    }

    setSignupStep("profile");
    setSignupInfo("Phone number verified.");
    setSignupError("");
  }

  function onCompleteSignupProfile() {
    const identifier = sanitizeAuthIdentifier(signupIdentifier);
    if (!isValidEmailOrPhone(identifier)) {
      setSignupError("Please enter a valid email or phone number.");
      return;
    }

    if (!isValidPassword(signupPassword)) {
      setSignupError("Password must be at least 8 characters.");
      return;
    }

    const cleanProfileName = signupProfileName.replace(/[<>`]/g, "").trim().slice(0, 24);
    const user = setMockUser(identifier, { displayName: cleanProfileName });
    if (!user) {
      setSignupError("Unable to complete sign up.");
      return;
    }

    setDesktopProfileOpen(false);
    setMenuOpen(false);
    goToDashboard();
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
                    {desktopProfileOpen ? (
                      <ProfileMenu
                        onLogout={onLogout}
                        accountSettingsHref={accountSettingsUrl}
                        favoritesHref={favoritesUrl}
                      />
                    ) : null}
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
                  {staticProfileItems.map((item) => (
                    <button
                      key={item}
                      type="button"
                      disabled
                      className="py-2 text-left text-xs font-bold uppercase tracking-wide text-brand-gray opacity-70"
                    >
                      {item}
                    </button>
                  ))}
                  <a
                    href={safeHref(favoritesUrl)}
                    onClick={() => setMenuOpen(false)}
                    className="py-2 text-left text-xs font-bold uppercase tracking-wide text-brand-dark hover:text-brand-red"
                  >
                    Favorites
                  </a>
                  <a
                    href={safeHref(accountSettingsUrl)}
                    onClick={() => setMenuOpen(false)}
                    className="py-2 text-left text-xs font-bold uppercase tracking-wide text-brand-dark hover:text-brand-red"
                  >
                    Account Settings
                  </a>
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

      {authModalMode && canUsePortal
        ? createPortal(
            <div
              className="fixed inset-0 overflow-y-auto bg-black/55"
              style={{ zIndex: 2147483647 }}
              role="dialog"
              aria-modal="true"
              aria-label="Authentication"
              onClick={closeAuthModal}
              data-no-translate
            >
              <div className="flex min-h-[100dvh] items-center justify-center px-4 py-10 sm:p-8">
                <div
                  className="w-full max-w-md max-h-[calc(100dvh-5rem)] overflow-y-auto border border-brand-line bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,0.32)]"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-black text-brand-dark">
                        {authModalMode === "login" ? "Login" : "Sign Up"}
                      </h2>
                      {authModalMode === "signup" ? (
                        <p className="mt-1 text-sm text-brand-gray">
                          {signupStep === "identifier"
                            ? "Step 1 of 3: enter your email or phone number."
                            : signupStep === "verifyPhone"
                              ? "Step 2 of 3: verify your phone number."
                              : "Step 3 of 3: create password and profile."}
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={closeAuthModal}
                      className="inline-flex h-8 w-8 items-center justify-center border border-brand-line text-brand-dark hover:border-brand-red hover:text-brand-red"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {authModalMode === "login" ? (
                    <div className="grid gap-3">
                      <div className="inline-flex w-full border border-brand-line p-1">
                        <button
                          type="button"
                          onClick={() => {
                            setLoginIdentifierMode("phone");
                            setLoginIdentifier(composePhoneIdentifier(loginCountryCode, loginLocalPhone));
                            setLoginError("");
                            setLoginInfo("");
                          }}
                          className={`h-9 flex-1 text-xs font-bold uppercase tracking-wide ${
                            loginIdentifierMode === "phone" ? "bg-brand-dark text-white" : "text-brand-dark"
                          }`}
                        >
                          Phone
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLoginIdentifierMode("email");
                            setLoginIdentifier("");
                            setLoginError("");
                            setLoginInfo("");
                            setLoginPhoneChallengeId("");
                            setLoginOtpCode("");
                          }}
                          className={`h-9 flex-1 text-xs font-bold uppercase tracking-wide ${
                            loginIdentifierMode === "email" ? "bg-brand-dark text-white" : "text-brand-dark"
                          }`}
                        >
                          Email
                        </button>
                      </div>

                      {loginIdentifierMode === "phone" ? (
                        <label className="grid gap-1 text-sm font-semibold text-brand-dark">
                          Phone number
                          <div className="flex gap-2">
                            <div className="flex h-11 w-40 items-center border border-brand-line">
                              <select
                                value={loginCountryCode}
                                onChange={(event) => setLoginPhoneFromParts(event.target.value, loginLocalPhone)}
                                className="h-full w-16 border-r border-brand-line bg-white px-1 text-center text-base outline-none"
                                aria-label="Select country flag"
                              >
                                {COUNTRY_DIAL_CODES.map((item) => (
                                  <option key={`${item.name}-${item.code}`} value={item.code}>
                                    {item.flag}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="text"
                                value={loginCountryCode}
                                onChange={(event) => setLoginPhoneFromParts(event.target.value, loginLocalPhone)}
                                className="h-full w-full px-2 text-sm outline-none focus:text-brand-dark"
                                placeholder="+66"
                                aria-label="Area code"
                              />
                            </div>
                            <input
                              name="loginIdentifier"
                              type="text"
                              value={loginLocalPhone}
                              onChange={(event) => setLoginPhoneFromParts(loginCountryCode, event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  void completeLogin();
                                }
                              }}
                              className="h-11 flex-1 border border-brand-line px-3 outline-none focus:border-brand-red"
                              placeholder="Enter phone number"
                              autoComplete="tel-national"
                              inputMode="tel"
                              required
                            />
                          </div>
                        </label>
                      ) : (
                        <label className="grid gap-1 text-sm font-semibold text-brand-dark">
                          Email address
                          <input
                            name="loginIdentifier"
                            type="email"
                            value={loginIdentifier}
                            onChange={(event) => {
                              const next = sanitizeAuthIdentifier(event.target.value);
                              setLoginIdentifier(next);
                              setLoginError("");
                              setLoginInfo("");
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                void completeLogin();
                              }
                            }}
                            className="h-11 border border-brand-line px-3 outline-none focus:border-brand-red"
                            placeholder="Enter email address"
                            autoComplete="username"
                            required
                          />
                        </label>
                      )}

                      {loginIdentifierType(loginIdentifier) === "phone" ? (
                        <>
                          {loginPhoneChallengeId ? (
                            <>
                              <label className="grid gap-1 text-sm font-semibold text-brand-dark">
                                Phone number
                                <input
                                  type="text"
                                  value={loginIdentifier}
                                  disabled
                                  className="h-11 border border-brand-line bg-neutral-100 px-3 text-brand-gray"
                                />
                              </label>
                              <label className="grid gap-1 text-sm font-semibold text-brand-dark">
                                Verification code
                                <input
                                  name="loginOtpCode"
                                  type="text"
                                  value={loginOtpCode}
                                  onChange={(event) => {
                                    setLoginOtpCode(sanitizeOtpCode(event.target.value));
                                    setLoginError("");
                                  }}
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                      event.preventDefault();
                                      void onVerifyLoginCode();
                                    }
                                  }}
                                  className="h-11 border border-brand-line px-3 outline-none focus:border-brand-red"
                                  placeholder="Verification code"
                                  inputMode="numeric"
                                  autoComplete="one-time-code"
                                />
                              </label>
                            </>
                          ) : null}
                          <p className="text-xs font-semibold text-brand-gray">
                            Dev-only mock: use phone number {DEV_ONLY_MOCK_PHONE_NUMBER} and code {DEV_ONLY_MOCK_OTP_CODE}.
                          </p>
                        </>
                      ) : null}

                      {loginIdentifierType(loginIdentifier) === "email" ? (
                        <label className="grid gap-1 text-sm font-semibold text-brand-dark">
                          Password
                          <div className="relative">
                            <input
                              name="loginPassword"
                              type={showLoginPassword ? "text" : "password"}
                              value={loginPassword}
                              onChange={(event) => {
                                setLoginPassword(event.target.value);
                                setLoginError("");
                              }}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  void onCompleteEmailLogin();
                                }
                              }}
                              className="h-11 w-full border border-brand-line px-3 pr-11 outline-none focus:border-brand-red"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowLoginPassword((current) => !current)}
                              className="absolute right-0 top-0 inline-flex h-11 w-11 items-center justify-center text-brand-gray hover:text-brand-dark"
                              aria-label={showLoginPassword ? "Hide password" : "Show password"}
                            >
                              {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </label>
                      ) : null}

                      {loginInfo ? <p className="text-xs font-semibold text-[#166534]">{loginInfo}</p> : null}
                      {loginError ? <p className="text-sm font-semibold text-brand-red">{loginError}</p> : null}

                      <button
                        type="button"
                        onClick={() => void completeLogin()}
                        disabled={loginBusy}
                        className="mt-2 inline-flex h-11 items-center justify-center border border-brand-dark bg-brand-dark px-4 text-sm font-bold uppercase tracking-wide text-white hover:border-brand-red hover:bg-brand-red disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {loginIdentifierType(loginIdentifier) === "phone"
                          ? loginPhoneChallengeId
                            ? "Verify code"
                            : "Send code"
                          : "Continue"}
                      </button>
                      <SocialAuthButtons />
                    </div>
                  ) : null}

                  {authModalMode === "signup" && signupStep === "identifier" ? (
                    <div className="grid gap-3">
                      <div className="inline-flex w-full border border-brand-line p-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSignupIdentifierMode("phone");
                            setSignupIdentifier(composePhoneIdentifier(signupCountryCode, signupLocalPhone));
                            setSignupError("");
                            setSignupInfo("");
                          }}
                          className={`h-9 flex-1 text-xs font-bold uppercase tracking-wide ${
                            signupIdentifierMode === "phone" ? "bg-brand-dark text-white" : "text-brand-dark"
                          }`}
                        >
                          Phone
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSignupIdentifierMode("email");
                            setSignupIdentifier("");
                            setSignupError("");
                            setSignupInfo("");
                          }}
                          className={`h-9 flex-1 text-xs font-bold uppercase tracking-wide ${
                            signupIdentifierMode === "email" ? "bg-brand-dark text-white" : "text-brand-dark"
                          }`}
                        >
                          Email
                        </button>
                      </div>

                      {signupIdentifierMode === "phone" ? (
                        <label className="grid gap-1 text-sm font-semibold text-brand-dark">
                          Phone number
                          <div className="flex gap-2">
                            <div className="flex h-11 w-40 items-center border border-brand-line">
                              <select
                                value={signupCountryCode}
                                onChange={(event) => setSignupPhoneFromParts(event.target.value, signupLocalPhone)}
                                className="h-full w-16 border-r border-brand-line bg-white px-1 text-center text-base outline-none"
                                aria-label="Select country flag"
                              >
                                {COUNTRY_DIAL_CODES.map((item) => (
                                  <option key={`${item.name}-${item.code}`} value={item.code}>
                                    {item.flag}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="text"
                                value={signupCountryCode}
                                onChange={(event) => setSignupPhoneFromParts(event.target.value, signupLocalPhone)}
                                className="h-full w-full px-2 text-sm outline-none focus:text-brand-dark"
                                placeholder="+66"
                                aria-label="Area code"
                              />
                            </div>
                            <input
                              name="signupIdentifier"
                              type="text"
                              value={signupLocalPhone}
                              onChange={(event) => setSignupPhoneFromParts(signupCountryCode, event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  void onContinueSignupIdentifier();
                                }
                              }}
                              className="h-11 flex-1 border border-brand-line px-3 outline-none focus:border-brand-red"
                              placeholder="Enter phone number"
                              autoComplete="tel-national"
                              inputMode="tel"
                              required
                            />
                          </div>
                        </label>
                      ) : (
                        <label className="grid gap-1 text-sm font-semibold text-brand-dark">
                          Email address
                          <input
                            name="signupIdentifier"
                            type="email"
                            value={signupIdentifier}
                            onChange={(event) => {
                              setSignupIdentifier(sanitizeAuthIdentifier(event.target.value));
                              setSignupError("");
                              setSignupInfo("");
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                void onContinueSignupIdentifier();
                              }
                            }}
                            className="h-11 border border-brand-line px-3 outline-none focus:border-brand-red"
                            placeholder="Enter email address"
                            autoComplete="username"
                            required
                          />
                        </label>
                      )}
                      <p className="text-xs font-semibold text-brand-gray">
                        Dev-only mock phone auth: {DEV_ONLY_MOCK_PHONE_NUMBER} / {DEV_ONLY_MOCK_OTP_CODE}
                      </p>
                      {signupInfo ? <p className="text-xs font-semibold text-[#166534]">{signupInfo}</p> : null}
                      {signupError ? <p className="text-sm font-semibold text-brand-red">{signupError}</p> : null}
                      <button
                        type="button"
                        onClick={() => void onContinueSignupIdentifier()}
                        disabled={signupBusy}
                        className="mt-2 inline-flex h-11 items-center justify-center border border-brand-dark bg-brand-dark px-4 text-sm font-bold uppercase tracking-wide text-white hover:border-brand-red hover:bg-brand-red disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {signupIdentifierMode === "phone" ? "Send code" : "Continue"}
                      </button>
                      <SocialAuthButtons />
                    </div>
                  ) : null}

                  {authModalMode === "signup" && signupStep === "verifyPhone" ? (
                    <div className="grid gap-3">
                      <label className="grid gap-1 text-sm font-semibold text-brand-dark">
                        Phone number
                        <input
                          type="text"
                          value={signupIdentifier}
                          disabled
                          className="h-11 border border-brand-line bg-neutral-100 px-3 text-brand-gray"
                        />
                      </label>
                      <label className="grid gap-1 text-sm font-semibold text-brand-dark">
                        Verification code
                        <input
                          name="signupOtpCode"
                          type="text"
                          value={signupOtpCode}
                          onChange={(event) => {
                            setSignupOtpCode(sanitizeOtpCode(event.target.value));
                            setSignupError("");
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              void onVerifySignupPhoneCode();
                            }
                          }}
                          className="h-11 border border-brand-line px-3 outline-none focus:border-brand-red"
                          placeholder="Verification code"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                        />
                      </label>
                      {signupInfo ? <p className="text-xs font-semibold text-[#166534]">{signupInfo}</p> : null}
                      {signupError ? <p className="text-sm font-semibold text-brand-red">{signupError}</p> : null}
                      <button
                        type="button"
                        onClick={() => void onVerifySignupPhoneCode()}
                        disabled={signupBusy}
                        className="mt-2 inline-flex h-11 items-center justify-center border border-brand-dark bg-brand-dark px-4 text-sm font-bold uppercase tracking-wide text-white hover:border-brand-red hover:bg-brand-red disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        Verify code
                      </button>
                    </div>
                  ) : null}

                  {authModalMode === "signup" && signupStep === "profile" ? (
                    <div className="grid gap-3">
                      <div className="inline-flex items-center gap-2 text-sm text-brand-gray">
                        <User className="h-4 w-4" />
                        <span>{signupIdentifier}</span>
                      </div>
                      <label className="grid gap-1 text-sm font-semibold text-brand-dark">
                        Profile name
                        <input
                          name="signupProfileName"
                          type="text"
                          value={signupProfileName}
                          onChange={(event) => {
                            setSignupProfileName(event.target.value.replace(/[<>`]/g, "").slice(0, 24));
                            setSignupError("");
                          }}
                          className="h-11 border border-brand-line px-3 outline-none focus:border-brand-red"
                          placeholder={getDisplayNameFromIdentifier(signupIdentifier)}
                          autoComplete="name"
                        />
                      </label>
                      <label className="grid gap-1 text-sm font-semibold text-brand-dark">
                        Create password
                        <div className="relative">
                          <input
                            name="signupPassword"
                            type={showSignupPassword ? "text" : "password"}
                            value={signupPassword}
                            onChange={(event) => {
                              setSignupPassword(event.target.value);
                              setSignupError("");
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                onCompleteSignupProfile();
                              }
                            }}
                            className="h-11 w-full border border-brand-line px-3 pr-11 outline-none focus:border-brand-red"
                            autoComplete="new-password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignupPassword((current) => !current)}
                            className="absolute right-0 top-0 inline-flex h-11 w-11 items-center justify-center text-brand-gray hover:text-brand-dark"
                            aria-label={showSignupPassword ? "Hide password" : "Show password"}
                          >
                            {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </label>
                      <p className="text-xs text-brand-gray">Use at least 8 characters.</p>
                      {signupInfo ? <p className="text-xs font-semibold text-[#166534]">{signupInfo}</p> : null}
                      {signupError ? <p className="text-sm font-semibold text-brand-red">{signupError}</p> : null}
                      <button
                        type="button"
                        onClick={onCompleteSignupProfile}
                        className="mt-1 inline-flex h-11 items-center justify-center border border-brand-dark bg-brand-dark px-4 text-sm font-bold uppercase tracking-wide text-white hover:border-brand-red hover:bg-brand-red"
                      >
                        Create account
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
