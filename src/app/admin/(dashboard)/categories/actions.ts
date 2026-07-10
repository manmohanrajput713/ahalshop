"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.warn("Categories table not found or errored.", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function addCategory(formData: FormData) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return { error: "Unauthorized. Please log in as admin." };
  }

  const name = formData.get("name") as string;
  if (!name || !name.trim()) {
    return { error: "Category name is required." };
  }

  try {
    const { error } = await supabase.from("categories").insert([{ name: name.trim() }]);
    
    if (error) {
      if (error.code === '23505') { // unique constraint violation
        return { error: "Category already exists." };
      }
      throw error;
    }

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");
    
    return { success: true };
  } catch (err: any) {
    console.error("Failed to add category", err);
    return { error: err.message || "Failed to add category." };
  }
}

export async function deleteCategory(id: string) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return { error: "Unauthorized. Please log in as admin." };
  }

  try {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");
    
    return { success: true };
  } catch (err: any) {
    console.error("Failed to delete category", err);
    return { error: err.message || "Failed to delete category." };
  }
}
