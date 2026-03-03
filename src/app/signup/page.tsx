"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, db } from "@/lib/firebaseClient";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Lock, Mail, User, Phone, Globe, AlertCircle } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";

export default function SignupPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (user) router.replace("/account");
  }, [user, authLoading, router]);

  const mapError = (code?: string): string => {
    switch (code) {
      case "auth/email-already-in-use":
        return "An account with this email already exists. Try logging in.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/weak-password":
        return "Please choose a stronger password (at least 6 characters).";
      default:
        return "Couldn't create account. Please try again.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name?.trim() || !email?.trim() || !phone?.trim() || !nationality?.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await sendEmailVerification(cred.user);
      await setDoc(doc(db, "users", cred.user.uid), {
        displayName: name.trim(),
        email: email.trim(),
        phone: (phone || "").trim(),
        nationality: (nationality || "").trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Fire and forget welcome email
      fetch("/api/email/welcome", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Use a default fallback or dynamic env variable on the client if you have one.
          // For simplicity in the client component, if the API requires a secret, you could pass it 
          // via a NEXT_PUBLIC_ env variable, though standard practice is to use server actions.
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_INTERNAL_API_SECRET || "fallback_secret_for_local_dev"}`
        },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
        }),
      }).catch(console.error);

      router.push("/account");
    } catch (err: any) {
      setError(mapError(err?.code));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6FB]">
        <p className="text-slate-600">Loading…</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-28 pb-16 px-4 bg-gradient-to-br from-[#F5F6FB] via-white to-[#fdf7e3]">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-[#3C4161]">Create account</h1>
          <p className="mt-1 text-sm text-slate-500">Sign up to manage your visa applications and profile.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:ring-2 focus:ring-[#62E9C9]/30 focus:border-[#62E9C9]"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:ring-2 focus:ring-[#62E9C9]/30 focus:border-[#62E9C9]"
                />
              </div>
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+971 50 123 4567"
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:ring-2 focus:ring-[#62E9C9]/30 focus:border-[#62E9C9]"
                />
              </div>
            </div>
            <div>
              <label htmlFor="nationality" className="block text-sm font-medium text-slate-700 mb-1">Nationality</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  id="nationality"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:ring-2 focus:ring-[#62E9C9]/30 focus:border-[#62E9C9] appearance-none"
                >
                  <option value="" disabled>Select your country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:ring-2 focus:ring-[#62E9C9]/30 focus:border-[#62E9C9]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-800">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#62E9C9] text-[#0c4d3d] font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Creating account…" : "Sign up"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#0c4d3d] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
