"use client";

import { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, LogOut, Settings, Package, Home, Menu, X } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: Package },
    { href: "/admin/products", label: "Products", icon: ShoppingBag },
    { href: "/admin/settings", label: "Settings", icon: Settings },
    { href: "/", label: "Back to Store", icon: Home },
  ];

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-card rounded-md border border-border shadow-sm text-foreground"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col h-screen transform transition-transform duration-200 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="p-6 border-b border-border flex justify-between items-center">
          <Link href="/admin" className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <span>ASHL Admin</span>
          </Link>
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1 text-muted-foreground hover:bg-accent rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent/20 hover:text-foreground"
              }`}
              onClick={() => setIsOpen(false)}
            >
              <Icon className="w-5 h-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <form action={async () => {
          const { adminLogout } = await import('@/app/admin/actions');
          await adminLogout();
        }} className="w-full">
           <button
             type="submit"
             className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors rounded-lg"
           >
             <LogOut className="w-5 h-5" />
             Logout
           </button>
        </form>
      </div>
      </aside>
    </>
  );
}
