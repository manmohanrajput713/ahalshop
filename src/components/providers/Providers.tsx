"use client";

import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AddressProvider } from "@/context/AddressContext";
import { OrderProvider } from "@/context/OrderContext";
import { AshlCoinProvider } from "@/context/AshlCoinContext";
import { ReactNode, useEffect } from "react";
import { useOrders } from "@/context/OrderContext";
import { useAshlCoins } from "@/context/AshlCoinContext";

// Inner component that bridges OrderContext and AshlCoinContext
// Credits pending coins when orders are marked as delivered
function CoinDeliveryWatcher({ children }: { children: ReactNode }) {
  const { orders } = useOrders();
  const { pendingCoins, creditPendingCoins } = useAshlCoins();

  useEffect(() => {
    if (pendingCoins.length === 0 || orders.length === 0) return;

    // Check if any pending coin orders have been delivered
    for (const pending of pendingCoins) {
      const order = orders.find((o) => o.id === pending.order_id);
      if (order && order.status === "delivered") {
        creditPendingCoins(pending.order_id);
      }
    }
  }, [orders, pendingCoins, creditPendingCoins]);

  return <>{children}</>;
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <WishlistProvider>
        <AddressProvider>
          <OrderProvider>
            <AshlCoinProvider>
              <CoinDeliveryWatcher>
                {children}
              </CoinDeliveryWatcher>
            </AshlCoinProvider>
          </OrderProvider>
        </AddressProvider>
      </WishlistProvider>
    </CartProvider>
  );
}
