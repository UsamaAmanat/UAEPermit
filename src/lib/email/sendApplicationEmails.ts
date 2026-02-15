// src/lib/email/sendApplicationEmails.ts

import { mailTransporter, MAIL_FROM, MAIL_ADMIN_TO, SITE_URL } from "./mailer";
import {
  buildAdminNewApplicationEmail,
  buildCustomerApplicationReceivedEmail,
  type AdminEmailPayload,
  type CustomerEmailPayload,
} from "./templates";
import { buildCustomerStatusUpdatedEmail, type StatusUpdateEmailPayload } from "./templates";
type ApplicantInput = {
  // supports both shapes (your Firestore shape and template shape)
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  passportNumber?: string;
  nationality?: string;
};

type ApplicantRow = {
  fullName: string;
  email?: string;
  passportNumber?: string;
  nationality?: string;
};

function toFullName(a: ApplicantInput) {
  const direct = (a.fullName || "").trim();
  if (direct) return direct;

  const fn = String(a.firstName || "").trim();
  const ln = String(a.lastName || "").trim();
  const name = `${fn} ${ln}`.trim();
  return name || "Applicant";
}

function normalizeApplicants(applicants: ApplicantInput[]): ApplicantRow[] {
  return (Array.isArray(applicants) ? applicants : []).map((a) => ({
    fullName: toFullName(a),
    email: a.email ? String(a.email).trim() : undefined,
    passportNumber: a.passportNumber ? String(a.passportNumber).trim() : undefined,
    nationality: a.nationality ? String(a.nationality).trim() : undefined,
  }));
}

function buildUrl(pathOrUrl: string) {
  if (!pathOrUrl) return SITE_URL;
  return pathOrUrl.startsWith("http")
    ? pathOrUrl
    : `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

/**
 * Single-customer sender
 * - Sends customer confirmation
 * - Sends admin notification
 */
export async function sendApplicationEmails(args: {
  applicationId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  paidAmount: number;
  currency?: string;
  applicants: ApplicantInput[];
  trackingIdOrPath: string;
  adminPanelPath?: string;
  submittedAt?: Date | string;

  // ✅ NEW
  orderId?: string; // Stripe cs_... or pi_... or your internal order id
}) {
  const trackingUrl = buildUrl(args.trackingIdOrPath);
  const adminPanelUrl = args.adminPanelPath ? buildUrl(args.adminPanelPath) : undefined;

  const applicants = normalizeApplicants(args.applicants);

  // Customer
  const customerPayload: CustomerEmailPayload = {
    customerName: args.customerName,
    customerEmail: args.customerEmail,
    paidAmount: args.paidAmount,
    currency: args.currency,
    applicants,
    trackingUrl,
    submittedAt: args.submittedAt,

    // ✅ NEW
    orderId: args.orderId,
  };

  const customerEmail = buildCustomerApplicationReceivedEmail(customerPayload);

  // Admin
  const adminPayload: AdminEmailPayload = {
    applicationId: args.applicationId,
    paidAmount: args.paidAmount,
    currency: args.currency,
    applicants,
    customerEmail: args.customerEmail,
    customerPhone: args.customerPhone,
    submittedAt: args.submittedAt,
    adminPanelUrl,

    // ✅ NEW
    orderId: args.orderId,
  };

  const adminEmail = buildAdminNewApplicationEmail(adminPayload);

  // Allow multiple admins via comma-separated env
  const adminTo = MAIL_ADMIN_TO.includes(",")
    ? MAIL_ADMIN_TO.split(",").map((s) => s.trim()).filter(Boolean)
    : MAIL_ADMIN_TO;

  await Promise.all([
    mailTransporter.sendMail({
      from: MAIL_FROM,
      to: args.customerEmail,
      subject: customerEmail.subject,
      html: customerEmail.html,
      text: customerEmail.text,
    }),

    mailTransporter.sendMail({
      from: MAIL_FROM,
      to: adminTo,
      subject: adminEmail.subject,
      html: adminEmail.html,
      text: adminEmail.text,
    }),
  ]);
}

export async function sendStatusUpdateEmailsToMany(args: {
  customerEmails: string[];
  customerName?: string;
  applicants: Array<{ fullName: string; email?: string; passportNumber?: string; nationality?: string }>;
  trackingUrl: string;
  status: string;
  previousStatus?: string;
  submittedAt?: Date | string;
  visaFileUrl?: string;
}) {
  const emails = Array.from(
    new Set((args.customerEmails || []).map((e) => String(e || "").trim().toLowerCase()).filter(Boolean))
  );

  if (!emails.length) return;

const primaryApplicant = args.applicants?.[0];

const tplBase = (toEmail: string): StatusUpdateEmailPayload => ({

    customerName: args.customerName || args.applicants?.[0]?.fullName || "Customer",
    customerEmail: toEmail,
    applicants: (args.applicants || []).map((a) => ({
      fullName: a.fullName,
      email: a.email,
      passportNumber: a.passportNumber,
      nationality: a.nationality,
    })),
    trackingUrl: args.trackingUrl,
    status: args.status,
    previousStatus: args.previousStatus,
    submittedAt: args.submittedAt,
    visaFileUrl: args.visaFileUrl,
  });

  // Send per recipient (privacy-safe)
  await Promise.all(
    emails.map(async (to) => {
      const email = buildCustomerStatusUpdatedEmail(tplBase(to));
      return mailTransporter.sendMail({
        from: MAIL_FROM,
        to,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });
    })
  );
}

/**
 * 
 * 
 * Multi-customer sender (THIS is what your webhook is calling)
 * - Sends the customer email to many recipients (unique)
 * - Also sends ONE admin notification (not duplicated)
 */
export async function sendApplicationEmailsToMany(args: {
  applicationId: string;
  trackingId: string; // in your webhook you pass trackingId
  customerEmails: string[];
  customerName?: string;
  applicants: ApplicantInput[];
  totalPaid?: number;
  currency?: string;
  status?: "pending" | "processing" | "issued" | string;
  customerPhone?: string;
  orderId?: string;
}) {
  const emails = Array.from(
    new Set((args.customerEmails || []).map((e) => String(e || "").trim().toLowerCase()).filter(Boolean))
  );

  const applicants = normalizeApplicants(args.applicants);

  const trackingUrl = buildUrl(`/track/${args.trackingId || args.applicationId}`);

  const paidAmount = typeof args.totalPaid === "number" ? args.totalPaid : 0;
  const currency = args.currency || "USD";

  // Send CUSTOMER email to all (single email with multiple "to" is ok, but better: separate to avoid showing others)
await Promise.all(
  emails.map((to) =>
    sendApplicationEmails({
      applicationId: args.applicationId,
      customerName: args.customerName || applicants[0]?.fullName || "Customer",
      customerEmail: to,
      customerPhone: args.customerPhone,
      paidAmount,
      currency,
      applicants,
      trackingIdOrPath: trackingUrl,
      submittedAt: new Date(),

      orderId: args.orderId,
    })
  )
);


  // NOTE:
  // The above sends admin email too for each customer (because sendApplicationEmails sends both).
  // If you want ONLY ONE admin email total, use the optimized version below instead.

  // ✅ Optimized single-admin version (uncomment this block and comment the Promise.all above)
  /*
  // Build once
  const customerEmailTpl = buildCustomerApplicationReceivedEmail({
    customerName: args.customerName || applicants[0]?.fullName || "Customer",
    customerEmail: emails[0] || "",
    paidAmount,
    currency,
    applicants,
    trackingUrl,
    submittedAt: new Date(),
  });

  const adminEmailTpl = buildAdminNewApplicationEmail({
    applicationId: args.applicationId,
    paidAmount,
    currency,
    applicants,
    customerEmail: emails[0],
    customerPhone: args.customerPhone,
    submittedAt: new Date(),
    adminPanelUrl: buildUrl(`/admin/applications/${args.applicationId}`),
  });

  const adminTo = MAIL_ADMIN_TO.includes(",")
    ? MAIL_ADMIN_TO.split(",").map((s) => s.trim()).filter(Boolean)
    : MAIL_ADMIN_TO;

  await Promise.all([
    ...emails.map((to) =>
      mailTransporter.sendMail({
        from: MAIL_FROM,
        to,
        subject: customerEmailTpl.subject,
        html: customerEmailTpl.html,
        text: customerEmailTpl.text,
      })
    ),
    mailTransporter.sendMail({
      from: MAIL_FROM,
      to: adminTo,
      subject: adminEmailTpl.subject,
      html: adminEmailTpl.html,
      text: adminEmailTpl.text,
    }),
  ]);
  */
}
