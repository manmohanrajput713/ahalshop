import { cookies } from "next/headers";
import crypto from "crypto";

/**
 * Secret used to sign admin session tokens.
 * Derived from the service role key so no extra env var is needed.
 */
function getSigningSecret(): string {
  const secret =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "ashalshop-fallback-secret-change-me";
  return secret;
}

// ────────────────────────────────────────────
// Session Token helpers
// ────────────────────────────────────────────

/**
 * Create a signed admin session token.
 * Format: `<timestamp>.<hmac-signature>`
 */
export function createAdminSessionToken(): string {
  const timestamp = Date.now().toString();
  const hmac = crypto
    .createHmac("sha256", getSigningSecret())
    .update(`admin-session:${timestamp}`)
    .digest("hex");
  return `${timestamp}.${hmac}`;
}

/**
 * Verify an admin session token is valid and was signed by us.
 * Returns true only if the HMAC matches.
 */
export function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [timestamp, signature] = parts;
  if (!timestamp || !signature) return false;

  const expectedHmac = crypto
    .createHmac("sha256", getSigningSecret())
    .update(`admin-session:${timestamp}`)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedHmac, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * Check if the current request has a valid admin session.
 * Call this from any Server Component or Server Action that needs admin auth.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  return verifyAdminSessionToken(token);
}

// ────────────────────────────────────────────
// Password hashing helper (salted SHA-256)
// ────────────────────────────────────────────

const PASSWORD_SALT = "ashl-herbal-salt-2026";

/**
 * Hash a password with a fixed salt using SHA-256.
 * Used for both login verification and password reset.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${PASSWORD_SALT}:${password}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
