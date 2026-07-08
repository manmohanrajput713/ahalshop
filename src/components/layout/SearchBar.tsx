"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { ALL_PRODUCTS } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = query.length >= 2
    ? ALL_PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-foreground/75 hover:text-accent transition-colors duration-200"
        aria-label="Search products"
      >
        <Search size={18} strokeWidth={1.5} />
      </button>

      {/* Search Dropdown */}
      {isOpen && (
        <div className="absolute top-10 right-0 w-[340px] bg-background border border-border shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
            <Search size={16} className="text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-[360px] overflow-y-auto">
            {query.length < 2 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-xs text-muted-foreground tracking-wide">Type at least 2 characters to search</p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {["Serum", "Soap", "Hair Oil", "Face Wash"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="text-[10px] tracking-[0.1em] uppercase px-3 py-1.5 bg-card border border-border text-muted-foreground hover:text-foreground hover:border-accent/40 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-muted-foreground">No products found for &quot;{query}&quot;</p>
              </div>
            ) : (
              results.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  onClick={() => {
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-card transition-colors group"
                >
                  <div className="relative w-12 h-12 bg-card rounded overflow-hidden shrink-0 border border-border">
                    <Image
                      src={product.img}
                      alt={product.name}
                      fill
                      className="object-contain p-1"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground group-hover:text-accent transition-colors truncate">
                      {product.name}
                    </p>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
                      {product.category}
                    </p>
                  </div>
                  <p className="text-sm text-accent font-medium shrink-0">{product.price}</p>
                </Link>
              ))
            )}
          </div>

          {/* View All link */}
          {results.length > 0 && (
            <div className="border-t border-border px-5 py-3">
              <Link
                href={`/shop?q=${encodeURIComponent(query)}`}
                onClick={() => {
                  setIsOpen(false);
                  setQuery("");
                }}
                className="text-[10px] tracking-[0.15em] uppercase text-accent hover:text-foreground transition-colors"
              >
                View all {results.length} results →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
