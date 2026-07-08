"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useOrders } from "@/context/OrderContext";
import { useAshlCoins } from "@/context/AshlCoinContext";
import Link from "next/link";
import { Package, ArrowLeft, ShoppingBag, MapPin, ChevronRight, XCircle, Loader2 } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";

export default function OrdersPage() {
  const { orders, isLoading, updateOrder, refreshOrders } = useOrders();
  const { removePendingCoins } = useAshlCoins();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  const handleCancelOrder = async (orderId: string, awbCode?: string) => {
    setCancellingId(orderId);
    try {
      // Cancel on ShypBuddy if AWB exists
      if (awbCode) {
        await fetch("/api/shiprocket/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ awbs: [awbCode] }),
        });
      }

      // Update status in Supabase
      await updateOrder(orderId, { status: "cancelled" });
      await removePendingCoins(orderId);
      await refreshOrders();
    } catch (e) {
      console.error("Cancel failed:", e);
    }
    setCancellingId(null);
    setShowConfirm(null);
  };

  const canCancel = (status: string) =>
    ["placed", "processing"].includes(status);

  return (
    <AuthGuard message="Please sign in to view your orders.">
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-32 pb-24 max-w-4xl mx-auto px-6 lg:px-12 w-full">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <h1
          className="text-3xl lg:text-4xl font-normal text-foreground mb-3"
          style={{ fontFamily: "var(--font-lora), serif" }}
        >
          My <em className="italic">Orders</em>
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          View your order history and track deliveries.
        </p>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-xl">
            <ShoppingBag size={40} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No orders yet.</p>
            <p className="text-xs text-muted-foreground mb-6">Your order history will appear here.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground uppercase tracking-[0.15em] text-xs px-8 py-4"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const formattedTotal = new Intl.NumberFormat("en-IN", {
                style: "currency", currency: "INR", maximumFractionDigits: 0,
              }).format(order.total);

              const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });

              const statusColors: Record<string, string> = {
                placed: "bg-blue-500/10 text-blue-600",
                processing: "bg-yellow-500/10 text-yellow-600",
                shipped: "bg-purple-500/10 text-purple-600",
                in_transit: "bg-indigo-500/10 text-indigo-600",
                out_for_delivery: "bg-orange-500/10 text-orange-600",
                delivered: "bg-green-500/10 text-green-600",
                cancelled: "bg-red-500/10 text-red-600",
              };

              return (
                <div key={order.id} className="bg-card border border-border rounded-xl p-6 hover:border-accent/20 transition-colors">
                  {/* Header */}
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-sm font-medium text-foreground">#{order.id}</p>
                        <span className={`text-[10px] uppercase tracking-[0.1em] px-2.5 py-1 rounded-md ${statusColors[order.status] || "bg-secondary text-muted-foreground"}`}>
                          {order.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{formattedDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium text-accent">{formattedTotal}</p>
                      <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                        {order.paymentMethod === "cod" ? "COD" : "Prepaid"}
                      </p>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {order.items.map((item) => (
                      <span key={item.id} className="text-xs bg-secondary px-3 py-1.5 rounded-md text-muted-foreground">
                        {item.name} × {item.quantity}
                      </span>
                    ))}
                  </div>

                  {/* Delivery Address */}
                  <div className="flex items-start gap-2 mb-4 text-xs text-muted-foreground">
                    <MapPin size={12} className="text-accent mt-0.5 shrink-0" />
                    <span>
                      {order.address.addressLine1}, {order.address.city}, {order.address.state} — {order.address.pincode}
                    </span>
                  </div>

                  {/* Cancel Confirmation */}
                  {showConfirm === order.id && (
                    <div className="mb-4 p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                      <p className="text-sm text-red-600 mb-3">Are you sure you want to cancel this order?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCancelOrder(order.id, order.awbCode)}
                          disabled={cancellingId === order.id}
                          className="inline-flex items-center gap-2 bg-red-600 text-white text-[10px] uppercase tracking-[0.15em] px-5 py-2.5 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          {cancellingId === order.id ? (
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

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                    <Link
                      href={`/track-order?id=${order.id}`}
                      className="inline-flex items-center gap-2 bg-primary text-primary-foreground uppercase tracking-[0.15em] text-[10px] px-5 py-2.5 hover:bg-primary/90 transition-colors"
                    >
                      <Package size={12} /> Track Order <ChevronRight size={10} />
                    </Link>

                    {canCancel(order.status) && showConfirm !== order.id && (
                      <button
                        onClick={() => setShowConfirm(order.id)}
                        className="inline-flex items-center gap-2 border border-red-500/30 text-red-600 uppercase tracking-[0.15em] text-[10px] px-5 py-2.5 rounded-md hover:bg-red-500/5 transition-colors"
                      >
                        <XCircle size={12} /> Cancel Order
                      </button>
                    )}

                    {order.status === "cancelled" && (
                      <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] text-red-500">
                        <XCircle size={12} /> Order Cancelled
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
    </AuthGuard>
  );
}
