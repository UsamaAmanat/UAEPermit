"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { toast } from "sonner";
import { Lock, Loader2, Eye, EyeOff, ShieldCheck, KeyRound } from "lucide-react";

export default function AccountPasswordPage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Eye toggle states
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const showMismatch = confirmPassword.length > 0 && !passwordsMatch;
  const passwordTooShort = newPassword.length > 0 && newPassword.length < 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser!, cred);
      await updatePassword(auth.currentUser!, newPassword);
      toast.success("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      if (err?.code === "auth/wrong-password" || err?.code === "auth/invalid-credential") {
        toast.error("Current password is incorrect.");
      } else {
        toast.error(err?.message || "Failed to update password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Change password</h1>
        <p className="mt-1 text-sm text-slate-500">
          Update your account password. You&apos;ll need your current password to confirm.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_auto]">
        {/* Password form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current password */}
            <div>
              <label htmlFor="current" className="block text-sm font-medium text-slate-700 mb-1.5">
                Current password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="current"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label htmlFor="new" className="block text-sm font-medium text-slate-700 mb-1.5">
                New password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="new"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  placeholder="At least 6 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordTooShort && (
                <p className="mt-1.5 text-xs text-amber-600">
                  Password must be at least 6 characters.
                </p>
              )}
            </div>

            {/* Confirm new password */}
            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-slate-700 mb-1.5">
                Confirm new password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500/30 transition ${
                    showMismatch ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-emerald-500"
                  }`}
                  placeholder="Re-enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {showMismatch && (
                <p className="mt-1.5 text-xs text-rose-500">Passwords do not match.</p>
              )}
              {passwordsMatch && newPassword.length >= 6 && (
                <p className="mt-1.5 text-xs text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !passwordsMatch || passwordTooShort}
              className="w-full py-2.5 rounded-lg bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition shadow-sm"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              Update password
            </button>
          </form>
        </div>

        {/* Security tips card */}
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-5 shadow-sm md:w-52">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-800">Security tips</h3>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
              Use at least 8 characters with mixed case
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
              Include numbers and special characters
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
              Don&apos;t reuse passwords from other sites
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
              Never share your password with anyone
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
