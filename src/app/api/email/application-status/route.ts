// src/app/api/email/application-status/route.ts
import { NextResponse } from "next/server";
import { sendStatusUpdateEmailsToMany } from "@/lib/email/sendApplicationEmails";
import { SITE_URL } from "@/lib/email/mailer";

function safeStr(v: any) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      applicationId,
      trackingId,
      status,
      previousStatus,
      applicants, // can be ONE applicant object or MANY (array)
      visaFileUrl, // optional legacy (shared)
    } = body || {};

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: "Missing applicationId / status" },
        { status: 400 }
      );
    }

    const applicantArr = Array.isArray(applicants)
      ? applicants
      : applicants
        ? [applicants]
        : [];

    if (!applicantArr.length) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const trackId = safeStr(trackingId || applicationId);
    const trackingUrl = `${SITE_URL}/track?appId=${encodeURIComponent(trackId)}`;

    // ✅ detect per-applicant visa links
    const hasPerApplicantVisa = applicantArr.some((a: any) => {
      const perVisa =
        a?.visaFileUrl ||
        a?.visaFile?.url ||
        a?.visa_file?.url ||
        null;
      return !!safeStr(perVisa);
    });

    // ✅ CASE A: per-applicant visa exists -> send ONE email per applicant (separate links)
    if (hasPerApplicantVisa) {
      for (const a of applicantArr) {
        const email = safeStr(a?.email).trim();
        if (!email) continue;

        const perVisaUrl = safeStr(
          a?.visaFileUrl || a?.visaFile?.url || a?.visa_file?.url || visaFileUrl
        ).trim();

        const customerName = safeStr(a?.name || a?.fullName || "").trim() || "Customer";

        await sendStatusUpdateEmailsToMany({
          customerEmails: [email],
          customerName,
          applicants: [
            {
              fullName: safeStr(a?.name || a?.fullName) || "Applicant",
              email,
              passportNumber: a?.passportNumber,
              nationality: a?.nationality,
            },
          ],
          trackingUrl,
          status,
          previousStatus,
          submittedAt: new Date(),
          visaFileUrl: perVisaUrl || undefined, // ✅ unique per applicant
        });
      }

      return NextResponse.json({ ok: true, mode: "per-applicant", status, previousStatus });
    }

    // ✅ CASE B: no per-applicant visa -> batch send (same as your current behavior)
    const customerEmails = applicantArr
      .map((a: any) => safeStr(a?.email).trim())
      .filter(Boolean);

    if (!customerEmails.length) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const customerName =
      safeStr(applicantArr.find((a: any) => safeStr(a?.name).trim())?.name).trim() ||
      "Customer";

    await sendStatusUpdateEmailsToMany({
      customerEmails,
      customerName,
      applicants: applicantArr.map((a: any) => ({
        fullName: safeStr(a?.name || a?.fullName) || "Applicant",
        email: a?.email,
        passportNumber: a?.passportNumber,
        nationality: a?.nationality,
      })),
      trackingUrl,
      status,
      previousStatus,
      submittedAt: new Date(),
      visaFileUrl: safeStr(visaFileUrl).trim() || undefined,
    });

    return NextResponse.json({ ok: true, mode: "batch", status, previousStatus });
  } catch (e: any) {
    console.error("application-status email error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to send" },
      { status: 500 }
    );
  }
}
