import Stripe from "stripe";
import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);


export async function POST(req: Request) {
  try {
    const { applicationId, amount } = await req.json();

    if (!applicationId || !amount) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const amountInCents = Math.round(Number(amount) * 100);
    const appRef = adminDB.collection("applications").doc(applicationId);
    const appSnap = await appRef.get();

    if (!appSnap.exists) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const appData = appSnap.data() || {};

    if (appData.paymentIntentId) {
      try {
        const existingPi = await stripe.paymentIntents.retrieve(appData.paymentIntentId);
        if (
          existingPi.amount === amountInCents &&
          existingPi.status !== "succeeded" &&
          existingPi.status !== "canceled"
        ) {
          return NextResponse.json({
            clientSecret: existingPi.client_secret,
          });
        }
      } catch (e) {
        console.warn("Could not reuse existing payment intent:", e);
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      
      metadata: { applicationId },
    });

    await stripe.paymentIntents.update(paymentIntent.id, {
      description: `UAE Permit - ${paymentIntent.id}`,
    });

    await appRef.update({
      paymentIntentId: paymentIntent.id
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Stripe error" },
      { status: 500 }
    );
  }
}
