import { NextRequest, NextResponse } from "next/server";
import { getShypBuddyHeaders, SHYPBUDDY_SELLER_BASE } from "@/lib/shiprocket";

// Cancel ShypBuddy order by AWB
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { awbs } = body;

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
