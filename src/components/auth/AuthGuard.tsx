"use client";

import { useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import AuthModal from "@/components/auth/AuthModal";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
  message?: string;
}

export default function AuthGuard({ children, message = "Please sign in to your account to access this page." }: AuthGuardProps) {
  const [user, setUser] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsChecking(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-muted-foreground" size={32} />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-1 pt-32 pb-24 max-w-2xl mx-auto px-6 lg:px-12 w-full text-center">
          <div className="bg-card border border-border rounded-xl p-12">
            <h2
              className="text-2xl font-normal text-foreground mb-4"
              style={{ fontFamily: "var(--font-lora), serif" }}
            >
              Sign In Required
            </h2>
            <p className="text-muted-foreground mb-6">{message}</p>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground uppercase tracking-[0.15em] text-xs px-8 py-4 hover:bg-primary/90 transition-colors"
            >
              Sign In to Continue
            </button>
          </div>
        </main>
        <Footer />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onAuthSuccess={() => setAuthModalOpen(false)}
        />
      </div>
    );
  }

  return <>{children}</>;
}
