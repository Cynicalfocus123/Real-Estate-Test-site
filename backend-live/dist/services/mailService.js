"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmtpMailTransport = void 0;
exports.isMailConfigured = isMailConfigured;
exports.setMailTransportForTests = setMailTransportForTests;
exports.setAdminNotificationEmailForTests = setAdminNotificationEmailForTests;
exports.resetMailTransportForTests = resetMailTransportForTests;
exports.sendVerificationEmail = sendVerificationEmail;
exports.sendResetEmail = sendResetEmail;
exports.sendEmailChangeEmail = sendEmailChangeEmail;
exports.sendRegistrationNotification = sendRegistrationNotification;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
function isMailConfigured() {
    return Boolean(env_1.env.SMTP_HOST && env_1.env.SMTP_FROM && Boolean(env_1.env.SMTP_USER) === Boolean(env_1.env.SMTP_PASSWORD));
}
class SmtpMailTransport {
    async send(message) {
        if (!env_1.env.SMTP_HOST || !env_1.env.SMTP_FROM)
            throw new Error("Mail transport is unavailable");
        if (Boolean(env_1.env.SMTP_USER) !== Boolean(env_1.env.SMTP_PASSWORD))
            throw new Error("SMTP credentials are incomplete");
        const transporter = nodemailer_1.default.createTransport({
            host: env_1.env.SMTP_HOST,
            port: env_1.env.SMTP_PORT,
            secure: env_1.env.SMTP_SECURE,
            connectionTimeout: env_1.env.OUTBOUND_REQUEST_TIMEOUT_MS,
            greetingTimeout: env_1.env.OUTBOUND_REQUEST_TIMEOUT_MS,
            socketTimeout: env_1.env.OUTBOUND_REQUEST_TIMEOUT_MS,
            auth: env_1.env.SMTP_USER && env_1.env.SMTP_PASSWORD ? { user: env_1.env.SMTP_USER, pass: env_1.env.SMTP_PASSWORD } : undefined,
        });
        await transporter.sendMail({ from: env_1.env.SMTP_FROM, to: message.to, subject: message.subject, text: message.text });
    }
}
exports.SmtpMailTransport = SmtpMailTransport;
let transport = new SmtpMailTransport();
let adminNotificationEmailForTests;
function setMailTransportForTests(next) { transport = next; }
function setAdminNotificationEmailForTests(next) { adminNotificationEmailForTests = next; }
function resetMailTransportForTests() { transport = new SmtpMailTransport(); adminNotificationEmailForTests = undefined; }
function actionUrl(path, token) { return `${env_1.env.PUBLIC_SITE_ORIGIN.replace(/\/+$/, "")}${path}?token=${encodeURIComponent(token)}`; }
async function sendVerificationEmail(to, token) { await transport.send({ to, subject: "Verify your Buy Home For Less email", text: `Verify your email: ${actionUrl("/verify-email", token)}` }); }
async function sendResetEmail(to, token) { await transport.send({ to, subject: "Reset your Buy Home For Less password", text: `Reset your password: ${actionUrl("/reset-password", token)}` }); }
async function sendEmailChangeEmail(to, token) { await transport.send({ to, subject: "Confirm your new Buy Home For Less email", text: `Confirm your new email: ${actionUrl("/confirm-email-change", token)}` }); }
async function sendRegistrationNotification(customer) {
    const adminEmail = adminNotificationEmailForTests ?? env_1.env.ADMIN_NOTIFICATION_EMAIL;
    if (!adminEmail)
        return;
    await transport.send({
        to: adminEmail,
        subject: "New Buy Home For Less customer registration",
        text: `Customer: ${customer.firstName} ${customer.lastName}\nEmail: ${customer.email}\nRegistered: ${customer.registeredAt}\nStatus: ${customer.status}\nAdmin: ${env_1.env.PUBLIC_SITE_ORIGIN.replace(/\/+$/, "")}/admin`,
    });
}
