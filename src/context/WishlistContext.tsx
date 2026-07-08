"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Heart, X } from "lucide-react";

interface WishlistContextType {
  wishlistIds: number[];
  addToWishlist: (id: number) => void;
  removeFromWishlist: (id: number) => void;
  toggleWishlist: (id: number) => void;
  isInWishlist: (id: number) => boolean;
  totalWishlist: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [toast, setToast] = useState<{ action: "added" | "removed" } | null>(null);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastTimers, setToastTimers] = useState<{ exit: NodeJS.Timeout; cleanup: NodeJS.Timeout } | null>(null);

  const triggerToast = (action: "added" | "removed") => {
    if (toastTimers) {
      clearTimeout(toastTimers.exit);
      clearTimeout(toastTimers.cleanup);
    }
    setToast({ action });
    setIsToastVisible(true);

    const exit = setTimeout(() => setIsToastVisible(false), 3500);
    const cleanup = setTimeout(() => { setToast(null); setToastTimers(null); }, 3950);
    setToastTimers({ exit, cleanup });
  };

  useEffect(() => {
    const saved = localStorage.getItem("wishlist_ids");
    if (saved) {
      try {
        setWishlistIds(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse wishlist", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("wishlist_ids", JSON.stringify(wishlistIds));
    }
  }, [wishlistIds, isLoaded]);

  const addToWishlist = (id: number) => {
    setWishlistIds((prev) => {
      if (!prev.includes(id)) {
        triggerToast("added");
        return [...prev, id];
      }
      return prev;
    });
  };

  const removeFromWishlist = (id: number) => {
    setWishlistIds((prev) => {
      if (prev.includes(id)) {
        triggerToast("removed");
        return prev.filter((wid) => wid !== id);
      }
      return prev;
    });
  };

  const toggleWishlist = (id: number) => {
    setWishlistIds((prev) => {
      if (prev.includes(id)) {
        triggerToast("removed");
        return prev.filter((wid) => wid !== id);
      } else {
        triggerToast("added");
        return [...prev, id];
      }
    });
  };

  const isInWishlist = (id: number) => wishlistIds.includes(id);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        totalWishlist: wishlistIds.length,
      }}
    >
      {children}
      {/* Wishlist Toast */}
      {toast && (
        <div
          className={`fixed top-20 right-4 left-4 md:left-auto md:right-8 z-50 md:w-[320px] bg-card border border-border shadow-2xl rounded-lg p-4 flex gap-4 transition-all duration-300 ${
            isToastVisible ? "animate-toast-in" : "animate-toast-out"
          }`}
          style={{ fontFamily: "var(--font-sans), sans-serif" }}
        >
          <div className={`absolute top-0 left-0 bottom-0 w-1.5 rounded-l-lg ${toast.action === 'added' ? 'bg-red-500' : 'bg-muted-foreground'}`} />
          
          <div className="flex-1 min-w-0 flex flex-col justify-center py-1 pl-2">
            <div className={`flex items-center gap-2 ${toast.action === 'added' ? 'text-red-500' : 'text-muted-foreground'} text-[10px] font-bold tracking-[0.15em] uppercase mb-1`}>
              <Heart size={14} strokeWidth={3} fill={toast.action === 'added' ? 'currentColor' : 'none'} />
              <span>{toast.action === 'added' ? 'Saved to Wishlist' : 'Removed from Wishlist'}</span>
            </div>
            <h4 
              className="text-sm font-medium text-foreground truncate pr-4"
              style={{ fontFamily: "var(--font-serif), serif", fontStyle: "italic" }}
            >
              {toast.action === 'added' ? 'Item added to your wishlist.' : 'Item removed from your wishlist.'}
            </h4>
          </div>

          <div className="flex flex-col justify-start items-end">
            <button
              onClick={() => {
                setIsToastVisible(false);
                setTimeout(() => setToast(null), 450);
              }}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="Close notification"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
