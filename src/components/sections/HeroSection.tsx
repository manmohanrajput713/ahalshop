"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const serumImages = [
  "/products/serum1.jpg",
  "/products/serum2.jpg",

  "/products/serum4.jpg",
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev + 1) % serumImages.length);
    }
    if (isRightSwipe) {
      setCurrentSlide((prev) => (prev === 0 ? serumImages.length - 1 : prev - 1));
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % serumImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="min-h-screen pt-16 grid md:grid-cols-2">
      {/* Left: Text */}
      <div className="flex flex-col justify-end pb-16 pt-16 px-6 lg:px-16 order-2 md:order-1">
        <p className="text-xs tracking-[0.3em] uppercase text-accent mb-6">
          A Step For Happy Life
        </p>
        <h1
          className="text-5xl lg:text-7xl font-normal leading-[1.05] text-foreground mb-8"
          style={{ fontFamily: "var(--font-lora), serif" }}
        >
          Nature&apos;s
          <br />
          <em className="italic">intelligence</em>
          <br />
          for your skin.
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground max-w-xs mb-10 font-light tracking-wide">
          100% natural herbal products, crafted with care. No artificial
          colors, no synthetic fragrances — only what your skin truly needs.
        </p>
        <div className="flex items-center gap-6">
          <a
            href="#collection"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 text-xs tracking-[0.2em] uppercase hover:bg-foreground transition-colors duration-300"
          >
            Shop Now
            <ArrowRight size={14} strokeWidth={1.5} />
          </a>
          <a
            href="#philosophy"
            className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-200 border-b border-border pb-0.5"
          >
            Our Story
          </a>
        </div>
      </div>

      {/* Right: Image Carousel */}
      <div 
        className="relative order-1 md:order-2 w-full aspect-square md:aspect-auto md:h-full bg-white overflow-hidden flex items-center justify-center"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative w-full h-full">
          {serumImages.map((src, index) => (
            <div
              key={src}
              className="absolute inset-0 w-full h-full transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={{ transform: `translateX(${(index - currentSlide) * 100}%)` }}
            >
              <Image
                src={src}
                alt={`ASHL Herbal Face Serum ${index + 1}`}
                fill
                className={index === 0 ? "object-contain object-center p-6 sm:p-8" : "object-contain object-center"}
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          ))}
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {serumImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 ease-out ${currentSlide === idx ? "bg-primary w-8" : "bg-primary/20 w-1.5 hover:bg-primary/50"
                }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Floating badge */}
        <div className="hidden md:block absolute bottom-8 left-8 bg-background/90 backdrop-blur-sm border border-border px-5 py-4 z-10">
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-0.5">Featured</p>
          <p className="text-sm font-medium" style={{ fontFamily: "var(--font-lora), serif" }}>
            Vitamin C Face Serum
          </p>
          <p className="text-xs text-accent mt-0.5">₹499</p>
        </div>
      </div>
    </section>
  );
}
