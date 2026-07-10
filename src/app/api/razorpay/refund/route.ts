import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { paymentId, orderId, amount } = await request.json();

    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    // Create refund via Razorpay API
    // If amount is provided, it's a partial refund (amount in paise)
    // If no amount, it's a full refund
    const refundOptions: Record<string, unknown> = {};
    if (amount && amount > 0) {
      refundOptions.amount = Math.round(amount * 100); // Convert to paise
    }

    const refund = await razorpay.payments.refund(paymentId, refundOptions);

    // Update order status to "refunded" in Supabase
    if (orderId) {
      await supabase
        .from("orders")
        .update({
          status: "refunded",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);
    }

    return NextResponse.json({
      success: true,
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount ? refund.amount / 100 : null, // Convert back to INR
    });
  } catch (error: any) {
    console.error("Razorpay refund failed:", error);
    return NextResponse.json(
      { error: error.error?.description || error.message || "Refund failed" },
      { status: 500 }
    );
  }
}
