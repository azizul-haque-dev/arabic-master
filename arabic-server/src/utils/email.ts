// Thin wrapper around nodemailer. All transactional emails (verify,
// reset password) go through here so the transport is configured once.
import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: env.SMTP_USER
    ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
    : undefined,
});

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({
  to,
  subject,
  html,
}: SendMailOptions): Promise<void> {
  try {
    await transporter.sendMail({ from: env.MAIL_FROM, to, subject, html });
  } catch (err) {
    // Email failures shouldn't take down the request that triggered them
    // (e.g. registration should still succeed) - just log it.
    logger.error({ err, to, subject }, "Failed to send email");
  }
}

export function verifyEmailTemplate(name: string, link: string): string {
  return `
    <p>Hi ${name},</p>
    <p>Please verify your email address by clicking the link below:</p>
    <p><a href="${link}">${link}</a></p>
    <p>This link expires in 24 hours.</p>
  `;
}

export function resetPasswordTemplate(name: string, link: string): string {
  return `
    <p>Hi ${name},</p>
    <p>We received a request to reset your password. Click the link below to continue:</p>
    <p><a href="${link}">${link}</a></p>
    <p>If you didn't request this, you can safely ignore this email. This link expires in 1 hour.</p>
  `;
}
