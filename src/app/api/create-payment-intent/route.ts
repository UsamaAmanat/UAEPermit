import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);


export async function POST(req: Request) {
  try {
    const { applicationId, amount } = await req.json();

    if (!applicationId || !amount) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      
      metadata: { applicationId },
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
