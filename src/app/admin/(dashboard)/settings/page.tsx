"use client";

import { useState, useEffect } from "react";
import { Save, Truck } from "lucide-react";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  // Store settings
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("499");
  const [shippingFee, setShippingFee] = useState("49");

  // Load saved settings
  useEffect(() => {
    const settings = localStorage.getItem("admin_settings");
    if (settings) {
      const parsed = JSON.parse(settings);
      setFreeShippingThreshold(parsed.freeShippingThreshold || "499");
      setShippingFee(parsed.shippingFee || "49");
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("admin_settings", JSON.stringify({
      freeShippingThreshold, shippingFee,
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Free Shipping Threshold (₹)</label>
              <input type="number" value={freeShippingThreshold} onChange={(e) => setFreeShippingThreshold(e.target.value)} className={inputClass} />
              <p className="text-[10px] text-muted-foreground mt-1">Orders above this amount get free shipping</p>
            </div>
            <div>
              <label className={labelClass}>Standard Shipping Fee (₹)</label>
              <input type="number" value={shippingFee} onChange={(e) => setShippingFee(e.target.value)} className={inputClass} />
              <p className="text-[10px] text-muted-foreground mt-1">Applied to orders below the free shipping threshold</p>
            </div>
          </div>
      </div>
    </div>
  );
}
