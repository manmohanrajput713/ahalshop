"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Hash password function using Web Crypto API to match the saved hashes
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

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
    } else {
      // Fallback to hardcoded password if no password is set in the database yet
      if (password === "admin@123") {
        isValid = true;
      }
    }

    if (isValid) {
      const cookieStore = await cookies();
      cookieStore.set("admin_session", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
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
