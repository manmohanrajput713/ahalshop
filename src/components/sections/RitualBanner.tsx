import { ArrowRight } from "lucide-react";

export default function RitualBanner() {
  return (
    <div className="bg-primary text-primary-foreground py-16 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-primary-foreground/60 mb-3">
            Free With Every Order
          </p>
          <h3
            className="text-3xl font-normal"
            style={{ fontFamily: "var(--font-lora), serif" }}
          >
            Your Herbal Care Guide — a personalised
            <br />
            <em className="italic">skincare &amp; haircare routine.</em>
          </h3>
        </div>
        <a
          href="#"
          className="flex-shrink-0 inline-flex items-center gap-2 border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary transition-colors duration-300 px-8 py-3.5 text-xs tracking-[0.2em] uppercase"
        >
          Explore Products <ArrowRight size={14} strokeWidth={1.5} />
        </a>
      </div>
    </div>
  );
}
