// src/lib/email/templates.ts

type ApplicantRow = {
  fullName: string;
  email?: string;
  passportNumber?: string;
  nationality?: string;
};

export type CustomerEmailPayload = {
  customerName: string;
  customerEmail: string;
  paidAmount: number;
  currency?: string; // default "USD"
  applicants: ApplicantRow[];
  trackingUrl: string;
  submittedAt?: Date | string;
  orderId?: string;
};

export type AdminEmailPayload = {
  applicationId: string;
  paidAmount: number;
  currency?: string; // default "USD"
  applicants: ApplicantRow[];
  customerEmail?: string;
  customerPhone?: string;
  submittedAt?: Date | string;
  adminPanelUrl?: string;
  orderId?: string;
};

const FONT = "font-family:'Montserrat', sans-serif;";

const S = {
  pageBg: "background:#070A12;",
  cardBg: "background:#0b1020;",
  border: "border:1px solid rgba(255,255,255,.08);",
  radius: "border-radius:22px;",
  shadow: "box-shadow:0 26px 80px rgba(0,0,0,.45);",
  text: "color:rgba(255,255,255,.86);",
  muted: "color:rgba(255,255,255,.62);",
  title: "color:#fff;font-weight:800;letter-spacing:-.02em;",
  h1: "font-size:22px;line-height:1.18;",
  h2: "font-size:15px;line-height:1.45;",
  body: "font-size:13.5px;line-height:1.65;",
  small: "font-size:12.5px;line-height:1.55;",
  micro: "font-size:11.5px;line-height:1.45;",
  pill: "display:inline-block;padding:7px 11px;border-radius:999px;background:rgba(52,211,153,.10);border:1px solid rgba(52,211,153,.26);color:#34d399;font-weight:800;font-size:12px;",
  softBox:
    "background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;",
  divider: "border-top:1px solid rgba(255,255,255,.08);",
};

function esc(v: any) {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function money(amount: number, currency = "USD") {
  const fixed = (Number(amount) || 0).toFixed(2);
  return `${currency} ${fixed}`;
}

function fmtDate(d?: Date | string) {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function trackRootUrl(input?: string) {
  // default fallback
  const FALLBACK = "https://uaepermit.com/track";

  if (!input) return FALLBACK;

  try {
    // handles absolute URLs
    const u = new URL(input);

    // if already /track or /track/..., force /track
    if (u.pathname === "/track" || u.pathname.startsWith("/track/")) {
      u.pathname = "/track";
      u.search = ""; // optional: remove query params
      u.hash = "";
      return u.toString();
    }

    // if something else was passed, still return fallback track page
    return FALLBACK;
  } catch {
    // handles relative paths like "/track/TRK-123"
    if (input === "/track" || input.startsWith("/track/")) return "/track";
    return FALLBACK;
  }
}

function extractTrackingId(input?: string) {
  if (!input) return "";

  try {
    const u = new URL(input);

    // Common query param names
    const qp =
      u.searchParams.get("trackingId") ||
      u.searchParams.get("tracking_id") ||
      u.searchParams.get("track") ||
      u.searchParams.get("t") ||
      u.searchParams.get("id");

    if (qp) return qp.trim();

    // Path style: /track/TRK-123 or /track/TRK123
    const parts = u.pathname.split("/").filter(Boolean);
    const trackIndex = parts.findIndex((p) => p.toLowerCase() === "track");
    const maybeId =
      trackIndex >= 0 ? parts[trackIndex + 1] : parts[parts.length - 1];

    if (!maybeId || maybeId.toLowerCase() === "track") return "";
    return maybeId.trim();
  } catch {
    // relative: /track/TRK-123
    const parts = String(input).split("?")[0].split("/").filter(Boolean);
    const trackIndex = parts.findIndex((p) => p.toLowerCase() === "track");
    const maybeId =
      trackIndex >= 0 ? parts[trackIndex + 1] : parts[parts.length - 1];

    if (!maybeId || maybeId.toLowerCase() === "track") return "";
    return maybeId.trim();
  }
}

function trackingIdRowHtml(trackingId?: string) {
  if (!trackingId) return "";
  return `
    <div style="margin-top:10px;">
      <div style="${FONT}${S.micro}color:rgba(255,255,255,.48);font-weight:900;letter-spacing:.10em;text-transform:uppercase;">
        Tracking ID
      </div>
      <div style="${FONT}margin-top:6px;padding:10px 12px;border-radius:14px;border:1px solid rgba(255,255,255,.10);
        background:rgba(255,255,255,.03);color:#fff;font-weight:950;letter-spacing:.08em;font-size:13px;line-height:1;">
        ${esc(trackingId)}
      </div>
    </div>
  `;
}

/**
 * Branding via env
 * Use Firebase Storage download URLs (recommended for emails).
 */
function brand() {
  const brandName = process.env.EMAIL_BRAND_NAME || "UAE Permit";
  const logoUrl = process.env.EMAIL_LOGO_URL || "";
  const heroImageUrl = process.env.EMAIL_HERO_IMAGE_URL || "";

  const trustDubaiTourism = process.env.EMAIL_TRUST_DUBAI_TOURISM_URL || "";
  const trustGovtDubai = process.env.EMAIL_TRUST_GOVT_DUBAI_URL || "";
  const trustEmirates = process.env.EMAIL_TRUST_EMIRATES_URL || "";

  return {
    brandName,
    logoUrl,
    heroImageUrl,
    trustDubaiTourism,
    trustGovtDubai,
    trustEmirates,
  };
}

function logoBlockHtml(brandName: string, logoUrl: string) {
  if (logoUrl) {
    return `<img src="${esc(logoUrl)}" width="120" alt="${esc(
      brandName,
    )}" style="display:block;border:0;outline:none;text-decoration:none;height:auto;">`;
  }
  return `<div style="${FONT}font-weight:900;font-size:16px;color:#ffffff;">${esc(
    brandName,
  )}</div>`;
}

/**
 * Bulletproof button (Gmail/Outlook)
 * (Slightly lighter / less tall = more premium)
 */
function buttonHtml(label: string, href: string) {
  return `
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
  </a>`;
}

function divider() {
  return `<div style="height:1px;background:rgba(255,255,255,.08);margin:14px 0;"></div>`;
}

function pill(text: string) {
  return `<span style="${FONT}${S.pill}">${esc(text)}</span>`;
}

/**
 * Compact trust row (one subtle bar, no heavy box stack)
 */
function trustRowCompactHtml(opts: {
  trustDubaiTourism?: string;
  trustGovtDubai?: string;
  trustEmirates?: string;
}) {
  const logos = [
    { url: opts.trustDubaiTourism, alt: "Dubai Tourism" },
    { url: opts.trustGovtDubai, alt: "Government of Dubai" },
    { url: opts.trustEmirates, alt: "The Emirates" },
  ].filter((x) => !!x.url);

  if (!logos.length) return "";

  const items = logos
    .map(
      (l) => `
    <td align="center" style="padding:0 6px;">
      <img src="${esc(l.url)}" width="78" alt="${esc(
        l.alt,
      )}" style="display:block;border:0;outline:none;text-decoration:none;height:auto;border-radius:10px;background:#ffffff;">
    </td>
  `,
    )
    .join("");

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
    <tr>
      <td style="padding:10px 12px;border:1px solid rgba(255,255,255,.08);border-radius:16px;background:rgba(255,255,255,.03);">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="${FONT}${S.micro}color:rgba(255,255,255,.50);font-weight:900;letter-spacing:.10em;text-transform:uppercase;">
              Trusted partners
            </td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
          <tr>${items}</tr>
        </table>
      </td>
    </tr>
  </table>
  `;
}

/**
 * Premium single payment panel (less bold labels, more air)
 */
function paymentPanelHtml(opts: {
  paid: string;
  applicantsCount: number;
  submittedAt?: string;
  orderId?: string;
}) {
  const orderRow = opts.orderId
    ? `
      <div style="margin-top:10px;">
        <div style="${FONT}${S.micro}color:rgba(255,255,255,.48);font-weight:900;letter-spacing:.10em;text-transform:uppercase;">
          Order ID
        </div>
        <div style="${FONT}margin-top:6px;padding:10px 12px;border-radius:14px;border:1px solid rgba(255,255,255,.10);
          background:rgba(255,255,255,.03);color:#fff;font-weight:900;letter-spacing:.04em;font-size:12.5px;line-height:1.2;word-break:break-all;">
          ${esc(opts.orderId)}
        </div>
      </div>
    `
    : "";

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${S.softBox}">
    <tr>
      <td style="${FONT}padding:14px 14px 12px 14px;">
        <div style="${FONT}${S.micro}color:rgba(255,255,255,.48);font-weight:900;letter-spacing:.10em;text-transform:uppercase;">
          Payment
        </div>

        <div style="${FONT}margin-top:7px;color:#fff;font-weight:950;letter-spacing:-.02em;font-size:20px;line-height:1.15;">
          ${esc(opts.paid)}
        </div>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
          <tr>
            <td style="${FONT}${S.small}color:rgba(255,255,255,.62);">
              Applicants: <span style="color:#fff;font-weight:900;">${esc(
                String(opts.applicantsCount),
              )}</span>
            </td>
            <td align="right" style="${FONT}${S.small}color:rgba(255,255,255,.58);">
              ${
                opts.submittedAt
                  ? `Submitted: <span style="color:rgba(255,255,255,.84);font-weight:800;">${esc(
                      opts.submittedAt,
                    )}</span>`
                  : ""
              }
            </td>
          </tr>
        </table>

        ${orderRow}
      </td>
    </tr>
  </table>`;
}

function rightInfoPanelHtml(args: {
  applicants: Array<{
    fullName: string;
    passportNumber?: string;
    nationality?: string;
  }>;
  applicantsCount: number;
  trackingUrl: string;
}) {
  const list = args.applicants || [];
  const preview = list.slice(0, 3); // ✅ show 3
  const remaining = Math.max(0, args.applicantsCount - preview.length);

  const rows = preview
    .map((a, idx) => {
      const name = a?.fullName ? esc(a.fullName) : "—";
      const passport = a?.passportNumber ? esc(a.passportNumber) : "—";
      const nat = a?.nationality ? esc(a.nationality) : "—";

      return `
        <div style="${idx === 0 ? "margin-top:12px;" : "margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.08);"}">
          <div style="${FONT}color:#fff;font-weight:900;font-size:13.5px;line-height:1.4;">
            ${idx + 1}. ${name}
          </div>

          <!-- ✅ keep Passport + Nationality on SAME LINE -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;">
            <tr>
              <td style="${FONT}${S.muted}font-size:12.8px;line-height:1.35;white-space:nowrap;">
                Passport:
                <span style="color:rgba(255,255,255,.88);font-weight:800;">${passport}</span>
              </td>
              <td align="right" style="${FONT}${S.muted}font-size:12.8px;line-height:1.35;white-space:nowrap;">
                Nationality:
                <span style="color:rgba(255,255,255,.88);font-weight:800;">${nat}</span>
              </td>
            </tr>
          </table>
        </div>
      `;
    })
    .join("");

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${S.softBox}">
    <tr>
      <td style="${FONT}padding:14px;">

        <div style="${FONT}${S.micro}color:rgba(255,255,255,.48);font-weight:900;letter-spacing:.10em;text-transform:uppercase;">
          Status
        </div>

        <div style="${FONT}margin-top:7px;font-size:13.5px;line-height:1.55;color:rgba(255,255,255,.78);">
          Applicants: <span style="color:#fff;font-weight:900;">${esc(String(args.applicantsCount))}</span>
          &nbsp;&nbsp;•&nbsp;&nbsp;
          <span style="color:#34d399;font-weight:900;">Application received</span>
        </div>

        ${rows}

        ${
          remaining > 0
            ? `<div style="${FONT}${S.small}margin-top:12px;color:rgba(255,255,255,.58);">
                + ${esc(String(remaining))} more •
                <a href="${esc(args.trackingUrl)}"
                   style="color:#34d399;text-decoration:none;font-weight:900;">View all</a>
              </div>`
            : ""
        }

      </td>
    </tr>
  </table>
  `;
}

function applicantsTable(applicants: ApplicantRow[]) {
  const rows = (applicants || [])
    .map((a, i) => {
      return `
      <tr>
        <td style="padding:10px 10px;border-top:1px solid rgba(255,255,255,.10);color:rgba(255,255,255,.60);${FONT}font-size:12px;">
          ${i + 1}
        </td>
        <td style="padding:10px 10px;border-top:1px solid rgba(255,255,255,.10);color:#ffffff;${FONT}font-size:13px;font-weight:900;">
          ${esc(a.fullName)}
        </td>
        <td style="padding:10px 10px;border-top:1px solid rgba(255,255,255,.10);color:rgba(255,255,255,.72);${FONT}font-size:12px;">
          ${a.passportNumber ? esc(a.passportNumber) : "—"}
        </td>
        <td style="padding:10px 10px;border-top:1px solid rgba(255,255,255,.10);color:rgba(255,255,255,.72);${FONT}font-size:12px;">
          ${a.nationality ? esc(a.nationality) : "—"}
        </td>
      </tr>
      `;
    })
    .join("");

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
    style="border:1px solid rgba(255,255,255,.10);border-radius:16px;overflow:hidden;background:rgba(255,255,255,.03);">
    <thead>
      <tr>
        <th align="left" style="padding:11px 10px;background:rgba(255,255,255,.05);color:rgba(255,255,255,.58);${FONT}font-size:11px;letter-spacing:.10em;text-transform:uppercase;">
          #
        </th>
        <th align="left" style="padding:11px 10px;background:rgba(255,255,255,.05);color:rgba(255,255,255,.58);${FONT}font-size:11px;letter-spacing:.10em;text-transform:uppercase;">
          Applicant
        </th>
        <th align="left" style="padding:11px 10px;background:rgba(255,255,255,.05);color:rgba(255,255,255,.58);${FONT}font-size:11px;letter-spacing:.10em;text-transform:uppercase;">
          Passport
        </th>
        <th align="left" style="padding:11px 10px;background:rgba(255,255,255,.05);color:rgba(255,255,255,.58);${FONT}font-size:11px;letter-spacing:.10em;text-transform:uppercase;">
          Nationality
        </th>
      </tr>
    </thead>
    <tbody>
      ${rows || ""}
    </tbody>
  </table>
  `;
}

/**
 * Optional hero (keep it short)
 */
function heroHtml(heroImageUrl: string) {
  if (!heroImageUrl) return "";
  return `
  <tr>
    <td style="padding:0 18px 14px 18px;">
      <div style="border-radius:18px;overflow:hidden;border:1px solid rgba(255,255,255,.08);">
        <img src="${esc(heroImageUrl)}" width="684" alt="Dubai"
          style="display:block;border:0;outline:none;text-decoration:none;height:auto;width:100%;max-width:684px;">
      </div>
    </td>
  </tr>
  `;
}
function ensureAbsolute(urlOrPath: string) {
  if (!urlOrPath) return "https://uaepermit.com/track";
  return urlOrPath.startsWith("http")
    ? urlOrPath
    : `https://uaepermit.com${urlOrPath.startsWith("/") ? "" : "/"}${urlOrPath}`;
}

function buildTrackingUrl(inputUrl?: string, trackingId?: string) {
  const FALLBACK = "https://uaepermit.com/track";

  const tid = (trackingId || extractTrackingId(inputUrl) || "").trim();
  if (!tid) {
    // if input already absolute /track/... keep it, else fallback
    if (inputUrl) {
      const abs = ensureAbsolute(inputUrl);
      return abs.includes("/track/") ? abs : FALLBACK;
    }
    return FALLBACK;
  }

  return `https://uaepermit.com/track/${encodeURIComponent(tid)}`;
}

/**
 * Customer email (received) — PREMIUM, ABOVE THE FOLD, LESS CONGESTED
 */
export function buildCustomerApplicationReceivedEmail(
  data: CustomerEmailPayload,
) {
  const b = brand();
  const currency = data.currency ?? "USD";
  const applicants = data.applicants || [];
  const applicantsCount = applicants.length;
  const submittedAt = fmtDate(data.submittedAt);

  const preheader = `We received your visa application. Applicants: ${applicantsCount}.`;
  const subject = `Application received ✓ (${applicantsCount} applicant${
    applicantsCount === 1 ? "" : "s"
  })`;

  const paidText = money(data.paidAmount, currency);
  const trackingId = extractTrackingId(data.trackingUrl);
  const trackUrl = buildTrackingUrl(data.trackingUrl, trackingId);

  const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>${esc(b.brandName)} - Application received</title>
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

          <!-- Header (tight) -->
          <tr>
            <td style="padding:16px 18px 10px 18px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    ${logoBlockHtml(b.brandName, b.logoUrl)}
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    ${pill("Application received")}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${heroHtml(b.heroImageUrl)}

          <!-- CONTENT: Calm, horizontal, less boxes -->
          <tr>
            <td style="padding:0 18px 18px 18px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>

                  <!-- LEFT column -->
                  <td style="width:58%;vertical-align:top;padding-right:12px;">

                    <div style="${FONT}color:#fff;">
                      <div style="${FONT}${S.title}${S.h1}">
                        Hello ${esc(data.customerName)},
                      </div>
                      <div style="${FONT}${S.body}margin-top:7px;color:rgba(255,255,255,.76);">
                        We received your visa application. We’ll keep you updated.
                      </div>

                      <div style="margin-top:14px;">
                        ${paymentPanelHtml({
                          paid: paidText,
                          applicantsCount,
                          submittedAt: submittedAt || undefined,
                          orderId: data.orderId,
                        })}
                      </div>
${trackingId ? trackingIdRowHtml(trackingId) : ""}

                      <div style="margin-top:14px;">
                        ${buttonHtml("Track your application", trackUrl)}
                      </div>

                      <div style="margin-top:10px;${FONT}${S.micro}color:rgba(255,255,255,.50);">
                        If you didn’t make this request, ignore this email or contact support.
                      </div>
                    </div>

                  </td>

                  <!-- RIGHT column -->
                  <td style="width:42%;vertical-align:top;padding-left:12px;">
                    ${rightInfoPanelHtml({
                      applicants,
                      applicantsCount,
                      trackingUrl: trackUrl,
                    })}
                    ${trustRowCompactHtml({
                      trustDubaiTourism: b.trustDubaiTourism,
                      trustGovtDubai: b.trustGovtDubai,
                      trustEmirates: b.trustEmirates,
                    })}
                  </td>

                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer (lighter, not a heavy bar) -->
          <tr>
            <td style="padding:12px 18px;background:rgba(255,255,255,.02);border-top:1px solid rgba(255,255,255,.08);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" style="${FONT}${S.small}color:rgba(255,255,255,.62);line-height:1.6;">
                    <div style="font-weight:950;color:#fff;margin-bottom:4px;">${esc(
                      b.brandName,
                    )}</div>
                    <div>This is an automated message. Please do not reply.</div>
                  </td>
                  <td align="right" style="${FONT}${S.small}">
                   <a href="${esc(trackUrl)}" style="color:#34d399;text-decoration:none;font-weight:950;">Track Application</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <div style="max-width:740px;color:rgba(255,255,255,.42);${FONT}${S.micro}margin-top:10px;">
          © ${new Date().getFullYear()} ${esc(b.brandName)}. All rights reserved.
        </div>

      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `Application received

Hello ${data.customerName},
We received your visa application.

Paid: ${money(data.paidAmount, currency)}
Applicants: ${applicantsCount}
${data.orderId ? `Order ID: ${data.orderId}\n` : ""}${submittedAt ? `Submitted: ${submittedAt}\n` : ""}

Track your application: ${data.trackingUrl}
`;

  return { subject, html, text };
}
function paymentBlockHtml(opts: {
  paid: string;
  applicantsCount: number;
  submittedAt?: string;
  label?: string; // e.g. "Payment" or "Payment received"
}) {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
    style="${S.softBox} overflow:hidden;">
    <tr>
      <td style="${FONT}padding:14px 14px 12px 14px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="left" style="${FONT}${S.muted}font-size:12px;font-weight:800;letter-spacing:.10em;text-transform:uppercase;">
              ${esc(opts.label || "Payment")}
            </td>
            <td align="right" style="${FONT}${S.muted}font-size:12px;font-weight:800;">
              ${opts.submittedAt ? `Submitted: <span style="color:rgba(255,255,255,.86);font-weight:800;">${esc(opts.submittedAt)}</span>` : ""}
            </td>
          </tr>
        </table>

        <div style="margin-top:8px;${S.title}font-size:26px;line-height:1.15;font-weight:950;letter-spacing:-.02em;">
          ${esc(opts.paid)}
        </div>

        <div style="margin-top:8px;${FONT}${S.small}${S.muted}">
          Applicants:
          <span style="color:#fff;font-weight:900;">${esc(String(opts.applicantsCount))}</span>
        </div>
      </td>
    </tr>
  </table>`;
}

/**
 * Admin email (kept clean; still includes full applicants table)
 */
export function buildAdminNewApplicationEmail(data: AdminEmailPayload) {
  const b = brand();
  const currency = data.currency ?? "USD";
  const applicantsCount = data.applicants?.length ?? 0;
  const submittedAt = fmtDate(data.submittedAt);

  const preheader = `New application received. Applicants: ${applicantsCount}. Paid: ${money(
    data.paidAmount,
    currency,
  )}`;

  const subject = `New application: ${data.applicationId} (${applicantsCount} applicant${
    applicantsCount === 1 ? "" : "s"
  })`;

  const paidText = money(data.paidAmount, currency);

  const cta = data.adminPanelUrl
    ? buttonHtml("Open in Admin Panel", data.adminPanelUrl)
    : "";

  // compact applicants preview (2 max) — keeps it premium + no scroll
  const preview = (data.applicants || []).slice(0, 2);
  const remaining = Math.max(0, applicantsCount - preview.length);

  const applicantsPreviewHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="${S.softBox} overflow:hidden;">
      <tr>
        <td style="${FONT}padding:12px 14px;background:rgba(255,255,255,.04);">
          <div style="${S.title}font-size:14px;font-weight:900;">
            Quick summary
          </div>
          <div style="${S.muted}font-size:13px;margin-top:4px;line-height:1.55;">
            Applicants: <span style="color:#fff;font-weight:900;">${esc(String(applicantsCount))}</span><br/>
            Status: <span style="color:#34d399;font-weight:900;">New application</span>
          </div>
        </td>
      </tr>

      ${preview
        .map((a, idx) => {
          const name = esc(a.fullName);
          const passport = a.passportNumber ? esc(a.passportNumber) : "—";
          const nat = a.nationality ? esc(a.nationality) : "—";
          return `
            <tr>
              <td style="${FONT}padding:10px 14px;border-top:1px solid rgba(255,255,255,.10);">
                <div style="color:#fff;font-weight:900;font-size:13px;line-height:1.35;">
                  ${idx + 1}. ${name}
                </div>
                <div style="${S.muted}font-size:12px;line-height:1.55;margin-top:4px;">
                  Passport: <span style="color:rgba(255,255,255,.88);font-weight:800;">${passport}</span>
                  &nbsp;&nbsp;•&nbsp;&nbsp;
                  Nationality: <span style="color:rgba(255,255,255,.88);font-weight:800;">${nat}</span>
                </div>
              </td>
            </tr>
          `;
        })
        .join("")}

      ${
        remaining > 0
          ? `
        <tr>
          <td style="${FONT}padding:10px 14px;border-top:1px solid rgba(255,255,255,.10);">
            <div style="${S.muted}font-size:12px;line-height:1.55;">
              + ${esc(String(remaining))} more applicant${remaining === 1 ? "" : "s"} •
              ${data.adminPanelUrl ? `<a href="${esc(data.adminPanelUrl)}" style="color:#34d399;text-decoration:none;font-weight:900;">View in admin</a>` : ""}
            </div>
          </td>
        </tr>
      `
          : ""
      }
    </table>
  `;

  // admin info box (compact)
  const adminMetaHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="${S.softBox} overflow:hidden;margin-top:12px;">
      <tr>
        <td style="${FONT}padding:12px 14px;">
          <div style="${S.muted}font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;">
            Application details
          </div>
          <div style="margin-top:10px;${FONT}${S.body}color:rgba(255,255,255,.78);line-height:1.7;">
            <b style="color:#fff;">Application ID:</b> ${esc(data.applicationId)}<br/>
            ${data.orderId ? `<b style="color:#fff;">Order ID:</b> ${esc(data.orderId)}<br/>` : ""}

            ${
              data.customerEmail
                ? `<b style="color:#fff;">Customer Email:</b> ${esc(data.customerEmail)}<br/>`
                : ""
            }
            ${
              data.customerPhone
                ? `<b style="color:#fff;">Customer Phone:</b> ${esc(data.customerPhone)}<br/>`
                : ""
            }
          </div>
        </td>
      </tr>
    </table>
  `;

  const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>${esc(b.brandName)} - New application</title>
</head>

<body style="margin:0;padding:0;background:#070A12;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${esc(preheader)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#070A12;padding:18px 10px;">
    <tr>
      <td align="center">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
          style="max-width:720px;border-radius:22px;overflow:hidden;background:#0b1020;border:1px solid rgba(255,255,255,.08);
          box-shadow:0 26px 80px rgba(0,0,0,.45);">

          <!-- Header (same logo block as customer) -->
          <tr>
            <td style="padding:16px 18px 10px 18px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    ${logoBlockHtml(b.brandName, b.logoUrl)}
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    ${pill("New application")}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content: premium 2-column above the fold -->
          <tr>
            <td style="padding:0 18px 18px 18px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>

                  <!-- LEFT -->
                  <td style="width:58%;vertical-align:top;padding-right:10px;">
                    <div style="${FONT}color:#fff;">

                      <div style="${FONT}font-size:20px;font-weight:950;letter-spacing:-.01em;margin-top:2px;">
                        New visa application submitted
                      </div>

                      <div style="margin-top:6px;${FONT}font-size:13px;line-height:1.6;color:rgba(255,255,255,.78);">
                        A customer completed payment and submitted an application.
                      </div>

                      <div style="margin-top:12px;">
  ${paymentBlockHtml({
    paid: paidText,
    applicantsCount,
    submittedAt: submittedAt || undefined,
    label: "Payment received",
  })}
</div>


                      ${cta ? `<div style="margin-top:12px;">${cta}</div>` : ""}

                      ${adminMetaHtml}

                      <div style="margin-top:10px;${FONT}${S.small}color:rgba(255,255,255,.55);line-height:1.55;">
                        This is an automated notification.
                      </div>

                    </div>
                  </td>

                  <!-- RIGHT -->
                  <td style="width:42%;vertical-align:top;padding-left:10px;">
                    ${applicantsPreviewHtml}
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
                  <td align="left" style="${FONT}${S.small}color:rgba(255,255,255,.62);line-height:1.6;">
                    <div style="font-weight:950;color:#fff;margin-bottom:4px;">${esc(b.brandName)}</div>
                    <div>Automated notification.</div>
                  </td>
                  <td align="right" style="${FONT}${S.small}">
                    ${
                      data.adminPanelUrl
                        ? `<a href="${esc(
                            data.adminPanelUrl,
                          )}" style="color:#34d399;text-decoration:none;font-weight:950;">Open Admin</a>`
                        : ""
                    }
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `New Application Submitted

Application ID: ${data.applicationId}
Paid: ${money(data.paidAmount, currency)}
Applicants: ${applicantsCount}
${submittedAt ? `Submitted: ${submittedAt}\n` : ""}

${data.adminPanelUrl ? `Admin Panel: ${data.adminPanelUrl}\n` : ""}
${data.orderId ? `Order ID: ${data.orderId}\n` : ""}

`;

  return { subject, html, text };
}

// Add near other exported builders in src/lib/email/templates.ts

export type StatusUpdateEmailPayload = {
  customerName: string;
  customerEmail: string;
  applicants: ApplicantRow[];
  trackingUrl: string;
  trackingId?: string; // ✅ NEW (preferred)
  status: string; // draft|pending|submitted|paid|processing|issued|rejected
  previousStatus?: string;
  submittedAt?: Date | string;
  visaFileUrl?: string;
};

function statusLabel(s?: string) {
  const v = String(s || "").toLowerCase();
  if (v === "draft") return "Draft";
  if (v === "pending") return "Pending";
  if (v === "submitted") return "Submitted";
  if (v === "paid") return "Paid";
  if (v === "processing") return "Processing";
  if (v === "issued") return "Visa Issued";
  if (v === "rejected") return "Rejected";
  return v ? v.charAt(0).toUpperCase() + v.slice(1) : "Updated";
}

function statusTone(s?: string) {
  const v = String(s || "").toLowerCase();
  if (v === "issued") return { pill: "Visa issued", accent: "#34d399" };
  if (v === "processing") return { pill: "Processing", accent: "#60a5fa" };
  if (v === "paid") return { pill: "Payment confirmed", accent: "#34d399" };
  if (v === "pending") return { pill: "Under review", accent: "#f59e0b" };
  if (v === "submitted") return { pill: "Submitted", accent: "#a78bfa" };
  if (v === "rejected") return { pill: "Action needed", accent: "#fb7185" };
  return { pill: "Updated", accent: "#94a3b8" };
}

function statusCopy(s?: string) {
  const v = String(s || "").toLowerCase();

  switch (v) {
    case "draft":
      return {
        title: "Your application is saved as draft",
        body: "Your application is currently saved as a draft. If you still need to complete steps or upload documents, you can continue anytime.",
        note: "If you didn’t request this change, contact support and we’ll help right away.",
      };

    case "pending":
      return {
        title: "We’re reviewing your application",
        body: "Your application is pending review. Our team will verify documents and details and update you with the next step.",
        note: "Tip: Keep your phone/email reachable in case we need a quick confirmation.",
      };

    case "submitted":
      return {
        title: "Application submitted successfully",
        body: "Your application has been submitted. We’ll now move it through verification and processing.",
        note: "You can track progress anytime from the link below.",
      };

    case "paid":
      return {
        title: "Payment confirmed",
        body: "We’ve confirmed your payment. Your application is now queued for processing.",
        note: "We’ll notify you again when your status moves to Processing / Issued.",
      };

    case "processing":
      return {
        title: "Processing started",
        body: "Good news — processing has started. Our team is working on your visa application now.",
        note: "Processing times vary by visa type and workload. Track updates anytime from the link below.",
      };

    case "issued":
      return {
        title: "Your visa has been issued",
        body: "Great news — your visa has been issued. You can view your application details and updates from the tracking link below.",
        note: "If you need any help (printing, travel dates, or clarifications), just reply to support.",
      };

    case "rejected":
      return {
        title: "Update required for your application",
        body: "Your application was marked as rejected / needs correction. This usually happens due to document quality, missing details, or verification issues.",
        note: "Please check the tracking page for next steps. If you’re unsure, contact support and we’ll guide you.",
      };

    default:
      return {
        title: "Your application status was updated",
        body: "Your application status has been updated. Please check the tracking page for the latest details.",
        note: "Use the link below to view the current status and updates.",
      };
  }
}

export function buildCustomerStatusUpdatedEmail(
  data: StatusUpdateEmailPayload,
) {
  const b = brand();
  const applicants = data.applicants || [];
  const applicantsCount = applicants.length;
  const submittedAt = fmtDate(data.submittedAt);

  const s = String(data.status || "").toLowerCase();
  const label = statusLabel(s);
  const tone = statusTone(s);
  const copy = statusCopy(s);

  // ✅ per-applicant handling
  const isSingleApplicant = applicantsCount === 1;
  const primaryApplicant = isSingleApplicant ? applicants[0] : null;
  const applicantName = primaryApplicant?.fullName || "Applicant";
  const applicantPassport = primaryApplicant?.passportNumber || "";

  // ✅ upgraded subject + preheader
  const preheader = isSingleApplicant
    ? s === "issued"
      ? `Visa issued for ${applicantName}. Download your visa.`
      : `Status update for ${applicantName}: ${label}.`
    : `Status update: ${label}. Applicants: ${applicantsCount}.`;

  const subject = isSingleApplicant
    ? s === "issued"
      ? `Visa Issued — ${applicantName}${applicantPassport ? ` (${applicantPassport})` : ""}`
      : `Application Update — ${applicantName}: ${label}`
    : `Status update: ${label} (${applicantsCount} applicant${applicantsCount === 1 ? "" : "s"})`;

  const trackingId = (
    data.trackingId || extractTrackingId(data.trackingUrl)
  ).trim();
  const trackUrl = buildTrackingUrl(data.trackingUrl, trackingId); // ✅ full URL WITH id

  const showTrackingId =
    ["paid", "issued", "rejected"].includes(s) && !!trackingId;

  const statusPanel = `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${S.softBox}">
    <tr>
      <td style="${FONT}padding:14px;">
        <div style="${FONT}${S.micro}color:rgba(255,255,255,.48);font-weight:900;letter-spacing:.10em;text-transform:uppercase;">
          Current status
        </div>

        <div style="${FONT}margin-top:7px;color:#fff;font-weight:950;letter-spacing:-.02em;font-size:20px;line-height:1.15;">
          ${esc(label)}
        </div>

        <div style="${FONT}${S.small}margin-top:10px;color:rgba(255,255,255,.62);line-height:1.65;">
          ${
            isSingleApplicant
              ? `Applicant: <span style="color:#fff;font-weight:900;">${esc(applicantName)}</span>`
              : `Applicants: <span style="color:#fff;font-weight:900;">${esc(String(applicantsCount))}</span>`
          }
          ${submittedAt ? `&nbsp;&nbsp;•&nbsp;&nbsp;Updated: <span style="color:rgba(255,255,255,.86);font-weight:800;">${esc(submittedAt)}</span>` : ""}
        </div>

        ${showTrackingId ? trackingIdRowHtml(trackingId) : ""}
      </td>
    </tr>
  </table>
`;

  const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>${esc(b.brandName)} - Status update</title>
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
            <td style="padding:16px 18px 10px 18px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left">
                    ${logoBlockHtml(b.brandName, b.logoUrl)}
                  </td>
                  <td align="right">
                    ${pill(esc(tone.pill))}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${heroHtml(b.heroImageUrl)}

          <!-- Content -->
          <tr>
            <td style="padding:0 18px 18px 18px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>

                  <td style="width:58%;vertical-align:top;padding-right:12px;">
                    <div style="${FONT}color:#fff;">
                      <div style="${FONT}${S.title}${S.h1}">
                        Hello ${esc(data.customerName)},
                      </div>

                      <div style="${FONT}${S.body}margin-top:7px;color:rgba(255,255,255,.76);">
                        ${esc(copy.body)}
                      </div>

                      <div style="margin-top:14px;">
                        ${statusPanel}
                      </div>

                      <div style="margin-top:14px;">
                        ${buttonHtml("Track your application", trackUrl)}
                      </div>

                      ${
                        data.visaFileUrl && s === "issued"
                          ? `<div style="margin-top:10px;${FONT}${S.micro}color:rgba(255,255,255,.60);">
                               Your visa for <strong>${esc(applicantName)}</strong>:
                               <a href="${esc(data.visaFileUrl)}" style="color:#34d399;text-decoration:none;font-weight:900;">
                                 Download visa
                               </a>
                             </div>`
                          : ""
                      }

                      <div style="margin-top:12px;${FONT}${S.micro}color:rgba(255,255,255,.50);">
                        ${esc(copy.note)}
                      </div>
                    </div>
                  </td>

                  <td style="width:42%;vertical-align:top;padding-left:12px;">
                    ${rightInfoPanelHtml({
                      applicants,
                      applicantsCount,
                      trackingUrl: trackUrl,
                    })}
                    ${trustRowCompactHtml({
                      trustDubaiTourism: b.trustDubaiTourism,
                      trustGovtDubai: b.trustGovtDubai,
                      trustEmirates: b.trustEmirates,
                    })}
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
                  <td align="left" style="${FONT}${S.small}color:rgba(255,255,255,.62);">
                    <div style="font-weight:950;color:#fff;margin-bottom:4px;">${esc(b.brandName)}</div>
                    <div>This is an automated message. Please do not reply.</div>
                  </td>
                  <td align="right" style="${FONT}${S.small}">
                    <a href="${esc(trackUrl)}" style="color:#34d399;text-decoration:none;font-weight:950;">
                      Track Application
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <div style="max-width:740px;color:rgba(255,255,255,.42);${FONT}${S.micro}margin-top:10px;">
          © ${new Date().getFullYear()} ${esc(b.brandName)}. All rights reserved.
        </div>

      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `Status update: ${label}

Hello ${data.customerName},

${copy.body}

${isSingleApplicant ? `Applicant: ${applicantName}` : `Applicants: ${applicantsCount}`}
${submittedAt ? `Updated: ${submittedAt}\n` : ""}
${trackingId ? `Tracking ID: ${trackingId}\n` : ""}
Track your application: ${trackUrl}

`;

  return { subject, html, text };
}

/**
 * Backward compatibility:
 * if any older code calls buildCustomerApplicationEmail, it still works.
 */
export const buildCustomerApplicationEmail =
  buildCustomerApplicationReceivedEmail;
