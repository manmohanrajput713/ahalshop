"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-medium text-foreground mb-2">Invalid Link</h2>
        <p className="text-sm text-muted-foreground mb-6">
          This password reset link is missing or invalid. Please request a new one.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary text-primary-foreground px-6 py-2.5 text-xs tracking-widest uppercase hover:bg-foreground transition-colors"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-medium text-foreground mb-2">Password Reset Successful</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Your admin password has been successfully updated.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary text-primary-foreground px-6 py-2.5 text-xs tracking-widest uppercase hover:bg-foreground transition-colors"
        >
          Return Home to Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs text-center font-light leading-relaxed">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium">
          New Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-card border border-border pl-4 pr-10 py-3 text-xs tracking-wide placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium">
          Confirm Password
        </label>
        <input
          type={showPassword ? "text" : "password"}
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full bg-card border border-border px-4 py-3 text-xs tracking-wide placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-primary-foreground py-3.5 mt-2 text-xs tracking-[0.2em] uppercase hover:bg-foreground transition-colors duration-300 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : "Reset Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border px-8 py-10 shadow-xl">
        <div className="text-center mb-8 flex flex-col items-center">
          <Link href="/" className="mb-6">
            <Image
              src="/products/logo.png"
              alt="ASHL Herbal Logo"
              width={60}
              height={60}
              className="object-contain"
            />
          </Link>
          <p className="text-[10px] tracking-[0.3em] uppercase text-accent mb-2">
            A Step For Happy Life
          </p>
          <h1
            className="text-2xl font-normal text-foreground"
            style={{ fontFamily: "var(--font-lora), serif" }}
          >
            Reset Admin Password
          </h1>
          <p className="text-xs text-muted-foreground mt-2 font-light">
            Enter your new password below.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
