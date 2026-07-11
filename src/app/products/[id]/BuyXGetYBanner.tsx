"use client";

import { useState, useEffect } from "react";
import { Gift } from "lucide-react";

export default function BuyXGetYBanner({ productPrice }: { productPrice: string }) {
  const [offer, setOffer] = useState<{ enabled: boolean; buyQty: number; freeQty: number; minPrice: number } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setOffer({
          enabled: data.buyXGetYEnabled ?? false,
          buyQty: data.buyXGetYBuyQty ?? 2,
          freeQty: data.buyXGetYFreeQty ?? 1,
          minPrice: data.buyXGetYMinPrice ?? 200,
        });
      })
      .catch(() => setOffer(null));
  }, []);

  if (!offer?.enabled) return null;

  const unitPrice = parseFloat(productPrice.replace(/[^\d.]/g, "")) || 0;
  if (unitPrice < offer.minPrice) return null;

  const totalRequired = offer.buyQty + offer.freeQty;

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-emerald-50/50 border border-emerald-200 rounded-lg p-4 mb-10 flex items-center gap-4 overflow-hidden relative">
      {/* Decorative shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
      
      <div className="bg-emerald-100 p-2.5 rounded-lg shrink-0 relative z-10">
        <Gift size={20} className="text-emerald-600" />
      </div>
      <div className="relative z-10">
        <p className="text-sm font-semibold text-emerald-800 tracking-wide">
          Buy {offer.buyQty}, Get {offer.freeQty} Free!
        </p>
        <p className="text-[11px] text-emerald-600 mt-0.5">
          Add {totalRequired} items (₹{offer.minPrice}+) to your bag — the cheapest {offer.freeQty === 1 ? "one is" : `${offer.freeQty} are`} on us!
        </p>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
