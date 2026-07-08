"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export type CoinTransaction = {
  id: string;
  type: "earned" | "redeemed";
  amount: number;
  order_id?: string;
  description: string;
  created_at: string;
};

export type PendingCoin = {
  id: string;
  order_id: string;
  amount: number;
  created_at: string;
};

interface AshlCoinContextType {
  balance: number;
  pendingCoins: PendingCoin[];
  transactions: CoinTransaction[];
  earnCoins: (orderTotal: number, orderId: string) => number;
  redeemCoins: (amount: number) => boolean;
  coinsToEarn: (orderTotal: number) => number;
  addPendingCoins: (orderId: string, amount: number) => void;
  creditPendingCoins: (orderId: string) => void;
  removePendingCoins: (orderId: string) => void;
  refreshCoins: () => void;
}

const AshlCoinContext = createContext<AshlCoinContextType | undefined>(undefined);

export function AshlCoinProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [pendingCoins, setPendingCoins] = useState<PendingCoin[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Track auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUserId = session?.user?.id ?? null;
      setUserId(newUserId);
      if (!newUserId) {
        // Clear state on logout
        setBalance(0);
        setTransactions([]);
        setPendingCoins([]);
        setIsLoaded(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch coin data from database when user is logged in
  const fetchCoinData = useCallback(async () => {
    if (!userId) return;

    try {
      const res = await fetch(`/api/coins?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
        setTransactions(data.transactions);
        setPendingCoins(data.pendingCoins);
      }
    } catch (e) {
      console.error("Failed to fetch coin data:", e);
    }
    setIsLoaded(true);
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchCoinData();
    }
  }, [userId, fetchCoinData]);

  const refreshCoins = useCallback(() => {
    fetchCoinData();
  }, [fetchCoinData]);

  // Calculate coins to earn: 10 coins per ₹100 spent
  const coinsToEarn = useCallback((orderTotal: number): number => {
    return Math.floor(orderTotal / 100) * 10;
  }, []);

  // Add pending coins for an order (coins will be credited after delivery)
  const addPendingCoins = useCallback(async (orderId: string, amount: number) => {
    if (!userId) return;

    // Optimistic update
    setPendingCoins((prev) => {
      if (prev.some((p) => p.order_id === orderId)) return prev;
      return [...prev, { id: `temp_${Date.now()}`, order_id: orderId, amount, created_at: new Date().toISOString() }];
    });

    try {
      await fetch("/api/coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "add_pending", orderId, amount }),
      });
    } catch (e) {
      console.error("Failed to add pending coins:", e);
    }
  }, [userId]);

  // Credit pending coins when order is delivered
  const creditPendingCoins = useCallback(async (orderId: string) => {
    if (!userId) return;

    const pending = pendingCoins.find((p) => p.order_id === orderId);
    if (!pending) return;

    // Optimistic update
    setBalance((b) => b + pending.amount);
    setTransactions((t) => [{
      id: `earn_${Date.now()}`,
      type: "earned" as const,
      amount: pending.amount,
      order_id: orderId,
      description: `Earned from delivered order #${orderId}`,
      created_at: new Date().toISOString(),
    }, ...t]);
    setPendingCoins((prev) => prev.filter((p) => p.order_id !== orderId));

    try {
      await fetch("/api/coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "credit_pending", orderId }),
      });
    } catch (e) {
      console.error("Failed to credit pending coins:", e);
      // Refetch on error
      fetchCoinData();
    }
  }, [userId, pendingCoins, fetchCoinData]);

  // Remove pending coins when order is cancelled
  const removePendingCoins = useCallback(async (orderId: string) => {
    if (!userId) return;

    // Optimistic update
    setPendingCoins((prev) => prev.filter((p) => p.order_id !== orderId));

    try {
      await fetch("/api/coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "remove_pending", orderId }),
      });
    } catch (e) {
      console.error("Failed to remove pending coins:", e);
      fetchCoinData();
    }
  }, [userId, fetchCoinData]);

  // Earn coins directly (kept for flexibility)
  const earnCoins = useCallback((orderTotal: number, orderId: string): number => {
    if (!userId) return 0;
    const coins = Math.floor(orderTotal / 100) * 10;
    if (coins <= 0) return 0;

    // Optimistic update
    setBalance((prev) => prev + coins);
    setTransactions((prev) => [{
      id: `earn_${Date.now()}`,
      type: "earned" as const,
      amount: coins,
      order_id: orderId,
      description: `Earned from order #${orderId}`,
      created_at: new Date().toISOString(),
    }, ...prev]);

    // Send to API
    fetch("/api/coins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action: "earn", amount: coins, orderId }),
    }).catch((e) => console.error("Failed to earn coins:", e));

    return coins;
  }, [userId]);

  // Redeem coins for discount
  const redeemCoins = useCallback((amount: number): boolean => {
    if (!userId || amount <= 0 || amount > balance) return false;

    // Optimistic update
    setBalance((prev) => prev - amount);
    setTransactions((prev) => [{
      id: `redeem_${Date.now()}`,
      type: "redeemed" as const,
      amount,
      description: `Redeemed for ₹${amount} discount`,
      created_at: new Date().toISOString(),
    }, ...prev]);

    // Send to API
    fetch("/api/coins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action: "redeem", amount }),
    }).catch((e) => console.error("Failed to redeem coins:", e));

    return true;
  }, [userId, balance]);

  return (
    <AshlCoinContext.Provider value={{ 
      balance, 
      pendingCoins,
      transactions, 
      earnCoins, 
      redeemCoins, 
      coinsToEarn,
      addPendingCoins,
      creditPendingCoins,
      removePendingCoins,
      refreshCoins,
    }}>
      {children}
    </AshlCoinContext.Provider>
  );
}

export function useAshlCoins() {
  const context = useContext(AshlCoinContext);
  if (context === undefined) {
    throw new Error("useAshlCoins must be used within an AshlCoinProvider");
  }
  return context;
}
