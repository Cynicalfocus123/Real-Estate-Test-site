import { useState } from "react";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { customerAuthApi } from "../services/customerAuthService";
import { safeHref } from "../utils/security";

const strong = (value: string) => value.length >= 12 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value);
export function CustomerAuthActionPage({ action }: { action: "verify" | "reset" | "confirm-email-change" }) {
  const token = new URLSearchParams(window.location.search).get("token") ?? "";
  const [password, setPassword] = useState(""); const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const isReset = action === "reset";
  const title = action === "verify" ? "Verify your email" : isReset ? "Choose a new password" : "Confirm your new email";
  async function submit() {
    setError(""); setMessage("");
    if (!token) { setError("This link is invalid or incomplete."); return; }
    if (isReset && !strong(password)) { setError("Use 12+ characters with uppercase, lowercase, a number, and a symbol."); return; }
    setBusy(true);
    try {
      if (action === "verify") await customerAuthApi.verifyEmail(token);
      else if (isReset) await customerAuthApi.resetPassword(token, password);
      else await customerAuthApi.confirmEmailChange(token);
      setMessage(action === "verify" ? "Your email is verified. You can now sign in." : isReset ? "Your password has been reset. You can now sign in." : "Your email address has been changed. Please sign in again.");
    } catch { setError("This link is invalid, expired, or has already been used."); } finally { setBusy(false); }
  }
  return <div className="min-h-screen bg-[#f6f7f8]"><Header /><main className="mx-auto max-w-lg p-4 py-16"><section className="bg-white p-8 shadow-sm"><p className="text-xs font-bold uppercase text-brand-red">Buy Home For Less</p><h1 className="mt-2 text-3xl font-black">{title}</h1><p className="mt-3 text-brand-gray">{isReset ? "Enter a strong new password to regain access to your account." : "Use the secure link from your email to complete this request."}</p>{message ? <><p role="status" className="mt-5 text-green-700">{message}</p><a href={safeHref(import.meta.env.BASE_URL)} className="mt-6 inline-block bg-brand-dark px-5 py-3 font-bold text-white">Return home</a></> : <form className="mt-6 grid gap-4" onSubmit={(event) => { event.preventDefault(); void submit(); }}>{isReset ? <label className="grid gap-1 text-sm font-semibold">New password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" className="h-11 border border-brand-line px-3" required /></label> : null}{error ? <p role="alert" className="text-brand-red">{error}</p> : null}<button disabled={busy} className="bg-brand-dark px-5 py-3 font-bold text-white disabled:opacity-60">{busy ? "Please wait" : action === "verify" ? "Verify email" : isReset ? "Reset password" : "Confirm email change"}</button></form>}</section></main><Footer /></div>;
}
