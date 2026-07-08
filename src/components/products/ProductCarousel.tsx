"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductCarousel({ images, alt }: { images: string[], alt: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  // If there's only 1 image, just render it statically
  if (images.length === 1) {
    return (
      <div className="relative aspect-[4/5] bg-muted/30 rounded-xl overflow-hidden border border-border">
        <Image 
          src={images[0]}
          alt={alt}
          fill
          className="object-contain"
          priority
        />
      </div>
    );
  }

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const nextSlide = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  return (
    <div className="relative aspect-[4/5] bg-muted/30 rounded-xl overflow-hidden border border-border group">
      {/* Main Image */}
      <div className="w-full h-full relative transition-opacity duration-500">
        <Image 
          src={images[currentIndex]}
          alt={`${alt} - Image ${currentIndex + 1}`}
          fill
          className="object-contain transition-transform duration-500 group-hover:scale-105"
          priority={currentIndex === 0}
        />
      </div>

      {/* Left Arrow */}
      <button 
        onClick={prevSlide}
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground p-2 rounded-full border border-border shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
        aria-label="Previous image"
      >
        <ChevronLeft size={20} strokeWidth={1.5} />
      </button>

      {/* Right Arrow */}
      <button 
        onClick={nextSlide}
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground p-2 rounded-full border border-border shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
        aria-label="Next image"
      >
        <ChevronRight size={20} strokeWidth={1.5} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
        {images.map((_, slideIndex) => (
          <button
            key={slideIndex}
            onClick={() => goToSlide(slideIndex)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              currentIndex === slideIndex 
                ? "bg-foreground scale-125" 
                : "bg-muted-foreground/40 hover:bg-muted-foreground"
            }`}
            aria-label={`Go to image ${slideIndex + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
