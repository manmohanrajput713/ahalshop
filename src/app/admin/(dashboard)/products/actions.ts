"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { ALL_PRODUCTS } from "@/lib/data"; // Fallback data
import { isAdminAuthenticated } from "@/lib/admin-auth";
import fs from "fs/promises";
import path from "path";

// Helper function to handle image upload
async function handleImageUpload(file: File | null, defaultPath: string = "/products/placeholder.jpg") {
  if (!file || file.size === 0) return defaultPath;
  
  try {
    const bytes = await file.arrayBuffer();
    
    // Generate unique filename to avoid overwriting
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `upload_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    
    // Use service role key if available to ensure upload succeeds regardless of RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    
    const { createClient } = await import("@supabase/supabase-js");
    const adminSupabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await adminSupabase.storage
      .from("products")
      .upload(filename, bytes, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      throw error;
    }
    
    const { data: publicUrlData } = adminSupabase.storage
      .from("products")
      .getPublicUrl(filename);
      
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    return defaultPath;
  }
}

export async function getProducts() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase products table not found or errored. Using fallback data.", error.message);
      // Return fallback data if table doesn't exist
      return ALL_PRODUCTS;
    }

    return data || [];
  } catch (err) {
    console.error(err);
    return ALL_PRODUCTS;
  }
}

export async function addProduct(formData: FormData) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return { error: "Unauthorized. Please log in as admin." };
  }

  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const price = formData.get("price") as string;
  const badge = formData.get("badge") as string;
  const stock = parseInt(formData.get("stock") as string) || 0;
  const imageFile = formData.get("imageFile") as File | null;
  const extraImageFiles = formData.getAll("extraImages") as File[];
  const alt = formData.get("alt") as string;
  const description = formData.get("description") as string;
  const size = formData.get("size") as string;
  const suitableFor = formData.get("suitableFor") as string;
  const ingredientsStr = formData.get("ingredients") as string;
  const benefitsStr = formData.get("benefits") as string;
  const howToUse = formData.get("howToUse") as string;

  const ingredients = ingredientsStr ? ingredientsStr.split(',').map(s => s.trim()).filter(Boolean) : null;
  const benefits = benefitsStr ? benefitsStr.split(',').map(s => s.trim()).filter(Boolean) : null;

  try {
    const imgPath = await handleImageUpload(imageFile);
    
    // Process extra images
    const validExtraImageFiles = extraImageFiles.filter(f => f && f.size > 0);
    const uploadedExtraImages = await Promise.all(
      validExtraImageFiles.map(f => handleImageUpload(f))
    );

    const { error } = await supabase.from("products").insert([
      {
        name,
        category,
        price,
        badge: badge || null,
        stock,
        img: imgPath,
        images: uploadedExtraImages.length > 0 ? uploadedExtraImages : null,
        alt: alt || name,
        description: description || null,
        size: size || null,
        suitable_for: suitableFor || null,
        ingredients: ingredients,
        benefits: benefits,
        how_to_use: howToUse || null,
      },
    ]);

    if (error) {
      throw error;
    }

    revalidatePath("/admin/products");
    revalidatePath("/");
    
    return { success: true };
  } catch (err: any) {
    console.error("Failed to add product", err);
    let errorMessage = err.message || "Failed to add product.";
    if (errorMessage.includes("Could not find the table") || errorMessage.includes("relation \"public.products\" does not exist")) {
      errorMessage = "The 'products' table does not exist in Supabase. Please run the supabase_setup.sql script in your Supabase SQL editor.";
    }
    return { error: errorMessage };
  }
}

export async function editProduct(formData: FormData) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return { error: "Unauthorized. Please log in as admin." };
  }

  const id = formData.get("id") as string;
  if (!id) return { error: "Product ID is missing." };

  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const price = formData.get("price") as string;
  const badge = formData.get("badge") as string;
  const stock = parseInt(formData.get("stock") as string) || 0;
  const imageFile = formData.get("imageFile") as File | null;
  const currentImg = formData.get("currentImg") as string;
  const extraImageFiles = formData.getAll("extraImages") as File[];
  const currentExtraImagesStr = formData.get("currentExtraImages") as string;
  const alt = formData.get("alt") as string;
  const description = formData.get("description") as string;
  const size = formData.get("size") as string;
  const suitableFor = formData.get("suitableFor") as string;
  const ingredientsStr = formData.get("ingredients") as string;
  const benefitsStr = formData.get("benefits") as string;
  const howToUse = formData.get("howToUse") as string;

  const ingredients = ingredientsStr ? ingredientsStr.split(',').map(s => s.trim()).filter(Boolean) : null;
  const benefits = benefitsStr ? benefitsStr.split(',').map(s => s.trim()).filter(Boolean) : null;

  try {
    // If a new file is uploaded, handle it; otherwise keep the current image
    const imgPath = (imageFile && imageFile.size > 0) 
      ? await handleImageUpload(imageFile) 
      : currentImg;

    // Handle extra images
    let finalExtraImages = null;
    try {
      if (currentExtraImagesStr) {
        finalExtraImages = JSON.parse(currentExtraImagesStr);
      }
    } catch (e) {
      console.error("Failed to parse currentExtraImages", e);
    }

    const validExtraImageFiles = extraImageFiles.filter(f => f && f.size > 0);
    if (validExtraImageFiles.length > 0) {
      finalExtraImages = await Promise.all(
        validExtraImageFiles.map(f => handleImageUpload(f))
      );
    }

    const { error } = await supabase.from("products").update({
      name,
      category,
      price,
      badge: badge || null,
      stock,
      img: imgPath,
      images: finalExtraImages,
      alt: alt || name,
      description: description || null,
      size: size || null,
      suitable_for: suitableFor || null,
      ingredients: ingredients,
      benefits: benefits,
      how_to_use: howToUse || null,
    }).eq("id", id);

    if (error) {
      throw error;
    }

    revalidatePath("/admin/products");
    revalidatePath("/");
    
    return { success: true };
  } catch (err: any) {
    console.error("Failed to edit product", err);
    let errorMessage = err.message || "Failed to edit product.";
    if (errorMessage.includes("Could not find the table") || errorMessage.includes("relation \"public.products\" does not exist")) {
      errorMessage = "The 'products' table does not exist in Supabase. Please run the supabase_setup.sql script in your Supabase SQL editor.";
    }
    return { error: errorMessage };
  }
}

export async function deleteProduct(id: number) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return { error: "Unauthorized. Please log in as admin." };
  }

  try {
    // 1. Fetch the product to get its image URLs before deleting
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("img, images")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Failed to fetch product for image cleanup:", fetchError);
    }

    // 2. Delete images from Supabase Storage
    if (product) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
      const { createClient } = await import("@supabase/supabase-js");
      const adminSupabase = createClient(supabaseUrl, supabaseKey);

      const storagePrefix = `${supabaseUrl}/storage/v1/object/public/products/`;
      const filesToDelete: string[] = [];

      // Extract filename from main image
      if (product.img && product.img.startsWith(storagePrefix)) {
        filesToDelete.push(product.img.replace(storagePrefix, ""));
      }

      // Extract filenames from carousel images
      if (product.images && Array.isArray(product.images)) {
        for (const imgUrl of product.images) {
          if (typeof imgUrl === "string" && imgUrl.startsWith(storagePrefix)) {
            filesToDelete.push(imgUrl.replace(storagePrefix, ""));
          }
        }
      }

      if (filesToDelete.length > 0) {
        const { error: storageError } = await adminSupabase.storage
          .from("products")
          .remove(filesToDelete);

        if (storageError) {
          console.error("Failed to delete images from storage:", storageError);
        }
      }
    }

    // 3. Delete the product row from the database
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/admin/products");
    revalidatePath("/");
    
    return { success: true };
  } catch (err: any) {
    console.error("Failed to delete product", err);
    let errorMessage = err.message || "Failed to delete product.";
    if (errorMessage.includes("Could not find the table") || errorMessage.includes("relation \"public.products\" does not exist")) {
      errorMessage = "The 'products' table does not exist in Supabase. Please run the supabase_setup.sql script in your Supabase SQL editor.";
    }
    return { error: errorMessage };
  }
}
