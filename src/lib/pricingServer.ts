import "server-only";
import { adminDB } from "@/lib/firebaseAdmin";

export async function getGlobalPricingServer() {
  const db = adminDB;
  const snap = await db.collection("settings").doc("pricing").get();
  return snap.exists ? (snap.data() as any) : null;
}
