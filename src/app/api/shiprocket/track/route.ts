import { NextRequest, NextResponse } from "next/server";
import { getShypBuddyHeaders, SHYPBUDDY_API_BASE } from "@/lib/shiprocket";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const awbNumbers = searchParams.get("awb");
    const orderId = searchParams.get("order_id");

    if (!awbNumbers && !orderId) {
      return NextResponse.json(
        { error: "Provide awb or order_id parameter" },
        { status: 400 }
      );
    }

    // ShypBuddy tracking endpoint uses AWB numbers
    if (awbNumbers) {
      const res = await fetch(
        `${SHYPBUDDY_API_BASE}/shipment-tracking?awbNumbers=${awbNumbers}`,
        { headers: getShypBuddyHeaders() }
      );

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        return NextResponse.json(
          { error: "Tracking service returned unexpected response" },
          { status: 502 }
        );
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        return NextResponse.json(
          { error: data.message || "Tracking fetch failed", data: data.data },
          { status: res.status }
        );
      }

      return NextResponse.json(data);
    }

    // If only order_id provided, return local info
    return NextResponse.json({
      success: false,
      message: "AWB number required for ShypBuddy tracking. Order may not be shipped yet.",
    });
  } catch (error: any) {
    console.error("Tracking error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch tracking" },
      { status: 500 }
    );
  }
}
