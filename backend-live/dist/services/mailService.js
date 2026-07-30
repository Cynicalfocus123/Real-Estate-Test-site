"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setMailTransportForTests = setMailTransportForTests;
exports.sendVerificationEmail = sendVerificationEmail;
exports.sendResetEmail = sendResetEmail;
class SmtpMailTransport {
    async send(_message) {
        // Deliberately provider-neutral: production must inject/configure a real SMTP adapter.
        if (!process.env.SMTP_HOST || !process.env.SMTP_FROM)
            throw new Error("Mail transport is unavailable");
        throw new Error("SMTP adapter is not configured");
    }
}
let transport = new SmtpMailTransport();
function setMailTransportForTests(next) { transport = next; }
async function sendVerificationEmail(to, token) { await transport.send({ to, subject: "Verify your Buy Home For Less email", text: `Verification token: ${token}` }); }
async function sendResetEmail(to, token) { await transport.send({ to, subject: "Reset your Buy Home For Less password", text: `Password reset token: ${token}` }); }
