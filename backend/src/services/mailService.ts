import nodemailer from "nodemailer";
import { env } from "../config/env";

export type MailMessage = { to: string; subject: string; text: string };
export type MailTransport = { send(message: MailMessage): Promise<void> };

export class SmtpMailTransport implements MailTransport {
  async send(message: MailMessage) {
    if (!env.SMTP_HOST || !env.SMTP_FROM) throw new Error("Mail transport is unavailable");
    if (Boolean(env.SMTP_USER) !== Boolean(env.SMTP_PASSWORD)) throw new Error("SMTP credentials are incomplete");
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      connectionTimeout: env.OUTBOUND_REQUEST_TIMEOUT_MS,
      greetingTimeout: env.OUTBOUND_REQUEST_TIMEOUT_MS,
      socketTimeout: env.OUTBOUND_REQUEST_TIMEOUT_MS,
      auth: env.SMTP_USER && env.SMTP_PASSWORD ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
    });
    await transporter.sendMail({ from: env.SMTP_FROM, to: message.to, subject: message.subject, text: message.text });
  }
}
let transport: MailTransport = new SmtpMailTransport();
export function setMailTransportForTests(next: MailTransport) { transport = next; }
export function resetMailTransportForTests() { transport = new SmtpMailTransport(); }
function actionUrl(path: string, token: string) { return `${env.PUBLIC_SITE_ORIGIN.replace(/\/+$/, "")}${path}?token=${encodeURIComponent(token)}`; }
export async function sendVerificationEmail(to: string, token: string) { await transport.send({ to, subject: "Verify your Buy Home For Less email", text: `Verify your email: ${actionUrl("/verify-email", token)}` }); }
export async function sendResetEmail(to: string, token: string) { await transport.send({ to, subject: "Reset your Buy Home For Less password", text: `Reset your password: ${actionUrl("/reset-password", token)}` }); }
export async function sendEmailChangeEmail(to: string, token: string) { await transport.send({ to, subject: "Confirm your new Buy Home For Less email", text: `Confirm your new email: ${actionUrl("/confirm-email-change", token)}` }); }
