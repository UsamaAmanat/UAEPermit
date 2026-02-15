// src/app/api/test-email/route.ts
import { NextResponse } from "next/server";
import { mailTransporter, MAIL_FROM, MAIL_ADMIN_TO, SITE_URL } from "@/lib/email/mailer";
import { buildCustomerApplicationReceivedEmail, buildAdminNewApplicationEmail } from "@/lib/email/templates";

export const runtime = "nodejs";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  const to = url.searchParams.get("to") || "usmanyousafali6@gmail.com";
  const type = url.searchParams.get("type") || "customer"; // customer | admin

  // ✅ control how many applicants to test
  const count = clamp(Number(url.searchParams.get("count") || 3), 1, 20);

  // ✅ allow overriding order id for testing
  const orderId = url.searchParams.get("orderId") || "pi_TEST_3QXxYzAbCdEfGhIjKlMnOpQr";

  // ✅ allow overriding tracking id for testing
  const trackingId = url.searchParams.get("trackingId") || "TRK-TEST-123";

  try {
    const applicationId = "TEST_APP_123";

    // generate applicants list
    const applicants = Array.from({ length: count }).map((_, i) => ({
      firstName: i === 0 ? "Abu" : "Applicant",
      lastName: i === 0 ? "Huraira" : `#${i + 1}`,
      email: i === 0 ? to : `applicant${i + 1}@example.com`,
      passportNumber: `A12345${String(100 + i)}`,
      nationality: i % 2 === 0 ? "Pakistan" : "India",
    }));

    const trackingUrlFull = `${SITE_URL.replace(/\/$/, "")}/track/${encodeURIComponent(trackingId)}`;

    // customer payload
    const customerPayload = {
      customerName: "Abu Huraira",
      customerEmail: to,
      paidAmount: 120,
      currency: "USD",

      // ✅ IMPORTANT: full track url WITH trackingId (so email can show tracking id + correct button)
      trackingUrl: trackingUrlFull,

      submittedAt: new Date(),
      orderId,

      applicants: applicants.map((a) => ({
        fullName: `${a.firstName} ${a.lastName}`.trim(),
        email: a.email,
        passportNumber: a.passportNumber,
        nationality: a.nationality,
      })),
    };

    // admin payload
    const adminPayload = {
      applicationId,
      paidAmount: 120,
      currency: "USD",
      submittedAt: new Date(),
      customerEmail: to,

      // you can override if you want:
      adminPanelUrl: `${SITE_URL.replace(/\/$/, "")}/admin/applications/${applicationId}`,

      orderId,

      applicants: applicants.map((a) => ({
        fullName: `${a.firstName} ${a.lastName}`.trim(),
        email: a.email,
        passportNumber: a.passportNumber,
        nationality: a.nationality,
      })),
    };

    const email =
      type === "admin"
        ? buildAdminNewApplicationEmail(adminPayload as any)
        : buildCustomerApplicationReceivedEmail(customerPayload as any);

    const info = await mailTransporter.sendMail({
      from: MAIL_FROM,
      to: type === "admin" ? (MAIL_ADMIN_TO || to) : to,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });

    return NextResponse.json({
      ok: true,
      messageId: info.messageId,
      type,
      count,
      orderId,
      trackingId,
      sentTo: type === "admin" ? (MAIL_ADMIN_TO || to) : to,
      preview: {
        applicationId,
        trackingUrl: trackingUrlFull,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || String(e), code: e?.code, response: e?.response },
      { status: 500 }
    );
  }
}
