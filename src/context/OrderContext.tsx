"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export type OrderItem = {
  id: string | number;
  name: string;
  price: string;
  img: string;
  category: string;
  quantity: number;
  selectedSize?: string;
};

export type Order = {
  id: string;
  items: OrderItem[];
  address: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
  };
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: "cod" | "upi" | "card";
  razorpayPaymentId?: string;
  shiprocketOrderId?: number;
  shiprocketShipmentId?: number;
  awbCode?: string;
  courierName?: string;
  status: "placed" | "processing" | "shipped" | "in_transit" | "out_for_delivery" | "delivered" | "cancelled";
  createdAt: string;
};

interface OrderContextType {
  orders: Order[];
  isLoading: boolean;
  addOrder: (order: Omit<Order, "id" | "createdAt">) => Promise<Order>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
  getOrder: (id: string) => Order | undefined;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch orders from Supabase on mount
  const refreshOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        // Map Supabase snake_case to camelCase
        const mapped: Order[] = (data || []).map((o: any) => ({
          id: o.id,
          items: o.items || [],
          address: {
            firstName: o.customer_first_name || "",
            lastName: o.customer_last_name || "",
            phone: o.customer_phone || "",
            email: o.customer_email || "",
            addressLine1: o.address_line1 || "",
            addressLine2: o.address_line2 || "",
            city: o.city || "",
            state: o.state || "",
            pincode: o.pincode || "",
          },
          subtotal: o.subtotal || 0,
          shippingFee: o.shipping_fee || 0,
          total: o.total || 0,
          paymentMethod: o.payment_method || "cod",
          razorpayPaymentId: o.razorpay_payment_id,
          shiprocketOrderId: o.shiprocket_order_id,
          shiprocketShipmentId: o.shiprocket_shipment_id,
          awbCode: o.awb_code,
          courierName: o.courier_name,
          status: o.status || "placed",
          createdAt: o.created_at || new Date().toISOString(),
        }));
        setOrders(mapped);
      }
    } catch (e) {
      console.error("Failed to fetch orders from Supabase:", e);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  const addOrder = useCallback(async (orderData: Omit<Order, "id" | "createdAt">): Promise<Order> => {
    const newOrder: Order = {
      ...orderData,
      id: `ASHL${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
    };

    // Save to Supabase
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: newOrder.id, ...orderData }),
      });
    } catch (e) {
      console.error("Failed to save order to Supabase:", e);
    }

    // Update local state
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  }, []);

  const updateOrder = useCallback(async (id: string, updates: Partial<Order>) => {
    // Update in Supabase
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
    } catch (e) {
      console.error("Failed to update order in Supabase:", e);
    }

    // Update local state
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates } : o))
    );
  }, []);

  const getOrder = useCallback(
    (id: string) => orders.find((o) => o.id === id),
    [orders]
  );

  return (
    <OrderContext.Provider value={{ orders, isLoading, addOrder, updateOrder, getOrder, refreshOrders }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
}
