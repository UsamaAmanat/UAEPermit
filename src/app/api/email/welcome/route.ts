import { NextRequest, NextResponse } from "next/server";
import { mailTransporter, MAIL_FROM } from "@/lib/email/mailer";
import { buildWelcomeEmail } from "@/lib/email/templates";

// Basic auth secret to prevent public abuse of the email endpoint
const API_SECRET = process.env.INTERNAL_API_SECRET || "fallback_secret_for_local_dev";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${API_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email, name } = body;

    if (!email || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!mailTransporter) {
      console.warn("⚠️ Welcome Email skipped (SMTP not configured for:", email, ")");
      // Still return 200 so the frontend doesn't break if SMTP isn't set up locally
      return NextResponse.json({ success: true, warning: "SMTP not configured" });
    }

    const welcomeEmailTpl = buildWelcomeEmail({
      customerEmail: email,
      customerName: name,
    });

    await mailTransporter.sendMail({
      from: MAIL_FROM,
      to: email,
      subject: welcomeEmailTpl.subject,
      html: welcomeEmailTpl.html,
      text: welcomeEmailTpl.text,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error sending welcome email:", error);
    return NextResponse.json(
      { error: "Failed to send welcome email" },
      { status: 500 }
    );
  }
}
