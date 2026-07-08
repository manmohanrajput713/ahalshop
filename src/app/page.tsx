"use client";

import Header from "@/components/layout/Header";
import HeroSection from "@/components/sections/HeroSection";
import MarqueeStrip from "@/components/sections/MarqueeStrip";
import FlashSaleBanner from "@/components/sections/FlashSaleBanner";
import CollectionSection from "@/components/sections/CollectionSection";
import BestSellersSection from "@/components/sections/BestSellersSection";
import PhilosophySection from "@/components/sections/PhilosophySection";
import IngredientsSection from "@/components/sections/IngredientsSection";
import RitualBanner from "@/components/sections/RitualBanner";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import NewsletterSection from "@/components/sections/NewsletterSection";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header />
      <HeroSection />
      <MarqueeStrip />
      <FlashSaleBanner />
      <CollectionSection />
      <BestSellersSection />
      <PhilosophySection />
      <IngredientsSection />
      <RitualBanner />
      <TestimonialsSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
}
