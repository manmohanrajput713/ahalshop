"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Ban } from "lucide-react";

type Variant = { size: string; price: string };

export default function AddToBagButton({ product, stock }: { product: any; stock: number }) {
  const { addToCart } = useCart();
  const variants: Variant[] = product.variants || [];
  const hasVariants = variants.length > 1;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const selectedVariant = variants[selectedIndex] || null;
  const displayPrice = selectedVariant ? selectedVariant.price : product.price;

  const isOutOfStock = stock <= 0;

  const handleAdd = () => {
    if (isOutOfStock) return;
    if (selectedVariant) {
      addToCart({
        ...product,
        price: selectedVariant.price,
        selectedSize: selectedVariant.size,
        id: hasVariants ? `${product.id}-${selectedVariant.size}` : product.id,
      }, quantity);
    } else {
      addToCart(product, quantity);
    }
    setQuantity(1);
  };

  // Out of Stock UI
  if (isOutOfStock) {
    return (
      <div className="space-y-5">
        {/* Out of Stock Notice */}
        <div className="relative overflow-hidden rounded-lg border border-red-200 bg-red-50/50">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent" />
          <div className="relative flex items-center gap-4 px-6 py-5">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <Ban size={22} className="text-red-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-700 tracking-wide uppercase">
                Out of Stock
              </p>
              <p className="text-xs text-red-500/80 mt-0.5">
                This product is currently unavailable
              </p>
            </div>
          </div>
        </div>

        {/* Price Display (still visible) */}
        <div className="flex items-end justify-between pt-2">
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-3">
              Price
            </p>
            <p className="text-3xl font-medium text-muted-foreground/50 pb-1 line-through">
              {displayPrice}
            </p>
          </div>
        </div>

        {/* Disabled Button */}
        <button
          disabled
          className="w-full bg-muted text-muted-foreground uppercase tracking-[0.15em] text-xs py-5 rounded-sm cursor-not-allowed opacity-60"
        >
          Out of Stock
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Size Selector */}
      {variants.length > 0 && (
        <div>
          <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-3">
            {hasVariants ? "Select Size" : "Size"}
          </p>
          <div className="flex flex-wrap gap-3">
            {variants.map((v, idx) => (
              <button
                key={v.size}
                onClick={() => setSelectedIndex(idx)}
                className={`
                  relative px-5 py-3 border rounded-lg text-sm transition-all duration-200
                  ${selectedIndex === idx
                    ? "border-accent bg-accent/10 text-foreground ring-1 ring-accent/30"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  }
                `}
              >
                <span className="font-medium">{v.size}</span>
                <span className="ml-2 text-xs opacity-75">{v.price}</span>
                {selectedIndex === idx && (
                  <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-accent rounded-full border-2 border-background" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-end justify-between pt-2">
        <div>
          <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-3">
            Quantity
          </p>
          <div className="flex items-center border border-border rounded-md bg-card w-fit">
            <button 
              className="p-3 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 rounded-l-md"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              <Minus size={14} />
            </button>
            <span className="w-12 text-center text-sm font-medium">
              {quantity}
            </span>
            <button 
              className="p-3 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 rounded-r-md"
              onClick={() => setQuantity(q => Math.min(stock, q + 1))}
              disabled={quantity >= stock}
            >
              <Plus size={14} />
            </button>
          </div>
          {stock <= 5 && (
            <p className="text-[10px] text-yellow-600 mt-2 tracking-wide">
              Only {stock} left in stock
            </p>
          )}
        </div>

        {/* Price Display */}
        <div className="text-right">
          <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-3">
            Price
          </p>
          <p className="text-3xl font-medium text-foreground pb-1">
            {displayPrice}
          </p>
        </div>
      </div>

      {/* Add to Bag */}
      <button
        onClick={handleAdd}
        className="w-full bg-primary text-primary-foreground uppercase tracking-[0.15em] text-xs py-5 hover:bg-primary/90 transition-colors rounded-sm"
      >
        Add to Bag{selectedVariant ? ` — ${selectedVariant.size}` : ""}
      </button>
    </div>
  );
}
