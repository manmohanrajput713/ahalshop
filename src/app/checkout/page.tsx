"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { useAddresses, SavedAddress } from "@/context/AddressContext";
import { useOrders } from "@/context/OrderContext";
import { useAshlCoins } from "@/context/AshlCoinContext";
import SavedAddresses from "@/components/checkout/SavedAddresses";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useState, useEffect } from "react";
import { ArrowLeft, ShieldCheck, Truck, CreditCard, Banknote, ChevronRight, Loader2, XCircle, Package, MapPin, Tag, Coins, Smartphone, Landmark, Gift } from "lucide-react";
import { supabase } from "@/lib/supabase";
import AuthModal from "@/components/auth/AuthModal";

// Extend Window to include Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { 
    items, 
    totalPrice, 
    totalItems, 
    clearCart,
    appliedCoupon,
    setAppliedCoupon,
    discountAmount,
    redeemedCoins,
    coinDiscountAmount,
    buyXGetYDiscount,
    buyXGetYSettings,
    discountedTotal
  } = useCart();
  const { getDefaultAddress } = useAddresses();
  const { addOrder } = useOrders();
  const { earnCoins, redeemCoins, coinsToEarn, addPendingCoins } = useAshlCoins();

  const [paymentMethod, setPaymentMethod] = useState<"cod" | "upi" | "card" | "netbanking">("cod");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showAnimation, setShowAnimation] = useState(true);
  const [placedOrderId, setPlacedOrderId] = useState<string>("");
  const [earnedCoinsAmount, setEarnedCoinsAmount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null);

  const [user, setUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Shipping settings from admin panel
  const [shippingSettings, setShippingSettings] = useState({ freeShippingThreshold: 499, shippingFee: 49 });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.freeShippingThreshold !== undefined || data.shippingFee !== undefined) {
          setShippingSettings({
            freeShippingThreshold: data.freeShippingThreshold ?? 499,
            shippingFee: data.shippingFee ?? 49,
          });
        }
        if (data.enableCoupons !== undefined) {
          if (!data.enableCoupons && appliedCoupon) {
            setAppliedCoupon(null);
          }
        }
      })
      .catch((e) => console.error("Failed to fetch shipping settings:", e));
  }, []);

  useEffect(() => {
    // Get active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsCheckingAuth(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsCheckingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (orderPlaced) {
      window.scrollTo(0, 0);
      setShowAnimation(true);
      const timer = setTimeout(() => {
        setShowAnimation(false);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [orderPlaced]);

  const shippingFee = shippingSettings.shippingFee === 0 || discountedTotal >= shippingSettings.freeShippingThreshold ? 0 : shippingSettings.shippingFee;
  const codFee = paymentMethod === "cod" ? 7 : 0;
  const finalTotal = discountedTotal + shippingFee + codFee;

  const formattedTotal = new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(finalTotal);

  const formattedSubtotal = new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(totalPrice);

  // Auto-select default address
  useEffect(() => {
    const defaultAddr = getDefaultAddress();
    if (defaultAddr && !selectedAddressId) {
      setSelectedAddressId(defaultAddr.id);
      setSelectedAddress(defaultAddr);
    }
  }, [getDefaultAddress, selectedAddressId]);

  const handleAddressSelect = (address: SavedAddress) => {
    setSelectedAddressId(address.id);
    setSelectedAddress(address);
  };

  // Create Shiprocket order after payment
  const createShiprocketOrder = async (orderId: string, razorpayPaymentId?: string) => {
    if (!selectedAddress) return null;

    try {
      const res = await fetch("/api/shiprocket/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          billingFirstName: selectedAddress.firstName,
          billingLastName: selectedAddress.lastName,
          billingAddress: selectedAddress.addressLine1,
          billingAddress2: selectedAddress.addressLine2,
          billingCity: selectedAddress.city,
          billingState: selectedAddress.state,
          billingPincode: selectedAddress.pincode,
          billingEmail: selectedAddress.email,
          billingPhone: selectedAddress.phone,
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          subTotal: finalTotal,
          paymentMethod,
        }),
      });

      if (res.ok) {
        return await res.json();
      }
      // Non-critical — ShypBuddy integration is best-effort
      return null;
    } catch (e) {
      // Silently skip — order will still be saved locally + Supabase
      return null;
    }
  };

  const finalizeOrder = async (razorpayPaymentId?: string) => {
    if (!selectedAddress) return;

    // Generate order ID
    const orderId = `ASHL${Date.now().toString().slice(-8)}`;

    // Try creating Shiprocket order (non-blocking — order still succeeds even if Shiprocket fails)
    let shiprocketData: any = null;
    try {
      shiprocketData = await createShiprocketOrder(orderId, razorpayPaymentId);
    } catch (e) {
      console.warn("Shiprocket order creation skipped:", e);
    }

    const orderData = {
      items: items.map((item) => ({ ...item })),
      address: {
        firstName: selectedAddress.firstName,
        lastName: selectedAddress.lastName,
        phone: selectedAddress.phone,
        email: selectedAddress.email,
        addressLine1: selectedAddress.addressLine1,
        addressLine2: selectedAddress.addressLine2,
        city: selectedAddress.city,
        state: selectedAddress.state,
        pincode: selectedAddress.pincode,
      },
      subtotal: totalPrice,
      shippingFee,
      total: finalTotal,
      paymentMethod,
      razorpayPaymentId,
      shiprocketOrderId: shiprocketData?.shiprocketOrderId,
      shiprocketShipmentId: shiprocketData?.shipmentId,
      awbCode: shiprocketData?.awbCode,
      courierName: shiprocketData?.courierName,
      status: "placed" as const,
    };

    // Save order to Supabase (addOrder handles this internally now)
    const order = await addOrder(orderData);

    // Deduct redeemed coins from balance
    if (redeemedCoins > 0) {
      redeemCoins(redeemedCoins);
    }

    // Track pending ASHL coins (will be credited after delivery)
    const pendingCoins = coinsToEarn(finalTotal);
    if (pendingCoins > 0) {
      addPendingCoins(order.id, pendingCoins);
    }
    setEarnedCoinsAmount(pendingCoins);

    setPlacedOrderId(order.id);
    setOrderPlaced(true);
    clearCart();
  };

  const initiateRazorpayPayment = async () => {
    setIsProcessing(true);
    setPaymentError(null);

    try {
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalTotal,
          currency: "INR",
          receipt: `ashl_${Date.now()}`,
        }),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json();
        throw new Error(errData.error || "Failed to create order");
      }

      const orderData = await orderRes.json();

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ASHL Herbal",
        description: `Order of ${totalItems} item${totalItems > 1 ? "s" : ""}`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) throw new Error("Payment verification failed");

            const verifyData = await verifyRes.json();
            if (verifyData.verified) {
              await finalizeOrder(response.razorpay_payment_id);
            } else {
              setPaymentError("Payment verification failed. Please contact support.");
            }
          } catch {
            setPaymentError("Payment verification failed. If money was deducted, please contact support.");
          }
          setIsProcessing(false);
        },
        prefill: selectedAddress ? {
          name: `${selectedAddress.firstName} ${selectedAddress.lastName}`.trim(),
          email: selectedAddress.email,
          contact: selectedAddress.phone,
        } : {},
        theme: { color: "#3A5240" },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setPaymentError("Payment was cancelled. You can try again.");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response: any) => {
        setIsProcessing(false);
        setPaymentError(response.error?.description || "Payment failed. Please try again.");
      });
      razorpay.open();
    } catch (error: any) {
      setIsProcessing(false);
      setPaymentError(error.message || "Something went wrong. Please try again.");
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);

    if (!selectedAddress) {
      setPaymentError("Please select or add a delivery address.");
      return;
    }

    if (paymentMethod === "cod") {
      setIsProcessing(true);
      await finalizeOrder();
      setIsProcessing(false);
    } else {
      if (!razorpayLoaded) {
        setPaymentError("Payment gateway is still loading. Please wait a moment.");
        return;
      }
      initiateRazorpayPayment();
    }
  };

  // ── Order Success Screen ──
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-1 pt-32 pb-24 max-w-2xl mx-auto px-6 lg:px-12 w-full flex items-center justify-center">
          {showAnimation ? (
            <div className="flex flex-col items-center justify-center p-12 animate-in fade-in duration-300">
              <style dangerouslySetInnerHTML={{ __html: `
                .checkmark__circle {
                  stroke-dasharray: 166;
                  stroke-dashoffset: 166;
                  stroke-width: 2;
                  stroke-miterlimit: 10;
                  stroke: #10B981;
                  fill: none;
                  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
                }
                .checkmark {
                  width: 80px;
                  height: 80px;
                  border-radius: 50%;
                  display: block;
                  stroke-width: 2;
                  stroke: #fff;
                  stroke-miterlimit: 10;
                  box-shadow: inset 0px 0px 0px #10B981;
                  animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s forwards;
                }
                .checkmark__check {
                  transform-origin: 50% 50%;
                  stroke-dasharray: 48;
                  stroke-dashoffset: 48;
                  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
                }
                @keyframes stroke {
                  100% {
                    stroke-dashoffset: 0;
                  }
                }
                @keyframes scale {
                  0%, 100% {
                    transform: none;
                  }
                  50% {
                    transform: scale3d(1.1, 1.1, 1);
                  }
                }
                @keyframes fill {
                  100% {
                    box-shadow: inset 0px 0px 0px 40px #10B981;
                  }
                }
              `}} />
              <svg className="checkmark mb-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
              <h1 className="text-2xl font-normal text-foreground" style={{ fontFamily: "var(--font-lora), serif" }}>
                Order Confirmed!
              </h1>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-12 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={36} className="text-emerald-600" />
              </div>
              <h1
                className="text-3xl font-normal text-foreground mb-4"
                style={{ fontFamily: "var(--font-lora), serif" }}
              >
                Order Placed <em className="italic">Successfully!</em>
              </h1>
              <p className="text-sm text-muted-foreground mb-2">
                Thank you for shopping with ASHL Herbal.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Your order confirmation will be sent to your email shortly.
              </p>
              <p className="text-xs text-muted-foreground bg-accent/5 inline-block px-4 py-2 rounded-lg mb-4">
                Order ID: <span className="font-medium text-foreground">#{placedOrderId}</span>
              </p>
              {earnedCoinsAmount > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 inline-flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <Coins size={20} className="text-amber-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-amber-800">+{earnedCoinsAmount} ASHL Coins pending</p>
                    <p className="text-[10px] text-amber-600">Coins will be credited after your order is delivered</p>
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href={`/track-order?id=${placedOrderId}`}
                  className="inline-flex items-center gap-2 bg-accent text-accent-foreground uppercase tracking-[0.15em] text-xs px-8 py-4 hover:bg-accent/90 transition-colors"
                >
                  <Package size={14} /> Track Your Order
                </Link>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground uppercase tracking-[0.15em] text-xs px-8 py-4 hover:bg-primary/90 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
              <div className="mt-6">
                <Link
                  href="/orders"
                  className="text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors border-b border-transparent hover:border-foreground pb-0.5"
                >
                  View All Orders
                </Link>
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  // ── Auth Check ──
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-muted-foreground" size={32} />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user && !orderPlaced) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-1 pt-32 pb-24 max-w-2xl mx-auto px-6 lg:px-12 w-full text-center">
          <div className="bg-card border border-border rounded-xl p-12">
            <h2 className="text-2xl font-normal text-foreground mb-4" style={{ fontFamily: "var(--font-lora), serif" }}>
              Sign In Required
            </h2>
            <p className="text-muted-foreground mb-6">Please sign in to your account to proceed with checkout.</p>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground uppercase tracking-[0.15em] text-xs px-8 py-4 hover:bg-primary/90 transition-colors"
            >
              Sign In to Continue
            </button>
          </div>
        </main>
        <Footer />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onAuthSuccess={() => setAuthModalOpen(false)}
        />
      </div>
    );
  }

  // ── Empty Cart ──
  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-1 pt-32 pb-24 max-w-2xl mx-auto px-6 lg:px-12 w-full text-center">
          <div className="bg-card border border-border rounded-xl p-12">
            <p className="text-muted-foreground mb-6">Your cart is empty. Add some products first.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground uppercase tracking-[0.15em] text-xs px-8 py-4"
            >
              Browse Products <ChevronRight size={14} />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Main Checkout ──
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        strategy="lazyOnload"
      />

      <Header />

      <main className="flex-1 pt-32 pb-24 max-w-7xl mx-auto px-6 lg:px-12 w-full">
        <Link href="/cart" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={14} /> Back to Cart
        </Link>

        <h1
          className="text-3xl lg:text-4xl font-normal text-foreground mb-12"
          style={{ fontFamily: "var(--font-lora), serif" }}
        >
          Checkout
        </h1>

        {/* Payment Error Banner */}
        {paymentError && (
          <div className="mb-8 flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-lg px-5 py-4">
            <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-600 font-medium">Issue</p>
              <p className="text-xs text-red-500/80 mt-1">{paymentError}</p>
            </div>
            <button type="button" onClick={() => setPaymentError(null)} className="ml-auto text-red-400/60 hover:text-red-500 transition-colors">
              <XCircle size={14} />
            </button>
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: Address + Payment */}
            <div className="lg:col-span-7 space-y-10">
              {/* Delivery Address */}
              <div>
                <h2
                  className="text-xl font-normal text-foreground mb-6 flex items-center gap-3"
                  style={{ fontFamily: "var(--font-lora), serif" }}
                >
                  <MapPin size={20} className="text-accent" /> Delivery Address
                </h2>
                <SavedAddresses
                  selectedAddressId={selectedAddressId}
                  onSelect={handleAddressSelect}
                />
              </div>

              {/* Payment Method */}
              <div>
                <h2
                  className="text-xl font-normal text-foreground mb-6 flex items-center gap-3"
                  style={{ fontFamily: "var(--font-lora), serif" }}
                >
                  <CreditCard size={20} className="text-accent" /> Payment Method
                </h2>
                <div className="space-y-3">
                  {[
                    { value: "cod" as const, label: "Cash on Delivery", desc: "Pay when you receive your order", icon: Banknote },
                    { value: "upi" as const, label: "UPI Apps", desc: "GPay, PhonePe, Paytm, BHIM", icon: Smartphone },
                    { value: "card" as const, label: "Credit / Debit Card", desc: "Visa, Mastercard, Rupay", icon: CreditCard },
                    { value: "netbanking" as const, label: "Net Banking", desc: "All major Indian banks supported", icon: Landmark },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                        paymentMethod === method.value
                          ? "bg-accent/5 border-accent/30"
                          : "bg-card border-border hover:border-accent/20"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={() => { setPaymentMethod(method.value); setPaymentError(null); }}
                        className="accent-accent"
                      />
                      <method.icon size={18} className="text-accent shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{method.label}</p>
                        <p className="text-xs text-muted-foreground">{method.desc}</p>
                        
                        {/* Custom brand indicators for UPI and Bank */}
                        {method.value === "upi" && (
                          <div className="flex gap-2.5 mt-3 items-center">
                            <div className="bg-white px-2 py-1 rounded border border-border h-6 flex items-center shadow-sm">
                              <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" className="h-3" />
                            </div>
                            <div className="bg-white px-2 py-1 rounded border border-border h-6 flex items-center shadow-sm">
                              <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" className="h-3.5" />
                            </div>
                            <div className="bg-white px-2 py-1 rounded border border-border h-6 flex items-center shadow-sm">
                              <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" alt="Paytm" className="h-2.5" />
                            </div>
                          </div>
                        )}
                        {method.value === "netbanking" && (
                          <div className="flex gap-2 mt-3 items-center">
                            <div className="bg-white px-2 py-1 rounded border border-border h-6 flex items-center shadow-sm">
                              <img src="https://upload.wikimedia.org/wikipedia/commons/c/cc/SBI-logo.svg" alt="SBI" className="h-3" />
                            </div>
                            <div className="bg-white px-2 py-1 rounded border border-border h-6 flex items-center shadow-sm">
                              <img src="https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg" alt="HDFC" className="h-3" />
                            </div>
                            <div className="bg-white px-2 py-1 rounded border border-border h-6 flex items-center shadow-sm">
                              <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/ICICI_Bank_Logo.svg" alt="ICICI" className="h-3" />
                            </div>
                            <div className="bg-white px-2 py-1 rounded border border-border h-6 flex items-center shadow-sm">
                              <img src="https://upload.wikimedia.org/wikipedia/commons/1/1a/Axis_Bank_logo.svg" alt="Axis" className="h-3" />
                            </div>
                          </div>
                        )}
                      </div>
                      {method.value !== "cod" && (
                        <span className="ml-auto text-[10px] uppercase tracking-wider text-accent/60 bg-accent/5 px-2 py-1 rounded">Secure</span>
                      )}
                    </label>
                  ))}
                </div>
                {paymentMethod !== "cod" && (
                  <p className="text-[10px] text-muted-foreground mt-3 flex items-center gap-1.5">
                    <ShieldCheck size={12} className="text-accent" />
                    Payments are processed securely by Razorpay.
                  </p>
                )}
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-5">
              <div className="bg-card border border-border rounded-xl p-8 sticky top-32">
                <h2
                  className="text-xl font-normal text-foreground mb-6"
                  style={{ fontFamily: "var(--font-lora), serif" }}
                >
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6 max-h-[240px] overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="relative w-14 h-14 bg-muted rounded-md overflow-hidden shrink-0">
                        <Image src={item.img} alt={item.name} fill className="object-cover" sizes="56px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm text-accent shrink-0">{item.price}</p>
                    </div>
                  ))}
                </div>

                {/* Selected Address Preview */}
                {selectedAddress && (
                  <div className="mb-6 p-3 bg-accent/5 rounded-lg border border-accent/10">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-accent mb-1.5 flex items-center gap-1">
                      <Truck size={10} /> Delivering to
                    </p>
                    <p className="text-xs text-foreground font-medium">
                      {selectedAddress.firstName} {selectedAddress.lastName}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {selectedAddress.addressLine1}, {selectedAddress.city} — {selectedAddress.pincode}
                    </p>
                  </div>
                )}

                <div className="space-y-3 mb-6 text-sm border-t border-border pt-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>{formattedSubtotal}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-1.5">
                        <Tag size={14} /> {appliedCoupon.code} ({appliedCoupon.discount}% off)
                      </span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  {redeemedCoins > 0 && (
                    <div className="flex justify-between text-sm text-amber-700 mt-2 pt-2 border-t border-amber-100">
                      <span className="flex items-center gap-1">
                        <Coins size={12} /> ASHL Coins Redeemed ({redeemedCoins})
                      </span>
                      <span>-₹{coinDiscountAmount}</span>
                    </div>
                  )}
                  {buyXGetYDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span className="flex items-center gap-1">
                        <Gift size={12} /> Buy {buyXGetYSettings.buyQty} Get {buyXGetYSettings.freeQty} Free
                      </span>
                      <span>-₹{buyXGetYDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>{shippingFee === 0 ? <span className="text-accent">Free</span> : `₹${shippingFee}`}</span>
                  </div>
                  {paymentMethod === "cod" && (
                    <div className="flex justify-between text-sm text-foreground/80">
                      <span>Cash on Delivery Fee</span>
                      <span>+₹7</span>
                    </div>
                  )}
                  {shippingFee > 0 && (
                    <p className="text-[10px] text-accent">Free shipping on orders above ₹499</p>
                  )}
                  {coinsToEarn(finalTotal) > 0 && (
                    <div className="flex items-center gap-1.5 text-amber-600 text-xs bg-amber-50 px-3 py-2 rounded-md">
                      <Coins size={12} /> You will earn <strong>{coinsToEarn(finalTotal)}</strong> ASHL Coins
                    </div>
                  )}
                  <div className="border-t border-border pt-3 flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span className="text-accent">{formattedTotal}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !selectedAddress}
                  className="w-full bg-primary text-primary-foreground uppercase tracking-[0.15em] text-xs py-4 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <><Loader2 size={16} className="animate-spin" /> Processing...</>
                  ) : !selectedAddress ? (
                    <><MapPin size={16} /> Select an Address</>
                  ) : paymentMethod === "cod" ? (
                    <><ShieldCheck size={16} /> Place Order (COD)</>
                  ) : (
                    <><CreditCard size={16} /> Pay {formattedTotal}</>
                  )}
                </button>

                <p className="text-[10px] text-muted-foreground text-center mt-4">
                  {paymentMethod === "cod"
                    ? "By placing your order, you agree to our terms and conditions."
                    : "You will be redirected to Razorpay's secure payment page."}
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
