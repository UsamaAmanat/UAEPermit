"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { isAdminEmail } from "@/lib/authConstants";
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      if (isAdminEmail(user.email)) router.replace("/admin");
      else router.replace("/account");
    }
  }, [user, authLoading, router]);

  const mapError = (code?: string): string => {
    switch (code) {
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/user-not-found":
      case "auth/invalid-credential":
        return "Email or password is incorrect.";
      case "auth/wrong-password":
        return "Incorrect password.";
      case "auth/too-many-requests":
        return "Too many attempts. Try again later.";
      default:
        return "Couldn't sign you in. Check your details and try again.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email?.trim() || !password) {
      setError("Please enter email and password.");
      return;
    }
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (isAdminEmail(cred.user.email)) router.push("/admin");
      else router.push("/account");
    } catch (err: any) {
      setError(mapError(err?.code));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email?.trim()) {
      setError("Enter your email above first.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
    } catch (err: any) {
      setError(err?.code === "auth/user-not-found" ? "No account found with this email." : "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-[400px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 mb-4">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Sign in</h1>
            <p className="mt-1 text-sm text-slate-500">
              Use the same login for customer dashboard or admin panel. We’ll redirect you based on your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
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
              <button
                type="button"
                onClick={handleForgotPassword}
                className="mt-1.5 text-xs text-emerald-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-800">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}
            {resetSent && (
              <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                Check your email for a link to reset your password.
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don’t have an account?{" "}
            <Link href="/signup" className="font-medium text-emerald-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
