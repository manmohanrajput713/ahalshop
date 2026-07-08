"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useOrders, Order } from "@/context/OrderContext";
import { useAshlCoins } from "@/context/AshlCoinContext";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Package, Truck, MapPin, CheckCircle2, Clock, CircleDot, ArrowLeft, Loader2, AlertCircle, Box, ShoppingBag, XCircle } from "lucide-react";
import Link from "next/link";
import AuthGuard from "@/components/auth/AuthGuard";

const STATUS_STEPS = [
  { key: "placed", label: "Order Placed", icon: ShoppingBag },
  { key: "processing", label: "Processing", icon: Box },
  { key: "shipped", label: "Shipped", icon: Package },
  { key: "in_transit", label: "In Transit", icon: Truck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: MapPin },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

function getStatusIndex(status: string): number {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

function TrackOrderContent() {
  const { orders, getOrder, updateOrder, refreshOrders } = useOrders();
  const { removePendingCoins } = useAshlCoins();
  const searchParams = useSearchParams();
  const [searchId, setSearchId] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shiprocketTracking, setShiprocketTracking] = useState<any>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  const handleCancelOrder = async (orderId: string, awbCode?: string) => {
    setCancellingId(orderId);
    try {
      if (awbCode) {
        await fetch("/api/shiprocket/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ awbs: [awbCode] }),
        });
      }
      await updateOrder(orderId, { status: "cancelled" });
      await removePendingCoins(orderId);
      await refreshOrders();
      if (trackedOrder?.id === orderId) {
        setTrackedOrder({ ...trackedOrder, status: "cancelled" });
      }
    } catch (e) {
      console.error("Cancel failed:", e);
    }
    setCancellingId(null);
    setShowConfirm(null);
  };

  const canCancel = (status: string) => ["placed", "processing"].includes(status);

  // Auto-load from URL param
  useEffect(() => {
    const idFromUrl = searchParams.get("id");
    if (idFromUrl) {
      setSearchId(idFromUrl);
      const order = getOrder(idFromUrl);
      if (order) {
        setTrackedOrder(order);
        setNotFound(false);
        // Try fetching Shiprocket tracking
        if (order.shiprocketShipmentId) {
          fetchShiprocketTracking(order.shiprocketShipmentId);
        }
      } else {
        setNotFound(true);
      }
    }
  }, [searchParams, getOrder]);

  const fetchShiprocketTracking = async (shipmentId: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/shiprocket/track?shipment_id=${shipmentId}`);
      if (res.ok) {
        const data = await res.json();
        setShiprocketTracking(data);
      }
    } catch (e) {
      console.error("Failed to fetch tracking:", e);
    }
    setIsLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchId.trim().replace("#", "");
    if (!trimmed) return;

    const order = getOrder(trimmed);
    if (order) {
      setTrackedOrder(order);
      setNotFound(false);
      if (order.shiprocketShipmentId) {
        fetchShiprocketTracking(order.shiprocketShipmentId);
      }
    } else {
      setTrackedOrder(null);
      setNotFound(true);
    }
  };

  const currentStepIndex = trackedOrder ? getStatusIndex(trackedOrder.status) : 0;

  return (
    <>
        <h1
          className="text-3xl lg:text-4xl font-normal text-foreground mb-3"
          style={{ fontFamily: "var(--font-lora), serif" }}
        >
          Track Your <em className="italic">Order</em>
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Enter your order ID to see real-time delivery status.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-12">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => { setSearchId(e.target.value); setNotFound(false); }}
                placeholder="Enter Order ID (e.g. ASHL12345678)"
                className="w-full bg-card border border-border pl-11 pr-4 py-4 text-sm rounded-lg focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <button
              type="submit"
              className="bg-primary text-primary-foreground uppercase tracking-[0.15em] text-xs px-8 hover:bg-primary/90 transition-colors"
            >
              Track
            </button>
          </div>
          {notFound && (
            <p className="text-xs text-red-500 mt-3 flex items-center gap-1.5">
              <AlertCircle size={12} /> No order found with this ID. Please check and try again.
            </p>
          )}
        </form>

        {/* Tracked Order */}
        {trackedOrder && (
          <div className="space-y-8">
            {/* Order Header */}
            <div className="bg-card border border-border rounded-xl p-6 lg:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Order ID</p>
                  <p className="text-lg font-medium text-foreground">#{trackedOrder.id}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Placed on {new Date(trackedOrder.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Total</p>
                  <p className="text-lg font-medium text-accent">
                    {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(trackedOrder.total)}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground mt-1 bg-secondary inline-block px-2 py-0.5 rounded">
                    {trackedOrder.paymentMethod === "cod" ? "Cash on Delivery" : "Paid via Razorpay"}
                  </p>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="relative">
                <div className="flex items-start justify-between">
                  {STATUS_STEPS.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const StepIcon = step.icon;

                    return (
                      <div key={step.key} className="flex flex-col items-center flex-1 relative">
                        {/* Connecting line */}
                        {index < STATUS_STEPS.length - 1 && (
                          <div
                            className={`absolute top-5 left-1/2 w-full h-0.5 ${
                              index < currentStepIndex ? "bg-accent" : "bg-border"
                            }`}
                          />
                        )}
                        
                        {/* Icon circle */}
                        <div
                          className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                            isCurrent
                              ? "bg-accent border-accent text-accent-foreground shadow-md shadow-accent/20"
                              : isCompleted
                              ? "bg-accent/10 border-accent text-accent"
                              : "bg-card border-border text-muted-foreground"
                          }`}
                        >
                          {isCurrent && !isCompleted ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <StepIcon size={16} />
                          )}
                        </div>

                        {/* Label */}
                        <p className={`text-[10px] text-center mt-2 leading-tight max-w-[70px] ${
                          isCompleted ? "text-foreground font-medium" : "text-muted-foreground"
                        }`}>
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Courier Info */}
              {(trackedOrder.courierName || trackedOrder.awbCode) && (
                <div className="mt-8 pt-6 border-t border-border flex flex-wrap gap-6">
                  {trackedOrder.courierName && (
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Courier</p>
                      <p className="text-sm text-foreground">{trackedOrder.courierName}</p>
                    </div>
                  )}
                  {trackedOrder.awbCode && (
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">AWB / Tracking Number</p>
                      <p className="text-sm text-foreground font-mono">{trackedOrder.awbCode}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Delivery Address */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <MapPin size={14} className="text-accent" /> Delivery Address
              </h3>
              <p className="text-sm text-foreground">
                {trackedOrder.address.firstName} {trackedOrder.address.lastName}
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {trackedOrder.address.addressLine1}
                {trackedOrder.address.addressLine2 ? `, ${trackedOrder.address.addressLine2}` : ""}
                <br />
                {trackedOrder.address.city}, {trackedOrder.address.state} — {trackedOrder.address.pincode}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                📞 {trackedOrder.address.phone}
              </p>
            </div>

            {/* Order Items */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                <Package size={14} className="text-accent" /> Items in this Order
              </h3>
              <div className="space-y-3">
                {trackedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-accent shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm text-accent">{item.price}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Actions (Cancel) */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-medium text-foreground mb-4">Order Actions</h3>
              
              {canCancel(trackedOrder.status) && showConfirm !== trackedOrder.id && (
                <button
                  onClick={() => setShowConfirm(trackedOrder.id)}
                  className="inline-flex items-center gap-2 border border-red-500/30 text-red-600 uppercase tracking-[0.15em] text-[10px] px-5 py-2.5 rounded-md hover:bg-red-500/5 transition-colors"
                >
                  <XCircle size={12} /> Cancel Order
                </button>
              )}

              {showConfirm === trackedOrder.id && (
                <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-600 mb-3">Are you sure you want to cancel this order?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCancelOrder(trackedOrder.id, trackedOrder.awbCode)}
                      disabled={cancellingId === trackedOrder.id}
                      className="inline-flex items-center gap-2 bg-red-600 text-white text-[10px] uppercase tracking-[0.15em] px-5 py-2.5 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {cancellingId === trackedOrder.id ? (
                        <><Loader2 size={12} className="animate-spin" /> Cancelling...</>
                      ) : (
                        "Yes, Cancel Order"
                      )}
                    </button>
                    <button
                      onClick={() => setShowConfirm(null)}
                      className="text-[10px] uppercase tracking-[0.15em] px-5 py-2.5 bg-secondary text-muted-foreground rounded-md hover:text-foreground transition-colors"
                    >
                      No, Keep It
                    </button>
                  </div>
                </div>
              )}

              {trackedOrder.status === "cancelled" && (
                <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] text-red-500">
                  <XCircle size={12} /> Order Cancelled
                </span>
              )}
            </div>
          </div>
        )}

        {/* Recent Orders (when no order is being tracked) */}
        {!trackedOrder && !notFound && orders.length > 0 && (
          <div>
            <h2
              className="text-xl font-normal text-foreground mb-6"
              style={{ fontFamily: "var(--font-lora), serif" }}
            >
              Recent Orders
            </h2>
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <Link
                  key={order.id}
                  href={`/track-order?id=${order.id}`}
                  className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-accent/20 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Package size={16} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">#{order.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.items.length} item{order.items.length > 1 ? "s" : ""} · {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-accent">
                      {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(order.total)}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground capitalize">{order.status.replace("_", " ")}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No orders at all */}
        {!trackedOrder && !notFound && orders.length === 0 && (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <Package size={40} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No orders yet.</p>
            <p className="text-xs text-muted-foreground mb-6">Place your first order and track it here!</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground uppercase tracking-[0.15em] text-xs px-8 py-4"
            >
              Start Shopping
            </Link>
          </div>
        )}
    </>
  );
}

export default function TrackOrderPage() {
  return (
    <AuthGuard message="Please sign in to track your orders.">
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-32 pb-24 max-w-4xl mx-auto px-6 lg:px-12 w-full">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-accent" size={32} />
          </div>
        }>
          <TrackOrderContent />
        </Suspense>
      </main>

      <Footer />
    </div>
    </AuthGuard>
  );
}
