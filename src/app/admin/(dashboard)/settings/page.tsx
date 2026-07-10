"use client";

import { useState, useEffect } from "react";
import { Save, Truck, Coins } from "lucide-react";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Store settings
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("499");
  const [shippingFee, setShippingFee] = useState("49");
  const [coinsPerRupeeDiscount, setCoinsPerRupeeDiscount] = useState("5");
  const [rupeesPerCoinEarned, setRupeesPerCoinEarned] = useState("10");

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
      </div>
    </div>
  );
}
