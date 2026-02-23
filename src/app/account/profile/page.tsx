"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, updateDoc, serverTimestamp, collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { toast } from "sonner";
import { User, Loader2, Mail, Phone, Globe, Calendar, FileText, ArrowRight, PlusCircle, Users } from "lucide-react";
import Link from "next/link";

type ProfileData = { displayName?: string; phone?: string; nationality?: string; createdAt?: any };

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

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid))
      .then((snap) => {
        const data = snap.exists() ? (snap.data() as ProfileData) : {};
        setProfile(data);
        setEditForm({ displayName: data?.displayName ?? "", phone: data?.phone ?? "", nationality: data?.nationality ?? "" });
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const payload = {
        displayName: (editForm.displayName ?? "").trim(),
        phone: (editForm.phone ?? "").trim(),
        nationality: (editForm.nationality ?? "").trim(),
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
                setEditForm({ displayName: profile?.displayName ?? "", phone: profile?.phone ?? "", nationality: profile?.nationality ?? "" });
              }}
              className="text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          )}
        </div>
        <div className="p-5">
          {!editing ? (
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700 ring-2 ring-emerald-200">
                <User className="h-6 w-6" />
              </div>
              <div className="min-w-0 space-y-2">
                <p className="text-lg font-semibold text-slate-900">{profile?.displayName || "User"}</p>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {user?.email}
                </div>
                {profile?.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {profile.phone}
                  </div>
                )}
                {profile?.nationality && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                    {profile.nationality}
                  </div>
                )}
                {memberSince && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    Member since {memberSince}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 mb-1">Display name</label>
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
              <div>
                <label htmlFor="nationality" className="block text-sm font-medium text-slate-700 mb-1">Nationality</label>
                <input
                  id="nationality"
                  type="text"
                  value={editForm.nationality ?? ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, nationality: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
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
