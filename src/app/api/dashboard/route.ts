import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch all orders
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (ordersError) {
      return NextResponse.json({ error: ordersError.message }, { status: 500 });
    }

    const allOrders = orders || [];

    // 2. Calculate total revenue (excluding cancelled orders)
    const totalRevenue = allOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

    // 3. Total orders count
    const totalOrders = allOrders.length;

    // 4. Get signed-up customers count via Supabase Auth Admin API
    let signedUpCustomers = 0;
    try {
      // listUsers returns paginated results; fetch first page to get total
      const { data: usersData, error: usersError } =
        await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });

      if (!usersError && usersData) {
        // The total count comes from the response
        // listUsers with perPage=1 still returns the full count
        // We need to get the actual total — let's fetch with a larger page
        const { data: allUsersData } = await supabase.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        });
        signedUpCustomers = allUsersData?.users?.length || 0;
      }
    } catch (e) {
      console.error("Failed to fetch auth users:", e);
    }

    // 5. Recent orders (last 5)
    const recentOrders = allOrders.slice(0, 5).map((o) => ({
      id: o.id,
      customerName: `${o.customer_first_name} ${o.customer_last_name}`,
      total: o.total,
      status: o.status,
      paymentMethod: o.payment_method,
      createdAt: o.created_at,
      itemCount: Array.isArray(o.items) ? o.items.length : 0,
    }));

    // 6. Order status breakdown
    const statusBreakdown: Record<string, number> = {};
    for (const o of allOrders) {
      statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1;
    }

    // 7. Top selling products (from order items JSON)
    const productCounts: Record<string, number> = {};
    for (const o of allOrders) {
      if (Array.isArray(o.items)) {
        for (const item of o.items) {
          const name = item.name || "Unknown";
          productCounts[name] = (productCounts[name] || 0) + (item.quantity || 1);
        }
      }
    }
    const topProducts = Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, unitsSold]) => ({ name, unitsSold }));

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      signedUpCustomers,
      recentOrders,
      statusBreakdown,
      topProducts,
    });
  } catch (error: any) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
