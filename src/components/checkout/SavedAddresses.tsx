"use client";

import { useState } from "react";
import { useAddresses, SavedAddress } from "@/context/AddressContext";
import { Home, Briefcase, MapPin, Plus, Trash2, Check, Edit3 } from "lucide-react";
import AddressForm from "./AddressForm";

interface SavedAddressesProps {
  selectedAddressId: string | null;
  onSelect: (address: SavedAddress) => void;
}

export default function SavedAddresses({ selectedAddressId, onSelect }: SavedAddressesProps) {
  const { addresses, addAddress, removeAddress, setDefaultAddress } = useAddresses();
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSaveNew = (formData: any) => {
    const newAddr = addAddress({
      ...formData,
      isDefault: addresses.length === 0,
    });
    onSelect(newAddr);
    setShowNewForm(false);
  };

  const labelIcons = {
    Home: Home,
    Work: Briefcase,
    Other: MapPin,
  };

  return (
    <div className="space-y-4">
      {/* Saved Address Cards */}
      {addresses.length > 0 && (
        <div className="space-y-3">
          {addresses.map((addr) => {
            const Icon = labelIcons[addr.label] || MapPin;
            const isSelected = selectedAddressId === addr.id;

            return (
              <div
                key={addr.id}
                onClick={() => onSelect(addr)}
                className={`relative p-4 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-accent/5 border-accent/30 shadow-sm"
                    : "bg-card border-border hover:border-accent/20"
                }`}
              >
                {/* Selection indicator */}
                <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected ? "bg-accent border-accent" : "border-border"
                }`}>
                  {isSelected && <Check size={12} className="text-accent-foreground" />}
                </div>

                {/* Label badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-accent bg-accent/10 px-2.5 py-1 rounded-md">
                    <Icon size={10} /> {addr.label}
                  </span>
                  {addr.isDefault && (
                    <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
                      Default
                    </span>
                  )}
                </div>

                {/* Address content */}
                <p className="text-sm font-medium text-foreground mb-0.5">
                  {addr.firstName} {addr.lastName}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {addr.addressLine1}
                  {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                  <br />
                  {addr.city}, {addr.state} — {addr.pincode}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  📞 {addr.phone} &nbsp;·&nbsp; ✉ {addr.email}
                </p>

                {/* Actions */}
                <div className="flex gap-3 mt-3 pt-2 border-t border-border/50">
                  {!addr.isDefault && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setDefaultAddress(addr.id); }}
                      className="text-[10px] uppercase tracking-[0.1em] text-accent hover:text-accent/80 transition-colors"
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeAddress(addr.id); }}
                    className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 ml-auto"
                  >
                    <Trash2 size={10} /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Address */}
      {!showNewForm ? (
        <button
          type="button"
          onClick={() => setShowNewForm(true)}
          className="w-full p-4 rounded-lg border border-dashed border-border hover:border-accent/30 transition-colors flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <Plus size={16} />
          {addresses.length === 0 ? "Add Delivery Address" : "Add New Address"}
        </button>
      ) : (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3
            className="text-lg font-normal text-foreground mb-5 flex items-center gap-2"
            style={{ fontFamily: "var(--font-lora), serif" }}
          >
            <MapPin size={18} className="text-accent" /> New Address
          </h3>
          <AddressForm
            onSave={handleSaveNew}
            onCancel={() => setShowNewForm(false)}
            saveLabel="Save & Use This Address"
          />
        </div>
      )}
    </div>
  );
}
