"use client";

import { useState, useEffect } from "react";
import {
  Users,
  ShoppingBag,
  IndianRupee,
  Package,
  Loader2,
  RefreshCw,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  AlertCircle,
  CreditCard,
  Banknote,
  TrendingUp,
} from "lucide-react";

type RecentOrder = {
  id: string;
  customerName: string;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  itemCount: number;
};

type TopProduct = {
  name: string;
  unitsSold: number;
};

type DashboardData = {
  totalRevenue: number;
  totalOrders: number;
  signedUpCustomers: number;
  recentOrders: RecentOrder[];
  statusBreakdown: Record<string, number>;
  topProducts: TopProduct[];
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  placed: { label: "Placed", color: "bg-blue-500/10 text-blue-600 border-blue-200", icon: Clock },
  processing: { label: "Processing", color: "bg-yellow-500/10 text-yellow-600 border-yellow-200", icon: Loader2 },
  shipped: { label: "Shipped", color: "bg-purple-500/10 text-purple-600 border-purple-200", icon: Package },
  in_transit: { label: "In Transit", color: "bg-indigo-500/10 text-indigo-600 border-indigo-200", icon: Truck },
  out_for_delivery: { label: "Out for Delivery", color: "bg-orange-500/10 text-orange-600 border-orange-200", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-500/10 text-green-600 border-green-200", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-600 border-red-200", icon: XCircle },
};

function formatCurrency(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-10 h-10 text-destructive" />
          <p className="text-foreground font-medium">Failed to load dashboard</p>
          <p className="text-muted-foreground text-sm">{error}</p>
          <button
            onClick={fetchDashboard}
            className="mt-2 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:bg-primary/90 transition-colors"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Revenue",
      value: formatCurrency(data.totalRevenue),
      description: "Excluding cancelled orders",
      icon: IndianRupee,
      accent: "bg-emerald-500/10 text-emerald-600",
    },
    {
      label: "Total Orders",
      value: data.totalOrders.toLocaleString("en-IN"),
      description: "All time",
      icon: ShoppingBag,
      accent: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "Customers Signed Up",
      value: data.signedUpCustomers.toLocaleString("en-IN"),
      description: "Registered on site",
      icon: Users,
      accent: "bg-violet-500/10 text-violet-600",
    },
  ];

  const avgOrderValue =
    data.totalOrders > 0
      ? Math.round(data.totalRevenue / data.totalOrders)
      : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, Admin. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg px-4 py-2.5 hover:bg-card transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.accent}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-muted-foreground">{stat.description}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Average Order Value highlight */}
      {data.totalOrders > 0 && (
        <div className="bg-gradient-to-r from-accent/10 via-primary/5 to-accent/10 border border-accent/20 rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-accent/15 p-2.5 rounded-lg">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">Average Order Value</p>
              <p className="text-xl font-bold text-foreground mt-0.5">{formatCurrency(avgOrderValue)}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Based on {data.totalOrders} orders</p>
        </div>
      )}

      {/* Main Grid — Recent Orders + Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders — 2/3 width */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
            <p className="text-xs text-muted-foreground mt-1">Last 5 orders placed on the site</p>
          </div>

          {data.recentOrders.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No orders yet</p>
              <p className="text-xs text-muted-foreground mt-1">Orders will appear here once customers start placing them.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data.recentOrders.map((order) => {
                const statusInfo = STATUS_CONFIG[order.status] || {
                  label: order.status,
                  color: "bg-muted text-muted-foreground border-border",
                  icon: AlertCircle,
                };
                const StatusIcon = statusInfo.icon;
                return (
                  <div key={order.id} className="px-6 py-4 flex items-center gap-4 hover:bg-muted/20 transition-colors">
                    {/* Status icon */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${statusInfo.color}`}>
                      <StatusIcon size={16} />
                    </div>

                    {/* Order info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {order.customerName}
                        </p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                        <span>#{order.id.slice(0, 8)}…</span>
                        <span>•</span>
                        <span>{order.itemCount} {order.itemCount === 1 ? "item" : "items"}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          {order.paymentMethod === "cod" ? (
                            <><Banknote size={10} /> COD</>
                          ) : (
                            <><CreditCard size={10} /> Prepaid</>
                          )}
                        </span>
                      </p>
                    </div>

                    {/* Amount & date */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(order.total)}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {formatDate(order.createdAt)} · {formatTime(order.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar — Order Status + Top Products */}
        <div className="space-y-6">
          {/* Order Status Breakdown */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Order Status</h2>
              <p className="text-xs text-muted-foreground mt-1">Breakdown by current status</p>
            </div>
            <div className="p-6 space-y-3">
              {Object.keys(STATUS_CONFIG).map((status) => {
                const count = data.statusBreakdown[status] || 0;
                const config = STATUS_CONFIG[status];
                const percentage = data.totalOrders > 0 ? Math.round((count / data.totalOrders) * 100) : 0;
                const StatusIcon = config.icon;

                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <StatusIcon size={13} className={config.color.split(" ")[1]} />
                        <span className="text-xs font-medium text-foreground">{config.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">{count}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${config.color.split(" ")[0].replace("/10", "/40")}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {data.totalOrders === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No orders yet</p>
              )}
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Top Products</h2>
              <p className="text-xs text-muted-foreground mt-1">By units sold</p>
            </div>
            {data.topProducts.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-xs text-muted-foreground">No product data yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {data.topProducts.map((product, idx) => (
                  <div key={product.name} className="px-6 py-3.5 flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-5 text-center">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{product.name}</p>
                    </div>
                    <span className="text-xs font-semibold text-accent shrink-0">
                      {product.unitsSold} sold
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
