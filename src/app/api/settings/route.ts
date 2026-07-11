import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: adminSetting, error } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "ashl_coin_settings")
      .single();

    if (error || !adminSetting) {
      // Default fallback if not set in DB
      return NextResponse.json({
        coinsPerRupeeDiscount: 5,
        rupeesPerCoinEarned: 10,
        freeShippingThreshold: 499,
        shippingFee: 49,
        enableCoupons: true,
        buyXGetYEnabled: false,
        buyXGetYBuyQty: 2,
        buyXGetYFreeQty: 1,
        buyXGetYMinPrice: 200,
      });
    }

    let settings;
    try {
      settings = JSON.parse(adminSetting.value);
    } catch (e) {
      settings = {
        coinsPerRupeeDiscount: 5,
        rupeesPerCoinEarned: 10,
        freeShippingThreshold: 499,
        shippingFee: 49,
        enableCoupons: true,
        buyXGetYEnabled: false,
        buyXGetYBuyQty: 2,
        buyXGetYFreeQty: 1,
        buyXGetYMinPrice: 200,
      };
    }

    return NextResponse.json({
      coinsPerRupeeDiscount: settings.coinsPerRupeeDiscount ?? 5,
      rupeesPerCoinEarned: settings.rupeesPerCoinEarned ?? 10,
      freeShippingThreshold: settings.freeShippingThreshold ?? 499,
      shippingFee: settings.shippingFee ?? 49,
      enableCoupons: settings.enableCoupons ?? true,
      buyXGetYEnabled: settings.buyXGetYEnabled ?? false,
      buyXGetYBuyQty: settings.buyXGetYBuyQty ?? 2,
      buyXGetYFreeQty: settings.buyXGetYFreeQty ?? 1,
      buyXGetYMinPrice: settings.buyXGetYMinPrice ?? 200,
    });
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Basic auth check: ensures the request has an admin_session cookie
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    
    if (!adminSession?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const newSettings = await request.json();

    const { error } = await supabase
      .from("admin_settings")
      .upsert({
        key: "ashl_coin_settings",
        value: JSON.stringify(newSettings)
      }, { onConflict: "key" });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, settings: newSettings });
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
