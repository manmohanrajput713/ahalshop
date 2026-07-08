"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistButton({ productId, size = 16 }: { productId: number; size?: number }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const active = isInWishlist(productId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(productId);
      }}
      className={`p-2 rounded-full transition-all duration-200 ${
        active
          ? "bg-red-50 text-red-500"
          : "bg-background/80 text-muted-foreground hover:text-red-400 hover:bg-red-50"
      }`}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart size={size} fill={active ? "currentColor" : "none"} strokeWidth={1.5} />
    </button>
  );
}
