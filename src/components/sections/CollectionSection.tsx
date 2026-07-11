"use client";

import Image from "next/image";
import { ChevronRight, Gift } from "lucide-react";
import { useEffect, useState } from "react";
import { getProducts } from "@/app/admin/(dashboard)/products/actions";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import WishlistButton from "@/components/products/WishlistButton";

export default function CollectionSection() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart, buyXGetYSettings } = useCart();

  useEffect(() => {
    getProducts().then(data => {
      if (data && data.length > 0) {
        setProducts(data);
      }
    }).finally(() => setIsLoading(false));
  }, []);

  return (
    <section id="collection" className="max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-36">
      <div className="flex items-end justify-between mb-16">
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-accent mb-3">The Collection</p>
          <h2
            className="text-4xl lg:text-5xl font-normal text-foreground"
            style={{ fontFamily: "var(--font-lora), serif" }}
          >
            Crafted with
            <br />
            <em className="italic">herbal precision.</em>
          </h2>
        </div>
        <Link
          href="/shop"
          className="hidden md:inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-200 border-b border-border pb-0.5"
        >
          View all <ChevronRight size={12} />
        </Link>
      </div>

      {/* Asymmetric product grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}>
              <div className="bg-card aspect-[4/5] rounded-lg animate-pulse" />
              <div className="pt-4 pb-2 space-y-2">
                <div className="h-3 w-16 bg-card rounded animate-pulse" />
                <div className="h-4 w-24 bg-card rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
        {products.map((product, idx) => (
          <Link
            href={`/products/${product.id}`}
            key={product.id}
            className={`group block ${idx === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
          >
            <div className="relative overflow-hidden bg-card aspect-[4/5] rounded-lg">
              <Image
                src={product.img}
                alt={product.alt}
                fill
                className="object-contain transition-transform duration-700 group-hover:scale-105"
                sizes={idx === 0 ? "(max-width: 768px) 50vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-500" />
              {product.discount ? (
                <span className="absolute top-4 left-4 bg-red-50 text-red-600 border border-red-100 text-[9px] tracking-[0.1em] font-medium uppercase px-2 py-1 rounded shadow-sm z-10">
                  {product.discount}
                </span>
              ) : product.badge ? (
                <span className="absolute top-4 left-4 bg-background text-foreground text-[9px] tracking-[0.2em] uppercase px-2.5 py-1 z-10">
                  {product.badge}
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
              {/* Wishlist Heart */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                <WishlistButton productId={product.id} />
              </div>
            </div>
            <div className="pt-4 pb-2">
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
                {product.category}
              </p>
              <div className="flex items-start justify-between">
                <p
                  className="text-sm font-normal text-foreground pr-2 leading-tight"
                  style={{ fontFamily: "var(--font-lora), serif" }}
                >
                  {product.name}
                </p>
                <div className="text-right shrink-0">
                  <p className="text-sm text-accent font-medium">{product.price}</p>
                  {product.mrp && (
                    <p className="text-[10px] text-muted-foreground line-through mt-0.5">
                      {product.mrp}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      )}
    </section>
  );
}
