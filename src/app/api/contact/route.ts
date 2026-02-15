// src/app/api/contact/route.ts (DROP-IN COMPLETE)
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

type Body = {
  firstName: string;
  lastName: string;
  phone: string;
  phoneCountryCode?: string;
  email: string;
  nationality?: string;
  tripPurpose?: string;
  message?: string;
  captchaToken: string;
};

function safe(v: any) {
  return String(v ?? "").trim();
}

function esc(v: any) {
  return safe(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function fmtDate(d: Date) {
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildPremiumContactEmail(args: {
  brandName: string;
  logoUrl?: string;
  fullName: string;
  email: string;
  phone: string;
  nationality?: string;
  tripPurpose?: string;
  message?: string;
  submittedAt: string;
}) {
  const FONT =
    "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,Arial,sans-serif;";

  const S = {
    pageBg: "background:#070A12;",
    cardBg: "background:#0b1020;",
    border: "border:1px solid rgba(255,255,255,.08);",
    radius: "border-radius:22px;",
    shadow: "box-shadow:0 26px 80px rgba(0,0,0,.45);",
    muted: "color:rgba(255,255,255,.62);",
    title: "color:#fff;font-weight:900;letter-spacing:-.01em;",
    micro:
      "font-size:11.5px;line-height:1.45;color:rgba(255,255,255,.48);font-weight:900;letter-spacing:.10em;text-transform:uppercase;",
    body: "font-size:13.5px;line-height:1.65;",
    softBox:
      "background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;",
    pill: "display:inline-block;padding:7px 11px;border-radius:999px;background:rgba(52,211,153,.10);border:1px solid rgba(52,211,153,.26);color:#34d399;font-weight:900;font-size:12px;",
  };

  const logoBlock = args.logoUrl
    ? `<img src="${esc(args.logoUrl)}" width="120" alt="${esc(
        args.brandName,
      )}" style="display:block;border:0;outline:none;text-decoration:none;height:auto;">`
    : `<div style="${FONT}font-weight:900;font-size:16px;color:#ffffff;">${esc(
        args.brandName,
      )}</div>`;

  const button = (label: string, href: string) => `
    <a href="${esc(href)}"
      style="${FONT}
        display:inline-block;
        padding:11px 16px;
        border-radius:13px;
        background:linear-gradient(180deg,#25d48f,#0fb176);
        color:#04110b;
        font-weight:900;
        font-size:13.5px;
        text-decoration:none;
        box-shadow:0 14px 34px rgba(16,185,129,.22);
      ">
      ${esc(label)} &nbsp;→
    </a>
  `;

  const metaRow = (label: string, value?: string) => {
    const v = safe(value);
    if (!v) return "";
    return `
      <tr>
        <td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,.10);${FONT}font-size:12.5px;line-height:1.55;color:rgba(255,255,255,.62);width:140px;white-space:nowrap;">
          ${esc(label)}
        </td>
        <td style="padding:10px 12px;border-top:1px solid rgba(255,255,255,.10);${FONT}font-size:13px;line-height:1.55;color:rgba(255,255,255,.88);font-weight:800;">
          ${esc(v)}
        </td>
      </tr>
    `;
  };

  const msg = safe(args.message);
  const msgHtml = msg ? esc(msg).replace(/\n/g, "<br/>") : "—";

  const preheader = `New contact form message from ${args.fullName}.`;

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>${esc(args.brandName)} - Contact message</title>
</head>

<body style="margin:0;padding:0;background:#070A12;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${esc(preheader)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#070A12;padding:18px 10px;">
    <tr>
      <td align="center">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
          style="max-width:740px;border-radius:22px;overflow:hidden;background:#0b1020;border:1px solid rgba(255,255,255,.08);
          box-shadow:0 26px 80px rgba(0,0,0,.45);">

          <!-- Header -->
          <tr>
            <td style="padding:16px 18px 12px 18px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    ${logoBlock}
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="${FONT}${S.pill}">New contact</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:0 18px 18px 18px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>

                  <!-- LEFT -->
                  <td style="width:58%;vertical-align:top;padding-right:12px;">
                    <div style="${FONT}${S.title}font-size:20px;line-height:1.18;">
                      New Contact Message
                    </div>
                    <div style="${FONT}${S.body}margin-top:6px;color:rgba(255,255,255,.74);">
                      A visitor submitted the contact form on <b style="color:#fff;">${esc(
                        args.submittedAt,
                      )}</b>.
                    </div>

                    <div style="margin-top:14px;${S.softBox}">
                      <div style="${FONT}padding:14px;">
                        <div style="${FONT}${S.micro}">Message</div>
                        <div style="${FONT}margin-top:10px;padding:12px 12px;border-radius:16px;border:1px solid rgba(255,255,255,.10);
                          background:rgba(255,255,255,.03);color:#fff;font-weight:700;font-size:13.5px;line-height:1.65;">
                          ${msgHtml}
                        </div>

                        <div style="margin-top:12px;">
                          ${button("Reply via email", `mailto:${args.email}`)}
                        </div>

                        <div style="margin-top:10px;${FONT}${S.micro}color:rgba(255,255,255,.50);text-transform:none;letter-spacing:0;font-weight:700;">
                          Replying will email the customer directly.
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- RIGHT -->
                  <td style="width:42%;vertical-align:top;padding-left:12px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${S.softBox}">
                      <tr>
                        <td style="${FONT}padding:14px;">
                          <div style="${FONT}${S.micro}">Contact details</div>

                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                            style="margin-top:10px;border:1px solid rgba(255,255,255,.10);border-radius:16px;overflow:hidden;background:rgba(255,255,255,.03);">
                            ${metaRow("Name", args.fullName)}
                            ${metaRow("Email", args.email)}
                            ${metaRow("Phone", args.phone)}
                            ${metaRow("Nationality", args.nationality)}
                            ${metaRow("Trip purpose", args.tripPurpose)}
                          </table>

                          <div style="margin-top:12px;">
                            ${button("Call / WhatsApp", `tel:${safe(args.phone).replace(/\s+/g, "")}`)}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>

                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:12px 18px;background:rgba(255,255,255,.02);border-top:1px solid rgba(255,255,255,.08);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" style="${FONT}font-size:12.5px;line-height:1.6;color:rgba(255,255,255,.62);">
                    <div style="font-weight:900;color:#fff;margin-bottom:4px;">${esc(
                      args.brandName,
                    )}</div>
                    <div>Automated contact form notification.</div>
                  </td>
                  <td align="right" style="${FONT}font-size:12.5px;">
                    <a href="mailto:${esc(args.email)}" style="color:#34d399;text-decoration:none;font-weight:900;">Reply</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <div style="max-width:740px;color:rgba(255,255,255,.42);${FONT}font-size:11.5px;line-height:1.45;margin-top:10px;">
          © ${new Date().getFullYear()} ${esc(args.brandName)}. All rights reserved.
        </div>

      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `New Contact Form Message

Name: ${args.fullName}
Email: ${args.email}
Phone: ${args.phone}
Nationality: ${args.nationality || "-"}
Trip purpose: ${args.tripPurpose || "-"}
Submitted: ${args.submittedAt}

Message:
${msg || "-"}

`;

  return { html, text };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const firstName = safe(body?.firstName);
    const lastName = safe(body?.lastName);
    const phone = safe(body?.phone);
    const email = safe(body?.email);
    const nationality = safe(body?.nationality);
    const tripPurpose = safe(body?.tripPurpose);
    const message = safe(body?.message);
    const captchaToken = safe(body?.captchaToken);

    if (!firstName || !lastName || !phone || !email) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields." },
        { status: 400 },
      );
    }

    if (!captchaToken) {
      return NextResponse.json(
        { ok: false, error: "Missing captcha token." },
        { status: 400 },
      );
    }

    // ✅ Verify reCAPTCHA
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        { ok: false, error: "Server missing RECAPTCHA secret key." },
        { status: 500 },
      );
    }

    const verifyRes = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret,
          response: captchaToken,
        }),
      },
    );

    const verifyData: any = await verifyRes.json();

    if (!verifyData?.success) {
      // pass google error codes to debug quickly
      return NextResponse.json(
        {
          ok: false,
          error: "reCAPTCHA verification failed.",
          codes: verifyData?.["error-codes"] || [],
        },
        { status: 400 },
      );
    }

    // ✅ If this is a v3 key, score will exist. Enforce a minimum.
    const score =
      typeof verifyData?.score === "number" ? verifyData.score : null;
    if (score !== null && score < 0.5) {
      return NextResponse.json(
        { ok: false, error: "reCAPTCHA score too low. Please try again." },
        { status: 400 },
      );
    }

    // ✅ SMTP (Titan)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const to = process.env.MAIL_ADMIN_TO || "info@uaepermit-send.com";
    const from = process.env.MAIL_FROM || process.env.SMTP_USER || to;

    const brandName = process.env.EMAIL_BRAND_NAME || "UAE Permit";
    const logoUrl = process.env.EMAIL_LOGO_URL || ""; // optional (same as other emails)

    const fullName = `${firstName} ${lastName}`.trim();
    const submittedAt = fmtDate(new Date());

    const subject = `New Contact Form Message — ${fullName}`;

    const { html, text } = buildPremiumContactEmail({
      brandName,
      logoUrl,
      fullName,
      email,
      phone,
      nationality: nationality || undefined,
      tripPurpose: tripPurpose || undefined,
      message: message || undefined,
      submittedAt,
    });

    await transporter.sendMail({
      from,
      to,
      replyTo: email,
      subject,
      html,
      text,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[/api/contact] error:", e);
    return NextResponse.json(
      { ok: false, error: "Server error while sending message." },
      { status: 500 },
    );
  }
}
