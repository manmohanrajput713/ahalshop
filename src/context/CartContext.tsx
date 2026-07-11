"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, X } from "lucide-react";

export type CartItem = {
  id: string | number;
  name: string;
  price: string; // Stored as "₹499" so we will parse it when needed
  img: string;
  category: string;
  quantity: number;
  selectedSize?: string;
};

export type Coupon = { code: string; discount: number };

export type BuyXGetYSettings = {
  enabled: boolean;
  buyQty: number;
  freeQty: number;
  minPrice: number;
};

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  appliedCoupon: Coupon | null;
  setAppliedCoupon: (coupon: Coupon | null) => void;
  discountAmount: number;
  redeemedCoins: number;
  setRedeemedCoins: (coins: number) => void;
  coinDiscountAmount: number;
  buyXGetYDiscount: number;
  buyXGetYSettings: BuyXGetYSettings;
  discountedTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [redeemedCoins, setRedeemedCoins] = useState(0);
  const [coinsPerRupeeDiscount, setCoinsPerRupeeDiscount] = useState(5);
  const [buyXGetYSettings, setBuyXGetYSettings] = useState<BuyXGetYSettings>({
    enabled: false,
    buyQty: 2,
    freeQty: 1,
    minPrice: 200,
  });

  // Fetch dynamic settings (coins + buy X get Y)
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setCoinsPerRupeeDiscount(Number(data.coinsPerRupeeDiscount) || 5);
          setBuyXGetYSettings({
            enabled: data.buyXGetYEnabled ?? false,
            buyQty: Number(data.buyXGetYBuyQty) || 2,
            freeQty: Number(data.buyXGetYFreeQty) || 1,
            minPrice: Number(data.buyXGetYMinPrice) || 200,
          });
        }
      } catch (e) {}
    }
    loadSettings();
  }, []);

  const [toast, setToast] = useState<{ product: any; quantity: number } | null>(null);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [timers, setTimers] = useState<{ exit: NodeJS.Timeout; cleanup: NodeJS.Timeout } | null>(null);

  const triggerToast = (product: any, quantity: number) => {
    if (timers) {
      clearTimeout(timers.exit);
      clearTimeout(timers.cleanup);
    }
    setToast({ product, quantity });
    setIsToastVisible(true);

    const exit = setTimeout(() => {
      setIsToastVisible(false);
    }, 3500);

    const cleanup = setTimeout(() => {
      setToast(null);
      setTimers(null);
    }, 3950);

    setTimers({ exit, cleanup });
  };

  const closeToast = () => {
    if (timers) {
      clearTimeout(timers.exit);
      clearTimeout(timers.cleanup);
    }
    setIsToastVisible(false);
    const cleanup = setTimeout(() => {
      setToast(null);
      setTimers(null);
    }, 450);
    setTimers({ exit: setTimeout(() => {}, 0), cleanup });
  };

  // Load from local storage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem("cart_items");
    const savedCoupon = localStorage.getItem("cart_coupon");
    if (savedItems) {
      try {
        setItems(JSON.parse(savedItems));
      } catch (e) {
        console.error("Failed to parse cart items", e);
      }
    }
    if (savedCoupon) {
      try {
        setAppliedCoupon(JSON.parse(savedCoupon));
      } catch (e) {
        console.error("Failed to parse cart coupon", e);
      }
    }
    const savedCoins = localStorage.getItem("cart_redeemed_coins");
    if (savedCoins) {
      try {
        setRedeemedCoins(JSON.parse(savedCoins));
      } catch (e) {
        console.error("Failed to parse redeemed coins", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage when items/coupon/coins change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("cart_items", JSON.stringify(items));
      if (appliedCoupon) {
        localStorage.setItem("cart_coupon", JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem("cart_coupon");
      }
      if (redeemedCoins > 0) {
        localStorage.setItem("cart_redeemed_coins", JSON.stringify(redeemedCoins));
      } else {
        localStorage.removeItem("cart_redeemed_coins");
      }
    }
  }, [items, appliedCoupon, redeemedCoins, isLoaded]);

  const addToCart = (product: any, quantityToAdd: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantityToAdd } : item
        );
      }
      return [...prev, { ...product, quantity: quantityToAdd }];
    });
    triggerToast(product, quantityToAdd);
  };

  const removeFromCart = (id: string | number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string | number, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setRedeemedCoins(0);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calculate total price. It assumes price is formatted like "₹499" or "499"
  const totalPrice = items.reduce((sum, item) => {
    const numericPrice = parseFloat(item.price.replace(/[^\d.]/g, "")) || 0;
    return sum + numericPrice * item.quantity;
  }, 0);

  // Buy X Get Y Free discount calculation
  const buyXGetYDiscount = (() => {
    if (!buyXGetYSettings.enabled) return 0;
    const { buyQty, freeQty, minPrice } = buyXGetYSettings;
    const groupSize = buyQty + freeQty;

    // Expand cart items into a flat list of unit prices, filtered by minPrice
    const qualifyingPrices: number[] = [];
    for (const item of items) {
      const unitPrice = parseFloat(item.price.replace(/[^\d.]/g, "")) || 0;
      if (unitPrice >= minPrice) {
        for (let i = 0; i < item.quantity; i++) {
          qualifyingPrices.push(unitPrice);
        }
      }
    }

    if (qualifyingPrices.length < groupSize) return 0;

    // Sort ascending (cheapest first) so the cheapest items become free
    qualifyingPrices.sort((a, b) => a - b);

    let discount = 0;
    const fullGroups = Math.floor(qualifyingPrices.length / groupSize);
    // For each complete group, the first `freeQty` items (cheapest) are free
    for (let g = 0; g < fullGroups; g++) {
      for (let f = 0; f < freeQty; f++) {
        discount += qualifyingPrices[g * groupSize + f];
      }
    }
    return Math.round(discount);
  })();

  const discountAmount = appliedCoupon ? Math.round((totalPrice * appliedCoupon.discount) / 100) : 0;
  const coinDiscountAmount = Math.floor(redeemedCoins / coinsPerRupeeDiscount);
  const discountedTotal = Math.max(0, totalPrice - discountAmount - coinDiscountAmount - buyXGetYDiscount);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        appliedCoupon,
        setAppliedCoupon,
        discountAmount,
        redeemedCoins,
        setRedeemedCoins,
        coinDiscountAmount,
        buyXGetYDiscount,
        buyXGetYSettings,
        discountedTotal,
      }}
    >
      {children}
      {toast && (
        <div
          className={`fixed top-20 right-4 left-4 md:left-auto md:right-8 z-50 md:w-[380px] bg-card border border-border shadow-2xl rounded-lg p-4 flex gap-4 transition-all duration-300 ${
            isToastVisible ? "animate-toast-in" : "animate-toast-out"
          }`}
          style={{ fontFamily: "var(--font-sans), sans-serif" }}
        >
          {/* Left decorative color bar */}
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-accent rounded-l-lg" />
          
          {/* Product Image */}
          <div className="relative w-16 h-16 bg-white rounded border border-border/40 flex-shrink-0 overflow-hidden flex items-center justify-center">
            <Image
              src={toast.product.img || "/products/logo.png"}
              alt={toast.product.name}
              fill
              className="object-contain p-1"
              sizes="64px"
            />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div>
              <div className="flex items-center gap-1.5 text-primary text-[10px] font-bold tracking-[0.15em] uppercase mb-1">
                <Check size={12} strokeWidth={3} className="text-primary" />
                <span>Added to Bag</span>
              </div>
              <h4 
                className="text-sm font-medium text-foreground truncate pr-4"
                style={{ fontFamily: "var(--font-serif), serif", fontStyle: "italic" }}
              >
                {toast.product.name}
              </h4>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1 font-medium">
                {toast.product.selectedSize && `Size: ${toast.product.selectedSize} • `}
                Qty: {toast.quantity}
              </p>
            </div>
            <p className="text-sm font-semibold text-accent mt-1">
              {toast.product.price}
            </p>
          </div>

          {/* Close & Action Buttons */}
          <div className="flex flex-col justify-between items-end">
            <button
              onClick={closeToast}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="Close notification"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
            <Link
              href="/cart"
              onClick={closeToast}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-medium tracking-[0.15em] uppercase py-2.5 px-4 rounded-sm transition-all duration-200 mt-2 hover:scale-[1.02] block text-center"
            >
              View Bag
            </Link>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
