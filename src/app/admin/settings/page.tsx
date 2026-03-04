"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { isAdminEmail } from "@/lib/authConstants";
import { Settings, Save, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tickerActive, setTickerActive] = useState(false);
  const [tickerText, setTickerText] = useState("");

  // Auth Protection
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser || !isAdminEmail(currentUser.email)) {
        router.replace("/login");
        return;
      }
      setUser(currentUser);
      setChecking(false);
    });
    return () => unsub();
  }, [router]);

  // Load Settings
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const docRef = doc(db, "settings", "general");
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setTickerActive(!!data.tickerActive);
          setTickerText(data.tickerText || "");
        }
      } catch (err) {
        toast.error("Failed to load settings");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, "settings", "general");
      await setDoc(docRef, { tickerActive, tickerText }, { merge: true });
      toast.success("Settings saved successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (checking || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <AdminLayout userEmail={user.email}>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Website Settings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage global settings, notices, and configurations.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
                <AlertCircle className="h-4.5 w-4.5 text-orange-600" />
              </div>
              <h2 className="text-base font-semibold text-slate-900">Notice Ticker</h2>
            </div>
            <p className="mt-1 text-xs text-slate-500 pl-10">
              Displays a scrolling banner at the very top of the website to communicate important news or updates to customers.
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-semibold text-slate-900">Enable Ticker</label>
                <p className="text-xs text-slate-500">Turn the scrolling notice ON or OFF instantly.</p>
              </div>
              <button
                type="button"
                onClick={() => setTickerActive(!tickerActive)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 ${
                  tickerActive ? "bg-emerald-500" : "bg-slate-200"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    tickerActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="space-y-2">
              <label htmlFor="tickerText" className="text-sm font-semibold text-slate-900">
                Notice Text
              </label>
              <textarea
                id="tickerText"
                value={tickerText}
                onChange={(e) => setTickerText(e.target.value)}
                rows={3}
                disabled={!tickerActive}
                placeholder="e.g., Important Notice: Visa processing may take an additional 24 hours due to national holidays..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
