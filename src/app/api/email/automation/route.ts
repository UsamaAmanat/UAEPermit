/**
 * POST /api/email/automation
 * Body: { type: "unpaid_reminder" | "passport_expiry" | "birthday" | "visa_expiry" | "overstay" | "absconding" | "exit_on_time", ...payload }
 * Use from cron or admin to send automated emails.
 */
import { NextResponse } from "next/server";
import {
  sendUnpaidReminderEmail,
  sendPassportExpiryReminderEmail,
  sendBirthdayEmail,
  sendVisaExpiryReminderEmail,
  sendOverstayEmail,
  sendAbscondingEmail,
  sendExitOnTimeEmail,
} from "@/lib/email/automation";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { type, ...payload } = body;

    if (!type || typeof type !== "string") {
      return NextResponse.json({ error: "Missing type" }, { status: 400 });
    }

    switch (type) {
      case "unpaid_reminder": {
        const { to, customerName, trackingId, amount, currency } = payload;
        if (!to || !trackingId) return NextResponse.json({ error: "Missing to, trackingId" }, { status: 400 });
        await sendUnpaidReminderEmail({ to, customerName: customerName || "Customer", trackingId, amount, currency });
        return NextResponse.json({ ok: true, type: "unpaid_reminder" });
      }
      case "passport_expiry": {
        const { to, name, passportExpiry } = payload;
        if (!to || !name || !passportExpiry) return NextResponse.json({ error: "Missing to, name, passportExpiry" }, { status: 400 });
        await sendPassportExpiryReminderEmail({ to, name, passportExpiry });
        return NextResponse.json({ ok: true, type: "passport_expiry" });
      }
      case "birthday": {
        const { to, name } = payload;
        if (!to || !name) return NextResponse.json({ error: "Missing to, name" }, { status: 400 });
        await sendBirthdayEmail({ to, name });
        return NextResponse.json({ ok: true, type: "birthday" });
      }
      case "visa_expiry": {
        const { to, name, visaExpiry, trackingId } = payload;
        if (!to || !name || !visaExpiry) return NextResponse.json({ error: "Missing to, name, visaExpiry" }, { status: 400 });
        await sendVisaExpiryReminderEmail({ to, name, visaExpiry, trackingId });
        return NextResponse.json({ ok: true, type: "visa_expiry" });
      }
      case "overstay": {
        const { to, name, details } = payload;
        if (!to || !name) return NextResponse.json({ error: "Missing to, name" }, { status: 400 });
        await sendOverstayEmail({ to, name, details });
        return NextResponse.json({ ok: true, type: "overstay" });
      }
      case "absconding": {
        const { to, name, details } = payload;
        if (!to || !name) return NextResponse.json({ error: "Missing to, name" }, { status: 400 });
        await sendAbscondingEmail({ to, name, details });
        return NextResponse.json({ ok: true, type: "absconding" });
      }
      case "exit_on_time": {
        const { to, name, exitBy, details } = payload;
        if (!to || !name) return NextResponse.json({ error: "Missing to, name" }, { status: 400 });
        await sendExitOnTimeEmail({ to, name, exitBy, details });
        return NextResponse.json({ ok: true, type: "exit_on_time" });
      }
      default:
        return NextResponse.json({ error: "Unknown type: " + type }, { status: 400 });
    }
  } catch (e: any) {
    console.error("automation email error:", e);
    return NextResponse.json({ error: e?.message || "Failed to send" }, { status: 500 });
  }
}
