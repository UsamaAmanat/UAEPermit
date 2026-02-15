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
import { db, storage } from "../firebaseClient"; // adjust path

import type {
  Applicant,
  Plan,
  ApplicantDocs,
  DocKind,
  UploadedDoc,
  ApplicantUploadedDocs,
} from "@/app/apply/types";

type CreateApplicationPayload = {
  plan: Plan;
  applicants: Applicant[];
  docs: ApplicantDocs[];
  extraFastSelected: boolean;
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
}: CreateApplicationPayload): Promise<string> {
  // 1) create Firestore doc with basic info
  // ✅ Important: we now store per-applicant status/visaFile inside applicants[]
  const applicantsWithDefaults = normalizeApplicantsWithDefaults(applicants);

  const appRef = await addDoc(collection(db, "applications"), {
    plan,
    applicants: applicantsWithDefaults,
    extraFastSelected,
status: "submitted",
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
  data: { stripeSessionId: string; totalPaid?: number; currency?: string },
) {
  const refDoc = doc(db, "applications", applicationId);

  const snap = await getDoc(refDoc);
  const existing = snap.exists() ? (snap.data() as any) : null;

  const existingApplicants = Array.isArray(existing?.applicants)
    ? existing.applicants
    : [];

  // ✅ When payment is done, move each applicant forward
  // IMPORTANT: use "processing" (your TrackPage maps it → paid UI step)
  const nextApplicants = existingApplicants.map((a: any) => ({
    ...a,
    status: "processing",
  }));

  await updateDoc(refDoc, {
    paymentStatus: "paid",
    status: "processing", // root legacy aligns with journey
    stripeSessionId: data.stripeSessionId,
    paidAmount: data.totalPaid ?? null,
    paidCurrency: data.currency ?? null,
    emailSent: true,
    emailSentAt: new Date().toISOString(),
    ...(nextApplicants.length ? { applicants: nextApplicants } : {}), // don't overwrite if empty
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
