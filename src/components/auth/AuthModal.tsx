"use client";

import { useState } from "react";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { adminLogin } from "@/app/admin/actions";

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (email: string) => void;
}) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetState = () => {
    setIsSignUp(false);
    setEmail("");
    setPassword("");
    setName("");
    setError(null);
    setSuccessMsg(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (data?.user) {
          if (data.session) {
            onAuthSuccess(data.user.email || email);
            handleClose();
          } else {
            // Show success message for the link
            setSuccessMsg("Verification link sent! Please check your email inbox to verify your account.");
          }
        } else {
          throw new Error("Failed to retrieve user data after registration.");
        }
      } else {
        // Admin login flow
        if (email === "admin") {
          const formData = new FormData();
          formData.append("username", email);
          formData.append("password", password);
          const result = await adminLogin(formData);
          if (result?.error) {
            throw new Error(result.error);
          }
          return; // The server action will handle redirecting to /admin
        }

        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        if (data?.user) {
          onAuthSuccess(data.user.email || email);
          handleClose();
        }
      }
    } catch (err: any) {
      // Next.js redirect() throws a special error — let it propagate
      if (err?.digest?.startsWith("NEXT_REDIRECT")) {
        throw err;
      }

      console.error("Full Auth Error:", err);
      
      let errorMsg = "An unexpected error occurred. Please try again.";
      if (err?.message && err.message !== "{}") {
        errorMsg = err.message;
      } else if (typeof err === "string" && err !== "{}") {
        errorMsg = err;
      } else {
        errorMsg = `System Error: ${JSON.stringify(err)}`;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email or username first.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (email === "admin") {
        const res = await fetch("/api/admin/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: email }),
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Failed to send reset link");
        
        setSuccessMsg(data.message || "Password reset link sent to the admin email.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSuccessMsg("Password reset link sent! Please check your email.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}`,
        },
      });

      if (error) throw error;
      // Note: We don't call onAuthSuccess here because OAuth redirects away
      // from the page. State is handled upon return.
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      setError(err.message || "An error occurred during Google Sign-In.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/15 backdrop-blur-md transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-background border border-border px-8 py-10 shadow-xl transition-all duration-300 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors duration-200"
          aria-label="Close modal"
        >
          <X size={18} strokeWidth={1.5} />
        </button>

        <div className="text-center mb-8">
          <p className="text-[10px] tracking-[0.3em] uppercase text-accent mb-2">
            A Step For Happy Life
          </p>
          <h2
            className="text-2xl font-normal text-foreground"
            style={{ fontFamily: "var(--font-lora), serif" }}
          >
            {isSignUp ? "Create an Account" : "Welcome Back"}
          </h2>
          <p className="text-xs text-muted-foreground mt-2 font-light">
            {isSignUp
              ? "Join us to save address and order details."
              : "Sign in to access your personal botanical rituals."}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs text-center font-light leading-relaxed">
            {error}
          </div>
        )}

        {successMsg ? (
          /* Success Message View */
          <div className="text-center mt-4">
            <div className="mb-6 p-4 bg-primary/10 border border-primary/20 text-primary text-sm font-light leading-relaxed rounded-md">
              {successMsg}
            </div>
            <button
              onClick={handleClose}
              className="mt-4 bg-primary text-primary-foreground py-3 px-8 text-xs tracking-[0.2em] uppercase hover:bg-foreground transition-colors duration-300"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full bg-card border border-border px-4 py-3 text-xs tracking-wide placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium">
                Email Address or Username
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com or username"
                className="w-full bg-card border border-border px-4 py-3 text-xs tracking-wide placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-medium">
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[10px] tracking-[0.1em] text-accent hover:text-foreground transition-colors duration-200"
                  >
                    Forgot?
                  </button>
                )}
              </div>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3.5 mt-2 text-xs tracking-[0.2em] uppercase hover:bg-foreground transition-colors duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : isSignUp ? (
                "Sign Up"
              ) : (
                "Sign In"
              )}
            </button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground uppercase tracking-widest">or</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-card border border-border text-foreground py-3 text-xs tracking-[0.1em] hover:bg-accent/5 hover:border-accent/30 transition-all duration-300 flex items-center justify-center gap-3"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Continue with Google
            </button>
          </form>
        )}

        {!successMsg && (
          <div className="mt-8 text-center border-t border-border/60 pt-6">
            <p className="text-xs text-muted-foreground font-light">
              {isSignUp ? "Already have an account?" : "New to ASHL Herbal?"}{" "}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-accent hover:text-foreground font-medium transition-colors duration-200 ml-1 pb-0.5 border-b border-transparent hover:border-foreground"
              >
                {isSignUp ? "Sign In" : "Create one"}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
