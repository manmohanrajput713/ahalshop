"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import { ALL_PRODUCTS } from "@/lib/data";
import { getProducts } from "@/app/admin/(dashboard)/products/actions";
import { useCart } from "@/context/CartContext";
import { useState, useEffect, useMemo } from "react";
import { SlidersHorizontal, X, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ShopContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "All";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "name">("default");
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState(ALL_PRODUCTS);
  const { addToCart } = useCart();

  useEffect(() => {
    getProducts().then(data => {
      if (data && data.length > 0) {
        setProducts(data);
      }
    });
  }, []);

  const categories = useMemo(() => {
    const cats = ["All", ...new Set(products.map((p) => p.category))];
    return cats;
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.alt && p.alt.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortBy === "price-asc") {
      result.sort((a, b) => {
        const pa = parseFloat(a.price.replace(/[^\d.]/g, ""));
        const pb = parseFloat(b.price.replace(/[^\d.]/g, ""));
        return pa - pb;
      });
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => {
        const pa = parseFloat(a.price.replace(/[^\d.]/g, ""));
        const pb = parseFloat(b.price.replace(/[^\d.]/g, ""));
        return pb - pa;
      });
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-32 pb-24 max-w-7xl mx-auto px-6 lg:px-12 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-accent mb-3">Browse</p>
            <h1
              className="text-4xl lg:text-5xl font-normal text-foreground"
              style={{ fontFamily: "var(--font-lora), serif" }}
            >
              Our <em className="italic">Collection</em>
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
              {selectedCategory !== "All" ? ` in ${selectedCategory}` : ""}
            </p>
          </div>

          {/* Search + Sort controls */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="pl-10 pr-4 py-2.5 bg-card border border-border text-sm rounded-md focus:outline-none focus:border-accent w-[200px] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* 
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-card border border-border text-sm px-4 py-2.5 rounded-md focus:outline-none focus:border-accent appearance-none cursor-pointer"
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
            */}

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 bg-card border border-border px-4 py-2.5 text-sm rounded-md"
            >
              <SlidersHorizontal size={16} /> Filter
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-56 shrink-0`}>
            <div className="sticky top-32 space-y-8">
              {/* Categories */}
              <div>
                <h3 className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-4">
                  Categories
                </h3>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        selectedCategory === cat
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-card"
                      }`}
                    >
                      {cat}
                      <span className="text-xs opacity-60 ml-2">
                        ({cat === "All"
                          ? products.length
                          : products.filter((p) => p.category === cat).length})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Filters */}
              {(selectedCategory !== "All" || searchQuery) && (
                <div>
                  <h3 className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-3">
                    Active Filters
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategory !== "All" && (
                      <button
                        onClick={() => setSelectedCategory("All")}
                        className="inline-flex items-center gap-1 bg-accent/10 text-accent text-xs px-3 py-1.5 rounded-full"
                      >
                        {selectedCategory} <X size={12} />
                      </button>
                    )}
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="inline-flex items-center gap-1 bg-accent/10 text-accent text-xs px-3 py-1.5 rounded-full"
                      >
                        &quot;{searchQuery}&quot; <X size={12} />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      setSearchQuery("");
                      setSortBy("default");
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground mt-3 underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-xl border border-border">
                <p className="text-muted-foreground mb-4">No products found matching your criteria.</p>
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchQuery("");
                  }}
                  className="text-xs uppercase tracking-[0.15em] text-accent hover:text-foreground transition-colors"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {filteredProducts.map((product) => (
                  <Link
                    href={`/products/${product.id}`}
                    key={product.id}
                    className="group block"
                  >
                    <div className="relative overflow-hidden bg-card aspect-square sm:aspect-[4/3] rounded-lg">
                      <Image
                        src={product.img}
                        alt={product.alt || product.name}
                        fill
                        className="object-contain p-2 sm:p-4 transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-500" />
                      {(product as any).badge && (
                        <span className="absolute top-3 left-3 bg-background text-foreground text-[9px] tracking-[0.2em] uppercase px-2.5 py-1 rounded">
                          {(product as any).badge}
                        </span>
                      )}
                    </div>
                    <div className="pt-3 pb-2">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
                        {product.category}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-normal text-foreground" style={{ fontFamily: "var(--font-lora), serif" }}>
                          {product.name}
                        </p>
                        <p className="text-sm text-accent">{product.price}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ShopContent />
    </Suspense>
  );
}
