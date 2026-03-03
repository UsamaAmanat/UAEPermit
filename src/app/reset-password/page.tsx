"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const mapError = (code?: string): string => {
    switch (code) {
      case "auth/expired-action-code":
        return "The password reset link has expired. Please request a new one.";
      case "auth/invalid-action-code":
        return "The password reset link is invalid. It may have already been used.";
      case "auth/user-disabled":
        return "This account has been disabled.";
      case "auth/user-not-found":
        return "No account found for this reset link.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      default:
        return "Failed to reset password. Please try again or request a new link.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!oobCode) {
      setError("Missing reset code. Please use the exact link from your email.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error && "code" in err) {
        setError(mapError((err as { code: string }).code));
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 mb-6">
          <CheckCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Password Reset Successful</h2>
        <p className="text-sm text-slate-500 mb-8">
          Your password has been successfully updated. You can now sign in with your new password.
        </p>
        <Link
          href="/login"
          className="block w-full py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
        >
          Return to Sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 mb-4">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-semibold text-slate-900">Reset Password</h1>
        <p className="mt-1 text-sm text-slate-500">
          Please enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-800">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {(!oobCode && !error) && (
          <div className="flex items-start gap-2 rounded-lg bg-orange-50 border border-orange-100 p-3 text-sm text-orange-800">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            Missing reset code. Make sure you clicked the exact link from your email.
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !oobCode}
          className="w-full py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors mt-2"
        >
          {loading ? "Resetting Password…" : "Reset Password"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-[400px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <Suspense fallback={
            <div className="flex justify-center items-center h-48">
              <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
