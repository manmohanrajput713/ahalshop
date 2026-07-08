import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — ASHL Herbal | Skin Care & Hair Care Tips",
  description: "Expert tips on skin care, hair care, ingredient guides, and herbal beauty routines from ASHL Herbal.",
};

const blogPosts = [
  {
    id: 1,
    title: "5 Ayurvedic Herbs That Transform Your Skin",
    excerpt: "Discover the ancient herbs like Neem, Turmeric, and Aloe Vera that have been used for centuries to achieve clear, glowing skin naturally.",
    category: "Skin Care Tips",
    readTime: "5 min read",
    date: "June 28, 2025",
    img: "/products/facepack1.jpg",
  },
  {
    id: 2,
    title: "How Bhringraj Reverses Hair Fall Naturally",
    excerpt: "Learn how the 'King of Herbs' for hair, Bhringraj, can strengthen your roots, reduce shedding, and promote new growth without chemicals.",
    category: "Hair Care Tips",
    readTime: "4 min read",
    date: "June 15, 2025",
    img: "/products/hairoil1.jpg",
  },
  {
    id: 3,
    title: "Understanding Your Skin Type: A Complete Guide",
    excerpt: "Is your skin oily, dry, combination, or sensitive? This guide helps you identify your type and choose the right products for your routine.",
    category: "Beauty Routine",
    readTime: "6 min read",
    date: "June 5, 2025",
    img: "/products/serum1.jpg",
  },
  {
    id: 4,
    title: "Why Paraben-Free Products Matter for Your Health",
    excerpt: "Parabens are in 85% of cosmetics. Learn why you should switch to paraben-free alternatives and how to read ingredient labels.",
    category: "Ingredient Guide",
    readTime: "4 min read",
    date: "May 22, 2025",
    img: "/products/facewash1.jpg",
  },
  {
    id: 5,
    title: "The Perfect Morning Skincare Routine in 5 Steps",
    excerpt: "Start your day right with this simple 5-step herbal skincare routine — cleanse, tone, serum, moisturize, and protect.",
    category: "Beauty Routine",
    readTime: "3 min read",
    date: "May 10, 2025",
    img: "/products/cleanser1.jpg",
  },
  {
    id: 6,
    title: "Neem vs Tea Tree Oil: Which is Better for Acne?",
    excerpt: "Both are powerful anti-bacterial ingredients. We compare their effectiveness, side effects, and how to use them for acne-prone skin.",
    category: "Ingredient Guide",
    readTime: "5 min read",
    date: "April 28, 2025",
    img: "/products/facepack1.jpg",
  },
];

const categories = ["All", "Skin Care Tips", "Hair Care Tips", "Beauty Routine", "Ingredient Guide"];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-32 pb-24">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-16">
          <p className="text-[11px] tracking-[0.3em] uppercase text-accent mb-3">Our Journal</p>
          <h1
            className="text-4xl lg:text-5xl font-normal text-foreground mb-4"
            style={{ fontFamily: "var(--font-lora), serif" }}
          >
            Herbal Beauty
            <br />
            <em className="italic">Insights.</em>
          </h1>
          <p className="text-sm text-muted-foreground font-light max-w-md leading-relaxed">
            Expert tips on skincare, hair care, ingredient science, and Ayurvedic beauty rituals.
          </p>
        </section>

        {/* Category Tags */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-12">
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <span
                key={cat}
                className="text-[10px] tracking-[0.15em] uppercase px-4 py-2 bg-card border border-border text-muted-foreground hover:text-foreground hover:border-accent/40 transition-colors cursor-pointer rounded-full"
              >
                {cat}
              </span>
            ))}
          </div>
        </section>

        {/* Featured Post */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-16">
          <div className="grid md:grid-cols-2 gap-8 bg-card border border-border rounded-xl overflow-hidden">
            <div className="relative aspect-[4/3] md:aspect-auto">
              <Image
                src={blogPosts[0].img}
                alt={blogPosts[0].title}
                fill
                className="object-contain p-6"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="flex flex-col justify-center p-8 lg:p-12">
              <span className="text-[10px] tracking-[0.2em] uppercase text-accent mb-3">
                {blogPosts[0].category}
              </span>
              <h2
                className="text-2xl lg:text-3xl font-normal text-foreground mb-4 leading-snug"
                style={{ fontFamily: "var(--font-lora), serif" }}
              >
                {blogPosts[0].title}
              </h2>
              <p className="text-sm text-muted-foreground font-light leading-relaxed mb-6">
                {blogPosts[0].excerpt}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6">
                <span className="flex items-center gap-1"><Clock size={12} /> {blogPosts[0].readTime}</span>
                <span>{blogPosts[0].date}</span>
              </div>
              <span className="inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-accent hover:text-foreground transition-colors cursor-pointer">
                Read Article <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post) => (
              <article key={post.id} className="group cursor-pointer">
                <div className="relative aspect-[4/3] bg-card border border-border rounded-xl overflow-hidden mb-5">
                  <Image
                    src={post.img}
                    alt={post.title}
                    fill
                    className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <span className="text-[10px] tracking-[0.2em] uppercase text-accent mb-2 block">
                  {post.category}
                </span>
                <h3
                  className="text-lg font-normal text-foreground mb-2 group-hover:text-accent transition-colors leading-snug"
                  style={{ fontFamily: "var(--font-lora), serif" }}
                >
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed mb-3 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                  <span>{post.date}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
