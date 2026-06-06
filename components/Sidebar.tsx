"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const mainNav = [
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    { name: "Jobs", href: "/jobs", icon: "💼" },
    { name: "Shifts", href: "/shifts", icon: "⏰" },
    { name: "Budget", href: "/budget", icon: "💴" },
    { name: "Reports", href: "/reports", icon: "📈" },
  ];

  const secondaryNav = [
    { name: "Settings", href: "/settings", icon: "⚙️" },
    { name: "Account", href: "/account", icon: "👤" },
  ];

  const renderLinks = (links: typeof mainNav) =>
    links.map((link) => {
      // Handles exact matching for dynamic states
      const isActive = pathname === link.href;
      return (
        <Link
          key={link.href}
          href={link.href}
          className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
            isActive
              ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.05)]"
              : "text-gray-400 hover:bg-gray-900 hover:text-gray-200 border border-transparent"
          }`}
        >
          <span
            className={`text-base transition-transform duration-200 group-hover:scale-110 ${
              isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"
            }`}
          >
            {link.icon}
          </span>
          <span>{link.name}</span>
        </Link>
      );
    });

  return (
    <aside className="w-64 bg-gray-950/40 border-r border-gray-800/80 backdrop-blur-xl flex flex-col justify-between min-h-screen sticky top-0">
      {/* Top Brand Block */}
      <div>
        <div className="p-6 border-b border-gray-950/30">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-blue-500/20 bg-blue-500/5">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs font-bold tracking-widest text-blue-400 uppercase">
              BOW SYSTEM
            </span>
          </div>
        </div>

        {/* Primary Workspace Links */}
        <nav className="mt-6 px-3 space-y-1.5 flex-1">
          <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">
            Workspace
          </p>
          {renderLinks(mainNav)}
        </nav>
      </div>

      {/* Bottom Preferences Block */}
      <div className="p-3 border-t border-gray-950/40 bg-gray-950/20">
        <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">
          Preferences
          </p>
        <div className="space-y-1.5">{renderLinks(secondaryNav)}</div>
      </div>
    </aside>
  );
}