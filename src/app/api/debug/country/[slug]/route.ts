import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await ctx.params;

    const snap = await adminDB.collection("countries").doc(slug).get();

    return NextResponse.json({
      ok: true,
      slug,
      docGet: {
        exists: snap.exists,
        keys: snap.exists ? Object.keys(snap.data() || {}) : [],
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
