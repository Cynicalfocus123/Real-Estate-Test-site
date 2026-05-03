import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  getAccountSettings,
  isValidPhoneNumber,
  mockChangeEmail,
  mockChangePassword,
  mockResetPassword,
  mockUpdateNotificationPreferences,
  mockVerifyEmail,
  sanitizeAddress,
  sanitizeName,
  sanitizePhone,
  sanitizeSettingsEmail,
  toSafeUserKey,
  updateProfileField,
} from "../services/accountSettingsService";
import { type AccountSettings, type EditableProfileField } from "../types/accountSettings";
import { requestAuthModal } from "../utils/authModal";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { isValidEmail, setMockUser, useMockAuth } from "../hooks/useMockAuth";

function isStrongPassword(password: string) {
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

const PROFILE_FIELD_LABELS: Record<Exclude<EditableProfileField, "email">, string> = {
  name: "Name",
  address: "Address",
  phone: "Phone Number",
};

const ADD_ACTION_TEXT: Record<Exclude<EditableProfileField, "email">, string> = {
  name: "Add name",
  address: "Add address",
  phone: "Add phone number",
};

type EditableProfileOnlyField = Exclude<EditableProfileField, "email">;

export function AccountSettingsPage() {
  const { mockUser, isSignedIn } = useMockAuth();
  const [activeUserKey, setActiveUserKey] = useState("");
  const [settings, setSettings] = useState<AccountSettings | null>(null);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [editingField, setEditingField] = useState<EditableProfileOnlyField | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [changeEmailDraft, setChangeEmailDraft] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fallbackEmail = useMemo(() => mockUser?.email ?? "", [mockUser?.email]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  useEffect(() => {
    if (!isSignedIn || !mockUser) {
      setActiveUserKey("");
      setSettings(null);
      return;
    }

    const userKey = toSafeUserKey(mockUser.email);
    setActiveUserKey(userKey);
    setSettings(getAccountSettings(userKey, mockUser.email));
  }, [isSignedIn, mockUser]);

  function cleanFieldValue(field: EditableProfileOnlyField, value: string) {
    if (field === "name") return sanitizeName(value);
    if (field === "address") return sanitizeAddress(value);
    return sanitizePhone(value);
  }

  function onStartEditingField(field: EditableProfileOnlyField) {
    if (!settings) return;
    setEditingField(field);
    setEditingValue(settings[field]);
    setProfileMessage("");
    setProfileError("");
  }

  function onCancelEditingField() {
    setEditingField(null);
    setEditingValue("");
    setProfileError("");
  }

  function onSaveProfileField() {
    if (!settings || !editingField || !activeUserKey) return;

    const sanitizedValue = cleanFieldValue(editingField, editingValue);

    if (editingField === "phone" && sanitizedValue && !isValidPhoneNumber(sanitizedValue)) {
      setProfileError("Please enter a valid phone number.");
      return;
    }

    const updated = updateProfileField(activeUserKey, editingField, sanitizedValue, settings.email);
    setSettings(updated);
    setEditingField(null);
    setEditingValue("");
    setProfileError("");
    setProfileMessage("Profile information saved.");
  }

  function onVerifyEmail() {
    if (!activeUserKey) return;
    setEmailMessage(mockVerifyEmail(activeUserKey));
    setEmailError("");
  }

  function onStartChangeEmail() {
    if (!settings) return;
    setIsChangingEmail(true);
    setChangeEmailDraft(settings.email);
    setEmailMessage("");
    setEmailError("");
  }

  function onCancelChangeEmail() {
    setIsChangingEmail(false);
    setChangeEmailDraft("");
    setEmailError("");
  }

  function onSaveChangeEmail() {
    if (!settings || !activeUserKey) return;

    const nextEmail = sanitizeSettingsEmail(changeEmailDraft);
    if (!isValidEmail(nextEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    const result = mockChangeEmail(activeUserKey, nextEmail, settings.email);
    if (!result.ok) {
      setEmailError(result.error);
      return;
    }

    const updatedAuth = setMockUser(nextEmail);
    if (!updatedAuth) {
      setEmailError("Unable to update account email.");
      return;
    }

    setActiveUserKey(result.userKey);
    setSettings(result.settings);
    setIsChangingEmail(false);
    setChangeEmailDraft("");
    setEmailError("");
    setEmailMessage("Email updated.");
  }

  function onStartChangePassword() {
    setIsChangingPassword(true);
    setPasswordMessage("");
    setPasswordError("");
  }

  function onCancelChangePassword() {
    setIsChangingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
  }

  function onSaveChangePassword() {
    if (!isStrongPassword(newPassword)) {
      setPasswordError("New password must have 8+ chars, uppercase, lowercase, number, and symbol.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Confirm new password must match.");
      return;
    }

    void currentPassword;

    setPasswordMessage(mockChangePassword());
    setPasswordError("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsChangingPassword(false);
  }

  function onResetPassword() {
    const email = settings?.email ?? fallbackEmail;
    setPasswordMessage(mockResetPassword(email));
    setPasswordError("");
  }

  function onSaveNotificationPreferences() {
    if (!settings || !activeUserKey) return;
    const updated = mockUpdateNotificationPreferences(
      activeUserKey,
      {
        savedListingsEmailFrequency: settings.savedListingsEmailFrequency,
        marketingUpdates: settings.marketingUpdates,
      },
      settings.email,
    );
    setSettings(updated);
    setNotificationMessage("Notification settings saved.");
  }

  if (!isSignedIn || !mockUser) {
    return (
      <div className="min-h-screen bg-[#f6f7f8] text-brand-dark">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
          <section className="mx-auto max-w-2xl rounded-3xl border border-brand-line bg-white p-7 text-center shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-10">
            <h1 className="text-3xl font-black text-brand-dark sm:text-4xl">Account Settings</h1>
            <p className="mt-4 text-base text-brand-gray sm:text-lg">
              Log in to manage your account settings.
            </p>
            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => requestAuthModal("login")}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-brand-line bg-white px-4 text-sm font-black uppercase tracking-wide text-brand-dark hover:border-brand-red hover:text-brand-red"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => requestAuthModal("signup")}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-brand-dark bg-brand-dark px-4 text-sm font-black uppercase tracking-wide text-white hover:border-brand-red hover:bg-brand-red"
              >
                Sign Up
              </button>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-[#f6f7f8] text-brand-dark">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
          <section className="mx-auto max-w-2xl rounded-3xl border border-brand-line bg-white p-7 text-center shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-10">
            <p className="text-base text-brand-gray">Loading account settings...</p>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f8] text-brand-dark">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8 lg:px-8 lg:py-12">
        <section className="rounded-3xl border border-brand-line bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-8">
          <h1 className="text-3xl font-black text-brand-dark sm:text-4xl">Account Settings</h1>
          <p className="mt-3 text-base leading-7 text-brand-gray sm:text-lg">
            Manage your profile, login details, and notification preferences.
          </p>
        </section>

        <section className="mt-6 rounded-3xl border border-brand-line bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-8">
          <h2 className="text-2xl font-black text-brand-dark">Profile Information</h2>
          <div className="mt-6 grid gap-5">
            {(Object.keys(PROFILE_FIELD_LABELS) as EditableProfileOnlyField[]).map((field) => {
              const value = settings[field];
              const isEditing = editingField === field;
              const addAction = ADD_ACTION_TEXT[field];
              const label = PROFILE_FIELD_LABELS[field];

              return (
                <div key={field} className="rounded-2xl border border-brand-line p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-wide text-brand-gray">{label}</p>
                      {isEditing ? (
                        <div className="mt-2 grid gap-2">
                          <label className="sr-only" htmlFor={`account-${field}`}>
                            {label}
                          </label>
                          <input
                            id={`account-${field}`}
                            value={editingValue}
                            onChange={(event) => {
                              setEditingValue(cleanFieldValue(field, event.target.value));
                              setProfileError("");
                            }}
                            maxLength={field === "name" ? 80 : field === "address" ? 200 : 30}
                            className="h-11 w-full rounded-xl border border-brand-line px-3 text-sm font-semibold outline-none focus:border-brand-red"
                          />
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={onSaveProfileField}
                              className="inline-flex h-10 items-center justify-center rounded-xl border border-brand-dark bg-brand-dark px-4 text-xs font-black uppercase tracking-wide text-white hover:border-brand-red hover:bg-brand-red"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={onCancelEditingField}
                              className="inline-flex h-10 items-center justify-center rounded-xl border border-brand-line bg-white px-4 text-xs font-black uppercase tracking-wide text-brand-dark hover:border-brand-red hover:text-brand-red"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : value ? (
                        <p className="mt-1 break-words text-sm font-semibold text-brand-dark">{value}</p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onStartEditingField(field)}
                          className="mt-2 text-sm font-black text-brand-red hover:text-brand-dark"
                        >
                          {addAction}
                        </button>
                      )}
                    </div>
                    {!isEditing && value ? (
                      <button
                        type="button"
                        onClick={() => onStartEditingField(field)}
                        className="text-xs font-black uppercase tracking-wide text-brand-red hover:text-brand-dark"
                      >
                        Edit
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}

            <div className="rounded-2xl border border-brand-line p-4">
              <p className="text-xs font-black uppercase tracking-wide text-brand-gray">Email</p>
              {!isChangingEmail ? (
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <p className="break-all text-sm font-semibold text-brand-dark">{settings.email || fallbackEmail}</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={onVerifyEmail}
                      className="inline-flex h-9 items-center justify-center rounded-xl border border-brand-line px-3 text-xs font-black uppercase tracking-wide text-brand-dark hover:border-brand-red hover:text-brand-red"
                    >
                      Verify email
                    </button>
                    <button
                      type="button"
                      onClick={onStartChangeEmail}
                      className="inline-flex h-9 items-center justify-center rounded-xl border border-brand-line px-3 text-xs font-black uppercase tracking-wide text-brand-dark hover:border-brand-red hover:text-brand-red"
                    >
                      Change email
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 grid gap-2">
                  <label htmlFor="change-email-input" className="text-xs font-semibold text-brand-gray">
                    New email
                  </label>
                  <input
                    id="change-email-input"
                    type="email"
                    value={changeEmailDraft}
                    onChange={(event) => {
                      setChangeEmailDraft(sanitizeSettingsEmail(event.target.value));
                      setEmailError("");
                    }}
                    maxLength={120}
                    className="h-11 rounded-xl border border-brand-line px-3 text-sm font-semibold outline-none focus:border-brand-red"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={onSaveChangeEmail}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-brand-dark bg-brand-dark px-4 text-xs font-black uppercase tracking-wide text-white hover:border-brand-red hover:bg-brand-red"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={onCancelChangeEmail}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-brand-line bg-white px-4 text-xs font-black uppercase tracking-wide text-brand-dark hover:border-brand-red hover:text-brand-red"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {profileMessage ? (
            <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#166534]">
              <CheckCircle2 className="h-4 w-4" />
              {profileMessage}
            </p>
          ) : null}
          {profileError ? <p className="mt-3 text-sm font-semibold text-brand-red">{profileError}</p> : null}
          {emailMessage ? (
            <p className="mt-3 text-sm font-semibold text-[#166534]">{emailMessage}</p>
          ) : null}
          {emailError ? <p className="mt-3 text-sm font-semibold text-brand-red">{emailError}</p> : null}
        </section>

        <section className="mt-6 rounded-3xl border border-brand-line bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-8">
          <h2 className="text-2xl font-black text-brand-dark">Password &amp; Security</h2>

          {!isChangingPassword ? (
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onStartChangePassword}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-brand-line bg-white px-4 text-xs font-black uppercase tracking-wide text-brand-dark hover:border-brand-red hover:text-brand-red"
              >
                Change password
              </button>
              <button
                type="button"
                onClick={onResetPassword}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-brand-line bg-white px-4 text-xs font-black uppercase tracking-wide text-brand-dark hover:border-brand-red hover:text-brand-red"
              >
                Reset password
              </button>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-brand-line p-4">
              <div className="grid gap-3">
                <label className="grid gap-1 text-sm font-semibold text-brand-dark">
                  Current password
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(event) => {
                      setCurrentPassword(event.target.value);
                      setPasswordError("");
                    }}
                    className="h-11 rounded-xl border border-brand-line px-3 outline-none focus:border-brand-red"
                  />
                </label>
                <label className="grid gap-1 text-sm font-semibold text-brand-dark">
                  New password
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) => {
                      setNewPassword(event.target.value);
                      setPasswordError("");
                    }}
                    className="h-11 rounded-xl border border-brand-line px-3 outline-none focus:border-brand-red"
                  />
                </label>
                <label className="grid gap-1 text-sm font-semibold text-brand-dark">
                  Confirm new password
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      setPasswordError("");
                    }}
                    className="h-11 rounded-xl border border-brand-line px-3 outline-none focus:border-brand-red"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onSaveChangePassword}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-brand-dark bg-brand-dark px-4 text-xs font-black uppercase tracking-wide text-white hover:border-brand-red hover:bg-brand-red"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={onCancelChangePassword}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-brand-line bg-white px-4 text-xs font-black uppercase tracking-wide text-brand-dark hover:border-brand-red hover:text-brand-red"
                  >
                    Cancel
                  </button>
                </div>
                <p className="inline-flex items-center gap-2 text-xs font-semibold text-brand-gray">
                  <ShieldCheck className="h-4 w-4" />
                  Password is never stored in browser settings.
                </p>
              </div>
            </div>
          )}

          {passwordMessage ? <p className="mt-4 text-sm font-semibold text-[#166534]">{passwordMessage}</p> : null}
          {passwordError ? <p className="mt-3 text-sm font-semibold text-brand-red">{passwordError}</p> : null}
        </section>

        <section className="mt-6 rounded-3xl border border-brand-line bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-8">
          <h2 className="text-2xl font-black text-brand-dark">Notification Settings</h2>

          <div className="mt-5 grid gap-6">
            <fieldset className="grid gap-3">
              <legend className="text-sm font-semibold text-brand-dark">
                Email me saved listings and searches
              </legend>
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-brand-dark">
                <input
                  type="radio"
                  name="saved-listings-frequency"
                  value="realtime"
                  checked={settings.savedListingsEmailFrequency === "realtime"}
                  onChange={() => {
                    setSettings((current) =>
                      current
                        ? {
                            ...current,
                            savedListingsEmailFrequency: "realtime",
                          }
                        : current,
                    );
                    setNotificationMessage("");
                  }}
                />
                In realtime
              </label>
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-brand-dark">
                <input
                  type="radio"
                  name="saved-listings-frequency"
                  value="daily"
                  checked={settings.savedListingsEmailFrequency === "daily"}
                  onChange={() => {
                    setSettings((current) =>
                      current
                        ? {
                            ...current,
                            savedListingsEmailFrequency: "daily",
                          }
                        : current,
                    );
                    setNotificationMessage("");
                  }}
                />
                Once a day
              </label>
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-brand-dark">
                <input
                  type="radio"
                  name="saved-listings-frequency"
                  value="none"
                  checked={settings.savedListingsEmailFrequency === "none"}
                  onChange={() => {
                    setSettings((current) =>
                      current
                        ? {
                            ...current,
                            savedListingsEmailFrequency: "none",
                          }
                        : current,
                    );
                    setNotificationMessage("");
                  }}
                />
                No, thanks
              </label>
            </fieldset>

            <fieldset className="grid gap-3">
              <legend className="text-sm font-semibold text-brand-dark">
                Send me real estate and moving related updates, tips, promos and news from Buy Home For Less.
              </legend>
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-brand-dark">
                <input
                  type="radio"
                  name="marketing-updates"
                  value="yes"
                  checked={settings.marketingUpdates === "yes"}
                  onChange={() => {
                    setSettings((current) =>
                      current
                        ? {
                            ...current,
                            marketingUpdates: "yes",
                          }
                        : current,
                    );
                    setNotificationMessage("");
                  }}
                />
                Yes
              </label>
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-brand-dark">
                <input
                  type="radio"
                  name="marketing-updates"
                  value="no"
                  checked={settings.marketingUpdates === "no"}
                  onChange={() => {
                    setSettings((current) =>
                      current
                        ? {
                            ...current,
                            marketingUpdates: "no",
                          }
                        : current,
                    );
                    setNotificationMessage("");
                  }}
                />
                No
              </label>
            </fieldset>
          </div>

          <button
            type="button"
            onClick={onSaveNotificationPreferences}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-brand-dark bg-brand-dark px-6 text-sm font-black uppercase tracking-wide text-white hover:border-brand-red hover:bg-brand-red"
          >
            Save Preferences
          </button>

          {notificationMessage ? (
            <p className="mt-3 text-sm font-semibold text-[#166534]">{notificationMessage}</p>
          ) : null}
        </section>
      </main>
      <Footer />
    </div>
  );
}
