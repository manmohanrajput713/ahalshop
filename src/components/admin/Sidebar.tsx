"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, LogOut, Settings, Package, Home } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: Package },
    { href: "/admin/products", label: "Products", icon: ShoppingBag },
    { href: "/admin/settings", label: "Settings", icon: Settings },
    { href: "/", label: "Back to Store", icon: Home },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col min-h-screen">
      <div className="p-6 border-b border-border">
        <Link href="/admin" className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <span>ASHL Admin</span>
        </Link>
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
  );
}
