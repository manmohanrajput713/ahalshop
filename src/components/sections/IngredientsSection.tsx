import Image from "next/image";
import { Leaf } from "lucide-react";
import { INGREDIENTS } from "@/lib/data";

export default function IngredientsSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-36">
      <div className="grid md:grid-cols-2 gap-16 items-start">
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-accent mb-4">Key Botanicals</p>
          <h2
            className="text-4xl font-normal text-foreground leading-tight"
            style={{ fontFamily: "var(--font-lora), serif" }}
          >
            Powered by
            <br />
            <em className="italic">20+ natural</em>
            <br />
            ingredients.
          </h2>
        </div>
        <div className="relative bg-white overflow-hidden aspect-[4/3] flex items-center justify-center p-2 md:p-3 lg:p-4">
          <div className="relative w-full h-full">
            <Image
              src="/products/cleanser1.jpg"
              alt="ASHL Herbal Face Cleanser with botanical ingredients"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-border">
        {INGREDIENTS.map((ing, i) => (
          <div
            key={ing.name}
            className={`py-10 px-8 border-b md:border-b-0 ${
              i < 3 ? "lg:border-r" : ""
            } border-border group hover:bg-card transition-colors duration-300`}
          >
            <div className="flex items-center gap-2 mb-4">
              <Leaf size={14} className="text-accent" strokeWidth={1.5} />
              <span className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground">
                Botanical
              </span>
            </div>
            <h3
              className="text-xl font-normal text-foreground mb-1"
              style={{ fontFamily: "var(--font-lora), serif" }}
            >
              {ing.name}
            </h3>
            <p className="text-[10px] tracking-wide text-accent italic mb-4">{ing.latin}</p>
            <p className="text-xs leading-relaxed text-muted-foreground font-light">
              {ing.benefit}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
