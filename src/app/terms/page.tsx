// src/app/terms/page.tsx

import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions",
  description:
    "Review UAE Permit's terms and conditions for UAE Dubai visa applications, services, payments, and user responsibilities.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <main className="bg-[#f5f7fb] min-h-screen pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb + meta */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm">
          <nav className="flex items-center gap-1 text-slate-500">
            <Link href="/" className="hover:text-emerald-600 transition-colors">
              Home
            </Link>
            <span className="text-slate-400">/</span>
            <span className="font-medium text-slate-800">
              Terms &amp; Conditions
            </span>
          </nav>
          <p className="text-xs sm:text-sm text-slate-500">
            Last updated:{" "}
            <span className="font-medium text-slate-700">05 December 2025</span>
          </p>
        </div>

        {/* Hero – tuned to site theme (navy + lime) */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#3C4161] via-[#3C4161] to-[#0c4d3d] px-6 py-10 sm:px-10 sm:py-12 mb-10">
          <div className="relative z-10 max-w-2xl">
            <p className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[#62E9C9] mb-4">
              Legal &amp; Compliance
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white leading-tight">
              Terms &amp; Conditions
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-100 max-w-xl">
              These Terms of Use govern your use of{" "}
              <span className="font-semibold">UAE Permit</span> and the visa and
              travel-related services provided by Budget Travel &amp; Tourism
              LLC. Please read them carefully before submitting any application
              or payment.
            </p>
          </div>

          {/* soft light circle, aligned with brand teal */}
          <div className="pointer-events-none absolute -right-16 -bottom-24 h-64 w-64 rounded-full bg-[#62E9C9]/20 blur-3xl" />
        </section>

        {/* Content + sidebar */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(260px,1fr)]">
          {/* MAIN CONTENT */}
          <section className="space-y-8 text-sm sm:text-[15px] leading-relaxed text-slate-700">
            {/* 1. Acceptance of Terms */}
            <div
              id="acceptance"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                1. Acceptance of Terms
              </h2>
              <p className="mb-3">
                By using this website and submitting your passport(s),
                application(s), or other documents to{" "}
                <span className="font-semibold">UAE Permit</span>, you
                acknowledge that you have read, understood, and accepted these
                Terms of Use as well as our{" "}
                <Link
                  href="/privacy"
                  className="text-emerald-700 font-medium hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </p>
              <p className="mb-2">
                If you do not agree with any part of these Terms, please do not
                use the site or our services.
              </p>
              <p className="text-xs text-slate-500">
                UAE Permit reserves the right to update these Terms at any time.
                We recommend reviewing them periodically. Continued use of the
                website after updates constitutes your acceptance of the revised
                Terms.
              </p>
            </div>

            {/* 2. Services Provided */}
            <div
              id="services"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                2. Services Provided
              </h2>
              <p className="mb-3">
                <span className="font-semibold">UAE Permit</span> is operated by{" "}
                <span className="font-semibold">
                  Budget Travel &amp; Tourism LLC
                </span>
                . We provide:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Visa processing and visa issuance assistance</li>
                <li>
                  Travel-related services such as tours, excursions, transport
                  services, and travel insurance
                </li>
                <li>Customer support and related advisory services</li>
              </ul>
              <p className="mt-3 mb-2">
                We act solely as a{" "}
                <span className="font-semibold">facilitation agency</span>.
                Final approval of any visa or travel permit is at the sole
                discretion of the relevant UAE immigration authorities or other
                government agencies. We do not have authority to influence or
                override their decisions.
              </p>
            </div>

            {/* 3. User Obligations & Responsibilities */}
            <div
              id="responsibilities"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                3. User Obligations &amp; Responsibilities
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  You agree to provide{" "}
                  <span className="font-semibold">
                    accurate, complete, and truthful
                  </span>{" "}
                  information when filling out forms or providing documents.
                </li>
                <li>
                  You are responsible for ensuring that all submitted documents
                  (including passport copies, photos, flight tickets, hotel
                  bookings, or other papers) meet the requirements for the visa
                  or service you apply for.
                </li>
                <li>
                  You must keep any login credentials, account details, tracking
                  IDs, or other confidential information secure. You are
                  responsible for all activity under your account.
                </li>
                <li>
                  You agree to notify us immediately of any suspected or actual
                  unauthorised access to your account or data.
                </li>
              </ul>
            </div>

            {/* 4. Fees and Payments */}
            <div
              id="fees"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                4. Fees and Payments
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  All applicable fees and charges become payable immediately
                  upon successful online verification or submission of your
                  application.
                </li>
                <li>
                  You are responsible for payment of all fees, including any
                  taxes, service charges, gateway charges, and other applicable
                  costs.
                </li>
                <li>
                  Visa requirements, government fees, and associated charges are
                  subject to change at any time without prior notice. Such
                  changes may be imposed by third parties or authorities beyond
                  our control.
                </li>
              </ul>
            </div>

            {/* 5. Refund Policy & Cancellation */}
            <div
              id="refunds"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                5. Refund Policy &amp; Cancellation
              </h2>
              <p className="mb-2">
                Our refund and cancellation policy is as follows (you can adapt
                the exact conditions to match your internal policy):
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  If you cancel the service within{" "}
                  <span className="font-semibold">one hour</span> from the
                  application submission time and your documents have{" "}
                  <span className="font-semibold">not yet been submitted</span>{" "}
                  to the relevant authorities, you may be entitled to a full or
                  partial refund.
                </li>
                <li>
                  If the application and supporting documents{" "}
                  <span className="font-semibold">
                    have already been submitted
                  </span>{" "}
                  for processing, no refund will be provided.
                </li>
                <li>
                  No refunds will be given for applications that have already
                  been processed, approved, or rejected by the authorities.
                </li>
              </ul>
              <p className="mt-3 text-xs text-slate-500">
                Any exceptions or special cases will be handled at the sole
                discretion of Budget Travel &amp; Tourism LLC and must be agreed
                in writing.
              </p>
            </div>

            {/* 6. Processing Times & No Guarantee of Outcome */}
            <div
              id="processing"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                6. Processing Times &amp; No Guarantee of Outcome
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Any processing times or categories (standard, express, “extra
                  fast", etc.) provided by UAE Permit are{" "}
                  <span className="font-semibold">estimates only</span> based on
                  typical conditions.
                </li>
                <li>
                  Processing generally begins from the{" "}
                  <span className="font-semibold">next business day</span> after
                  successful submission of documents and payment.
                </li>
                <li>
                  Delays, rejections, or other outcomes beyond our control may
                  occur. We do{" "}
                  <span className="font-semibold">not guarantee</span> visa
                  approval or adherence to estimated processing times.
                </li>
                <li>
                  UAE Permit will not be liable for financial or other losses
                  resulting from visa delays, cancellations, or denial of visa,
                  including but not limited to flight tickets, hotel bookings,
                  or tour costs.
                </li>
              </ul>
            </div>

            {/* 7. Delivery of Visa / Service Output */}
            <div
              id="delivery"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                7. Delivery of Visa / Service Output
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Once a visa, permit, or other service output is approved or
                  completed, we will deliver the approved visa or documentation
                  via email or other digital medium, after full payment has been
                  received.
                </li>
                <li>
                  You are responsible for checking the details on the issued
                  visa or documents and informing us promptly of any apparent
                  errors.
                </li>
                <li>
                  You acknowledge that final issuance remains at the discretion
                  of UAE authorities and that procedures or requirements may
                  change without prior notice.
                </li>
              </ul>
            </div>

            {/* 8. Communication & Consent */}
            <div
              id="communication"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                8. Communication &amp; Consent
              </h2>
              <p className="mb-3">
                By using this site and our services, you consent to receive
                communications from us via email, phone, messaging apps, or
                other channels. These communications may include:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Application and booking updates</li>
                <li>Payment confirmations and receipts</li>
                <li>Support and service-related messages</li>
                <li>
                  Marketing communications, offers, or promotional updates (you
                  may opt out of non-essential marketing at any time).
                </li>
              </ul>
            </div>

            {/* 9. Intellectual Property */}
            <div
              id="ip"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                9. Intellectual Property
              </h2>
              <p className="mb-3">
                All content on this website—including, but not limited to, text,
                images, graphics, logos, software, and design—is the exclusive
                property of{" "}
                <span className="font-semibold">
                  Budget Travel &amp; Tourism LLC
                </span>{" "}
                and is protected under UAE and international intellectual
                property laws.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  You may not reproduce, copy, adapt, translate, or distribute
                  any content from this site without our prior written
                  permission.
                </li>
                <li>
                  All third-party trademarks, logos, or content remain the
                  property of their respective owners.
                </li>
              </ul>
            </div>

            {/* 10. Limitation of Liability / No Warranty */}
            <div
              id="liability"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                10. Limitation of Liability / No Warranty
              </h2>
              <p className="mb-3">
                Because visa issuance and travel approvals depend on external
                government authorities and third-party service providers, UAE
                Permit does not guarantee any visa, permit, or specific outcome.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  We are not liable for delays, rejections, cancellations, or
                  changes in immigration regulations or requirements.
                </li>
                <li>
                  We are not liable for any direct, indirect, incidental,
                  consequential, or special damages, including financial losses
                  arising from missed flights, hotel cancellations, or changes
                  to travel plans.
                </li>
                <li>
                  Use of the site and services is at your own risk. The website
                  and services are provided on an &quot;as is&quot; and &quot;as
                  available&quot; basis without any warranties, express or
                  implied, to the maximum extent permitted by law.
                </li>
              </ul>
            </div>

            {/* 11. Modifications of Terms / Service Changes */}
            <div
              id="modifications"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                11. Modifications of Terms / Service Changes
              </h2>
              <p className="mb-3">
                We reserve the right to modify, suspend, or discontinue any
                aspect of the website or services at any time, with or without
                prior notice.
              </p>
              <p>
                Any changes to these Terms will be published on this page. Your
                continued use of the website after such modifications
                constitutes acceptance of the updated Terms.
              </p>
            </div>

            {/* 12. Governing Law & Dispute Resolution */}
            <div
              id="law"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                12. Governing Law &amp; Dispute Resolution
              </h2>
              <p className="mb-3">
                These Terms shall be governed by and construed in accordance
                with the laws of the{" "}
                <span className="font-semibold">United Arab Emirates</span>.
              </p>
              <p>
                Any dispute arising from or relating to these Terms or your use
                of the website shall be subject to the exclusive jurisdiction of
                the competent courts of Dubai, UAE.
              </p>
            </div>

            {/* 13. Additional Clauses for Travel Services & Insurance */}
            <div
              id="additional"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                13. Travel Services, Third-Party Partners &amp; Insurance
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Tours, excursions (including desert safaris and adventure
                  activities), hotel bookings, transport, and other travel
                  services may be operated by{" "}
                  <span className="font-semibold">third-party partners</span>.
                  Their own terms and conditions may apply in addition to these
                  Terms.
                </li>
                <li>
                  While we take reasonable care in selecting partners, we are
                  not responsible for their acts, omissions, or negligence.
                </li>
                <li>
                  Complimentary travel insurance, where provided, is offered
                  through third-party insurers. Coverage, exclusions, and claims
                  processes are governed by the policy terms of the insurer.
                  Customers are responsible for reviewing and understanding
                  those policy terms.
                </li>
                <li>
                  For activities with inherent risks (e.g. adventure tours,
                  excursions), you participate at your own risk and must ensure
                  you meet all health, safety, and fitness requirements.
                </li>
              </ul>
            </div>

            {/* 14. Contact */}
            <div
              id="contact"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                14. Contact Us
              </h2>
              <p className="mb-2">
                If you have any questions or concerns regarding these Terms of
                Use, you can contact us at:
              </p>
              <ul className="space-y-1 text-sm">
                <li>
                  Email:{" "}
                  <a
                    href="mailto:support@uaepermit.com"
                    className="text-emerald-700 hover:underline"
                  >
                    support@uaepermit.com
                  </a>
                </li>
                <li>Phone: +971 55 871 5533</li>
                <li>Company: Budget Travel &amp; Tourism LLC</li>
                <li>Website: https://www.uaepermit.com</li>
              </ul>
            </div>
          </section>

          {/* SIDEBAR */}
          <aside className="space-y-6">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                On this page
              </h3>
              <ul className="space-y-2 text-sm">
                {[
                  ["Acceptance of Terms", "#acceptance"],
                  ["Services Provided", "#services"],
                  ["User Obligations", "#responsibilities"],
                  ["Fees & Payments", "#fees"],
                  ["Refunds & Cancellation", "#refunds"],
                  ["Processing Times", "#processing"],
                  ["Delivery of Visa", "#delivery"],
                  ["Communication & Consent", "#communication"],
                  ["Intellectual Property", "#ip"],
                  ["Liability / No Warranty", "#liability"],
                  ["Modifications", "#modifications"],
                  ["Governing Law", "#law"],
                  ["Travel & Insurance Clauses", "#additional"],
                  ["Contact Us", "#contact"],
                ].map(([label, href]) => (
                  <li key={href}>
                    <a
                      href={href}
                      className="flex items-center gap-2 text-slate-600 hover:text-emerald-700 transition-colors"
                    >
                      <span className="h-[3px] w-[18px] rounded-full bg-emerald-500/50" />
                      <span>{label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-5">
              <h3 className="text-sm font-semibold text-emerald-900 mb-2">
                Need clarification?
              </h3>
              <p className="text-xs text-emerald-900/80 mb-4">
                Our support team can explain how these Terms apply to your visa
                or travel booking. For legal interpretation or detailed advice,
                please consult a qualified legal professional.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
              >
                Contact support
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
