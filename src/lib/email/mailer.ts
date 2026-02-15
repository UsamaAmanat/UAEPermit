// src/lib/email/mailer.ts
import nodemailer from "nodemailer";

function required(name: string, v?: string) {
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

const SMTP_HOST = required("SMTP_HOST", process.env.SMTP_HOST);
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = required("SMTP_USER", process.env.SMTP_USER);
const SMTP_PASS = required("SMTP_PASS", process.env.SMTP_PASS);

// If port is 465 -> secure true. Otherwise -> secure false (STARTTLS).
const SMTP_SECURE =
  process.env.SMTP_SECURE != null
    ? String(process.env.SMTP_SECURE).toLowerCase() === "true"
    : SMTP_PORT === 465;

export const mailTransporter = nodemailer.createTransport({
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
});

export const MAIL_FROM = required("MAIL_FROM", process.env.MAIL_FROM);
export const MAIL_ADMIN_TO = required("MAIL_ADMIN_TO", process.env.MAIL_ADMIN_TO);
export const SITE_URL = required("NEXT_PUBLIC_SITE_URL", process.env.NEXT_PUBLIC_SITE_URL);
