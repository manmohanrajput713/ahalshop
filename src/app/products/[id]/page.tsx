import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ALL_PRODUCTS } from "@/lib/data";
import { getProducts } from "@/app/admin/(dashboard)/products/actions";
import { PRODUCT_DETAILS } from "@/lib/product-details";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ReviewsSection from "@/components/products/ReviewsSection";
import ProductCarousel from "@/components/products/ProductCarousel";
import AddToBagButton from "./AddToBagButton";
import { Leaf, Droplets, CheckCircle2, Info, ChevronRight } from "lucide-react";

// Next.js dynamic route params
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const productId = parseInt(resolvedParams.id);
  const products = await getProducts();
  const product = products.find((p: any) => p.id === productId);

  if (!product) {
    notFound();
  }

  const details = PRODUCT_DETAILS[productId] || {
    size: product.size || "Standard",
    suitableFor: product.suitable_for || "All types",
    benefits: product.benefits || [],
    ingredients: product.ingredients || [],
    howToUse: product.how_to_use || "Follow standard instructions.",
  };

  // Adding a fallback description for products that don't have one defined
  const description = product.description || "Experience the pure essence of herbal care. Formulated with carefully selected natural ingredients to nourish, protect, and rejuvenate your skin and hair. Free from harsh chemicals, synthetic colors, and artificial fragrances.";

  // Related products: same category, excluding current
  const relatedProducts = products
    .filter((p: any) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // If not enough related in same category, fill from other products
  const moreRelated = relatedProducts.length < 4
    ? products.filter((p: any) => p.id !== product.id && !relatedProducts.find((r: any) => r.id === p.id)).slice(0, 4 - relatedProducts.length)
    : [];

  const allRelated = [...relatedProducts, ...moreRelated];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      
      <main className="flex-1 pt-32 pb-24 max-w-7xl mx-auto px-6 lg:px-12 w-full">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <ChevronRight size={12} />
          <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-foreground transition-colors">
            {product.category}
          </Link>
          <ChevronRight size={12} />
          <span className="text-foreground">{product.name}</span>
        </nav>

        {/* Promotional Banner */}
        {/*
        <div className="bg-accent/10 border border-accent/20 rounded-md p-4 mb-12 text-center">
          <p className="text-accent font-medium tracking-wide">
            Buy 2, Get 3rd Free
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Add 3 items to bag to get the lowest priced product for free.
          </p>
        </div>
        */}

        {/* Product Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 mb-16">
          
          {/* Left Column: Image Carousel */}
          <div className="relative">
            <ProductCarousel 
              images={(product as any).images || [product.img]} 
              alt={product.alt || product.name} 
            />
            {/* Cast product to any to avoid TypeScript error since MORE_PRODUCTS items lack a badge property */}
            {(product as any).badge && (
              <span className="absolute top-6 left-6 z-10 bg-background border border-border text-foreground text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 shadow-sm">
                {(product as any).badge}
              </span>
            )}
          </div>

          {/* Right Column: Info */}
          <div className="flex flex-col justify-center">
            <p className="text-[11px] tracking-[0.3em] uppercase text-accent mb-4">
              {product.category}
            </p>
            <h1 
              className="text-4xl lg:text-5xl font-normal text-foreground mb-6 leading-tight"
              style={{ fontFamily: "var(--font-lora), serif" }}
            >
              {product.name}
            </h1>

            <div className="prose prose-sm text-muted-foreground mb-10 leading-relaxed">
              <p>{description}</p>
            </div>

            {/* Quick Info Pills */}
            {details && (
              <div className="flex flex-wrap gap-3 mb-8">
                <span className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.1em] uppercase bg-card border border-border px-3 py-1.5 rounded-full text-muted-foreground">
                  <Leaf size={12} className="text-accent" /> 100% Natural
                </span>
                <span className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.1em] uppercase bg-card border border-border px-3 py-1.5 rounded-full text-muted-foreground">
                  <Info size={12} className="text-accent" /> {details.size}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.1em] uppercase bg-card border border-border px-3 py-1.5 rounded-full text-muted-foreground">
                  <CheckCircle2 size={12} className="text-accent" /> {details.suitableFor.split("—")[0].trim()}
                </span>
              </div>
            )}

            <div className="space-y-6">
              {/* Using a Client Component for the Add to Bag action */}
              <AddToBagButton product={product} />

              <div className="pt-8 border-t border-border grid grid-cols-2 gap-6 text-xs uppercase tracking-[0.1em] text-muted-foreground">
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-foreground">Usage</span>
                  <span>Daily application</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-foreground">Type</span>
                  <span>100% Herbal</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Info Sections */}
        {details && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {/* Benefits */}
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle2 size={22} className="text-accent" />
                <h3
                  className="text-lg font-normal text-foreground"
                  style={{ fontFamily: "var(--font-lora), serif" }}
                >
                  Benefits
                </h3>
              </div>
              <ul className="space-y-3">
                {details.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground font-light">
                    <span className="text-accent mt-0.5 shrink-0">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* Ingredients */}
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Leaf size={22} className="text-accent" />
                <h3
                  className="text-lg font-normal text-foreground"
                  style={{ fontFamily: "var(--font-lora), serif" }}
                >
                  Key Ingredients
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {details.ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-full"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            {/* How to Use */}
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Droplets size={22} className="text-accent" />
                <h3
                  className="text-lg font-normal text-foreground"
                  style={{ fontFamily: "var(--font-lora), serif" }}
                >
                  How to Use
                </h3>
              </div>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                {details.howToUse}
              </p>
              <div className="mt-6 p-4 bg-accent/5 rounded-lg">
                <p className="text-[10px] tracking-[0.15em] uppercase text-accent font-medium mb-1">
                  Suitable For
                </p>
                <p className="text-xs text-muted-foreground">{details.suitableFor}</p>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <ReviewsSection />

        {/* Related Products */}
        {allRelated.length > 0 && (
          <section className="mt-20">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[11px] tracking-[0.3em] uppercase text-accent mb-2">You May Also Like</p>
                <h2
                  className="text-3xl font-normal text-foreground"
                  style={{ fontFamily: "var(--font-lora), serif" }}
                >
                  Related <em className="italic">Products</em>
                </h2>
              </div>
              <Link
                href="/shop"
                className="hidden md:inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors border-b border-border pb-0.5"
              >
                View all <ChevronRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {allRelated.map((rp) => (
                <Link key={rp.id} href={`/products/${rp.id}`} className="group block">
                  <div className="relative overflow-hidden bg-card aspect-square sm:aspect-[4/3] rounded-lg">
                    <Image
                      src={rp.img}
                      alt={rp.alt || rp.name}
                      fill
                      className="object-contain p-2 sm:p-4 transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  <div className="pt-3">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
                      {rp.category}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-foreground" style={{ fontFamily: "var(--font-lora), serif" }}>
                        {rp.name}
                      </p>
                      <p className="text-sm text-accent">{rp.price}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </main>

      <Footer />
    </div>
  );
}
