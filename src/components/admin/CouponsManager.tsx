"use client";

import { useState, useEffect } from "react";
import { addCoupon, deleteCoupon, toggleCouponsEnabled } from "@/app/admin/(dashboard)/coupons/actions";
import { Trash2, Plus, Loader2, Tag, TicketPercent, Power } from "lucide-react";

export default function CouponsManager({ initialCoupons }: { initialCoupons: any[] }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [showAddForm, setShowAddForm] = useState(false);
  const [enableCoupons, setEnableCoupons] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.enableCoupons !== undefined) {
          setEnableCoupons(data.enableCoupons);
        }
      })
      .catch(err => console.error("Failed to load settings:", err));
  }, []);

  const handleToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setEnableCoupons(newValue);
    setIsToggling(true);
    try {
      await toggleCouponsEnabled(newValue);
    } catch (err) {
      console.error(err);
      setEnableCoupons(!newValue); // revert on error
    } finally {
      setIsToggling(false);
    }
  };
  
  // Add coupon state
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  
  // Delete coupon state
  const [couponToDelete, setCouponToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!code.trim() || !discount) {
      setError("Please fill in all fields.");
      return;
    }

    setIsAdding(true);
    
    const formData = new FormData();
    formData.set("code", code);
    formData.set("discount", discount);

    try {
      const result = await addCoupon(formData);
      if (result.error) {
        setError(result.error);
      } else {
        // Success
        setCode("");
        setDiscount("");
        setShowAddForm(false);
        // Refresh the page data. In a real app we might update local state, but nextjs revalidatePath will handle the data refresh on navigation, or we can just append.
        // For simplicity, we just reload the window or let the Server Action revalidate.
        // Actually, revalidatePath will trigger a server refresh so we can just wait for it.
        window.location.reload(); 
      }
    } catch (err) {
      setError("Failed to add coupon.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteCoupon = async () => {
    if (!couponToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCoupon(couponToDelete.id);
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      setCouponToDelete(null);
    }
  };

  return (
    <>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TicketPercent size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Discount Coupons</h2>
              <p className="text-sm text-muted-foreground">{coupons.length} active coupons</p>
            </div>
          </div>
          <button
            onClick={() => { setShowAddForm(!showAddForm); setError(""); }}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs tracking-wider uppercase font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            {showAddForm ? "Cancel" : <><Plus size={16} /> Add Coupon</>}
          </button>
        </div>

        <div className="p-4 px-6 border-b border-border bg-muted/10 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-foreground">Enable Coupons</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Allow customers to apply discount codes at checkout.</p>
          </div>
          <label className="flex items-center cursor-pointer relative">
            <input type="checkbox" className="sr-only" checked={enableCoupons} onChange={handleToggle} disabled={isToggling} />
            <div className={`block w-12 h-6 rounded-full transition-colors ${enableCoupons ? 'bg-primary' : 'bg-muted border border-border'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${enableCoupons ? 'translate-x-6' : ''}`}></div>
            {isToggling && <Loader2 size={14} className="absolute -left-6 text-muted-foreground animate-spin" />}
          </label>
        </div>

        {showAddForm && (
          <div className="p-6 border-b border-border bg-muted/30">
            <form onSubmit={handleAddCoupon} className="max-w-md space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium tracking-wide uppercase text-muted-foreground mb-1.5">Coupon Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SUMMER50"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium tracking-wide uppercase text-muted-foreground mb-1.5">Discount (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="e.g. 20"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>
              
              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}
              
              <button
                type="submit"
                disabled={isAdding}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAdding ? <Loader2 size={16} className="animate-spin" /> : "Save Coupon"}
              </button>
            </form>
          </div>
        )}

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="relative group bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
                <button
                  onClick={() => setCouponToDelete(coupon)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-destructive/10"
                  title="Delete coupon"
                >
                  <Trash2 size={16} />
                </button>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-primary" />
                    <span className="font-mono text-lg font-bold text-foreground tracking-wider">{coupon.code}</span>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-600 text-sm px-3 py-1 rounded-full font-medium">
                  {coupon.discount}% OFF
                </div>
                <div className="mt-4 text-[10px] text-muted-foreground uppercase tracking-widest">
                  Added on {new Date(coupon.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
            
            {coupons.length === 0 && !showAddForm && (
              <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                <TicketPercent className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No coupons found. Create one to offer discounts.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {couponToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-normal text-foreground mb-3 flex items-center gap-2" style={{ fontFamily: "var(--font-lora), serif" }}>
              <Trash2 className="text-destructive" size={20} />
              Delete Coupon
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete <span className="font-mono font-bold text-foreground">{couponToDelete.code}</span>? Customers will no longer be able to use this code.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCouponToDelete(null)}
                disabled={isDeleting}
                className="px-5 py-2.5 text-xs tracking-wider uppercase font-medium text-foreground hover:bg-muted border border-border rounded-md transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCoupon}
                disabled={isDeleting}
                className="px-5 py-2.5 text-xs tracking-wider uppercase font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
