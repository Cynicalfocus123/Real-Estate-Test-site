export type MailMessage = { to: string; subject: string; text: string };
export type MailTransport = { send(message: MailMessage): Promise<void> };

class SmtpMailTransport implements MailTransport {
  async send(_message: MailMessage) {
    // Deliberately provider-neutral: production must inject/configure a real SMTP adapter.
    if (!process.env.SMTP_HOST || !process.env.SMTP_FROM) throw new Error("Mail transport is unavailable");
    throw new Error("SMTP adapter is not configured");
  }
}
let transport: MailTransport = new SmtpMailTransport();
export function setMailTransportForTests(next: MailTransport) { transport = next; }
export async function sendVerificationEmail(to: string, token: string) { await transport.send({ to, subject: "Verify your Buy Home For Less email", text: `Verification token: ${token}` }); }
export async function sendResetEmail(to: string, token: string) { await transport.send({ to, subject: "Reset your Buy Home For Less password", text: `Password reset token: ${token}` }); }
