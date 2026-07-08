"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Phone, Mail, MapPin, MessageCircle, Clock, Send } from "lucide-react";
import { useState } from "react";

const contactMethods = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    detail: "+91 94608 08019",
    sub: "Quick replies, Mon–Sat",
    href: "https://wa.me/919460808019",
    color: "bg-green-50 text-green-700",
  },
  {
    icon: Mail,
    title: "Email",
    detail: "ashl4shop@gmail.com",
    sub: "We respond within 24 hours",
    href: "mailto:ashl4shop@gmail.com",
    color: "bg-amber-50 text-amber-700",
  },
  {
    icon: Phone,
    title: "Call Us",
    detail: "+91 95889 32754, +91 94608 08019",
    sub: "Mon–Sat, 10 AM – 7 PM IST",
    href: "tel:+919588932754",
    color: "bg-blue-50 text-blue-700",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    detail: "ASHL Herbal, India",
    sub: "By appointment only",
    href: "#",
    color: "bg-rose-50 text-rose-700",
  },
];

const faqs = [
  {
    q: "Are ASHL Herbal products safe for sensitive skin?",
    a: "Yes! All our products are dermatologist tested, free from harsh chemicals, parabens, and sulphates. They are formulated for all skin types including sensitive skin.",
  },
  {
    q: "Do you ship across India?",
    a: "Absolutely! We offer free shipping on orders above ₹499 across India. Standard delivery takes 3-7 business days.",
  },
  {
    q: "What is your return policy?",
    a: "We offer a 7-day return policy for unopened products. If you receive a damaged or defective item, we'll replace it immediately.",
  },
  {
    q: "Are your products tested on animals?",
    a: "Never. We are 100% cruelty-free. None of our products or ingredients are tested on animals.",
  },
  {
    q: "How can I track my order?",
    a: "Once your order is shipped, you'll receive a tracking link via SMS and email. You can also check your order status in your account.",
  },
  {
    q: "Can I use these products during pregnancy?",
    a: "While our products are natural, we recommend consulting your dermatologist before using any skincare product during pregnancy.",
  },
];

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setFormStatus("sending");

    const formData = new FormData(form);
    // User needs to replace this with their actual Web3Forms access key
    formData.append("access_key", process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || "YOUR_ACCESS_KEY_HERE");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setFormStatus("sent");
        form.reset();
        setTimeout(() => setFormStatus("idle"), 3000);
      } else {
        console.error("Form submission failed:", data);
        alert("Failed to send message. Please check the API key.");
        setFormStatus("idle");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Something went wrong. Please try again later.");
      setFormStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-32 pb-24">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-20">
          <p className="text-[11px] tracking-[0.3em] uppercase text-accent mb-3">Get In Touch</p>
          <h1
            className="text-4xl lg:text-5xl font-normal text-foreground mb-4"
            style={{ fontFamily: "var(--font-lora), serif" }}
          >
            We&apos;d love to
            <br />
            <em className="italic">hear from you.</em>
          </h1>
          <p className="text-sm text-muted-foreground font-light max-w-md leading-relaxed">
            Have questions about our products? Need help choosing the right one for you?
            Reach out through any of the channels below.
          </p>
        </section>

        {/* Contact Methods */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method) => (
              <a
                key={method.title}
                href={method.href}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card border border-border p-6 rounded-xl hover:border-accent/30 hover:shadow-lg transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-lg ${method.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <method.icon size={22} />
                </div>
                <h3 className="text-sm font-medium text-foreground mb-1">{method.title}</h3>
                <p className="text-sm text-accent font-medium mb-1">{method.detail}</p>
                <p className="text-xs text-muted-foreground">{method.sub}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Contact Form */}
        <section className="max-w-3xl mx-auto px-6 lg:px-12 mb-24">
          <div>
            <h2
              className="text-2xl font-normal text-foreground mb-8"
              style={{ fontFamily: "var(--font-lora), serif" }}
            >
              Send us a <em className="italic">message</em>
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full bg-card border border-border px-4 py-3 text-sm text-foreground rounded-md focus:outline-none focus:border-accent transition-colors"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full bg-card border border-border px-4 py-3 text-sm text-foreground rounded-md focus:outline-none focus:border-accent transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  className="w-full bg-card border border-border px-4 py-3 text-sm text-foreground rounded-md focus:outline-none focus:border-accent transition-colors"
                  placeholder="What's this about?"
                />
              </div>
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  className="w-full bg-card border border-border px-4 py-3 text-sm text-foreground rounded-md focus:outline-none focus:border-accent transition-colors resize-none"
                  placeholder="Tell us what you need help with..."
                />
              </div>
              <button
                type="submit"
                disabled={formStatus === "sending"}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 text-xs tracking-[0.2em] uppercase hover:bg-foreground transition-colors duration-300 disabled:opacity-50"
              >
                {formStatus === "sending" ? "Sending..." : formStatus === "sent" ? "Message Sent ✓" : (
                  <>Send Message <Send size={14} /></>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-card border-y border-border py-24 px-6 lg:px-12">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-[11px] tracking-[0.3em] uppercase text-accent mb-3">Common Questions</p>
              <h2
                className="text-3xl font-normal text-foreground"
                style={{ fontFamily: "var(--font-lora), serif" }}
              >
                Frequently Asked <em className="italic">Questions</em>
              </h2>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-border rounded-lg overflow-hidden bg-background">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-card/50 transition-colors"
                  >
                    <span className="text-sm font-medium text-foreground">{faq.q}</span>
                    <span className="text-accent text-lg shrink-0">{openFaq === idx ? "−" : "+"}</span>
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-4">
                      <p className="text-sm text-muted-foreground font-light leading-relaxed">{faq.a}</p>
                    </div>
                  )}
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
