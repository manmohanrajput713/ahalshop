import Image from "next/image";
import Link from "next/link";

const footerColumns = [
  {
    heading: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "Face Serums", href: "/shop?category=Face+Serum" },
      { label: "Hair Oils", href: "/shop?category=Hair+Oil" },
      { label: "Face Wash", href: "/shop?category=Face+Wash" },
      { label: "Soaps", href: "/shop?category=Soap" },
      { label: "Shampoo", href: "/shop?category=Hair+Care" },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "FAQ", href: "/contact#faq" },
      { label: "Shipping Info", href: "/contact" },

    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "Blog", href: "/blog" },

    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 mb-16">
          <div className="col-span-2 md:col-span-3 lg:col-span-1 mb-8 lg:mb-0">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/products/logo.png"
                alt="ASHL Herbal Logo"
                width={32}
                height={32}
                className="object-contain"
                style={{ width: "auto", height: "auto" }}
              />
              <p
                className="text-foreground tracking-[0.15em] text-sm font-medium uppercase"
                style={{ fontFamily: "var(--font-lora), serif" }}
              >
                ASHL Herbal
              </p>
            </Link>
            <p className="text-xs text-muted-foreground font-light leading-relaxed max-w-[180px]">
              A Step For Happy Life — 100% natural herbal skincare and hair care, crafted with care.
            </p>
            {/* Social placeholder */}
            <div className="flex items-center gap-4 mt-6">
              {["Instagram", "Facebook", "YouTube"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground hover:text-accent transition-colors"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
          {footerColumns.map((col) => (
            <div key={col.heading}>
              <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-5">
                {col.heading}
              </p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-foreground hover:text-accent transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] tracking-wide text-muted-foreground flex items-center gap-4">
            <span>© 2026 ASHL Herbal. All rights reserved.</span>
            <span className="hidden md:inline">|</span>
            <Link href="/privacy" className="hover:text-accent transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-accent transition-colors">Terms</Link>
          </p>
          <p className="text-[10px] tracking-wide text-muted-foreground">
            Made with intention · No artificial ingredients · www.ashlshop.com
          </p>
        </div>
      </div>
    </footer>
  );
}
