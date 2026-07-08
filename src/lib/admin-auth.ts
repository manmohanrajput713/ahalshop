import { cookies } from "next/headers";

/**
 * Check if the current request has a valid admin session.
 * Call this from any Server Component or Server Action that needs admin auth.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value === "true";
}
