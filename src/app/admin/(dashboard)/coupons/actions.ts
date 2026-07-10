"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function getCoupons() {
  try {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase coupons table not found or errored.", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function addCoupon(formData: FormData) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return { error: "Unauthorized. Please log in as admin." };
  }

  const code = formData.get("code") as string;
  const discount = parseInt(formData.get("discount") as string);

  if (!code || isNaN(discount) || discount <= 0 || discount > 100) {
    return { error: "Invalid coupon data. Code is required and discount must be between 1 and 100." };
  }

  try {
    const { error } = await supabase.from("coupons").insert([{
      code: code.toUpperCase().trim(),
      discount,
    }]);

    if (error) {
      if (error.code === '23505') { // Postgres unique violation
        return { error: "A coupon with this code already exists." };
      }
      throw error;
    }

    revalidatePath("/admin/coupons");
    revalidatePath("/cart");
    
    return { success: true };
  } catch (err: any) {
    console.error("Failed to add coupon", err);
    let errorMessage = err.message || "Failed to add coupon.";
    if (errorMessage.includes("relation \"public.coupons\" does not exist")) {
      errorMessage = "The 'coupons' table does not exist in Supabase. Please run the SQL migration script.";
    }
    return { error: errorMessage };
  }
}

export async function deleteCoupon(id: number) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return { error: "Unauthorized. Please log in as admin." };
  }

  try {
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/admin/coupons");
    
    return { success: true };
  } catch (err: any) {
    console.error("Failed to delete coupon", err);
    return { error: err.message || "Failed to delete coupon." };
  }
}

export async function validateCoupon(code: string) {
  if (!code) return { error: "Please enter a coupon code." };
  
  try {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase().trim())
      .single();

    if (error || !data) {
      return { error: "Invalid coupon code." };
    }

    return { discount: data.discount };
  } catch (err) {
    console.error("Failed to validate coupon", err);
    return { error: "Failed to validate coupon." };
  }
}

export async function toggleCouponsEnabled(enable: boolean) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return { error: "Unauthorized. Please log in as admin." };
  }

  try {
    // Fetch current settings
    const { data: adminSetting, error: fetchError } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "ashl_coin_settings")
      .single();

    let settings = {
      coinsPerRupeeDiscount: 5,
      rupeesPerCoinEarned: 10,
      freeShippingThreshold: 499,
      shippingFee: 49,
      enableCoupons: true
    };

    if (!fetchError && adminSetting) {
      try {
        settings = { ...settings, ...JSON.parse(adminSetting.value) };
      } catch (e) {}
    }

    settings.enableCoupons = enable;

    // Upsert back
    const { error: upsertError } = await supabase
      .from("admin_settings")
      .upsert({
        key: "ashl_coin_settings",
        value: JSON.stringify(settings)
      }, { onConflict: "key" });

    if (upsertError) throw upsertError;

    revalidatePath("/admin/coupons");
    revalidatePath("/cart");
    revalidatePath("/checkout");
    
    return { success: true, enableCoupons: enable };
  } catch (err: any) {
    console.error("Failed to toggle coupons", err);
    return { error: "Failed to toggle coupons." };
  }
}
