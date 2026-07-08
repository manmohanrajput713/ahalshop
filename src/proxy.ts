import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminPath = pathname.startsWith("/admin");
  const isResetPasswordPath = pathname.startsWith("/admin/reset-password");

  if (isAdminPath && !isResetPasswordPath) {
    const hasAdminSession = request.cookies.get("admin_session")?.value === "true";

    if (!hasAdminSession) {
      return Response.redirect(new URL("/", request.url));
    }
  }

  // Allow the request to continue
  return undefined;
}
