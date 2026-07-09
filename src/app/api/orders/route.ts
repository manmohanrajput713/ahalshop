import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdminAuthenticated } from "@/lib/admin-auth";

// Use service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to adjust stock for order items
async function adjustStock(items: { id: string | number; quantity: number }[], direction: "decrease" | "increase") {
  for (const item of items) {
    if (!item.id) continue;

    // Cart items may have composite IDs like "5-50g" for variant products.
    // Extract the numeric product ID from the front.
    const rawId = String(item.id);
    const productId = parseInt(rawId.split("-")[0]);

    if (isNaN(productId)) {
      console.warn("adjustStock: could not parse product ID from", item.id);
      continue;
    }

    const { data: product, error } = await supabase
      .from("products")
      .select("stock")
      .eq("id", productId)
      .single();

    if (error || !product) {
      console.warn("adjustStock: product not found for id", productId, error?.message);
      continue;
    }

    const currentStock = product.stock ?? 0;
    const qty = item.quantity || 1;
    const newStock = direction === "decrease"
      ? Math.max(0, currentStock - qty)
      : currentStock + qty;

    console.log(`adjustStock: ${direction} product ${productId} stock ${currentStock} -> ${newStock} (qty: ${qty})`);

    await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", productId);
  }
}

// GET — fetch all orders (for admin) or single order by id or by user_id
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("id");
    const userId = searchParams.get("user_id");

    if (orderId) {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      // Verify ownership: only the order owner or an admin can view it
      if (userId && data.user_id !== userId) {
        const isAdmin = await isAdminAuthenticated();
        if (!isAdmin) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
      }

      return NextResponse.json(data);
    }

    if (userId) {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json(data || []);
    }

    // Fetch all orders (admin only), sorted newest first
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const orderRow = {
      id: body.id,
      user_id: body.user_id || null,
      customer_first_name: body.address.firstName,
      customer_last_name: body.address.lastName,
      customer_phone: body.address.phone,
      customer_email: body.address.email,
      address_line1: body.address.addressLine1,
      address_line2: body.address.addressLine2 || "",
      city: body.address.city,
      state: body.address.state,
      pincode: body.address.pincode,
      items: body.items,
      subtotal: body.subtotal,
      shipping_fee: body.shippingFee,
      total: body.total,
      payment_method: body.paymentMethod,
      razorpay_payment_id: body.razorpayPaymentId || null,
      shiprocket_order_id: body.shiprocketOrderId || null,
      shiprocket_shipment_id: body.shiprocketShipmentId || null,
      awb_code: body.awbCode || null,
      courier_name: body.courierName || null,
      status: body.status || "placed",
    };

    const { data, error } = await supabase
      .from("orders")
      .insert(orderRow)
      .select()
      .single();

    if (error) {
      console.error("Supabase order insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Decrease stock for each ordered item
    try {
      if (body.items && Array.isArray(body.items)) {
        await adjustStock(body.items, "decrease");
      }
    } catch (stockErr) {
      console.error("Failed to adjust stock after order:", stockErr);
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Order save error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH — update order status (admin or owner)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, userId, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    const isAdmin = await isAdminAuthenticated();

    if (!isAdmin) {
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Verify the user owns this order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("user_id")
        .eq("id", id)
        .single();

      if (orderError || order.user_id !== userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Map camelCase to snake_case for DB
    const dbUpdates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.shiprocketOrderId) dbUpdates.shiprocket_order_id = updates.shiprocketOrderId;
    if (updates.shiprocketShipmentId) dbUpdates.shiprocket_shipment_id = updates.shiprocketShipmentId;
    if (updates.awbCode) dbUpdates.awb_code = updates.awbCode;
    if (updates.courierName) dbUpdates.courier_name = updates.courierName;

    const { data, error } = await supabase
      .from("orders")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If order is being cancelled, restore stock for each item
    if (updates.status === "cancelled" && data?.items && Array.isArray(data.items)) {
      try {
        await adjustStock(data.items, "increase");
      } catch (stockErr) {
        console.error("Failed to restore stock after cancellation:", stockErr);
      }
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE — remove all orders (admin only)
export async function DELETE() {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("orders")
      .delete()
      .neq("id", ""); // delete all rows

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "All orders deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
