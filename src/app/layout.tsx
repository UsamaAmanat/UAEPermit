// src/app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import ConditionalShell from "@/components/layout/ConditionalShell";
import NextTopLoader from "nextjs-toploader";

// export const metadata: Metadata = {
//   metadataBase: new URL("https://uaepermit.com"),
//   title: {
//     default: "UAE Permit",
//     template: "%s | UAE Permit",
//   },

//   // ✅ Google + Bing verification
//   verification: {
//     google: "Vfel3ODty6ZQGY3rb71v8UcZltwZzzPQ0QsjmTNlMeQ",
//     other: {
//       "msvalidate.01": "B6172316F305A01A8FDBA7C63FF29C89",
//     },
//   },

//   description:
//     "Dubai & UAE Visa Assistance — fast processing, secure payments, and 24/7 support.",

//   openGraph: {
//     type: "website",
//     siteName: "UAE Permit",
//     url: "https://uaepermit.com",
//     title: "UAE Permit",
//     description:
//       "Dubai & UAE Visa Assistance — fast processing, secure payments, and 24/7 support.",
//     images: [
//       {
//         url: "/og.jpg",
//         width: 1200,
//         height: 630,
//         alt: "UAE Permit – Dubai & UAE Visa Services",
//       },
//     ],
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: "UAE Permit",
//     description:
//       "Dubai & UAE Visa Assistance — fast processing, secure payments, and 24/7 support.",
//     images: ["/og.jpg"],
//   },

//   // ✅ Global default: index + follow
//   robots: {
//     index: true,
//     follow: true,
//     googleBot: {
//       index: true,
//       follow: true,
//       "max-image-preview": "large",
//       "max-snippet": -1,
//       "max-video-preview": -1,
//     },
//   },
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* ================== Google Analytics (gtag.js) ================== */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-DTMMVY0WQV"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-DTMMVY0WQV');
            `,
          }}
        />
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id=GTM-T6CP4XLF'+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-T6CP4XLF');
            `,
          }}
        />

        {/* Google Search Console */}
        <meta
          name="google-site-verification"
          content="wGEwV2Po3PfyVDKSghaF7BOQVMO3nLq-9pA7DSTmBOA"
        />

        {/* Bing Webmaster */}
        <meta
          name="msvalidate.01"
          content="94ECDD201744C0F0D4B93F23C0CD71E2"
        />

        {/* Yandex Webmaster */}
        <meta
          name="yandex-verification"
          content="5832d4f481a9eac9"
        />
        {/* Montserrat Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
      </head>

      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-T6CP4XLF"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        <AuthProvider>
          <NextTopLoader color="#62E9C9" height={3} showSpinner={false} />
          <ConditionalShell>{children}</ConditionalShell>
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}
