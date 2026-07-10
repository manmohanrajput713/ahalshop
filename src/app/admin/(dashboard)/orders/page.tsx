"use client";

import { useState, useEffect } from "react";
import {
  Package, Truck, MapPin, CreditCard, Banknote,
  Search, Filter, RefreshCw, ChevronDown, ChevronUp,
  Eye, Clock, CheckCircle2, Loader2, XCircle, AlertCircle, Ban, RotateCcw
} from "lucide-react";

type OrderItem = {
  id: number;
  name: string;
  price: string;
  quantity: number;
  img?: string;
  category?: string;
};

type Order = {
  id: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone: string;
  customer_email: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  total: number;
  payment_method: string;
  razorpay_payment_id: string | null;
  shiprocket_order_id: number | null;
  shiprocket_shipment_id: number | null;
  awb_code: string | null;
  courier_name: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

const STATUS_OPTIONS = [
  { value: "placed", label: "Placed", color: "bg-blue-500/10 text-blue-600" },
  { value: "processing", label: "Processing", color: "bg-yellow-500/10 text-yellow-600" },
  { value: "shipped", label: "Shipped", color: "bg-purple-500/10 text-purple-600" },
  { value: "in_transit", label: "In Transit", color: "bg-indigo-500/10 text-indigo-600" },
  { value: "out_for_delivery", label: "Out for Delivery", color: "bg-orange-500/10 text-orange-600" },
  { value: "delivered", label: "Delivered", color: "bg-green-500/10 text-green-600" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-500/10 text-red-600" },
  { value: "refunded", label: "Refunded", color: "bg-emerald-500/10 text-emerald-600" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [refundingOrderId, setRefundingOrderId] = useState<string | null>(null);
  const [refundMessage, setRefundMessage] = useState<{ orderId: string; type: "success" | "error"; text: string } | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error("Failed to fetch orders:", e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (e) {
      console.error("Failed to update order:", e);
    }
    setUpdatingOrderId(null);
  };

  const cancelOrder = async (orderId: string, awbCode: string | null) => {
    setCancellingOrderId(orderId);
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
      await updateOrderStatus(orderId, "cancelled");
    } catch (e) {
      console.error("Cancel failed:", e);
    }
    setCancellingOrderId(null);
  };

  const refundOrder = async (order: Order) => {
    if (!order.razorpay_payment_id) {
      setRefundMessage({ orderId: order.id, type: "error", text: "No Razorpay payment ID found. This order was likely COD." });
      return;
    }
    const confirmed = window.confirm(`Are you sure you want to refund ₹${order.total} for order #${order.id}?\n\nThis will send the money back to the customer's account.`);
    if (!confirmed) return;

    setRefundingOrderId(order.id);
    setRefundMessage(null);
    try {
      const res = await fetch("/api/razorpay/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: order.razorpay_payment_id,
          orderId: order.id,
          amount: order.total,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, status: "refunded" } : o))
        );
        setRefundMessage({ orderId: order.id, type: "success", text: `Refund of ₹${order.total} initiated successfully! Refund ID: ${data.refundId}` });
      } else {
        setRefundMessage({ orderId: order.id, type: "error", text: data.error || "Refund failed. Please try again." });
      }
    } catch (e) {
      console.error("Refund failed:", e);
      setRefundMessage({ orderId: order.id, type: "error", text: "Network error. Please try again." });
    }
    setRefundingOrderId(null);
  };

  // Filter & search
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      !searchQuery ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${order.customer_first_name} ${order.customer_last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone.includes(searchQuery) ||
      order.customer_email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Stats
  const totalRevenue = orders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => ["placed", "processing"].includes(o.status)).length;
  const shippedOrders = orders.filter((o) => ["shipped", "in_transit", "out_for_delivery"].includes(o.status)).length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  const getStatusBadge = (status: string) => {
    const s = STATUS_OPTIONS.find((so) => so.value === status);
    return s || { label: status, color: "bg-secondary text-muted-foreground" };
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-1">Manage and track all customer orders.</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm hover:bg-primary/90 transition-colors"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: CreditCard, color: "text-accent" },
          { label: "Pending", value: pendingOrders, icon: Clock, color: "text-yellow-600" },
          { label: "Shipped", value: shippedOrders, icon: Truck, color: "text-purple-600" },
          { label: "Delivered", value: deliveredOrders, icon: CheckCircle2, color: "text-green-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <stat.icon size={18} className={stat.color} />
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, name, phone, email..."
            className="w-full bg-card border border-border pl-9 pr-4 py-2.5 text-sm rounded-lg focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-card border border-border pl-9 pr-8 py-2.5 text-sm rounded-lg focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">Loading orders...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-xl">
          <Package size={40} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {orders.length === 0 ? "No orders yet." : "No orders match your search."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Column Headers */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-2 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            <div className="col-span-2">Order ID</div>
            <div className="col-span-3">Customer</div>
            <div className="col-span-2">Items</div>
            <div className="col-span-1">Total</div>
            <div className="col-span-1">Payment</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Actions</div>
          </div>

          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const badge = getStatusBadge(order.status);

            return (
              <div key={order.id} className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Row */}
                <div
                  className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-5 py-4 items-center cursor-pointer hover:bg-secondary/30 transition-colors"
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                >
                  {/* Order ID + Date */}
                  <div className="lg:col-span-2">
                    <p className="text-sm font-medium text-foreground">#{order.id}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>

                  {/* Customer */}
                  <div className="lg:col-span-3">
                    <p className="text-sm text-foreground">{order.customer_first_name} {order.customer_last_name}</p>
                    <p className="text-[10px] text-muted-foreground">{order.customer_phone} · {order.customer_email}</p>
                  </div>

                  {/* Items count */}
                  <div className="lg:col-span-2">
                    <p className="text-sm text-muted-foreground">
                      {order.items.reduce((sum: number, i: OrderItem) => sum + i.quantity, 0)} item(s)
                    </p>
                  </div>

                  {/* Total */}
                  <div className="lg:col-span-1">
                    <p className="text-sm font-medium text-accent">{formatCurrency(order.total)}</p>
                  </div>

                  {/* Payment */}
                  <div className="lg:col-span-1">
                    <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-1">
                      {order.payment_method === "cod" ? <Banknote size={10} /> : <CreditCard size={10} />}
                      {order.payment_method === "cod" ? "COD" : "Paid"}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="lg:col-span-2">
                    <span className={`text-[10px] uppercase tracking-[0.1em] px-2.5 py-1 rounded-md inline-block ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Expand */}
                  <div className="lg:col-span-1 flex items-center gap-2">
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-border pt-5 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* Delivery Address */}
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2 flex items-center gap-1">
                          <MapPin size={10} /> Delivery Address
                        </p>
                        <p className="text-sm text-foreground">{order.customer_first_name} {order.customer_last_name}</p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {order.address_line1}
                          {order.address_line2 ? `, ${order.address_line2}` : ""}<br />
                          {order.city}, {order.state} — {order.pincode}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">📞 {order.customer_phone}</p>
                        <p className="text-xs text-muted-foreground">✉ {order.customer_email}</p>
                      </div>

                      {/* Items */}
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2 flex items-center gap-1">
                          <Package size={10} /> Order Items
                        </p>
                        <div className="space-y-2">
                          {order.items.map((item: OrderItem, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-foreground">{item.name} × {item.quantity}</span>
                              <span className="text-accent">{item.price}</span>
                            </div>
                          ))}
                          <div className="pt-2 border-t border-border flex justify-between text-sm font-medium">
                            <span>Total</span>
                            <span className="text-accent">{formatCurrency(order.total)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Shipping / Payment Info */}
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2 flex items-center gap-1">
                          <Truck size={10} /> Shipping & Payment
                        </p>
                        <div className="space-y-2 text-xs">
                          {order.razorpay_payment_id && (
                            <div>
                              <span className="text-muted-foreground">Razorpay ID: </span>
                              <span className="text-foreground font-mono">{order.razorpay_payment_id}</span>
                            </div>
                          )}
                          {order.shiprocket_order_id && (
                            <div>
                              <span className="text-muted-foreground">Shiprocket Order: </span>
                              <span className="text-foreground">#{order.shiprocket_order_id}</span>
                            </div>
                          )}
                          {order.awb_code && (
                            <div>
                              <span className="text-muted-foreground">AWB: </span>
                              <span className="text-foreground font-mono">{order.awb_code}</span>
                            </div>
                          )}
                          {order.courier_name && (
                            <div>
                              <span className="text-muted-foreground">Courier: </span>
                              <span className="text-foreground">{order.courier_name}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-muted-foreground">Shipping: </span>
                            <span className="text-foreground">{order.shipping_fee === 0 ? "Free" : formatCurrency(order.shipping_fee)}</span>
                          </div>
                        </div>

                        {/* Update Status */}
                        <div className="mt-4">
                          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Update Status</p>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            disabled={updatingOrderId === order.id}
                            className="w-full bg-background border border-border px-3 py-2 text-sm rounded-md focus:outline-none focus:border-accent transition-colors"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                          {updatingOrderId === order.id && (
                            <p className="text-[10px] text-accent mt-1 flex items-center gap-1">
                              <Loader2 size={10} className="animate-spin" /> Updating...
                            </p>
                          )}
                        </div>

                        {/* Cancel Order */}
                        {["placed", "processing"].includes(order.status) && (
                          <div className="mt-4">
                            <button
                              onClick={() => cancelOrder(order.id, order.awb_code)}
                              disabled={cancellingOrderId === order.id}
                              className="w-full flex items-center justify-center gap-2 bg-red-600 text-white text-xs uppercase tracking-[0.1em] px-4 py-2.5 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              {cancellingOrderId === order.id ? (
                                <><Loader2 size={12} className="animate-spin" /> Cancelling...</>
                              ) : (
                                <><XCircle size={12} /> Cancel Order</>
                              )}
                            </button>
                          </div>
                        )}

                        {/* Refund Button — visible for cancelled online-paid orders */}
                        {order.status === "cancelled" && order.payment_method !== "cod" && order.razorpay_payment_id && (
                          <div className="mt-4">
                            <button
                              onClick={(e) => { e.stopPropagation(); refundOrder(order); }}
                              disabled={refundingOrderId === order.id}
                              className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white text-xs uppercase tracking-[0.1em] px-4 py-2.5 rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50"
                            >
                              {refundingOrderId === order.id ? (
                                <><Loader2 size={12} className="animate-spin" /> Processing Refund...</>
                              ) : (
                                <><RotateCcw size={12} /> Refund ₹{order.total}</>
                              )}
                            </button>
                            {refundMessage && refundMessage.orderId === order.id && (
                              <p className={`text-[11px] mt-2 flex items-center gap-1 ${
                                refundMessage.type === "success" ? "text-emerald-600" : "text-red-500"
                              }`}>
                                {refundMessage.type === "success" ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                                {refundMessage.text}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Already refunded indicator */}
                        {order.status === "refunded" && (
                          <div className="mt-4 flex items-center gap-2 text-emerald-600 text-xs">
                            <CheckCircle2 size={14} />
                            <span>Refund processed for this order</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Order count */}
      {!isLoading && filteredOrders.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Showing {filteredOrders.length} of {orders.length} orders
        </p>
      )}
    </div>
  );
}
