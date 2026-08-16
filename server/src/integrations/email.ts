/**
 * Email Service Integration
 * Nodemailer wrapper for sending transactional emails
 */

import nodemailer from "nodemailer";
import { env } from "@/config/env.js";
import { logger } from "@/config/logger.js";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
});

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email via Nodemailer
 * Failures are logged but don't propagate to avoid breaking the calling request
 */
export async function sendMail({ to, subject, html }: SendMailOptions): Promise<void> {
  try {
    await transporter.sendMail({ from: env.MAIL_FROM, to, subject, html });
  } catch (err) {
    logger.error({ err, to, subject }, "Failed to send email");
  }
}

/**
 * Email verification template
 * @param name User's name
 * @param link Verification link
 */
export function verifyEmailTemplate(name: string, link: string): string {
  return `
    <p>Hi ${name},</p>
    <p>Please verify your email address by clicking the link below:</p>
    <p><a href="${link}">${link}</a></p>
    <p>This link expires in 24 hours.</p>
  `;
}

/**
 * Password reset template
 * @param name User's name
 * @param link Reset link
 */
export function resetPasswordTemplate(name: string, link: string): string {
  return `
    <p>Hi ${name},</p>
    <p>We received a request to reset your password. Click the link below to continue:</p>
    <p><a href="${link}">${link}</a></p>
    <p>If you didn't request this, you can safely ignore this email. This link expires in 1 hour.</p>
  `;
}
