// src/app/api/create-payment-intent/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {});


export async function POST(req: NextRequest) {
  try {
    const { amount, applicationId } = await req.json();

    if (!amount || !applicationId) {
      return NextResponse.json(
        { error: "Missing amount or applicationId" },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100), // in cents
      currency: "usd",
      metadata: { applicationId },
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err: any) {
    console.error("create-payment-intent error", err);
    return NextResponse.json(
      { error: err?.message || "Stripe error" },
      { status: 500 }
    );
  }
}
