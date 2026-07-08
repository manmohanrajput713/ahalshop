import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username } = body;

    // Always return success to prevent username enumeration
    if (username !== "admin") {
      return NextResponse.json({
        message: "If this is a valid admin account, a reset link has been sent.",
      });
    }

    // Generate a secure random token
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const token = Array.from(tokenBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Store token in Supabase
    const { error: tokenError } = await supabase
      .from("admin_reset_tokens")
      .insert({ token, used: false });

    if (tokenError) {
      console.error("Failed to store reset token:", tokenError);
      return NextResponse.json(
        { error: "Failed to generate reset link" },
        { status: 500 }
      );
    }

    // Build reset link
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/admin/reset-password?token=${token}`;
    const adminEmail = process.env.ADMIN_EMAIL || "ashl4shop@gmail.com";

    // Send email via Resend
    const { error: emailError } = await resend.emails.send({
      from: "ASHL Herbal <onboarding@resend.dev>",
      to: [adminEmail],
      subject: "Admin Password Reset — ASHL Herbal",
      html: `
        <div style="font-family: 'Georgia', serif; max-width: 500px; margin: 0 auto; padding: 40px 30px; background: #F5F0E8; border: 1px solid #D8D2C4;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3A5240; font-size: 22px; font-weight: normal; margin: 0;">ASHL Herbal</h1>
            <p style="color: #9B7D5A; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; margin-top: 4px;">A Step For Happy Life</p>
          </div>
          <div style="background: white; padding: 30px; border: 1px solid #D8D2C4;">
            <h2 style="color: #1E2D1F; font-size: 18px; font-weight: normal; margin: 0 0 15px 0;">Password Reset Request</h2>
            <p style="color: #7A7060; font-size: 14px; line-height: 1.6; margin: 0 0 25px 0;">
              We received a request to reset your admin password. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="display: inline-block; background: #3A5240; color: #F5F0E8; text-decoration: none; padding: 14px 32px; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">
                Reset Password
              </a>
            </div>
            <p style="color: #7A7060; font-size: 12px; line-height: 1.6; margin: 20px 0 0 0;">
              If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
            </p>
          </div>
          <p style="color: #7A7060; font-size: 10px; text-align: center; margin-top: 20px;">
            © ${new Date().getFullYear()} ASHL Herbal. All rights reserved.
          </p>
        </div>
      `,
    });

    if (emailError) {
      console.error("Failed to send reset email:", emailError);
      return NextResponse.json(
        { error: "Failed to send reset email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "If this is a valid admin account, a reset link has been sent.",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
