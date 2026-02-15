// src/app/apply/types.ts

// ─────────────────────────────
// Core types used in Apply flow
// ─────────────────────────────

export type Applicant = {
  id: string; // use string everywhere (e.g. `${Date.now()}`)

  // contact
  countryCode: string; // e.g. "+971"
  phone: string; // WhatsApp preferred
  email: string;

  // personal
  firstName: string;
  lastName: string;
  nationality: string; // country name
  applyingFrom: string; // country name

  // passport & job
  passportNumber: string;
  profession: string;

  // trip
  purposeOfTravel: string;
  tentativeTravelDate: string; // "YYYY-MM-DD"
};

export type Plan = {
  id: string;
  country: string; // e.g. "Pakistan"
  visa: string; // e.g. "96 Hours Transit Visa"
  entry: string; // e.g. "Single / Multiple Entry"
  price: string; // keep as string for UI, convert to number when needed

  processingTime: string; // "24 to 48 hours"
  validity: string; // "Up to 30 days stay"
};

// ─────────────────────────────
// Document upload types
// ─────────────────────────────

export type DocKind = "passport" | "photo" | "ticket";

/** Raw browser-selected files (Step upload) */
export type ApplicantDocs = {
  passport: File[];
  photo: File[];
  ticket: File[];
};

export const emptyDocs = (): ApplicantDocs => ({
  passport: [],
  photo: [],
  ticket: [],
});

/** Uploaded document metadata saved to Firestore */
export type UploadedDoc = {
  name: string;
  url: string;
  path: string;
  size: number; // bytes
  type?: string;
};

/** Uploaded docs per applicant */
export type ApplicantUploadedDocs = Record<DocKind, UploadedDoc[]>;

export const emptyUploadedDocs = (): ApplicantUploadedDocs => ({
  passport: [],
  photo: [],
  ticket: [],
});

// ─────────────────────────────
// Firestore createApplication payload
// ─────────────────────────────

export type CreateApplicationPayload = {
  plan: Plan;
  applicants: Applicant[];
  docs: ApplicantDocs[]; // same index as applicants[]
  extraFastSelected: boolean; // toggle from step 2
};
