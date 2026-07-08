import { NextRequest, NextResponse } from "next/server";
import { getShypBuddyHeaders, SHYPBUDDY_SELLER_BASE } from "@/lib/shiprocket";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      billingFirstName,
      billingLastName,
      billingAddress,
      billingAddress2,
      billingCity,
      billingState,
      billingPincode,
      billingEmail,
      billingPhone,
      items,
      subTotal,
      paymentMethod,
    } = body;

    if (!orderId || !items || !items.length) {
      return NextResponse.json({ error: "Missing required order fields" }, { status: 400 });
    }

    // Use customOrderApi — works with direct API token
    // Requires: orderData, customerAddressList, pickUpAddress, packageList
    const payload = {
      orderData: {
        deliveryType: "FORWARD",
        isDangerousGoods: "n",
        paymentMode: paymentMethod === "cod" ? "cod" : "prepaid",
        length: 15,
        breadth: 10,
        height: 8,
        packageCount: 1,
        shippingMode: "surface",
        deadWeight: 0.5,
        deliveryPartner: "delhivery", // cheapest available partner
      },
      customerAddressList: {
        fullName: `${billingFirstName} ${billingLastName || ""}`.trim(),
        contactNumber: billingPhone,
        email: billingEmail,
        alternateNumber: "",
        buyerCompanyName: "",
        buyerGstin: "",
        address: billingAddress + (billingAddress2 ? `, ${billingAddress2}` : ""),
        landmark: billingAddress2 || "",
        pincode: parseInt(billingPincode) || 0,
        createdAt: new Date().toISOString(),
        city: billingCity,
        state: billingState,
      },
      // Pickup address from your registered warehouse
      pickUpAddress: {
        address: "NEAR RAJMAHAL PLACE PATEL NAGAR BEHROR",
        landmark: "near rajmahal",
        pincode: 301001,
        city: "Behror",
        state: "Rajasthan",
        country: "India",
        contactNumber: "9460808019",
        fullName: "ASHL Herbal",
      },
      packageList: items.map((item: any, index: number) => ({
        name: item.name,
        qty: item.quantity,
        price: parseFloat(item.price.replace(/[^\d.]/g, "")) || 0,
        category: item.category || "Herbal Products",
        sku: `ASHL-${item.id || index}`,
        hsnCode: "330499",
      })),
    };

    console.log("ShypBuddy order payload:", JSON.stringify(payload, null, 2));

    // Call ShypBuddy customOrderApi (works with Bearer token)
    const res = await fetch(`${SHYPBUDDY_SELLER_BASE}/orderApi/customOrderApi`, {
      method: "POST",
      headers: getShypBuddyHeaders(),
      body: JSON.stringify(payload),
    });

    console.log("ShypBuddy response status:", res.status);

    // Check if response is JSON
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      console.warn("ShypBuddy returned non-JSON:", text.slice(0, 500));
      return NextResponse.json({
        shiprocketOrderId: null,
        shipmentId: null,
        awbCode: null,
        courierName: "ShypBuddy",
        status: "pending",
        message: "ShypBuddy returned non-JSON response",
      });
    }

    const data = await res.json();
    console.log("ShypBuddy response:", JSON.stringify(data));

    if (!res.ok || data.data?.status === "error") {
      console.warn("ShypBuddy order error:", JSON.stringify(data));
      return NextResponse.json({
        shiprocketOrderId: null,
        shipmentId: null,
        awbCode: null,
        courierName: "ShypBuddy",
        status: "error",
        message: data.error || data.data?.message || "ShypBuddy order creation failed",
      });
    }

    // Extract from response: { data: { orderId, status, awbNumber, deliveryPartner, message } }
    const orderResult = data.data || data;
    return NextResponse.json({
      shiprocketOrderId: orderResult.orderId || null,
      shipmentId: null,
      awbCode: orderResult.awbNumber || orderResult.awb || null,
      courierName: orderResult.deliveryPartner || "ShypBuddy",
      status: orderResult.status || "created",
    });
  } catch (error: any) {
    console.warn("ShypBuddy order skipped:", error.message);
    return NextResponse.json({
      shiprocketOrderId: null,
      shipmentId: null,
      awbCode: null,
      courierName: "ShypBuddy",
      status: "error",
      message: error.message,
    });
  }
}
