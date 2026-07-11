"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Ban, Gift, Sparkles } from "lucide-react";

type Variant = { size: string; price: string; mrp?: string; discount?: string };

export default function AddToBagButton({ product, stock }: { product: any; stock: number }) {
  const { addToCart, buyXGetYSettings } = useCart();
  const variants: Variant[] = product.variants || [];
  const hasVariants = variants.length > 1;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showFreeAnim, setShowFreeAnim] = useState(false);
  
  const selectedVariant = variants[selectedIndex] || null;
  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const displayMrp = selectedVariant ? selectedVariant.mrp : product.mrp;
  const displayDiscount = selectedVariant ? selectedVariant.discount : product.discount;

  const isOutOfStock = stock <= 0;

  // Check if this product qualifies for Buy X Get Y
  const unitPrice = parseFloat(displayPrice?.replace(/[^\d.]/g, "")) || 0;
  const qualifies = buyXGetYSettings.enabled && unitPrice >= buyXGetYSettings.minPrice;
  const triggerQty = qualifies ? buyXGetYSettings.buyQty + buyXGetYSettings.freeQty : 0;
  const isFreeTrigger = qualifies && quantity >= triggerQty;

  // Trigger "FREE" animation when quantity hits the trigger point
  useEffect(() => {
    if (isFreeTrigger) {
      setShowFreeAnim(true);
      const timer = setTimeout(() => setShowFreeAnim(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isFreeTrigger]);

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
            <div className="flex items-center gap-3">
              <p className="text-3xl font-medium text-muted-foreground/50 pb-1 line-through">
                {displayPrice}
              </p>
              {displayMrp && (
                <p className="text-sm font-medium text-muted-foreground/30 line-through">
                  {displayMrp}
                </p>
              )}
            </div>
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

  // Calculate how many free items the user gets at current quantity
  const freeItemCount = qualifies
    ? Math.floor(quantity / triggerQty) * buyXGetYSettings.freeQty
    : 0;
  const freeItemSavings = freeItemCount * unitPrice;

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
                <div className="font-medium text-base text-center">{v.size}</div>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-sm font-medium">{v.price}</span>
                  {v.mrp && <span className="text-xs opacity-50 line-through">{v.mrp}</span>}
                </div>
                {v.discount && (
                  <span className="absolute -top-2.5 -right-2 bg-red-100 text-red-600 text-[9px] font-bold tracking-[0.1em] px-1.5 py-0.5 rounded-sm border border-red-200">
                    {v.discount}
                  </span>
                )}
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
          {/* Nudge: how many more to trigger free */}
          {qualifies && !isFreeTrigger && (
            <p className="text-[10px] text-emerald-600 mt-2 tracking-wide flex items-center gap-1">
              <Gift size={10} /> Add {triggerQty - quantity} more to get {buyXGetYSettings.freeQty} free!
            </p>
          )}
        </div>

        {/* Price Display */}
        <div className="text-right">
          <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-3">
            Total Price
          </p>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-3">
              {displayDiscount && (
                <span className="bg-red-50 border border-red-100 text-red-600 text-[10px] tracking-[0.1em] font-medium uppercase px-2 py-0.5 rounded shadow-sm">
                  {displayDiscount}
                </span>
              )}
              {displayMrp && (
                <p className="text-base text-muted-foreground line-through">
                  {displayMrp}
                </p>
              )}
              <p className="text-3xl font-medium text-accent pb-1">
                {displayPrice}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FREE animation when quantity hits trigger */}
      {isFreeTrigger && (
        <div className={`relative overflow-hidden rounded-lg border border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100/50 px-5 py-4 transition-all duration-500 ${showFreeAnim ? "animate-offer-pop" : ""}`}>
          {/* Sparkle particles */}
          {showFreeAnim && (
            <>
              <div className="absolute top-1 left-4 animate-sparkle-1"><Sparkles size={10} className="text-emerald-400" /></div>
              <div className="absolute top-2 right-8 animate-sparkle-2"><Sparkles size={8} className="text-emerald-300" /></div>
              <div className="absolute bottom-1 left-1/3 animate-sparkle-3"><Sparkles size={9} className="text-emerald-400" /></div>
            </>
          )}
          <div className="flex items-center gap-3 relative z-10">
            <div className={`bg-emerald-200 p-2 rounded-full ${showFreeAnim ? "animate-bounce" : ""}`}>
              <Gift size={18} className="text-emerald-700" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                🎉 {freeItemCount} {freeItemCount === 1 ? "Item" : "Items"} FREE!
              </p>
              <p className="text-[10px] text-emerald-600 mt-0.5">
                You save ₹{Math.round(freeItemSavings)} — the cheapest {freeItemCount === 1 ? "item is" : "items are"} on us!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Button */}
      <button
        onClick={handleAdd}
        className="w-full group relative overflow-hidden bg-foreground text-background uppercase tracking-[0.15em] text-xs py-5 rounded-sm transition-all hover:shadow-xl active:scale-[0.98]"
      >
        Add to Bag{selectedVariant ? ` — ${selectedVariant.size}` : ""}
        {freeItemCount > 0 && (
          <span className="ml-2 bg-emerald-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold tracking-wider">
            +{freeItemCount} FREE
          </span>
        )}
      </button>

      <style jsx>{`
        @keyframes offer-pop {
          0% { transform: scale(0.95); opacity: 0; }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-offer-pop {
          animation: offer-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes sparkle-float-1 {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.7; }
          50% { transform: translateY(-8px) rotate(20deg); opacity: 1; }
        }
        @keyframes sparkle-float-2 {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.5; }
          50% { transform: translateY(-10px) rotate(-15deg); opacity: 1; }
        }
        @keyframes sparkle-float-3 {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
          50% { transform: translateY(-6px) rotate(10deg); opacity: 1; }
        }
        .animate-sparkle-1 { animation: sparkle-float-1 1.2s ease-in-out infinite; }
        .animate-sparkle-2 { animation: sparkle-float-2 1.5s ease-in-out infinite 0.3s; }
        .animate-sparkle-3 { animation: sparkle-float-3 1.3s ease-in-out infinite 0.6s; }
      `}</style>
    </div>
  );
}
