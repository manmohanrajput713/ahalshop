"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export type SavedAddress = {
  id: string;
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
  isDefault: boolean;
};

interface AddressContextType {
  addresses: SavedAddress[];
  addAddress: (address: Omit<SavedAddress, "id">) => SavedAddress;
  updateAddress: (id: string, address: Partial<SavedAddress>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  getDefaultAddress: () => SavedAddress | undefined;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export function AddressProvider({ children }: { children: ReactNode }) {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("saved_addresses");
    if (saved) {
      try {
        setAddresses(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved addresses", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("saved_addresses", JSON.stringify(addresses));
    }
  }, [addresses, isLoaded]);

  const addAddress = useCallback((address: Omit<SavedAddress, "id">): SavedAddress => {
    const newAddress: SavedAddress = {
      ...address,
      id: `addr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    };
    setAddresses((prev) => {
      // If this is the first address or marked default, make it default
      if (prev.length === 0 || newAddress.isDefault) {
        return [...prev.map((a) => ({ ...a, isDefault: false })), { ...newAddress, isDefault: true }];
      }
      return [...prev, newAddress];
    });
    return newAddress;
  }, []);

  const updateAddress = useCallback((id: string, updates: Partial<SavedAddress>) => {
    setAddresses((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  }, []);

  const removeAddress = useCallback((id: string) => {
    setAddresses((prev) => {
      const filtered = prev.filter((a) => a.id !== id);
      // If we removed the default, make the first one default
      if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
  }, []);

  const setDefaultAddress = useCallback((id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
  }, []);

  const getDefaultAddress = useCallback(() => {
    return addresses.find((a) => a.isDefault) || addresses[0];
  }, [addresses]);

  return (
    <AddressContext.Provider
      value={{ addresses, addAddress, updateAddress, removeAddress, setDefaultAddress, getDefaultAddress }}
    >
      {children}
    </AddressContext.Provider>
  );
}

export function useAddresses() {
  const context = useContext(AddressContext);
  if (context === undefined) {
    throw new Error("useAddresses must be used within an AddressProvider");
  }
  return context;
}
