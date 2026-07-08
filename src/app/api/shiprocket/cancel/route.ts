import { NextRequest, NextResponse } from "next/server";
import { getShypBuddyHeaders, SHYPBUDDY_SELLER_BASE } from "@/lib/shiprocket";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
import { isAdminAuthenticated } from "@/lib/admin-auth";

// Cancel ShypBuddy order by AWB (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { awbs, userId } = body;

    const isAdmin = await isAdminAuthenticated();

    if (!isAdmin) {
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Verify the user owns the orders matching these AWBs
      const { data: orders, error } = await supabase
        .from("orders")
        .select("user_id")
        .in("awb_code", awbs);

      if (error || !orders || orders.some((o) => o.user_id !== userId)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    if (!awbs || !awbs.length) {
      return NextResponse.json({ error: "Provide awbs array" }, { status: 400 });
    }

    const res = await fetch(`${SHYPBUDDY_SELLER_BASE}/orderApi/cancelOrderApi`, {
      method: "POST",
      headers: getShypBuddyHeaders(),
      body: JSON.stringify({ awbs }),
    });

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Cancel service returned unexpected response" },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to cancel order" },
      { status: 500 }
    );
  }
}
