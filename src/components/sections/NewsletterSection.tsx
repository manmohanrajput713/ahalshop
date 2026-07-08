"use client";

import { useState } from "react";
import { Leaf } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("subscribers")
        .insert([{ email }]);
        
      if (error && error.code !== "23505") {
        // 23505 is unique violation, which means already subscribed
        console.error("Error subscribing:", error);
      }
      
      setSubscribed(true);
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="border-t border-border bg-card">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-accent mb-3">Stay Rooted</p>
          <h3
            className="text-3xl font-normal text-foreground leading-tight"
            style={{ fontFamily: "var(--font-lora), serif" }}
          >
            Botanical wisdom,
            <br />
            <em className="italic">delivered gently.</em>
          </h3>
          <p className="text-xs text-muted-foreground mt-3 font-light">
            Seasonal rituals, new formulations, and herb garden notes.
          </p>
        </div>
        {subscribed ? (
          <div className="flex items-center gap-3 text-primary">
            <Leaf size={16} strokeWidth={1.5} />
            <span className="text-sm tracking-wide" style={{ fontFamily: "var(--font-lora), serif" }}>
              Thank you — watch your inbox.
            </span>
          </div>
        ) : (
          <form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row gap-0 w-full md:max-w-sm"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              className="flex-1 bg-background border border-border px-5 py-3.5 text-xs tracking-wide placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground px-6 py-3.5 text-[10px] tracking-[0.2em] uppercase hover:bg-foreground transition-colors duration-300 whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
