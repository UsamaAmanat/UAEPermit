import "server-only";
import { cert, initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function loadAdminCreds() {
  const projectId = process.env.ADMIN_PROJECT_ID;
  const clientEmail = process.env.ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing ADMIN_PROJECT_ID / ADMIN_CLIENT_EMAIL / ADMIN_PRIVATE_KEY");
  }

  const pk = privateKey.replace(/^"|"$/g, "").replace(/\\n/g, "\n");

  return { projectId, clientEmail, privateKey: pk };
}

const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert(loadAdminCreds()),
        projectId: process.env.ADMIN_PROJECT_ID,
      });

export const adminDB = getFirestore(app);
