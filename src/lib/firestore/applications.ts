// src/lib/applications.ts

import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { customAlphabet } from "nanoid";
import { db, storage } from "../firebaseClient"; // adjust path

import type {
  Applicant,
  Plan,
  ApplicantDocs,
  DocKind,
  UploadedDoc,
  ApplicantUploadedDocs,
} from "@/app/apply/types";

const nanoid = customAlphabet("0123456789ABCDEFGHJKLMNPQRSTUVWXYZ", 10);

export type LeadSource = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
};

type CreateApplicationPayload = {
  plan: Plan;
  applicants: Applicant[];
  docs: ApplicantDocs[];
  extraFastSelected: boolean;
  extraFastFeePerApplicant?: number;
  grandTotal?: number;
  leadSource?: LeadSource | null;
  createAccount?: boolean;
  userId?: string | null;
};

// --- helpers (small + safe) ---
type ApplicantStatus =
  | "draft"
  | "pending"
  | "submitted"
  | "paid"
  | "processing"
  | "issued"
  | "rejected";

function normalizeApplicantsWithDefaults(applicants: Applicant[]) {
  // Add per-applicant status + visaFile placeholders (backward compatible)
  return (Array.isArray(applicants) ? applicants : []).map((a: any) => ({
    ...a,
    status: (a?.status as ApplicantStatus) || ("submitted" as ApplicantStatus),
    visaFile: a?.visaFile || null, // {name,url,path,size,type,uploadedAt} later
  }));
}

export async function createApplication({
  plan,
  applicants,
  docs,
  extraFastSelected,
  extraFastFeePerApplicant = 0,
  grandTotal = 0,
  leadSource = null,
  createAccount = false,
  userId = null,
}: CreateApplicationPayload): Promise<string> {
  const applicantsWithDefaults = normalizeApplicantsWithDefaults(applicants);
  const trackingId = nanoid();

    const appRef = await addDoc(collection(db, "applications"), {
      plan,
      applicants: applicantsWithDefaults,
      extraFastSelected,
      extraFastFeePerApplicant: extraFastFeePerApplicant || 0,
      grandTotal: grandTotal || 0,
      status: "pending",
      paymentStatus: "pending",
      trackingId,
      orderId: null,
      leadSource: leadSource && Object.keys(leadSource).length > 0 ? leadSource : null,
      createAccount: !!createAccount,
      userId: userId || null,
      createdAt: serverTimestamp(),
    });

  const appId = appRef.id;

  // 2) upload all files to Storage and collect URLs
  const documents: ApplicantUploadedDocs[] = [];

  for (let i = 0; i < applicantsWithDefaults.length; i++) {
    const d = docs?.[i];

    const forApplicant: ApplicantUploadedDocs = {
      passport: [],
      photo: [],
      ticket: [],
    };

    if (d) {
      for (const kind of ["passport", "photo", "ticket"] as DocKind[]) {
        const files = (d as any)?.[kind] || [];
        for (const file of files) {
          const path = `applications/${appId}/applicant_${i}/${kind}/${Date.now()}_${file.name}`;
          const storageRef = ref(storage, path);

          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);

          const uploaded: UploadedDoc = {
            name: file.name,
            url,
            path,
            size: file.size,
            type: file.type || undefined,
          };

          forApplicant[kind].push(uploaded);
        }
      }
    }

    documents.push(forApplicant);
  }

  // 3) write URLs back into the same Firestore doc
  await updateDoc(doc(db, "applications", appId), {
    documents, // applicant-index aligned documents
  });

  return appId;
}

export async function getApplicationById(applicationId: string) {
  const refDoc = doc(db, "applications", applicationId);
  const snap = await getDoc(refDoc);
  if (!snap.exists()) throw new Error("Application not found");
  return { id: snap.id, ...snap.data() } as any;
}

export async function markApplicationPaidAndEmailed(
  applicationId: string,
  data: {
    stripeSessionId: string;
    totalPaid?: number;
    currency?: string;
    orderId?: string;
  },
) {
  const refDoc = doc(db, "applications", applicationId);

  const snap = await getDoc(refDoc);
  const existing = snap.exists() ? (snap.data() as any) : null;

  const existingApplicants = Array.isArray(existing?.applicants)
    ? existing.applicants
    : [];

  const nextApplicants = existingApplicants.map((a: any) => ({
    ...a,
    status: "processing",
  }));

  await updateDoc(refDoc, {
    paymentStatus: "paid",
    status: "processing",
    stripeSessionId: data.stripeSessionId,
    orderId: data.orderId ?? data.stripeSessionId ?? null,
    paidAmount: data.totalPaid ?? null,
    paidCurrency: data.currency ?? null,
    emailSent: true,
    emailSentAt: new Date().toISOString(),
    ...(nextApplicants.length ? { applicants: nextApplicants } : {}),
    updatedAt: serverTimestamp(),
  });
}


export async function updateApplicationContact(
  applicationId: string,
  data: { customerEmail: string; customerName?: string; phone?: string },
) {
  const refDoc = doc(db, "applications", applicationId);

  await updateDoc(refDoc, {
    customerEmail: data.customerEmail,
    customerName: data.customerName || "",
    phone: data.phone || "",
    updatedAt: serverTimestamp(),
  });
}
