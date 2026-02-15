export default function HomeSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://uaepermit.com/#organization",
        name: "UAE Permit",
        url: "https://uaepermit.com/",
        logo: "https://uaepermit.com/assets/logo.png",
        description:
          "UAE Permit is a trusted online platform providing Dubai visa online and UAE visa services including tourist visas, business visas, and express visa processing worldwide.",
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+971-56-261-7646",
          contactType: "customer support",
          areaServed: "Worldwide",
          availableLanguage: ["English"],
        },
        sameAs: [
          "https://www.facebook.com/uaepermit",
          "https://www.instagram.com/uaepermit",
          "https://www.linkedin.com/company/uaepermit",
        ],
      },

      {
        "@type": "TravelAgency",
        "@id": "https://uaepermit.com/#travelagency",
        name: "UAE Permit",
        url: "https://uaepermit.com/",
        description:
          "Professional UAE travel agency offering Dubai visa online services, express visa processing, and tourist visa assistance for international travelers.",
        parentOrganization: {
          "@id": "https://uaepermit.com/#organization",
        },
        address: {
          "@type": "PostalAddress",
          addressCountry: "AE",
          addressRegion: "Dubai",
          addressLocality: "Dubai",
          postalCode: "00000",
        },
        serviceArea: {
          "@type": "AdministrativeArea",
          name: "Worldwide",
        },
      },

      {
        "@type": "WebSite",
        "@id": "https://uaepermit.com/#website",
        url: "https://uaepermit.com/",
        name: "Dubai Visa Online | UAE Permit",
        publisher: {
          "@id": "https://uaepermit.com/#organization",
        },
      },

      {
        "@type": "WebPage",
        "@id": "https://uaepermit.com/#homepage",
        url: "https://uaepermit.com/",
        name: "Apply Dubai Visa Online | UAE Visa Services – UAE Permit",
        isPartOf: {
          "@id": "https://uaepermit.com/#website",
        },
        about: {
          "@id": "https://uaepermit.com/#travelagency",
        },
        description:
          "Apply Dubai visa online with UAE Permit. Fast UAE tourist visa processing, express approval, transparent fees, and 24/7 expert support.",
      },

      {
        "@type": "FAQPage",
        "@id": "https://uaepermit.com/#faq",
        mainEntity: [
          {
            "@type": "Question",
            name: "Can I apply for a Dubai visa online?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, you can apply for a Dubai visa online through UAE Permit with a simple process and fast approval.",
            },
          },
          {
            "@type": "Question",
            name: "How long does Dubai visa processing take?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Standard processing takes 24–72 hours, while express Dubai visa processing can take 6–24 hours.",
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
