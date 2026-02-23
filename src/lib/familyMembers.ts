import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export type FamilyMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  nationality: string;
  applyingFrom: string;
  passportNumber: string;
  profession: string;
  purposeOfTravel?: string;
  tentativeTravelDate?: string;
  dob?: string; // YYYY-MM-DD for birthday
  passportExpiry?: string; // for reminders
  createdAt?: string;
  updatedAt?: string;
};

const emptyMember = (): Omit<FamilyMember, "id" | "createdAt" | "updatedAt"> => ({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  countryCode: "+971",
  nationality: "",
  applyingFrom: "",
  passportNumber: "",
  profession: "",
  purposeOfTravel: "",
  tentativeTravelDate: "",
  dob: "",
  passportExpiry: "",
});

export function familyMembersRef(userId: string) {
  return collection(db, "users", userId, "familyMembers");
}

export async function getFamilyMembers(userId: string): Promise<FamilyMember[]> {
  const snap = await getDocs(familyMembersRef(userId));
  return snap.docs
    .map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...emptyMember(),
      ...data,
      createdAt: data?.createdAt?.toDate?.()?.toISOString?.() ?? undefined,
      updatedAt: data?.updatedAt?.toDate?.()?.toISOString?.() ?? undefined,
    } as FamilyMember;
  })
    .sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
}

export async function addFamilyMember(
  userId: string,
  data: Omit<FamilyMember, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = await addDoc(familyMembersRef(userId), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateFamilyMember(
  userId: string,
  memberId: string,
  data: Partial<Omit<FamilyMember, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  await updateDoc(doc(db, "users", userId, "familyMembers", memberId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteFamilyMember(
  userId: string,
  memberId: string
): Promise<void> {
  await deleteDoc(doc(db, "users", userId, "familyMembers", memberId));
}
