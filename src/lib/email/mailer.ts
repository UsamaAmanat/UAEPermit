// src/lib/email/mailer.ts
import nodemailer from "nodemailer";

function optional(name: string, v?: string) {
  return v || "";
}

const SMTP_HOST = optional("SMTP_HOST", process.env.SMTP_HOST);
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = optional("SMTP_USER", process.env.SMTP_USER);
const SMTP_PASS = optional("SMTP_PASS", process.env.SMTP_PASS);

// If port is 465 -> secure true. Otherwise -> secure false (STARTTLS).
const SMTP_SECURE =
  process.env.SMTP_SECURE != null
    ? String(process.env.SMTP_SECURE).toLowerCase() === "true"
    : SMTP_PORT === 465;

const isConfigured = !!(SMTP_HOST && SMTP_USER && SMTP_PASS);

export const mailTransporter = isConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      // STARTTLS tuning only for 587/STARTTLS
      ...(SMTP_SECURE
        ? {}
        : {
            requireTLS: true,
            tls: { minVersion: "TLSv1.2" as const },
          }),
    })
  : null;

if (!isConfigured) {
  console.warn(
    "⚠️  SMTP not configured (missing SMTP_HOST, SMTP_USER, or SMTP_PASS). Emails will be skipped."
  );
}

export const MAIL_FROM = process.env.MAIL_FROM || "noreply@uaepermit.com";
export const MAIL_ADMIN_TO = process.env.MAIL_ADMIN_TO || "";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://uaepermit.com";
