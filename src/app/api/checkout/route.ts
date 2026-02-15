import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { applicationId, amount, customerEmail } = await req.json();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],

    customer_email: customerEmail, // ✅ IMPORTANT

    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Dubai Visa application #${applicationId}`,
            description: "Visa fee & application processing",
          },
          unit_amount: Math.round(Number(amount) * 100),
        },
        quantity: 1,
      },
    ],

    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/apply/success?appId=${applicationId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/apply?countryCancelled=1`,

    custom_text: {
      submit: { message: "Card details are encrypted and processed securely." },
    },

    metadata: { applicationId },
  });

  return NextResponse.json({ url: session.url });
}
