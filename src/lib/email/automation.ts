/**
 * Mail automation: account creation, order confirmation, in-process,
 * approval/rejection, unpaid reminders, passport/visa expiry, birthday,
 * status-based (Overstay, Absconding, Exit on time).
 *
 * Order confirmation & status updates (in-process, approval, rejection) are
 * handled by sendApplicationEmailsToMany and application-status API.
 * This module adds: account creation, unpaid reminder, passport/visa expiry,
 * birthday, and status-based emails (overstay, absconding, exit on time).
 */

import { mailTransporter, MAIL_FROM, SITE_URL } from "./mailer";

function esc(s: string) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function guardTransporter() {
  if (!mailTransporter) {
    console.warn("⚠️ Email skipped (SMTP not configured)");
    return false;
  }
  return true;
}

export async function sendAccountCreationEmail(args: {
  to: string;
  displayName: string;
  setPasswordUrl: string;
}) {
  if (!guardTransporter()) return;
  const { to, displayName, setPasswordUrl } = args;
  await mailTransporter!.sendMail({
    from: MAIL_FROM,
    to,
    subject: "Your visa application account has been created",
    text: `Hello ${displayName},\n\nAn account has been created for you. Set your password here: ${setPasswordUrl}\n\nYou can then log in at ${SITE_URL}/login and view your applications at ${SITE_URL}/account.\n\nBest regards,\nThe Visa Team`,
    html: `<p>Hello ${esc(displayName)},</p><p>An account has been created for you. <a href="${esc(setPasswordUrl)}">Set your password here</a>.</p><p>You can then log in at <a href="${SITE_URL}/login">${SITE_URL}/login</a> and view your applications at <a href="${SITE_URL}/account">${SITE_URL}/account</a>.</p><p>Best regards,<br/>The Visa Team</p>`,
  });
}

export async function sendUnpaidReminderEmail(args: {
  to: string;
  customerName: string;
  trackingId: string;
  amount?: number;
  currency?: string;
}) {
  if (!guardTransporter()) return;
  const { to, customerName, trackingId, amount, currency = "USD" } = args;
  const trackUrl = `${SITE_URL}/track?appId=${encodeURIComponent(trackingId)}`;
  const amountStr = amount != null ? `${currency} ${Number(amount).toFixed(2)}` : "";
  await mailTransporter!.sendMail({
    from: MAIL_FROM,
    to,
    subject: "Reminder: Complete your visa application payment",
    text: `Hello ${customerName},\n\nYour visa application (ID: ${trackingId}) is pending payment.${amountStr ? ` Amount: ${amountStr}.` : ""}\n\nComplete your payment here: ${trackUrl}\n\nBest regards,\nThe Visa Team`,
    html: `<p>Hello ${esc(customerName)},</p><p>Your visa application (ID: ${esc(trackingId)}) is pending payment.${amountStr ? ` Amount: <strong>${esc(amountStr)}</strong>.` : ""}</p><p><a href="${esc(trackUrl)}">Complete your payment here</a>.</p><p>Best regards,<br/>The Visa Team</p>`,
  });
}

export async function sendPassportExpiryReminderEmail(args: {
  to: string;
  name: string;
  passportExpiry: string;
}) {
  if (!guardTransporter()) return;
  const { to, name, passportExpiry } = args;
  await mailTransporter!.sendMail({
    from: MAIL_FROM,
    to,
    subject: "Passport expiry reminder",
    text: `Hello ${name},\n\nThis is a reminder that your passport expires on ${passportExpiry}. Please renew it in time for your travels.\n\nBest regards,\nThe Visa Team`,
    html: `<p>Hello ${esc(name)},</p><p>This is a reminder that your passport expires on <strong>${esc(passportExpiry)}</strong>. Please renew it in time for your travels.</p><p>Best regards,<br/>The Visa Team</p>`,
  });
}

export async function sendBirthdayEmail(args: { to: string; name: string }) {
  if (!guardTransporter()) return;
  const { to, name } = args;
  await mailTransporter!.sendMail({
    from: MAIL_FROM,
    to,
    subject: "Happy Birthday!",
    text: `Dear ${name},\n\nWishing you a very happy birthday! Thank you for choosing our visa services.\n\nBest regards,\nThe Visa Team`,
    html: `<p>Dear ${esc(name)},</p><p>Wishing you a very happy birthday! Thank you for choosing our visa services.</p><p>Best regards,<br/>The Visa Team</p>`,
  });
}

export async function sendVisaExpiryReminderEmail(args: {
  to: string;
  name: string;
  visaExpiry: string;
  trackingId?: string;
}) {
  if (!guardTransporter()) return;
  const { to, name, visaExpiry, trackingId } = args;
  const trackUrl = trackingId ? `${SITE_URL}/track?appId=${encodeURIComponent(trackingId)}` : SITE_URL;
  await mailTransporter!.sendMail({
    from: MAIL_FROM,
    to,
    subject: "Visa expiry reminder",
    text: `Hello ${name},\n\nYour visa expires on ${visaExpiry}. Please plan your travel or extension accordingly.\n\nTrack your application: ${trackUrl}\n\nBest regards,\nThe Visa Team`,
    html: `<p>Hello ${esc(name)},</p><p>Your visa expires on <strong>${esc(visaExpiry)}</strong>. Please plan your travel or extension accordingly.</p><p><a href="${esc(trackUrl)}">Track your application</a>.</p><p>Best regards,<br/>The Visa Team</p>`,
  });
}

export async function sendOverstayEmail(args: {
  to: string;
  name: string;
  details?: string;
}) {
  if (!guardTransporter()) return;
  const { to, name, details } = args;
  await mailTransporter!.sendMail({
    from: MAIL_FROM,
    to,
    subject: "Important: Overstay notice",
    text: `Hello ${name},\n\nThis email is regarding overstay status.${details ? `\n\nDetails: ${details}` : ""}\n\nPlease contact us or the relevant authorities for guidance.\n\nBest regards,\nThe Visa Team`,
    html: `<p>Hello ${esc(name)},</p><p>This email is regarding <strong>overstay</strong> status.</p>${details ? `<p>${esc(details)}</p>` : ""}<p>Please contact us or the relevant authorities for guidance.</p><p>Best regards,<br/>The Visa Team</p>`,
  });
}

export async function sendAbscondingEmail(args: {
  to: string;
  name: string;
  details?: string;
}) {
  if (!guardTransporter()) return;
  const { to, name, details } = args;
  await mailTransporter!.sendMail({
    from: MAIL_FROM,
    to,
    subject: "Important: Absconding status notice",
    text: `Hello ${name},\n\nThis email is regarding absconding status.${details ? `\n\nDetails: ${details}` : ""}\n\nPlease contact us or the relevant authorities for guidance.\n\nBest regards,\nThe Visa Team`,
    html: `<p>Hello ${esc(name)},</p><p>This email is regarding <strong>absconding</strong> status.</p>${details ? `<p>${esc(details)}</p>` : ""}<p>Please contact us or the relevant authorities for guidance.</p><p>Best regards,<br/>The Visa Team</p>`,
  });
}

export async function sendExitOnTimeEmail(args: {
  to: string;
  name: string;
  exitBy?: string;
  details?: string;
}) {
  if (!guardTransporter()) return;
  const { to, name, exitBy, details } = args;
  await mailTransporter!.sendMail({
    from: MAIL_FROM,
    to,
    subject: "Reminder: Exit on time",
    text: `Hello ${name},\n\nPlease ensure you exit before your visa expiry.${exitBy ? ` Exit by: ${exitBy}.` : ""}${details ? `\n\n${details}` : ""}\n\nBest regards,\nThe Visa Team`,
    html: `<p>Hello ${esc(name)},</p><p>Please ensure you <strong>exit on time</strong> before your visa expiry.${exitBy ? ` Exit by: <strong>${esc(exitBy)}</strong>.` : ""}</p>${details ? `<p>${esc(details)}</p>` : ""}<p>Best regards,<br/>The Visa Team</p>`,
  });
}
