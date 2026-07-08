"use client";

import { useCart } from "@/context/CartContext";
import { useAshlCoins } from "@/context/AshlCoinContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight, Tag, X, Coins } from "lucide-react";
import { useState } from "react";

export default function CartPage() {
  const { 
    items, 
    updateQuantity, 
    removeFromCart, 
    totalPrice,
    totalItems,
    appliedCoupon, 
    setAppliedCoupon, 
    discountAmount,
    redeemedCoins,
    setRedeemedCoins,
    discountedTotal 
  } = useCart();
  const { balance: coinBalance } = useAshlCoins();

  const formattedTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(totalPrice);

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");

  const VALID_COUPONS: Record<string, number> = {
    ASHL10: 10,
    HERBAL20: 20,
    WELCOME15: 15,
  };

  const handleApplyCoupon = () => {
    const code = couponCode.toUpperCase().trim();
    if (VALID_COUPONS[code]) {
      setAppliedCoupon({ code, discount: VALID_COUPONS[code] });
      setCouponError("");
    } else {
      setCouponError("Invalid coupon code");
      setAppliedCoupon(null);
    }
  };

  const formattedDiscountedTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(discountedTotal);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      
      <main className="flex-1 pt-32 pb-24 max-w-7xl mx-auto px-6 lg:px-12 w-full">
        <h1 
          className="text-4xl lg:text-5xl font-normal text-foreground mb-4"
          style={{ fontFamily: "var(--font-lora), serif" }}
        >
          Your Shopping Bag
        </h1>
        <p className="text-muted-foreground text-sm tracking-[0.1em] uppercase mb-12">
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </p>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground mb-6">Your bag is currently empty.</p>
            <Link 
              href="/#collection"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground uppercase tracking-[0.15em] text-xs px-8 py-4 hover:bg-primary/90 transition-colors"
            >
              Continue Shopping <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-8 space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-6 p-6 bg-card rounded-xl border border-border">
                  <div className="relative w-24 h-32 bg-muted shrink-0 rounded-md overflow-hidden">
                    <Image 
                      src={item.img} 
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
                          {item.category}
                        </p>
                        <h3 
                          className="text-lg font-normal text-foreground"
                          style={{ fontFamily: "var(--font-lora), serif" }}
                        >
                          {item.name}
                        </h3>
                        {item.selectedSize && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Size: {item.selectedSize}
                          </p>
                        )}
                      </div>
                      <p className="text-accent font-medium">{item.price}</p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-border rounded-md">
                        <button 
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button 
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-muted-foreground hover:text-destructive flex items-center gap-1 text-xs uppercase tracking-[0.1em] transition-colors"
                      >
                        <Trash2 size={14} />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4">
              <div className="bg-card rounded-xl border border-border p-8 sticky top-32">
                <h2 
                  className="text-2xl font-normal text-foreground mb-6"
                  style={{ fontFamily: "var(--font-lora), serif" }}
                >
                  Order Summary
                </h2>
                
                <div className="space-y-4 mb-6 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formattedTotal}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-1">
                        <Tag size={12} /> {appliedCoupon.code} ({appliedCoupon.discount}% off)
                      </span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  {redeemedCoins > 0 && (
                    <div className="flex justify-between text-amber-600">
                      <span className="flex items-center gap-1">
                        <Coins size={12} /> ASHL Coins
                      </span>
                      <span>-₹{redeemedCoins}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>{discountedTotal >= 499 ? <span className="text-accent">Free</span> : "₹49"}</span>
                  </div>
                  <div className="border-t border-border pt-4 mt-4 flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span className="text-accent">{formattedDiscountedTotal}</span>
                  </div>
                </div>

                {/* Coupon Code */}
                <div className="mb-6">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 px-4 py-3 rounded-md">
                      <span className="text-sm text-green-700 flex items-center gap-2">
                        <Tag size={14} /> {appliedCoupon.code} applied
                      </span>
                      <button
                        onClick={() => { setAppliedCoupon(null); setCouponCode(""); }}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => { setCouponCode(e.target.value); setCouponError(""); }}
                          placeholder="Enter coupon code"
                          className="flex-1 bg-background border border-border px-4 py-2.5 text-sm rounded-md focus:outline-none focus:border-accent transition-colors"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={!couponCode.trim()}
                          className="bg-primary text-primary-foreground text-xs tracking-[0.1em] uppercase px-5 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                          Apply
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-xs text-red-500 mt-2">{couponError}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-2">
                        Try: ASHL10, HERBAL20, WELCOME15
                      </p>
                    </div>
                  )}
                </div>

                {/* ASHL Coins */}
                {coinBalance > 0 && (
                  <div className="mb-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-amber-800 font-medium flex items-center gap-1.5">
                          <Coins size={16} className="text-amber-600" /> ASHL Coins
                        </span>
                        <span className="text-sm font-semibold text-amber-700">{coinBalance} coins</span>
                      </div>
                      <p className="text-[10px] text-amber-600 mb-3">1 coin = ₹1 discount. Max usable: ₹{Math.min(coinBalance, Math.floor(totalPrice * 0.5))}</p>
                      {redeemedCoins > 0 ? (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-amber-700">Using {redeemedCoins} coins (-₹{redeemedCoins})</span>
                          <button
                            onClick={() => setRedeemedCoins(0)}
                            className="text-amber-600 hover:text-amber-800 text-xs underline"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            const maxCoins = Math.min(coinBalance, Math.floor(totalPrice * 0.5));
                            if (maxCoins > 0) setRedeemedCoins(maxCoins);
                          }}
                          className="w-full bg-amber-600 text-white text-xs tracking-[0.1em] uppercase py-2.5 rounded-md hover:bg-amber-700 transition-colors"
                        >
                          Use {Math.min(coinBalance, Math.floor(totalPrice * 0.5))} Coins
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <Link
                  href="/checkout"
                  className="w-full bg-primary text-primary-foreground uppercase tracking-[0.15em] text-xs py-4 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight size={14} />
                </Link>
                
                <div className="mt-6 text-center">
                  <Link href="/#collection" className="text-xs uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground border-b border-transparent hover:border-foreground transition-all">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
