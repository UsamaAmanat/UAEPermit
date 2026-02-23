import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getApplicationById, markApplicationPaidAndEmailed } from "@/lib/firestore/applications";
import { sendApplicationEmailsToMany } from "@/lib/email/sendApplicationEmails";
import { adminDB } from "@/lib/firebaseAdmin";
import { createUserFromApplicationIfRequested } from "@/lib/userFromApplication";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function uniqStrings(list: string[]) {
  return Array.from(
    new Set(list.map((s) => String(s || "").trim().toLowerCase()).filter(Boolean))
  );
}

function safeString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

// ─────────────────────────────────────────────────────────────
// ✅ Email idempotency lock (prevents duplicate sends)

async function claimEmailLock(applicationId: string, piId: string) {
  const ref = adminDB.collection("applications").doc(applicationId);

  const result = await adminDB.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return { ok: false as const, reason: "not_found" as const };

    const data: any = snap.data() || {};

    // ✅ already emailed -> skip forever
    if (data.emailSent === true) {
      return { ok: false as const, reason: "already_emailed" as const };
    }

    // ✅ already processed same PI -> skip forever
    if (data.paidStripePaymentIntentId && data.paidStripePaymentIntentId === piId) {
      return { ok: false as const, reason: "already_processed_pi" as const };
    }

    // ✅ lock handling (protects against concurrent webhook retries)
    const lock = data.emailLock || {};
    const lockedPi = lock.piId ? String(lock.piId) : "";
    const lockedAtMs = lock.at?.toMillis ? lock.at.toMillis() : 0;

    // same PI already locked => duplicate delivery
    if (lockedPi && lockedPi === piId) {
      return { ok: false as const, reason: "already_locked_same_pi" as const };
    }

    // different PI locked recently => avoid parallel sending
    const now = Date.now();
    const LOCK_TTL_MS = 10 * 60 * 1000; // 10 min
    if (lockedPi && lockedAtMs && now - lockedAtMs < LOCK_TTL_MS) {
      return { ok: false as const, reason: "locked_recently" as const };
    }

    // ✅ claim lock
    tx.set(
      ref,
      {
        emailLock: {
          piId,
          at: FieldValue.serverTimestamp(),
        },
      },
      { merge: true }
    );

    return { ok: true as const };
  });

  return result;
}

async function clearEmailLock(applicationId: string) {
  const ref = adminDB.collection("applications").doc(applicationId);
  await ref.set({ emailLock: FieldValue.delete() }, { merge: true });
}

// Optional: store PI on app even if markApplicationPaidAndEmailed doesn't.
async function stampProcessedPI(applicationId: string, piId: string) {
  const ref = adminDB.collection("applications").doc(applicationId);
  await ref.set(
    {
      paidStripePaymentIntentId: piId,
      emailSent: true,
      emailLock: FieldValue.delete(),
    },
    { merge: true }
  );
}

// ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const startedAt = Date.now();
  console.log("✅ WEBHOOK HIT:", new Date().toISOString());

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    console.log("❌ Missing stripe-signature header");
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.log("❌ Missing STRIPE_WEBHOOK_SECRET env");
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    console.log("✅ Signature verified. Event:", event.type, event.id);
  } catch (err: any) {
    console.error("❌ Signature verify failed:", err?.message || err);
    return NextResponse.json({ error: "Webhook signature verify failed" }, { status: 400 });
  }

  try {
    // ✅ only process this event
    if (event.type !== "payment_intent.succeeded") {
      console.log("ℹ️ Ignored event type:", event.type);
      return NextResponse.json({ received: true, ignored: event.type });
    }

    const pi = event.data.object as Stripe.PaymentIntent;
    console.log("✅ PI succeeded:", pi.id);

    const applicationId = safeString(pi.metadata?.applicationId);
    console.log("📌 applicationId from metadata:", applicationId || "(missing)");

    if (!applicationId) {
      return NextResponse.json({ received: true, skipped: "missing_applicationId" });
    }

    console.log("🔎 Fetching Firestore application...");
    const app = await getApplicationById(applicationId);

    if (!app) {
      console.log("❌ Application not found:", applicationId);
      return NextResponse.json({ received: true, skipped: "app_not_found" });
    }

    // ✅ claim lock FIRST (prevents 2x/3x emails)
    const lock = await claimEmailLock(applicationId, pi.id);
    if (!lock.ok) {
      console.log("ℹ️ Duplicate prevented by lock:", lock.reason);
      return NextResponse.json({ received: true, skipped: lock.reason });
    }

    const applicants = Array.isArray(app.applicants) ? app.applicants : [];
    console.log("👤 applicants count:", applicants.length);

    const applicantEmails = applicants
      .map((a: any) => String(a?.email || "").trim())
      .filter(Boolean);

    const uniqueEmails = uniqStrings(applicantEmails);
    console.log("📧 uniqueEmails:", uniqueEmails);

    const paidAmount =
      typeof pi.amount_received === "number" ? pi.amount_received / 100 : undefined;
    const paidCurrency = pi.currency ? pi.currency.toUpperCase() : "USD";

    // If no emails, still mark paid; also clear lock
    if (uniqueEmails.length === 0) {
      console.log("⚠️ No customer emails. Marking paid but skipping email.");

      await markApplicationPaidAndEmailed(applicationId, {
        stripeSessionId: pi.id,
        totalPaid: paidAmount,
        currency: paidCurrency,
        orderId: pi.id,
      });

      if (typeof paidAmount === "number" && paidAmount > 0) {
        try {
          await adminDB.doc("settings/stats").set(
            { totalRevenue: FieldValue.increment(paidAmount), updatedAt: FieldValue.serverTimestamp() },
            { merge: true }
          );
        } catch (e) {
          console.warn("Revenue stats update failed:", e);
        }
      }

      await clearEmailLock(applicationId);

      return NextResponse.json({ received: true, skipped: "no_customer_emails" });
    }

    try {
      console.log("🚀 Sending emails now...");
      await sendApplicationEmailsToMany({
        applicationId,
        trackingId: app.trackingId || applicationId,
        customerEmails: uniqueEmails,
        customerName:
          (applicants?.[0]?.firstName
            ? `${applicants?.[0]?.firstName} ${applicants?.[0]?.lastName || ""}`.trim()
            : "") || undefined,
        applicants: applicants.map((a: any) => ({
          firstName: a?.firstName,
          lastName: a?.lastName,
          passportNumber: a?.passportNumber,
          nationality: a?.nationality,
          email: a?.email,
        })),
        totalPaid: paidAmount,
        currency: paidCurrency,

        // better: "paid" (then admin can move to processing)
        status: "paid",
        orderId: pi.id,
      });

      console.log("✅ Emails sent. Marking paid+emailed in Firestore...");

      await markApplicationPaidAndEmailed(applicationId, {
        stripeSessionId: pi.id,
        totalPaid: paidAmount,
        currency: paidCurrency,
        orderId: pi.id,
      });

      if (typeof paidAmount === "number" && paidAmount > 0) {
        try {
          await adminDB.doc("settings/stats").set(
            { totalRevenue: FieldValue.increment(paidAmount), updatedAt: FieldValue.serverTimestamp() },
            { merge: true }
          );
        } catch (e) {
          console.warn("Revenue stats update failed:", e);
        }
      }

      await stampProcessedPI(applicationId, pi.id);

      // ✅ Optional: create user account if customer chose "Create account" at checkout
      try {
        const accountResult = await createUserFromApplicationIfRequested(applicationId);
        if (accountResult.created) console.log("✅ User account created for:", applicationId);
      } catch (accountErr: any) {
        console.warn("Account creation skipped or failed:", accountErr?.message);
      }

      console.log("✅ Done. Took:", Date.now() - startedAt, "ms");
      return NextResponse.json({ received: true, emailedTo: uniqueEmails.length });
    } catch (err: any) {
      console.error("❌ Email send failed, clearing lock:", err?.message || err);
      await clearEmailLock(applicationId); // allow retry
      throw err;
    }
  } catch (err: any) {
    console.error("❌ Webhook handler error:", err?.message || err);
    return NextResponse.json(
      { error: "Webhook handler failed", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
