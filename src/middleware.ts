import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RESERVED = new Set([
  "", "country", "apply", "admin", "blogs", "blog", "contact", "about",
  "track", "terms", "privacy", "faq", "faqs", "api", "_next", "images",
  "sitemap.xml", "robots.txt", "favicon.ico", "stay-overstay-rules"
]);

// If you have exact country slugs list, put them here for stricter redirect.
// Otherwise, this "generic" approach works well.
function isLikelyCountrySlug(s: string) {
  // allow letters + hyphens only (no dots, no underscores, no numbers)
  return /^[a-z-]+$/.test(s);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ignore next internal + files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // only handle single-segment routes: "/albania"
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length !== 1) return NextResponse.next();

  const slug = parts[0].toLowerCase();

  // avoid redirecting known routes
  if (RESERVED.has(slug)) return NextResponse.next();

  // only redirect clean country-like slugs
  if (!isLikelyCountrySlug(slug)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/country/${slug}`;

  return NextResponse.redirect(url, 301);
}

export const config = {
  matcher: ["/:path*"],
};
