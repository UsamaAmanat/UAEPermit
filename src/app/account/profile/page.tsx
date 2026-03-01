"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, updateDoc, serverTimestamp, collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { toast } from "sonner";
import { User, Loader2, Mail, Phone, Globe, Calendar, FileText, ArrowRight, PlusCircle, Users, UploadCloud, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebaseClient";
import { COUNTRIES } from "@/lib/countries";

type ProfileData = {
  displayName?: string;
  phone?: string;
  nationality?: string;
  applyingFrom?: string;
  passportNumber?: string;
  passportExpiry?: string;
  profession?: string;
  dob?: string;
  passportUrl?: string;
  photoUrl?: string;
  createdAt?: any;
};

type QuickApp = {
  id: string;
  country: string;
  status: string;
  createdAt: Date | null;
};

export default function AccountProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<ProfileData>({});
  const [recentApps, setRecentApps] = useState<QuickApp[]>([]);
  const [appCount, setAppCount] = useState(0);
  const [uploadingDoc, setUploadingDoc] = useState<"passport" | "photo" | null>(null);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid))
      .then((snap) => {
        const data = snap.exists() ? (snap.data() as ProfileData) : {};
        setProfile(data);
        setEditForm({
          displayName: data?.displayName ?? "",
          phone: data?.phone ?? "",
          nationality: data?.nationality ?? "",
          applyingFrom: data?.applyingFrom ?? "",
          passportNumber: data?.passportNumber ?? "",
          passportExpiry: data?.passportExpiry ?? "",
          profession: data?.profession ?? "",
          dob: data?.dob ?? "",
          passportUrl: data?.passportUrl ?? "",
          photoUrl: data?.photoUrl ?? ""
        });
      })
      .catch(() => setProfile({}))
      .finally(() => setLoading(false));

    // Fetch recent applications
    getDocs(query(collection(db, "applications"), where("userId", "==", user.uid), orderBy("createdAt", "desc")))
      .then((snap) => {
        setAppCount(snap.size);
        const apps: QuickApp[] = [];
        snap.docs.slice(0, 3).forEach((d) => {
          const data = d.data() as any;
          apps.push({
            id: d.id,
            country: data?.plan?.country || "—",
            status: (data?.status || "draft").toString().toLowerCase(),
            createdAt: data?.createdAt?.toDate?.() || null,
          });
        });
        setRecentApps(apps);
      })
      .catch(() => {});
  }, [user]);

  const handleUpload = async (kind: "passport" | "photo", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingDoc(kind);
    try {
      const path = `users/${user.uid}/profile/${kind}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setEditForm((prev) => ({ ...prev, [kind === "passport" ? "passportUrl" : "photoUrl"]: url }));
      toast.success(`${kind === "passport" ? "Passport" : "Picture"} uploaded`);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to upload ${kind}`);
    } finally {
      setUploadingDoc(null);
      e.target.value = "";
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const payload = {
        displayName: (editForm.displayName ?? "").trim(),
        phone: (editForm.phone ?? "").trim(),
        nationality: (editForm.nationality ?? "").trim(),
        applyingFrom: (editForm.applyingFrom ?? "").trim(),
        passportNumber: (editForm.passportNumber ?? "").trim(),
        passportExpiry: (editForm.passportExpiry ?? "").trim(),
        profession: (editForm.profession ?? "").trim(),
        dob: (editForm.dob ?? "").trim(),
        passportUrl: editForm.passportUrl ?? "",
        photoUrl: editForm.photoUrl ?? "",
        updatedAt: serverTimestamp(),
      };
      await updateDoc(doc(db, "users", user.uid), payload);
      if (auth.currentUser && payload.displayName !== undefined) {
        await updateProfile(auth.currentUser, { displayName: payload.displayName });
      }
      setProfile((prev) => ({ ...prev, ...payload }));
      setEditing(false);
      toast.success("Profile updated.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const memberSince = profile?.createdAt?.toDate
    ? profile.createdAt.toDate().toLocaleDateString("en-US", { year: "numeric", month: "long" })
    : user?.metadata?.creationTime
      ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", { year: "numeric", month: "long" })
      : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your personal information and account details.</p>
      </div>

      {/* Profile info card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50/50 to-slate-50 px-5 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-800">Your information</span>
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition"
            >
              Edit profile
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setEditForm({
                  displayName: profile?.displayName ?? "",
                  phone: profile?.phone ?? "",
                  nationality: profile?.nationality ?? "",
                  applyingFrom: profile?.applyingFrom ?? "",
                  passportNumber: profile?.passportNumber ?? "",
                  passportExpiry: profile?.passportExpiry ?? "",
                  profession: profile?.profession ?? "",
                  dob: profile?.dob ?? "",
                  passportUrl: profile?.passportUrl ?? "",
                  photoUrl: profile?.photoUrl ?? ""
                });
              }}
              className="text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          )}
        </div>
        <div className="p-5">
          {!editing ? (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {profile?.photoUrl ? (
                  <img src={profile.photoUrl} alt="Profile" className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-emerald-200" />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700 ring-2 ring-emerald-200">
                    <User className="h-6 w-6" />
                  </div>
                )}
                <div className="min-w-0 space-y-1">
                  <p className="text-lg font-semibold text-slate-900">{profile?.displayName || "User"}</p>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {user?.email}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 mt-2">
                {profile?.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {profile.phone}
                  </div>
                )}
                {profile?.nationality && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                    Nationality: {profile.nationality}
                  </div>
                )}
                {profile?.applyingFrom && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                    Applying From: {profile.applyingFrom}
                  </div>
                )}
                {profile?.passportNumber && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                    Passport: {profile.passportNumber}
                  </div>
                )}
                {profile?.passportExpiry && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    Passport Expiry: {profile.passportExpiry}
                  </div>
                )}
                {profile?.profession && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    Profession: {profile.profession}
                  </div>
                )}
                {profile?.dob && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    Date of Birth: {profile.dob}
                  </div>
                )}
                {memberSince && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    Member since {memberSince}
                  </div>
                )}
              </div>

              {/* Uploaded documents */}
              {(profile?.passportUrl || profile?.photoUrl) && (
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Uploaded Documents</p>
                  <div className="flex gap-4">
                    {profile.passportUrl && (
                      <a href={profile.passportUrl} target="_blank" rel="noreferrer" className="group">
                        <div className="h-16 w-24 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden hover:ring-2 hover:ring-emerald-300 transition">
                          <img src={profile.passportUrl} alt="Passport" className="h-full w-full object-cover" />
                        </div>
                        <p className="mt-1 text-[10px] text-emerald-600 group-hover:underline">Passport</p>
                      </a>
                    )}
                    {profile.photoUrl && (
                      <a href={profile.photoUrl} target="_blank" rel="noreferrer" className="group">
                        <div className="h-16 w-16 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden hover:ring-2 hover:ring-emerald-300 transition">
                          <img src={profile.photoUrl} alt="Photo" className="h-full w-full object-cover" />
                        </div>
                        <p className="mt-1 text-[10px] text-emerald-600 group-hover:underline">Photo</p>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 mb-1">First & Last Name</label>
                <input
                  id="displayName"
                  type="text"
                  value={editForm.displayName ?? ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, displayName: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  id="phone"
                  type="text"
                  value={editForm.phone ?? ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="nationality" className="block text-sm font-medium text-slate-700 mb-1">Nationality</label>
                  <select
                    id="nationality"
                    value={editForm.nationality ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, nationality: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="applyingFrom" className="block text-sm font-medium text-slate-700 mb-1">Applying From</label>
                  <select
                    id="applyingFrom"
                    value={editForm.applyingFrom ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, applyingFrom: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="passportNumber" className="block text-sm font-medium text-slate-700 mb-1">Passport Number</label>
                  <input
                    id="passportNumber"
                    type="text"
                    value={editForm.passportNumber ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, passportNumber: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label htmlFor="passportExpiry" className="block text-sm font-medium text-slate-700 mb-1">Passport Expiry</label>
                  <input
                    id="passportExpiry"
                    type="date"
                    value={editForm.passportExpiry ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, passportExpiry: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="profession" className="block text-sm font-medium text-slate-700 mb-1">Profession</label>
                  <input
                    id="profession"
                    type="text"
                    value={editForm.profession ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, profession: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label htmlFor="dob" className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                  <input
                    id="dob"
                    type="date"
                    value={editForm.dob ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, dob: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Uploads */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Passport Upload</label>
                  <label className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition cursor-pointer">
                    {uploadingDoc === "passport" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : editForm.passportUrl ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <UploadCloud className="h-4 w-4" />
                    )}
                    <span className="truncate max-w-[120px]">
                      {uploadingDoc === "passport" ? "Uploading..." : editForm.passportUrl ? "Uploaded" : "Upload Passport"}
                    </span>
                    <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleUpload("passport", e)} disabled={!!uploadingDoc} />
                  </label>
                  {editForm.passportUrl && (
                    <a href={editForm.passportUrl} target="_blank" rel="noreferrer" className="mt-1 block text-[10px] text-emerald-600 hover:underline">View File</a>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Picture Upload</label>
                  <label className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition cursor-pointer">
                    {uploadingDoc === "photo" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : editForm.photoUrl ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <UploadCloud className="h-4 w-4" />
                    )}
                    <span className="truncate max-w-[120px]">
                      {uploadingDoc === "photo" ? "Uploading..." : editForm.photoUrl ? "Uploaded" : "Upload Picture"}
                    </span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload("photo", e)} disabled={!!uploadingDoc} />
                  </label>
                  {editForm.photoUrl && (
                    <a href={editForm.photoUrl} target="_blank" rel="noreferrer" className="mt-1 block text-[10px] text-emerald-600 hover:underline">View File</a>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save changes
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Account summary + Quick links */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Account summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Account summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Total applications</span>
              <span className="font-semibold text-slate-900">{appCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Email</span>
              <span className="font-medium text-slate-700 truncate max-w-[180px]">{user?.email}</span>
            </div>
            {memberSince && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Member since</span>
                <span className="font-medium text-slate-700">{memberSince}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Quick links</h3>
          <div className="space-y-2">
            <Link
              href="/apply"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
            >
              <PlusCircle className="h-4 w-4 text-emerald-500" />
              Apply for a new visa
              <ArrowRight className="h-3 w-3 ml-auto text-slate-400" />
            </Link>
            <Link
              href="/account/applications"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
            >
              <FileText className="h-4 w-4 text-blue-500" />
              View all applications
              <ArrowRight className="h-3 w-3 ml-auto text-slate-400" />
            </Link>
            <Link
              href="/account/family"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
            >
              <Users className="h-4 w-4 text-purple-500" />
              Manage family members
              <ArrowRight className="h-3 w-3 ml-auto text-slate-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent applications */}
      {recentApps.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Recent applications</h3>
            <Link href="/account/applications" className="text-xs font-medium text-emerald-600 hover:text-emerald-700">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentApps.map((app) => (
              <Link
                key={app.id}
                href={`/account/applications/${app.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{app.country}</p>
                    <p className="text-xs text-slate-400">
                      {app.createdAt
                        ? app.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                  app.status === "issued" ? "bg-green-50 text-green-700" :
                  app.status === "processing" || app.status === "paid" ? "bg-sky-50 text-sky-700" :
                  app.status === "rejected" ? "bg-rose-50 text-rose-700" :
                  "bg-slate-100 text-slate-600"
                }`}>
                  {app.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
