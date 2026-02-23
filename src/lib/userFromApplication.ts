import "server-only";
import { adminAuth, adminDB } from "@/lib/firebaseAdmin";
import { mailTransporter, MAIL_FROM, SITE_URL } from "@/lib/email/mailer";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 12);

/**
 * After payment success: if application has createAccount true and primary applicant email,
 * create Firebase user, link application to userId, send "account created" email with set-password link.
 */
export async function createUserFromApplicationIfRequested(
  applicationId: string
): Promise<{ created: boolean; userId?: string; error?: string }> {
  const appRef = adminDB.collection("applications").doc(applicationId);
  const snap = await appRef.get();
  if (!snap.exists) return { created: false, error: "application_not_found" };

  const data = snap.data() as any;
  if (!data?.createAccount) return { created: false };

  const applicants = Array.isArray(data.applicants) ? data.applicants : [];
  const primary = applicants[0];
  const email = primary?.email ? String(primary.email).trim() : "";
  if (!email) return { created: false, error: "no_primary_email" };

  // Already linked
  if (data.userId) return { created: false };

  const displayName = [primary?.firstName, primary?.lastName].filter(Boolean).join(" ").trim() || "User";
  const tempPassword = nanoid() + "A1!"; // satisfy typical password policy

  try {
    const userRecord = await adminAuth.createUser({
      email,
      password: tempPassword,
      displayName,
      emailVerified: false,
    });
    const userId = userRecord.uid;

    await appRef.update({
      userId,
      updatedAt: new Date().toISOString(),
    });

    const resetLink = await adminAuth.generatePasswordResetLink(email, {
      url: `${SITE_URL}/account`,
    });

    await mailTransporter.sendMail({
      from: MAIL_FROM,
      to: email,
      subject: "Your visa application account has been created",
      text: `Hello ${displayName},\n\nAn account has been created for you using this email, so you can track your visa applications and manage your profile.\n\nSet your password here: ${resetLink}\n\nYou can then log in at ${SITE_URL}/login and view your applications at ${SITE_URL}/account.\n\nBest regards,\nThe Visa Team`,
      html: `
        <p>Hello ${displayName},</p>
        <p>An account has been created for you using this email, so you can track your visa applications and manage your profile.</p>
        <p><a href="${resetLink}" style="display:inline-block; padding:10px 20px; background:#62E9C9; color:#0c4d3d; text-decoration:none; border-radius:8px; font-weight:600;">Set your password</a></p>
        <p>You can then log in at <a href="${SITE_URL}/login">${SITE_URL}/login</a> and view your applications at <a href="${SITE_URL}/account">${SITE_URL}/account</a>.</p>
        <p>Best regards,<br/>The Visa Team</p>
      `,
    });

    return { created: true, userId };
  } catch (err: any) {
    if (err?.code === "auth/email-already-exists") {
      // Link existing user to this application
      const existing = await adminAuth.getUserByEmail(email);
      if (existing?.uid) {
        await appRef.update({
          userId: existing.uid,
          updatedAt: new Date().toISOString(),
        });
        return { created: false }; // didn't create, but linked
      }
    }
    console.error("createUserFromApplicationIfRequested failed:", err?.message || err);
    return { created: false, error: err?.message || "create_user_failed" };
  }
}
