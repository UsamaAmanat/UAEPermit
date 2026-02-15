"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const ALLOWED_ADMINS = ["admin@uaepermit.com"]; // update as needed

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapFirebaseError = (code?: string): string => {
    switch (code) {
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/user-not-found":
      case "auth/invalid-credential":
        return "Email or password is incorrect. Please try again.";
      case "auth/wrong-password":
        return "Incorrect password. Please double-check and try again.";
      case "auth/too-many-requests":
        return "Too many login attempts. Please try again later.";
      default:
        return "We couldn't sign you in. Please check your details and try again.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      const userEmail = userCred.user.email || "";

      if (!ALLOWED_ADMINS.includes(userEmail)) {
        await signOut(auth);
        setError("This account is not allowed to access the admin panel.");
        return;
      }

      router.push("/admin");
    } catch (err: any) {
      console.error(err);
      const friendly = mapFirebaseError(err?.code);
      setError(friendly);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center -mt-[40px] justify-center bg-gradient-to-br from-[#3C4161] via-[#3C4161]/95 to-[#0c4d3d] px-4 sm:px-6 py-12">
      {/* Animated background accents */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-[#62E9C9]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#0c4d3d]/15 rounded-full blur-3xl" />
      </div>

      {/* Main container */}
      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/20">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-gradient-to-br from-[#3C4161] to-[#0c4d3d] rounded-2xl">
                <Lock className="w-6 h-6 text-[#62E9C9]" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center text-[#3C4161] tracking-tight">
              Admin Portal
            </h1>
            <p className="text-center text-sm text-slate-500 mt-2">
              Manage applications, countries, and pricing
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700 mb-2.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@uaepermit.com"
                  autoComplete="email"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3C4161]/20 focus:border-[#3C4161] transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700 mb-2.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3C4161]/20 focus:border-[#3C4161] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Forgot your password? Ask the main owner to reset it from
                Firebase console.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-950">
                    Sign in failed
                  </p>
                  <p className="text-sm text-red-800 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#3C4161] to-[#0c4d3d] text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 mt-8"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-center text-xs text-slate-500">
              <span className="font-semibold">Security notice:</span> Only
              whitelisted admin emails can access this panel. All login attempts
              are monitored and logged.
            </p>
          </div>
        </div>

        {/* Bottom decorative text */}
        <p className="text-center text-xs text-white/60 mt-6">
          UAE Permit Admin Console
        </p>
      </div>
    </div>
  );
}
