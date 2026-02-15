// src/app/privacy/page.tsx

import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Read UAE Permit's privacy policy to understand how we collect, use, and protect your personal information when applying for a UAE Dubai visa.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
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
            <span className="font-medium text-slate-800">Privacy Policy</span>
          </nav>
          <p className="text-xs sm:text-sm text-slate-500">
            Last updated:{" "}
            <span className="font-medium text-slate-700">05 December 2025</span>
          </p>
        </div>

        {/* Hero – same family as Terms, tuned to brand */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#3C4161] via-[#3C4161] to-[#0c4d3d] px-6 py-10 sm:px-10 sm:py-12 mb-10">
          <div className="relative z-10 max-w-2xl">
            <p className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[#62E9C9] mb-4">
              Data Protection
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white leading-tight">
              Privacy Policy
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-100 max-w-xl">
              This Privacy Policy explains how{" "}
              <span className="font-semibold">UAE Permit</span> (operated by
              Budget Travel &amp; Tourism LLC) collects, uses, and protects your
              personal information when you apply for visas or book travel
              services with us.
            </p>
          </div>

          <div className="pointer-events-none absolute -right-16 -bottom-24 h-64 w-64 rounded-full bg-[#62E9C9]/20 blur-3xl" />
        </section>

        {/* Layout: main + sidebar */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(260px,1fr)]">
          {/* MAIN CONTENT */}
          <section className="space-y-8 text-sm sm:text-[15px] leading-relaxed text-slate-700">
            {/* 1. Overview & Consent */}
            <div
              id="overview"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                1. Overview &amp; Consent
              </h2>
              <p className="mb-3">
                By using <span className="font-semibold">UAE Permit</span> and
                submitting any personal information (such as passport details,
                contact information, payment information, etc.), you consent to
                the collection, use, disclosure, and storage of your information
                as described in this Privacy Policy.
              </p>
              <p className="mb-3">
                If you do not agree with this Privacy Policy, please do not use
                our website or services.
              </p>
              <p className="mb-2">
                We may update this Privacy Policy from time to time. Continued
                use of the website after such updates constitutes acceptance of
                the updated policy.
              </p>
              <p className="text-xs text-slate-500">
                This Privacy Policy should be read together with our{" "}
                <Link
                  href="/terms"
                  className="text-emerald-700 font-medium hover:underline"
                >
                  Terms &amp; Conditions
                </Link>
                , which govern your use of the site and services.
              </p>
            </div>

            {/* 2. Security of Your Personal Information */}
            <div
              id="security"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                2. Security of Your Personal Information
              </h2>
              <p className="mb-3">
                We implement industry-standard security measures to protect your
                personal and payment information from unauthorised access,
                disclosure, alteration, or destruction. These measures include,
                for example:
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-3">
                <li>SSL encryption for data transmission</li>
                <li>
                  Secure servers and restricted access controls within our
                  systems
                </li>
                <li>
                  Internal policies and procedures to limit access only to
                  authorised personnel who need it to perform their duties
                </li>
              </ul>
              <p className="text-xs text-slate-500">
                While we take reasonable steps to safeguard your data, no method
                of transmission or storage is completely secure. See{" "}
                <a
                  href="#disclaimer"
                  className="text-emerald-700 hover:underline"
                >
                  Disclaimer &amp; Limitation of Liability
                </a>{" "}
                for more details.
              </p>
            </div>

            {/* 3. Information We Collect & Why */}
            <div
              id="information-we-collect"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                3. Information We Collect &amp; Why
              </h2>
              <p className="mb-3">
                The types of information we collect depend on the services you
                request. We generally collect the following:
              </p>

              {/* a. Personal Information */}
              <h3 className="font-semibold text-slate-900 mb-1">
                a. Personal Information
              </h3>
              <p className="mb-2">
                This may include, for example: your name, date of birth,
                nationality, passport number, passport copy, photo, contact
                details (email, phone number), and any other identity-related
                information required for visa processing or travel services.
              </p>
              <p className="mb-3">
                If you request travel-related services, we may also collect
                travel information such as flight details, hotel bookings,
                transport details, and tour bookings.
              </p>

              {/* b. Payment Information */}
              <h3 className="font-semibold text-slate-900 mb-1">
                b. Payment Information
              </h3>
              <p className="mb-3">
                When you pay for our services, we collect necessary payment
                details such as credit/debit card information or payment gateway
                data. These payments are processed through{" "}
                <span className="font-semibold">
                  secure third-party payment processors
                </span>
                . We do not store your full card details on our own servers
                beyond what is necessary for verification, accounting, or legal
                compliance.
              </p>

              {/* c. System & Usage Information */}
              <h3 className="font-semibold text-slate-900 mb-1">
                c. System &amp; Usage Information
              </h3>
              <p className="mb-2">
                We may collect non-identifying technical data including:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 mb-3">
                <li>IP address, browser type, and operating system</li>
                <li>
                  Device type, pages visited, and time &amp; date of visits
                </li>
                <li>
                  General usage patterns used to monitor site performance,
                  optimise user experience, and diagnose technical issues
                </li>
              </ul>
              <p>
                We also use cookies and similar technologies to recognise
                returning users, facilitate navigation, save preferences, and
                gather analytics. See{" "}
                <a href="#cookies" className="text-emerald-700 hover:underline">
                  Cookies &amp; Tracking Technologies
                </a>{" "}
                for more information.
              </p>
            </div>

            {/* 4. Use of Information */}
            <div
              id="use-of-information"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                4. Use of Information
              </h2>
              <p className="mb-3">We use the information we collect to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Process and manage visa applications and travel-related
                  bookings (including hotels, flights, tours, and transport).
                </li>
                <li>
                  Communicate with you regarding application status, booking
                  confirmations, service updates, customer support, and
                  necessary legal or immigration notifications.
                </li>
                <li>
                  Provide complimentary travel insurance (through our partnered
                  insurance providers) when applicable.
                </li>
                <li>
                  Enhance and improve our website, services, and overall user
                  experience.
                </li>
                <li>
                  Send you marketing communications, offers, or promotional
                  updates —{" "}
                  <span className="font-semibold">only with your consent</span>.
                  You may opt out at any time.
                </li>
              </ul>
            </div>

            {/* 5. Sharing & Disclosure */}
            <div
              id="sharing-and-disclosure"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                5. Sharing &amp; Disclosure of Information
              </h2>
              <p className="mb-3">
                We do <span className="font-semibold">not</span> sell or rent
                your personal information to third-party marketing companies.
                However, to deliver our services, we may share your information
                with:
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-3">
                <li>
                  Relevant immigration or government authorities, as required
                  for visa processing.
                </li>
                <li>
                  Payment processing companies, for the sole purpose of
                  completing transactions.
                </li>
                <li>
                  Hotels, airlines, transport providers, tour operators, and
                  insurance partners — strictly to arrange the services you
                  request.
                </li>
                <li>
                  Legal or regulatory authorities, if required by law or to
                  respond to valid legal requests (such as subpoenas, court
                  orders, or investigations).
                </li>
              </ul>
              <p className="text-xs text-slate-500">
                When we share data for service delivery, our partners receive
                only the information necessary to perform their part of the
                service and are expected to protect it appropriately.
              </p>
            </div>

            {/* 6. Cookies */}
            <div
              id="cookies"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                6. Cookies &amp; Tracking Technologies
              </h2>
              <p className="mb-3">
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-3">
                <li>Improve your website experience</li>
                <li>Remember your preferences and settings</li>
                <li>Simplify navigation between pages and steps</li>
                <li>Collect usage analytics and performance metrics</li>
              </ul>
              <p className="mb-2">
                Cookies do <span className="font-semibold">not</span> store
                sensitive personal information such as passport numbers or full
                payment card data.
              </p>
              <p>
                If you disable cookies in your browser, some features of the
                website (such as saved application progress or language
                preferences) may not function properly.
              </p>
            </div>

            {/* 7. Access, Correction & Control */}
            <div
              id="access-and-control"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                7. Access, Correction &amp; Control
              </h2>
              <p className="mb-3">
                You have the right, subject to applicable law, to:
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-3">
                <li>
                  Access and review the personal information we hold about you
                </li>
                <li>
                  Request corrections or updates to inaccurate information
                </li>
                <li>
                  Request deletion of your data where legally permissible and
                  technically feasible
                </li>
                <li>
                  Withdraw consent for non-essential uses (such as marketing
                  emails)
                </li>
              </ul>
              <p className="mb-2">
                If you discover any unauthorised use of your account or data,
                please notify us immediately at{" "}
                <a
                  href="mailto:support@uaepermit.com"
                  className="text-emerald-700 hover:underline"
                >
                  support@uaepermit.com
                </a>{" "}
                or using the phone number listed on our website.
              </p>
              <p>
                You can opt out of marketing communications at any time by using
                the &quot;unsubscribe&quot; option in our emails or by
                contacting us directly.
              </p>
            </div>

            {/* 8. Data Retention */}
            <div
              id="data-retention"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                8. Data Retention
              </h2>
              <p className="mb-3">
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-3">
                <li>Provide the services you requested</li>
                <li>Comply with legal or regulatory obligations</li>
                <li>Resolve disputes and enforce our agreements</li>
              </ul>
              <p>
                If you request deletion of your data (where legally
                permissible), we will remove it, except for information we are
                required by law to retain, such as for compliance, audit, or tax
                purposes.
              </p>
            </div>

            {/* 9. Third-Party Websites */}
            <div
              id="third-party-links"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                9. Third-Party Websites / External Links
              </h2>
              <p className="mb-3">
                Our website may contain links to external websites (such as
                partner hotel sites, airlines, payment gateways, or other
                service providers). We are{" "}
                <span className="font-semibold">not responsible</span> for the
                privacy practices or content of those external sites.
              </p>
              <p>
                We encourage you to read the privacy policies of those websites
                before providing any personal information to them.
              </p>
            </div>

            {/* 10. Disclaimer & Limitation of Liability */}
            <div
              id="disclaimer"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                10. Disclaimer &amp; Limitation of Liability
              </h2>
              <p className="mb-3">
                While we strive to protect your data,{" "}
                <span className="font-semibold">no system is 100% secure</span>.
                UAE Permit and its parent company, Budget Travel &amp; Tourism
                LLC, cannot guarantee absolute protection against hacking, data
                interception, or unauthorised access.
              </p>
              <p className="mb-3">
                By using our services, you accept this inherent risk and agree
                that we are not liable for any damages caused by such events,
                except to the extent required by applicable law.
              </p>
              <p className="text-xs text-slate-500">
                We recommend that you also take reasonable steps to protect your
                own information, such as using strong passwords, logging out on
                shared devices, and keeping your email account secure.
              </p>
            </div>

            {/* 11. Governing Law & Jurisdiction */}
            <div
              id="governing-law"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                11. Governing Law &amp; Jurisdiction
              </h2>
              <p className="mb-3">
                This Privacy Policy is governed by the laws of the{" "}
                <span className="font-semibold">United Arab Emirates</span>.
              </p>
              <p>
                Any disputes relating to privacy or data protection in relation
                to our services will be subject to the exclusive jurisdiction of
                the competent courts of Dubai, UAE.
              </p>
            </div>

            {/* 12. Contact Us */}
            <div
              id="contact"
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                12. Contact Us
              </h2>
              <p className="mb-3">
                If you have questions, concerns, or requests regarding your
                personal information or this Privacy Policy, please contact us
                at:
              </p>
              <ul className="space-y-1 text-sm mb-3">
                <li>
                  📧 Email:{" "}
                  <a
                    href="mailto:support@uaepermit.com"
                    className="text-emerald-700 hover:underline"
                  >
                    support@uaepermit.com
                  </a>
                </li>
                <li>📞 Phone: +971 55 871 5533</li>
              </ul>
              <p className="text-xs text-slate-500">
                For security reasons, we may need to verify your identity before
                responding to certain requests (such as access or deletion
                requests).
              </p>
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
                  ["Overview & Consent", "#overview"],
                  ["Security of Information", "#security"],
                  ["Information We Collect", "#information-we-collect"],
                  ["Use of Information", "#use-of-information"],
                  ["Sharing & Disclosure", "#sharing-and-disclosure"],
                  ["Cookies & Tracking", "#cookies"],
                  ["Access & Control", "#access-and-control"],
                  ["Data Retention", "#data-retention"],
                  ["Third-Party Links", "#third-party-links"],
                  ["Disclaimer & Liability", "#disclaimer"],
                  ["Governing Law", "#governing-law"],
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
                Your privacy matters
              </h3>
              <p className="text-xs text-emerald-900/80 mb-4">
                We only collect the information we need to process your visa and
                travel services. If you&apos;re unsure about how a specific
                clause applies to you, our team can guide you in simple,
                practical language.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
              >
                Talk to our team
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
