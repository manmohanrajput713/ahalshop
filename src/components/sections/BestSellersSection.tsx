"use client";

import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/app/admin/(dashboard)/products/actions";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { Star, ChevronRight, Gift } from "lucide-react";
import WishlistButton from "@/components/products/WishlistButton";

// Products marked as Bestseller or Popular
export default function BestSellersSection() {
  const { addToCart, buyXGetYSettings } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getProducts().then(data => {
      if (data && data.length > 0) {
        setProducts(data);
      }
    }).finally(() => setIsLoading(false));
  }, []);

  const bestSellers = products.filter(
    (p) => (p as any).badge === "Bestseller" || (p as any).badge === "Popular"
  );

  if (isLoading) return null;
  if (bestSellers.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28">
      <div className="flex items-end justify-between mb-12">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star size={16} className="text-amber-500 fill-amber-500" />
            <p className="text-[11px] tracking-[0.3em] uppercase text-accent">Best Sellers</p>
          </div>
          <h2
            className="text-3xl lg:text-4xl font-normal text-foreground"
            style={{ fontFamily: "var(--font-lora), serif" }}
          >
            Most loved <em className="italic">products.</em>
          </h2>
        </div>
        <Link
          href="/shop"
          className="hidden md:inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors border-b border-border pb-0.5"
        >
          View all <ChevronRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
        {bestSellers.slice(0, 4).map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group block"
          >
            <div className="relative overflow-hidden bg-card aspect-[4/5] rounded-lg">
              <Image
                src={product.img}
                alt={product.alt || product.name}
                fill
                className="object-contain transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-500" />
              {(product as any).discount ? (
                <span className="absolute top-3 left-3 bg-red-50 text-red-600 border border-red-100 text-[9px] tracking-[0.1em] font-medium uppercase px-2 py-1 rounded shadow-sm z-10">
                  {(product as any).discount}
                </span>
              ) : (product as any).badge ? (
                <span className="absolute top-3 left-3 bg-amber-50 text-amber-700 text-[9px] tracking-[0.15em] uppercase px-2.5 py-1 rounded-full flex items-center gap-1 z-10">
                  <Star size={10} fill="currentColor" /> {(product as any).badge}
                </span>
              ) : null}
              {buyXGetYSettings.enabled && (() => {
                const unitPrice = parseFloat(product.price?.replace(/[^\d.]/g, "")) || 0;
                if (unitPrice >= buyXGetYSettings.minPrice) {
                  return (
                    <span className="absolute bottom-3 left-3 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] tracking-[0.1em] font-semibold uppercase px-2 py-1 rounded-full shadow-sm z-10 flex items-center gap-1">
                      <Gift size={10} /> Buy {buyXGetYSettings.buyQty} Get {buyXGetYSettings.freeQty} Free
                    </span>
                  );
                }
                return null;
              })()}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                <WishlistButton productId={product.id} />
              </div>
            </div>
            <div className="pt-3">
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
                {product.category}
              </p>
              <div className="flex items-start justify-between mt-0.5">
                <p className="text-sm text-foreground pr-2 leading-tight" style={{ fontFamily: "var(--font-lora), serif" }}>
                  {product.name}
                </p>
                <div className="text-right shrink-0">
                  <p className="text-sm text-accent font-medium">{product.price}</p>
                  {(product as any).mrp && (
                    <p className="text-[10px] text-muted-foreground line-through mt-0.5">
                      {(product as any).mrp}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
