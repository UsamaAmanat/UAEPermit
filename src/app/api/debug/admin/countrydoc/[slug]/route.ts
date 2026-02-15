export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { slug } = await ctx.params;

    const snap = await adminDB.collection("countries").doc(slug).get();
    const data = snap.data() || {};
    const cfg: any = (data as any).config ?? data;

    const singleCount = Array.isArray(cfg.single) ? cfg.single.length : 0;
    const multipleCount = Array.isArray(cfg.multiple) ? cfg.multiple.length : 0;

    return NextResponse.json({
      ok: true,
      exists: snap.exists,
      keys: Object.keys(data),
      singleCount,
      multipleCount,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
