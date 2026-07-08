import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import { Leaf, Heart, Shield, Sparkles, Award, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us — ASHL Herbal | Our Story & Mission",
  description: "Learn about ASHL Herbal — A Step For Happy Life. Our mission to bring 100% natural, chemical-free skincare and hair care products to every home.",
};

const values = [
  {
    icon: Leaf,
    title: "100% Natural",
    desc: "Every ingredient is sourced from nature. No synthetic chemicals, no artificial colors, no harmful preservatives.",
  },
  {
    icon: Shield,
    title: "Chemical Free",
    desc: "Paraben free, sulphate free, and silicone free. We never compromise on what touches your skin.",
  },
  {
    icon: Heart,
    title: "Cruelty Free",
    desc: "We love animals. None of our products are tested on animals. Ever.",
  },
  {
    icon: Sparkles,
    title: "Handcrafted",
    desc: "Each product is made in small batches to ensure maximum freshness and potency.",
  },
  {
    icon: Award,
    title: "Dermatologist Tested",
    desc: "All formulations are tested and approved by certified dermatologists for safety.",
  },
  {
    icon: Users,
    title: "For Everyone",
    desc: "Suitable for all skin and hair types — men and women, young and mature.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-24">
        {/* Hero */}
        <section className="relative py-24 lg:py-36 px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[11px] tracking-[0.3em] uppercase text-accent mb-4">Our Story</p>
              <h1
                className="text-4xl lg:text-6xl font-normal text-foreground mb-8 leading-tight"
                style={{ fontFamily: "var(--font-lora), serif" }}
              >
                A Step For
                <br />
                <em className="italic">Happy Life.</em>
              </h1>
              <div className="space-y-4 text-muted-foreground text-sm leading-relaxed font-light max-w-md">
                <p>
                  ASHL Herbal was born from a simple belief — that nature holds the most powerful
                  solutions for our skin and hair. In a world saturated with chemical-laden products,
                  we chose a different path.
                </p>
                <p>
                  Our journey began with a passion for Ayurveda and traditional herbal remedies that
                  have been trusted for centuries. We combine ancient wisdom with modern formulation
                  techniques to create products that truly work.
                </p>
                <p>
                  Every product is crafted with hand-selected herbs, essential oils, and botanical
                  extracts — sourced responsibly and processed with care to retain their natural potency.
                </p>
              </div>
            </div>
            <div className="relative aspect-square bg-card rounded-2xl overflow-hidden">
              <Image
                src="/products/logo.png"
                alt="ASHL Herbal — A Step For Happy Life"
                fill
                className="object-contain p-16"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="bg-primary text-primary-foreground py-24 px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-[11px] tracking-[0.3em] uppercase opacity-70 mb-4">Our Mission</p>
            <h2
              className="text-3xl lg:text-4xl font-normal mb-8 leading-relaxed"
              style={{ fontFamily: "var(--font-lora), serif" }}
            >
              &ldquo;To make pure, natural, and effective herbal products accessible to every household —
              because <em className="italic">everyone deserves</em> healthy skin and hair.&rdquo;
            </h2>
            <p className="text-sm opacity-80 font-light max-w-lg mx-auto leading-relaxed">
              We are committed to transparency, sustainability, and the timeless healing power of herbs.
              No artificial color, no synthetic fragrance — only what your body truly needs.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="py-24 lg:py-36 px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] tracking-[0.3em] uppercase text-accent mb-3">What We Stand For</p>
            <h2
              className="text-3xl lg:text-4xl font-normal text-foreground"
              style={{ fontFamily: "var(--font-lora), serif" }}
            >
              Our <em className="italic">Values</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-card border border-border p-8 rounded-xl hover:border-accent/30 transition-colors duration-300 group"
              >
                <v.icon
                  size={28}
                  strokeWidth={1.2}
                  className="text-accent mb-5 group-hover:scale-110 transition-transform duration-300"
                />
                <h3
                  className="text-lg font-medium text-foreground mb-3"
                  style={{ fontFamily: "var(--font-lora), serif" }}
                >
                  {v.title}
                </h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications */}
        <section className="bg-card border-y border-border py-20 px-6 lg:px-12">
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-[11px] tracking-[0.3em] uppercase text-accent mb-4">Why Trust Us</p>
            <h2
              className="text-3xl font-normal text-foreground mb-12"
              style={{ fontFamily: "var(--font-lora), serif" }}
            >
              Certified & <em className="italic">Trusted</em>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "100% Natural", sub: "No chemicals" },
                { label: "Paraben Free", sub: "Safe formulas" },
                { label: "Sulphate Free", sub: "Gentle cleanse" },
                { label: "Cruelty Free", sub: "Not tested on animals" },
              ].map((cert) => (
                <div key={cert.label} className="p-6">
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Shield size={22} className="text-accent" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">{cert.label}</p>
                  <p className="text-xs text-muted-foreground">{cert.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
