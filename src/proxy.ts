import type { NextRequest } from "next/server";
import { verifyAdminSessionToken } from "@/lib/admin-auth";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminPath = pathname.startsWith("/admin");
  const isResetPasswordPath = pathname.startsWith("/admin/reset-password");

  if (isAdminPath && !isResetPasswordPath) {
    const token = request.cookies.get("admin_session")?.value;
    const hasValidSession = verifyAdminSessionToken(token);

    if (!hasValidSession) {
      return Response.redirect(new URL("/", request.url));
    }
  }

  // Allow the request to continue
  return undefined;
}
