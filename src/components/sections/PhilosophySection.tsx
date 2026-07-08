import Image from "next/image";

export default function PhilosophySection() {
  return (
    <section
      id="philosophy"
      className="relative min-h-[70vh] flex items-center justify-center overflow-hidden"
    >
      <Image
        src="/products/rose_tulsi1.jpg"
        alt="ASHL Herbal — Natural Ingredients & Luxury Care"
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <p className="text-[11px] tracking-[0.35em] uppercase text-accent mb-6">Our Philosophy</p>
        <blockquote
          className="text-3xl md:text-5xl font-normal leading-[1.25] text-primary-foreground mb-8"
          style={{ fontFamily: "var(--font-lora), serif" }}
        >
          &ldquo;Rooted in nature, perfected for you. We craft every product with 20+ powerful natural ingredients.&rdquo;
        </blockquote>
        <p className="text-sm tracking-wide text-primary-foreground/80 font-light leading-relaxed max-w-lg mx-auto">
          Every ASHL Herbal formulation is dermatologically tested, free from artificial colors &amp;
          fragrances, and crafted for all skin and hair types — for both men and women.
        </p>
      </div>
    </section>
  );
}
