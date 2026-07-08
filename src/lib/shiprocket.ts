// ShypBuddy delivery integration helper
// Docs: README copy.md

// Two base URLs — order operations use seller domain, tracking uses api domain
const SHYPBUDDY_SELLER_BASE = "https://seller.shypbuddy.net/api";
const SHYPBUDDY_API_BASE = "https://api.shypbuddy.net/api/direct-api";

export function getShypBuddyHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.SHYPBUDDY_API_TOKEN}`,
  };
}

export { SHYPBUDDY_SELLER_BASE, SHYPBUDDY_API_BASE };
