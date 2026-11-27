"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { authClient } from "@/lib/auth/client";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCardShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#F8F6F1] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px] mb-6 flex items-center">
        <Link
          href="/"
          className="text-[16px] font-semibold tracking-tight text-[#1A1A1A]"
        >
          EscrowPay
        </Link>
      </div>

      <section className="w-full max-w-[420px] bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#5F6368]">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-[24px] font-semibold tracking-[-0.02em] text-[#1A1A1A] leading-tight">
          {title}
        </h1>
        <p className="mt-2 text-[14px] text-[#5F6368] leading-relaxed">
          {subtitle}
        </p>

        <div className="mt-6">{children}</div>

        {footer ? (
          <div className="mt-6 pt-5 border-t border-[#E5E5E5] text-[13px] text-[#5F6368] text-center">
            {footer}
          </div>
        ) : null}
      </section>
    </main>
  );
}

interface EmailAuthFormProps {
  mode: "login" | "signup";
}

export function EmailPasswordAuthForm({ mode }: EmailAuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const trimmedEmail = email.trim();
      const res = isSignup
        ? await authClient.signUp.email({
            email: trimmedEmail,
            password,
            name: trimmedEmail.split("@")[0] || "Seller",
          })
        : await authClient.signIn.email({
            email: trimmedEmail,
            password,
          });

      if (res.error) {
        setError(res.error.message || "Authentication failed. Please try again.");
        setLoading(false);
        return;
      }

      router.push(isSignup ? "/onboarding" : "/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
      setLoading(false);
    }
  }

  return (
    <AuthCardShell
      eyebrow={isSignup ? "SELLER ACCOUNT" : "SELLER SIGN IN"}
      title={isSignup ? "Create your seller account" : "Welcome back"}
      subtitle={
        isSignup
          ? "Start sharing protected Naira payment links on WhatsApp and Instagram."
          : "Sign in to manage your pay links, orders, and payouts."
      }
      footer={
        isSignup ? (
          <>
            Already have a store?{" "}
            <Link
              href="/login"
              className="text-[#1A1A1A] font-medium underline underline-offset-4"
            >
              Sign in
            </Link>
          </>
        ) : (
          <>
            New to EscrowPay?{" "}
            <Link
              href="/signup"
              className="text-[#1A1A1A] font-medium underline underline-offset-4"
            >
              Create a seller account
            </Link>
          </>
        )
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-[13px] font-medium text-[#1A1A1A] mb-1.5"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@store.com"
            className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] text-[14px] text-[#1A1A1A] placeholder:text-[#5F6368]/60 focus:outline-none focus:border-[#1A1A1A] transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-[13px] font-medium text-[#1A1A1A] mb-1.5"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete={isSignup ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            className="w-full h-11 px-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] text-[14px] text-[#1A1A1A] placeholder:text-[#5F6368]/60 focus:outline-none focus:border-[#1A1A1A] transition-colors"
          />
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-xl bg-[#FDECEC] border border-[#FECACA] px-3.5 py-2.5 text-[13px] text-[#B42318]"
          >
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-full bg-[#1A1A1A] text-[#FFFFFF] text-[14px] font-medium hover:bg-[#1A1A1A]/90 disabled:opacity-60 transition-opacity cursor-pointer"
        >
          {loading
            ? isSignup
              ? "Creating account..."
              : "Signing in..."
            : isSignup
              ? "Continue →"
              : "Sign in →"}
        </button>
        {isSignup ? (
          <p className="text-center text-[12px] leading-snug text-[#5F6368]">
            By creating an account you agree to the{" "}
            <Link href="/legal/terms" className="underline underline-offset-2 hover:text-[#1A1A1A]">
              Terms
            </Link>
            ,{" "}
            <Link href="/legal/escrow" className="underline underline-offset-2 hover:text-[#1A1A1A]">
              Escrow Agreement
            </Link>{" "}
            and{" "}
            <Link href="/legal/privacy" className="underline underline-offset-2 hover:text-[#1A1A1A]">
              Privacy Policy
            </Link>
            .
          </p>
        ) : null}
      </form>
    </AuthCardShell>
  );
}
