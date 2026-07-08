import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdminAuthenticated } from "@/lib/admin-auth";

// Use service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Order save error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH — update order status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
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
