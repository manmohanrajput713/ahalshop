"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Minus, Plus } from "lucide-react";

type Variant = { size: string; price: string };

export default function AddToBagButton({ product }: { product: any }) {
  const { addToCart } = useCart();
  const variants: Variant[] = product.variants || [];
  const hasVariants = variants.length > 1;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  const selectedVariant = variants[selectedIndex] || null;
  const displayPrice = selectedVariant ? selectedVariant.price : product.price;

  const handleAdd = () => {
    if (selectedVariant) {
      addToCart({
        ...product,
        price: selectedVariant.price,
        selectedSize: selectedVariant.size,
        // Use a composite id so different sizes are separate cart items
        id: hasVariants ? `${product.id}-${selectedVariant.size}` : product.id,
      }, quantity);
    } else {
      addToCart(product, quantity);
    }
    // Optional: could reset quantity to 1 after adding
    setQuantity(1);
  };

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
              className="p-3 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-r-md"
              onClick={() => setQuantity(q => q + 1)}
            >
              <Plus size={14} />
            </button>
          </div>
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
