"use client";

import { useState, useEffect, useRef } from "react";
import { ShoppingBag, Menu, X, LogOut, User, Heart, Coins, Check } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import AuthModal from "@/components/auth/AuthModal";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAshlCoins } from "@/context/AshlCoinContext";
import Link from "next/link";
import SearchBar from "@/components/layout/SearchBar";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "My Orders", href: "/orders" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { totalItems } = useCart();
  const { totalWishlist } = useWishlist();
  const { balance, pendingCoins, transactions, coinsPerRupeeDiscount, rupeesPerCoinEarned } = useAshlCoins();

  const [authToast, setAuthToast] = useState<{ message: string; type: "login" | "logout" } | null>(null);
  const [isAuthToastVisible, setIsAuthToastVisible] = useState(false);
  const [toastTimers, setToastTimers] = useState<{ exit: NodeJS.Timeout; cleanup: NodeJS.Timeout } | null>(null);

  const triggerAuthToast = (message: string, type: "login" | "logout") => {
    if (toastTimers) {
      clearTimeout(toastTimers.exit);
      clearTimeout(toastTimers.cleanup);
    }
    setAuthToast({ message, type });
    setIsAuthToastVisible(true);

    const exit = setTimeout(() => setIsAuthToastVisible(false), 3500);
    const cleanup = setTimeout(() => { setAuthToast(null); setToastTimers(null); }, 3950);
    setToastTimers({ exit, cleanup });
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close profile panel on outside click
  useEffect(() => {
    if (!profilePanelOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-profile-panel]")) {
        setProfilePanelOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [profilePanelOpen]);

  // Track previous user to detect real sign-in transitions (null -> user)
  const prevUserRef = useRef<any>(undefined); // undefined = not yet initialized

  // Sync Supabase Auth State
  useEffect(() => {
    // Get active session (initial load — no toast)
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      prevUserRef.current = currentUser; // Set initial state without triggering toast
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);

      // Only show toast when transitioning from no-user to user (real sign-in)
      // prevUserRef.current === null means user was explicitly logged out before
      // prevUserRef.current === undefined means initial load hasn't completed
      if (event === "SIGNED_IN" && newUser && prevUserRef.current === null) {
        triggerAuthToast(`Welcome back, ${newUser.email}`, "login");
      }

      prevUserRef.current = newUser;
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    triggerAuthToast("Successfully signed out", "logout");
  };

  const totalPending = pendingCoins.reduce((sum, p) => sum + p.amount, 0);

  // Get recent activity (max 10 items: transactions + pending)
  const recentActivity = [
    ...pendingCoins.map((p) => ({
      id: `pending_${p.order_id}`,
      type: "pending" as const,
      amount: p.amount,
      description: `Order #${p.order_id}`,
      createdAt: p.created_at,
    })),
    ...transactions.slice(0, 10).map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      description: t.description,
      createdAt: t.created_at,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-background/95 backdrop-blur-md border-b border-border" : "bg-transparent"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-16">
          {/* Logo Branding */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/products/logo.png"
              alt="ASHL Herbal Logo"
              width={40}
              height={40}
              className="object-contain"
              style={{ width: "auto", height: "auto" }}
            />
            <span
              className="text-foreground tracking-[0.15em] text-sm font-medium uppercase hidden sm:inline"
              style={{ fontFamily: "var(--font-lora), serif" }}
            >
              ASHL Herbal
            </span>
          </Link>

          {/* Navigation Links */}
          <ul className="hidden md:flex items-center gap-10">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-sm tracking-[0.15em] uppercase text-foreground/75 hover:text-accent transition-colors duration-200"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Action Buttons */}
          <div className="flex items-center gap-5">
            {/* Search */}
            <div className="hidden md:block">
              <SearchBar />
            </div>

            {/* Auth & Profile */}
            <div className="hidden md:flex items-center gap-5">
              {user ? (
                <div className="relative" data-profile-panel>
                  <button
                    onClick={(e) => { e.stopPropagation(); setProfilePanelOpen(!profilePanelOpen); }}
                    className="relative text-foreground hover:text-accent transition-colors duration-200 flex items-center gap-2"
                    aria-label="Profile"
                  >
                    <div className="w-8 h-8 rounded-full bg-accent/5 border border-accent/20 flex items-center justify-center hover:bg-accent/10 transition-colors">
                      <User size={16} className="text-accent" />
                    </div>
                    {totalPending > 0 && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-white text-[8px] flex items-center justify-center font-bold animate-pulse shadow-sm">
                        !
                      </span>
                    )}
                  </button>

                  {/* Profile Dropdown Panel */}
                  {profilePanelOpen && (
                    <div 
                      className="absolute right-0 top-12 w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* User Info Header */}
                      <div className="px-5 py-4 border-b border-border bg-muted/30">
                        <p className="text-sm font-medium text-foreground">
                          {user.user_metadata?.full_name || user.email?.split("@")[0]}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                      </div>

                      {/* Coins Section */}
                      <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-5 border-b border-amber-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] tracking-[0.2em] uppercase text-amber-600 mb-1">Available Balance</p>
                            <p className="text-2xl font-semibold text-amber-800">{balance} <span className="text-sm font-normal">coins</span></p>
                          </div>
                          <div className="w-12 h-12 bg-amber-200/50 rounded-full flex items-center justify-center">
                            <Coins size={24} className="text-amber-600" />
                          </div>
                        </div>
                        {totalPending > 0 && (
                          <div className="mt-3 bg-white/60 rounded-md px-3 py-2 flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-wider text-amber-700">Pending</span>
                            <span className="text-sm font-medium text-amber-600">+{totalPending} coins</span>
                          </div>
                        )}
                        <p className="text-[10px] text-amber-500 mt-2">{coinsPerRupeeDiscount} coins = ₹1 discount • Earn 1 coin per ₹{rupeesPerCoinEarned}</p>
                      </div>

                      {/* Activity List */}
                      <div className="max-h-[200px] overflow-y-auto">
                        {recentActivity.length === 0 ? (
                          <div className="p-6 text-center">
                            <Coins size={28} className="text-muted-foreground/30 mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground">No coin activity yet</p>
                            <p className="text-[10px] text-muted-foreground mt-1">Place an order to start earning!</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-border">
                            {recentActivity.map((item) => (
                              <div key={item.id} className="px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                  item.type === "pending"
                                    ? "bg-amber-100 text-amber-600"
                                    : item.type === "earned"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-600"
                                }`}>
                                  <Coins size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-foreground truncate">{item.description}</p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {new Date(item.createdAt).toLocaleDateString("en-IN", { 
                                      day: "numeric", month: "short", year: "numeric" 
                                    })}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className={`text-xs font-semibold ${
                                    item.type === "pending"
                                      ? "text-amber-600"
                                      : item.type === "earned"
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}>
                                    {item.type === "redeemed" ? "-" : "+"}{item.amount}
                                  </p>
                                  <p className={`text-[9px] uppercase tracking-wider font-medium ${
                                    item.type === "pending"
                                      ? "text-amber-500"
                                      : item.type === "earned"
                                      ? "text-green-500"
                                      : "text-red-500"
                                  }`}>
                                    {item.type === "pending" ? "Pending" : item.type === "earned" ? "Credited" : "Used"}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Sign Out Footer */}
                      <div className="border-t border-border p-2 bg-muted/10">
                        <button
                          onClick={() => { setProfilePanelOpen(false); handleSignOut(); }}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-xs tracking-[0.1em] uppercase text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors font-medium"
                        >
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="text-sm tracking-[0.15em] uppercase text-foreground/75 hover:text-accent transition-colors duration-200 flex items-center gap-1.5"
                >
                  <User size={16} strokeWidth={1.5} /> Sign In
                </button>
              )}
            </div>

            {/* Wishlist Button */}
            <Link
              href="/wishlist"
              className="relative text-foreground hover:text-red-400 transition-colors duration-200 hidden md:flex items-center"
              aria-label="Wishlist"
            >
              <Heart size={18} strokeWidth={1.5} />
              {totalWishlist > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-medium">
                  {totalWishlist}
                </span>
              )}
            </Link>

            {/* Shopping Bag Button */}
            <Link
              href="/cart"
              className="relative text-foreground hover:text-accent transition-colors duration-200 flex items-center"
              aria-label="Shopping bag"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-medium">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-foreground flex items-center"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-background border-t border-border px-6 py-8 flex flex-col gap-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm tracking-[0.15em] uppercase text-foreground"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {/* Mobile Profile & Coins */}
            {user && (
              <button
                onClick={() => { setProfilePanelOpen(!profilePanelOpen); setMenuOpen(false); }}
                className="flex items-center gap-2 text-sm tracking-[0.15em] uppercase text-amber-700"
              >
                <Coins size={16} /> ASHL Coins: {balance}
                {totalPending > 0 && <span className="text-[10px] text-amber-500 normal-case">({totalPending} pending)</span>}
              </button>
            )}

            <div className="border-t border-border pt-6 mt-2 flex flex-col gap-4">
              {user ? (
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-muted-foreground font-light">
                    Logged in as: {user.email}
                  </p>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMenuOpen(false);
                    }}
                    className="text-sm tracking-[0.15em] uppercase text-accent font-medium text-left"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthModalOpen(true);
                    setMenuOpen(false);
                  }}
                  className="text-sm tracking-[0.15em] uppercase text-foreground font-medium text-left"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal overlay */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(email) => {
          console.log("Logged in user email:", email);
        }}
      />
      
      {/* Auth Success Toast */}
      {authToast && (
        <div
          className={`fixed top-20 right-4 left-4 md:left-auto md:right-8 z-50 md:w-[380px] bg-card border border-border shadow-2xl rounded-lg p-4 flex gap-4 transition-all duration-300 ${
            isAuthToastVisible ? "animate-toast-in" : "animate-toast-out"
          }`}
          style={{ fontFamily: "var(--font-sans), sans-serif" }}
        >
          <div className={`absolute top-0 left-0 bottom-0 w-1.5 rounded-l-lg ${authToast.type === 'login' ? 'bg-primary' : 'bg-destructive'}`} />
          
          <div className="flex-1 min-w-0 flex flex-col justify-center py-1 pl-2">
            <div className={`flex items-center gap-2 ${authToast.type === 'login' ? 'text-primary' : 'text-destructive'} text-[10px] font-bold tracking-[0.15em] uppercase mb-1`}>
              <Check size={14} strokeWidth={3} />
              <span>{authToast.type === 'login' ? 'Welcome' : 'Goodbye'}</span>
            </div>
            <h4 
              className="text-sm font-medium text-foreground truncate pr-4"
              style={{ fontFamily: "var(--font-serif), serif", fontStyle: "italic" }}
            >
              {authToast.message}
            </h4>
          </div>

          <div className="flex flex-col justify-start items-end">
            <button
              onClick={() => {
                setIsAuthToastVisible(false);
                setTimeout(() => setAuthToast(null), 450);
              }}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="Close notification"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
