import { NextResponse } from "next/server";

export async function GET() {
  const keys = [
    "ADMIN_PROJECT_ID",
    "ADMIN_CLIENT_EMAIL",
    "ADMIN_PRIVATE_KEY",
  ] as const;

  const present: Record<string, boolean> = {};
  for (const k of keys) present[k] = !!process.env[k];

  const pk = process.env.ADMIN_PRIVATE_KEY || "";
  const sample = pk ? pk.slice(0, 40) : "";

  return NextResponse.json({
    ok: true,
    envPresent: present,
    privateKeySample: sample,
    privateKeyHasBegin: pk.includes("BEGIN PRIVATE KEY"),
    privateKeyHasEnd: pk.includes("END PRIVATE KEY"),
    privateKeyHasNewlineEscape: pk.includes("\\n"),
  });
}
