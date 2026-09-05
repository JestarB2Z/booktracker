"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface NavBarProps {
  isAdmin: boolean;
}

const baseTabs = [
  { href: "/search", label: "Search", icon: "🔍" },
  { href: "/add-book", label: "Add", icon: "➕" },
  { href: "/library", label: "My Books", icon: "📚" },
];

export function NavBar({ isAdmin }: NavBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = isAdmin ? [...baseTabs, { href: "/admin/users", label: "Admin", icon: "⚙️" }] : baseTabs;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 flex border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      {tabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
              active ? "text-blue-600 dark:text-blue-400" : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            {tab.label}
          </Link>
        );
      })}
      <button
        onClick={handleLogout}
        className="flex flex-1 flex-col items-center gap-0.5 py-2 text-xs text-zinc-500 dark:text-zinc-400"
      >
        <span className="text-lg leading-none">🚪</span>
        Logout
      </button>
    </nav>
  );
}
