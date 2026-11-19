"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { authClient } from "@/lib/auth/client";
import { WithdrawModal } from "./WithdrawModal";

interface DashboardShellProps {
  storeName: string;
  email: string;
  securedOrdersCount: number;
  availableBalanceNgn: string;
  children: ReactNode;
}

export function DashboardShell({
  storeName,
  email,
  securedOrdersCount,
  availableBalanceNgn,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  const navItems = [
    {
      label: "Overview",
      href: "/dashboard",
      active: pathname === "/dashboard",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      label: "Pay Links",
      href: "/dashboard/products",
      active: pathname.startsWith("/dashboard/products"),
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      ),
    },
    {
      label: "Orders",
      href: "/dashboard/orders",
      active: pathname.startsWith("/dashboard/orders"),
      badge: securedOrdersCount > 0 ? securedOrdersCount : undefined,
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="m3.3 7 8.7 5 8.7-5" />
          <path d="M12 22V12" />
        </svg>
      ),
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-5">
      <div>
        <div className="flex items-center justify-between gap-2 pb-5 border-b border-[#E5E5E5]">
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-[#1A1A1A] truncate">
              {storeName}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#5F6368] mt-0.5">
              EscrowPay Seller
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/products/new"
          onClick={() => setMobileOpen(false)}
          className="mt-5 w-full h-10 rounded-full bg-[#1A1A1A] text-[#FFFFFF] text-[14px] font-medium flex items-center justify-center hover:bg-[#1A1A1A]/90 transition-opacity"
        >
          + Create Link
        </Link>

        <nav className="mt-5 space-y-1" aria-label="Dashboard navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${
                item.active
                  ? "bg-[#F8F6F1] text-[#1A1A1A]"
                  : "text-[#5F6368] hover:bg-[#F4F3EF] hover:text-[#1A1A1A]"
              }`}
            >
              <span className="flex items-center gap-2.5">
                {item.icon}
                {item.label}
              </span>
              {item.badge ? (
                <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-[#FFF4D6] text-[#8A5A00] border border-[#FFB800]/50">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          ))}

          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              setWithdrawOpen(true);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[14px] font-medium text-[#5F6368] hover:bg-[#F4F3EF] hover:text-[#1A1A1A] transition-colors cursor-pointer"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            Payouts
          </button>
        </nav>
      </div>

      <div className="pt-4 border-t border-[#E5E5E5]">
        <p className="text-[12px] text-[#5F6368] truncate px-1">{email}</p>
        <button
          type="button"
          disabled={signingOut}
          onClick={handleSignOut}
          className="mt-2 w-full h-9 px-3 rounded-xl text-left text-[13px] font-medium text-[#5F6368] hover:bg-[#F4F3EF] hover:text-[#1A1A1A] transition-colors cursor-pointer"
        >
          {signingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-30 bg-[#FFFFFF] border-b border-[#E5E5E5] px-4 h-14 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="p-2 -ml-2 rounded-lg text-[#1A1A1A] hover:bg-[#F4F3EF]"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="text-[15px] font-semibold text-[#1A1A1A] truncate max-w-[180px]">
          {storeName}
        </span>
        <Link
          href="/dashboard/products/new"
          className="h-8 px-3 rounded-full bg-[#1A1A1A] text-[#FFFFFF] text-[12px] font-medium flex items-center"
        >
          + Link
        </Link>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen ? (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-[#1A1A1A]/30"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-50 w-[260px] max-w-[80vw] bg-[#FFFFFF] h-full border-r border-[#E5E5E5]">
            {sidebarContent}
          </aside>
        </div>
      ) : null}

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-[240px] shrink-0 border-r border-[#E5E5E5] bg-[#FFFFFF] sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 px-4 py-6 sm:px-8 lg:px-10 lg:py-8 max-w-[1200px]">
        {children}
      </main>

      <WithdrawModal
        open={withdrawOpen}
        availableBalanceNgn={availableBalanceNgn}
        onClose={() => setWithdrawOpen(false)}
      />
    </div>
  );
}
