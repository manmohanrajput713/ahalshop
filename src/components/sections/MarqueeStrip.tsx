import { Leaf } from "lucide-react";
import { MARQUEE_ITEMS } from "@/lib/data";

export default function MarqueeStrip() {
  return (
    <div className="border-y border-border bg-card py-4 overflow-hidden">
      <div className="flex gap-0 animate-marquee whitespace-nowrap">
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-4 px-8">
            <Leaf size={12} className="text-accent flex-shrink-0" strokeWidth={1.5} />
            <span className="text-[11px] tracking-[0.25em] uppercase text-muted-foreground">{item}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
