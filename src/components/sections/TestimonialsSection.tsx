import { Star } from "lucide-react";
import { TESTIMONIALS } from "@/lib/data";

export default function TestimonialsSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-36">
      <p className="text-[11px] tracking-[0.3em] uppercase text-accent mb-16 text-center">
        From Our Community
      </p>
      <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
        {TESTIMONIALS.map((t) => (
          <div key={t.name} className="group">
            <div className="flex gap-0.5 mb-6">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} size={12} className="fill-accent text-accent" strokeWidth={0} />
              ))}
            </div>
            <blockquote
              className="text-xl font-normal text-foreground leading-relaxed mb-8"
              style={{ fontFamily: "var(--font-lora), serif" }}
            >
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <div className="flex items-center gap-3 border-t border-border pt-6">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-medium text-muted-foreground">
                  {t.name[0]}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{t.name}</p>
                <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
                  {t.location}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
