"use client";

import { useState } from "react";
import { Home, Briefcase, MapPin, Save } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with Leaflet
const AddressMap = dynamic(() => import("./AddressMap"), { ssr: false });

interface AddressFormData {
  label: "Home" | "Work" | "Other";
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

interface AddressFormProps {
  onSave: (address: AddressFormData & { isDefault: boolean }) => void;
  onCancel?: () => void;
  initialData?: Partial<AddressFormData>;
  showSaveOption?: boolean;
  saveLabel?: string;
}

export default function AddressForm({ onSave, onCancel, initialData, showSaveOption = true, saveLabel = "Save & Use This Address" }: AddressFormProps) {
  const [form, setForm] = useState<AddressFormData>({
    label: initialData?.label || "Home",
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    addressLine1: initialData?.addressLine1 || "",
    addressLine2: initialData?.addressLine2 || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    pincode: initialData?.pincode || "",
    lat: initialData?.lat,
    lng: initialData?.lng,
  });
  const [saveAddress, setSaveAddress] = useState(true);
  const [showMap, setShowMap] = useState(false);

  const update = (field: keyof AddressFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleMapLocation = (lat: number, lng: number, address?: { addressLine1?: string; city?: string; state?: string; pincode?: string }) => {
    setForm((prev) => ({
      ...prev,
      lat,
      lng,
      ...(address?.addressLine1 && !prev.addressLine1 ? { addressLine1: address.addressLine1 } : {}),
      ...(address?.city && !prev.city ? { city: address.city } : {}),
      ...(address?.state && !prev.state ? { state: address.state } : {}),
      ...(address?.pincode && !prev.pincode ? { pincode: address.pincode } : {}),
    }));
  };

  const handleSubmit = () => {
    onSave({ ...form, isDefault: false });
  };

  const labels: { value: "Home" | "Work" | "Other"; icon: typeof Home; label: string }[] = [
    { value: "Home", icon: Home, label: "Home" },
    { value: "Work", icon: Briefcase, label: "Work" },
    { value: "Other", icon: MapPin, label: "Other" },
  ];

  const inputClass = "w-full bg-card border border-border px-4 py-3 text-sm rounded-md focus:outline-none focus:border-accent transition-colors";

  return (
    <div className="space-y-5">
      {/* Label Selector */}
      <div>
        <label className="block text-xs tracking-[0.15em] uppercase text-muted-foreground mb-3">Address Label</label>
        <div className="flex gap-2">
          {labels.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => update("label", l.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors ${
                form.label === l.value
                  ? "bg-accent/10 border-accent/30 text-foreground"
                  : "bg-card border-border text-muted-foreground hover:border-accent/20"
              }`}
            >
              <l.icon size={14} />
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2 text-xs text-accent hover:text-accent/80 transition-colors uppercase tracking-[0.1em]"
        >
          <MapPin size={14} />
          {showMap ? "Hide Map" : "📍 Pin location on map (auto-fills address)"}
        </button>
      </div>

      {/* Map */}
      {showMap && (
        <AddressMap
          onLocationSelect={handleMapLocation}
          initialLat={form.lat}
          initialLng={form.lng}
        />
      )}

      {/* Name Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">First Name *</label>
          <input required type="text" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">Last Name *</label>
          <input required type="text" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} className={inputClass} />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">Phone Number *</label>
        <input required type="tel" pattern="[0-9]{10}" value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} placeholder="10-digit mobile number" />
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">Email *</label>
        <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass} placeholder="you@example.com" />
      </div>

      {/* Address Lines */}
      <div>
        <label className="block text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">Address Line 1 *</label>
        <input required type="text" value={form.addressLine1} onChange={(e) => update("addressLine1", e.target.value)} className={inputClass} placeholder="House no., Building, Street" />
      </div>
      <div>
        <label className="block text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">Address Line 2</label>
        <input type="text" value={form.addressLine2} onChange={(e) => update("addressLine2", e.target.value)} className={inputClass} placeholder="Locality, Landmark (optional)" />
      </div>

      {/* City / State / PIN */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">City *</label>
          <input required type="text" value={form.city} onChange={(e) => update("city", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">State *</label>
          <input required type="text" value={form.state} onChange={(e) => update("state", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">PIN Code *</label>
          <input required type="text" pattern="[0-9]{6}" value={form.pincode} onChange={(e) => update("pincode", e.target.value)} className={inputClass} placeholder="6-digit PIN" />
        </div>
      </div>

      {/* Save checkbox */}
      {showSaveOption && (
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={saveAddress}
            onChange={(e) => setSaveAddress(e.target.checked)}
            className="accent-accent w-4 h-4"
          />
          <span className="text-sm text-muted-foreground">Save this address for future orders</span>
        </label>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 bg-primary text-primary-foreground uppercase tracking-[0.15em] text-xs py-3.5 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <Save size={14} /> {saveLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 border border-border text-muted-foreground text-xs uppercase tracking-[0.15em] py-3.5 hover:bg-secondary transition-colors rounded-md"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
