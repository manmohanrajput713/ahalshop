import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET — fetch coin data for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    // Fetch balance
    const { data: balanceRow } = await supabase
      .from("ashl_coin_balances")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Fetch transactions (last 20)
    const { data: transactions } = await supabase
      .from("ashl_coin_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    // Fetch pending coins
    const { data: pending } = await supabase
      .from("ashl_coin_pending")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      balance: balanceRow?.balance ?? 0,
      transactions: transactions || [],
      pendingCoins: pending || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — perform coin operations (earn, redeem, add_pending, credit_pending)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: "userId and action required" }, { status: 400 });
    }

    switch (action) {
      case "add_pending": {
        const { orderId, amount } = body;

        // Check for duplicate
        const { data: existing } = await supabase
          .from("ashl_coin_pending")
          .select("id")
          .eq("user_id", userId)
          .eq("order_id", orderId)
          .single();

        if (existing) {
          return NextResponse.json({ message: "Already pending" });
        }

        await supabase.from("ashl_coin_pending").insert({
          user_id: userId,
          order_id: orderId,
          amount,
        });

        return NextResponse.json({ success: true });
      }

      case "remove_pending": {
        const { orderId } = body;
        
        await supabase
          .from("ashl_coin_pending")
          .delete()
          .eq("user_id", userId)
          .eq("order_id", orderId);
          
        return NextResponse.json({ success: true });
      }

      case "credit_pending": {
        const { orderId } = body;

        // Find the pending record
        const { data: pending } = await supabase
          .from("ashl_coin_pending")
          .select("*")
          .eq("user_id", userId)
          .eq("order_id", orderId)
          .single();

        if (!pending) {
          return NextResponse.json({ message: "No pending coins for this order" });
        }

        // Upsert balance
        const { data: balanceRow } = await supabase
          .from("ashl_coin_balances")
          .select("balance")
          .eq("user_id", userId)
          .single();

        const currentBalance = balanceRow?.balance ?? 0;
        const newBalance = currentBalance + pending.amount;

        await supabase
          .from("ashl_coin_balances")
          .upsert({ user_id: userId, balance: newBalance }, { onConflict: "user_id" });

        // Create transaction record
        await supabase.from("ashl_coin_transactions").insert({
          user_id: userId,
          type: "earned",
          amount: pending.amount,
          order_id: orderId,
          description: `Earned from delivered order #${orderId}`,
        });

        // Delete pending record
        await supabase
          .from("ashl_coin_pending")
          .delete()
          .eq("id", pending.id);

        return NextResponse.json({ success: true, newBalance });
      }

      case "redeem": {
        const { amount, description } = body;

        // Get current balance
        const { data: balanceRow } = await supabase
          .from("ashl_coin_balances")
          .select("balance")
          .eq("user_id", userId)
          .single();

        const currentBalance = balanceRow?.balance ?? 0;
        if (amount > currentBalance) {
          return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
        }

        const newBalance = currentBalance - amount;

        await supabase
          .from("ashl_coin_balances")
          .upsert({ user_id: userId, balance: newBalance }, { onConflict: "user_id" });

        await supabase.from("ashl_coin_transactions").insert({
          user_id: userId,
          type: "redeemed",
          amount,
          description: description || `Redeemed for ₹${amount} discount`,
        });

        return NextResponse.json({ success: true, newBalance });
      }

      case "earn": {
        const { amount, orderId, description } = body;

        const { data: balanceRow } = await supabase
          .from("ashl_coin_balances")
          .select("balance")
          .eq("user_id", userId)
          .single();

        const currentBalance = balanceRow?.balance ?? 0;
        const newBalance = currentBalance + amount;

        await supabase
          .from("ashl_coin_balances")
          .upsert({ user_id: userId, balance: newBalance }, { onConflict: "user_id" });

        await supabase.from("ashl_coin_transactions").insert({
          user_id: userId,
          type: "earned",
          amount,
          order_id: orderId,
          description: description || `Earned from order #${orderId}`,
        });

        return NextResponse.json({ success: true, newBalance });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
