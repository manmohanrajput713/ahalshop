"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  createAdminSessionToken,
  hashPassword,
} from "@/lib/admin-auth";

export async function adminLogin(formData: FormData) {
  const username = formData.get("username");
  const password = formData.get("password") as string;

  if (username === "admin") {
    let isValid = false;

    // Use service role key since we're Server Side and need to read settings
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: adminSetting } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "admin_password")
      .single();

    if (adminSetting && adminSetting.value) {
      // Check against hashed password in database
      const hashedPassword = await hashPassword(password);
      if (hashedPassword === adminSetting.value) {
        isValid = true;
      }
    }
    // NOTE: Hardcoded fallback password removed for security.
    // If no password exists in the database, use the Forgot Password flow.

    if (isValid) {
      const cookieStore = await cookies();
      cookieStore.set("admin_session", createAdminSessionToken(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });
      
      redirect("/admin");
    }
  }

  return { error: "Invalid username or password" };
}

export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/");
}
