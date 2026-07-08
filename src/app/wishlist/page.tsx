"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { ALL_PRODUCTS } from "@/lib/data";
import { getProducts } from "@/app/admin/(dashboard)/products/actions";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";

export default function WishlistPage() {
  const { wishlistIds, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<any[]>(ALL_PRODUCTS);

  useEffect(() => {
    getProducts().then(data => {
      if (data && data.length > 0) {
        setProducts(data);
      }
    });
  }, []);

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-32 pb-24 max-w-7xl mx-auto px-6 lg:px-12 w-full">
        <div className="flex items-center gap-3 mb-2">
          <Heart size={24} className="text-accent" />
          <h1
            className="text-4xl lg:text-5xl font-normal text-foreground"
            style={{ fontFamily: "var(--font-lora), serif" }}
          >
            Your <em className="italic">Wishlist</em>
          </h1>
        </div>
        <p className="text-sm text-muted-foreground tracking-[0.1em] uppercase mb-12">
          {wishlistProducts.length} {wishlistProducts.length === 1 ? "item" : "items"} saved
        </p>

        {wishlistProducts.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-border">
            <Heart size={40} className="text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">Your wishlist is empty.</p>
            <p className="text-xs text-muted-foreground mb-6">Save items you love by tapping the heart icon.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground uppercase tracking-[0.15em] text-xs px-8 py-4 hover:bg-primary/90 transition-colors"
            >
              Browse Products <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {wishlistProducts.map((product) => (
              <div key={product.id} className="group relative">
                <Link href={`/products/${product.id}`} className="block">
                  <div className="relative overflow-hidden bg-card aspect-square sm:aspect-[4/3] rounded-lg">
                    <Image
                      src={product.img}
                      alt={product.alt || product.name}
                      fill
                      className="object-contain p-2 sm:p-4 transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    {/* Remove button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeFromWishlist(product.id);
                      }}
                      className="absolute top-3 right-3 p-2 bg-background/90 rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors z-10"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="pt-3 pb-2">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
                      {product.category}
                    </p>
                    <p className="text-sm font-normal text-foreground" style={{ fontFamily: "var(--font-lora), serif" }}>
                      {product.name}
                    </p>
                    <p className="text-sm text-accent mt-0.5">{product.price}</p>
                  </div>
                </Link>
                <button
                  onClick={() => addToCart(product)}
                  className="w-full mt-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground text-[10px] tracking-[0.15em] uppercase py-2.5 hover:bg-accent transition-colors rounded"
                >
                  <ShoppingBag size={13} /> Add to Bag
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
