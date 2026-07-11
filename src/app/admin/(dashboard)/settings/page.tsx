"use client";

import { useState, useEffect } from "react";
import { Save, Truck, Coins, Gift } from "lucide-react";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Store settings
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("499");
  const [shippingFee, setShippingFee] = useState("49");
  const [coinsPerRupeeDiscount, setCoinsPerRupeeDiscount] = useState("5");
  const [rupeesPerCoinEarned, setRupeesPerCoinEarned] = useState("10");

  // Buy X Get Y settings
  const [buyXGetYEnabled, setBuyXGetYEnabled] = useState(false);
  const [buyXGetYBuyQty, setBuyXGetYBuyQty] = useState("2");
  const [buyXGetYFreeQty, setBuyXGetYFreeQty] = useState("1");
  const [buyXGetYMinPrice, setBuyXGetYMinPrice] = useState("200");

  // Load saved settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setFreeShippingThreshold(data.freeShippingThreshold?.toString() || "499");
          setShippingFee(data.shippingFee?.toString() || "49");
          setCoinsPerRupeeDiscount(data.coinsPerRupeeDiscount?.toString() || "5");
          setRupeesPerCoinEarned(data.rupeesPerCoinEarned?.toString() || "10");
          setBuyXGetYEnabled(data.buyXGetYEnabled ?? false);
          setBuyXGetYBuyQty(data.buyXGetYBuyQty?.toString() || "2");
          setBuyXGetYFreeQty(data.buyXGetYFreeQty?.toString() || "1");
          setBuyXGetYMinPrice(data.buyXGetYMinPrice?.toString() || "200");
        }
      } catch (e) {
        console.error("Failed to load settings:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      const payload = {
        freeShippingThreshold: Number(freeShippingThreshold),
        shippingFee: Number(shippingFee),
        coinsPerRupeeDiscount: Number(coinsPerRupeeDiscount),
        rupeesPerCoinEarned: Number(rupeesPerCoinEarned),
        buyXGetYEnabled,
        buyXGetYBuyQty: Number(buyXGetYBuyQty),
        buyXGetYFreeQty: Number(buyXGetYFreeQty),
        buyXGetYMinPrice: Number(buyXGetYMinPrice),
      };

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert("Failed to save settings. Are you logged in as admin?");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving settings");
    }
  };

  const inputClass = "w-full bg-background border border-border px-4 py-3 text-sm rounded-lg focus:outline-none focus:border-primary transition-colors";
  const labelClass = "block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your store configuration.</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm hover:bg-primary/90 transition-colors"
        >
          <Save size={14} />
          {saved ? "Saved ✓" : "Save Changes"}
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">

          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Truck size={18} /> Shipping Rules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className={labelClass}>Free Shipping Threshold (₹)</label>
              <input type="number" value={freeShippingThreshold} onChange={(e) => setFreeShippingThreshold(e.target.value)} className={inputClass} disabled={isLoading} />
              <p className="text-[10px] text-muted-foreground mt-1">Orders above this amount get free shipping</p>
            </div>
            <div>
              <label className={labelClass}>Standard Shipping Fee (₹)</label>
              <input type="number" value={shippingFee} onChange={(e) => setShippingFee(e.target.value)} className={inputClass} disabled={isLoading} />
              <p className="text-[10px] text-muted-foreground mt-1">Applied to orders below the free shipping threshold</p>
            </div>
          </div>

          <hr className="border-border" />

          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 pt-4">
            <Coins size={18} /> ASHL Coin Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Rupees Spent to Earn 1 Coin</label>
              <input type="number" value={rupeesPerCoinEarned} onChange={(e) => setRupeesPerCoinEarned(e.target.value)} className={inputClass} disabled={isLoading} />
              <p className="text-[10px] text-muted-foreground mt-1">Example: 10 means spend ₹10 to earn 1 Coin</p>
            </div>
            <div>
              <label className={labelClass}>Coins Needed for ₹1 Discount</label>
              <input type="number" value={coinsPerRupeeDiscount} onChange={(e) => setCoinsPerRupeeDiscount(e.target.value)} className={inputClass} disabled={isLoading} />
              <p className="text-[10px] text-muted-foreground mt-1">Example: 5 means 5 coins equals ₹1 discount</p>
            </div>
          </div>

          <hr className="border-border" />

          {/* Buy X Get Y Free Offer */}
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 pt-4">
            <Gift size={18} /> Buy X Get Y Free Offer
          </h2>

          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between bg-background rounded-lg p-4 border border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Enable Offer</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {buyXGetYEnabled
                  ? `Active: Buy ${buyXGetYBuyQty}, Get ${buyXGetYFreeQty} Free (products ≥ ₹${buyXGetYMinPrice})`
                  : "Offer is currently disabled"}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only"
                checked={buyXGetYEnabled}
                onChange={() => setBuyXGetYEnabled(!buyXGetYEnabled)}
                disabled={isLoading}
              />
              <div className={`block w-12 h-6 rounded-full transition-colors ${buyXGetYEnabled ? "bg-primary" : "bg-muted border border-border"}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${buyXGetYEnabled ? "translate-x-6" : ""}`}></div>
            </label>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-opacity ${buyXGetYEnabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
            <div>
              <label className={labelClass}>Buy Quantity</label>
              <input
                type="number"
                min="1"
                value={buyXGetYBuyQty}
                onChange={(e) => setBuyXGetYBuyQty(e.target.value)}
                className={inputClass}
                disabled={isLoading || !buyXGetYEnabled}
              />
              <p className="text-[10px] text-muted-foreground mt-1">How many items the customer must buy</p>
            </div>
            <div>
              <label className={labelClass}>Free Quantity</label>
              <input
                type="number"
                min="1"
                value={buyXGetYFreeQty}
                onChange={(e) => setBuyXGetYFreeQty(e.target.value)}
                className={inputClass}
                disabled={isLoading || !buyXGetYEnabled}
              />
              <p className="text-[10px] text-muted-foreground mt-1">How many items become free</p>
            </div>
            <div>
              <label className={labelClass}>Min Product Price (₹)</label>
              <input
                type="number"
                min="0"
                value={buyXGetYMinPrice}
                onChange={(e) => setBuyXGetYMinPrice(e.target.value)}
                className={inputClass}
                disabled={isLoading || !buyXGetYEnabled}
              />
              <p className="text-[10px] text-muted-foreground mt-1">Only products priced ≥ this amount qualify</p>
            </div>
          </div>

          {buyXGetYEnabled && (
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 text-sm text-foreground">
              <p className="font-medium mb-1">Preview:</p>
              <p className="text-muted-foreground text-xs">
                Customer adds <strong>{Number(buyXGetYBuyQty) + Number(buyXGetYFreeQty)}</strong> items (each ≥ ₹{buyXGetYMinPrice}) → the <strong>{buyXGetYFreeQty}</strong> cheapest {Number(buyXGetYFreeQty) === 1 ? "item is" : "items are"} free.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
