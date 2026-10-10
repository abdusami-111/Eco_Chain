"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ScanLine,
  Wallet,
  Gift,
  Map as MapIcon,
  Trophy,
  Target,
  BookOpen,
  User,
  ShieldCheck,
  LogOut,
  Leaf,
  Coins,
  Sun,
  Moon,
  Menu,
  X,
  Globe,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useI18n, useTheme } from "@/app/providers";
import { useCurrentUser } from "./useCurrentUser";
import { api } from "./ApiClient";
import { LANGUAGES } from "@/lib/constants";

const NAV = [
  { href: "/dashboard", key: "nav.dashboard", icon: LayoutDashboard },
  { href: "/scan", key: "nav.scan", icon: ScanLine },
  { href: "/wallet", key: "nav.wallet", icon: Wallet },
  { href: "/rewards", key: "nav.rewards", icon: Gift },
  { href: "/map", key: "nav.map", icon: MapIcon },
  { href: "/leaderboard", key: "nav.leaderboard", icon: Trophy },
  { href: "/challenges", key: "nav.challenges", icon: Target },
  { href: "/learn", key: "nav.learn", icon: BookOpen },
  { href: "/profile", key: "nav.profile", icon: User },
];

export default function AppShell({ children }) {
  const { t, lang, setLang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: me } = useCurrentUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    ...NAV,
    ...(me?.user?.role === "ADMIN" ? [{ href: "/admin", key: "nav.admin", icon: ShieldCheck }] : []),
  ];

  async function handleLogout() {
    await api.post("/api/auth/logout");
    queryClient.clear();
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 surface border-r">
        <div className="h-20 flex items-center gap-3 px-6 border-b" style={{ borderColor: "var(--border-c)" }}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-eco-700 to-lime-500 flex items-center justify-center text-white shadow-md">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-lg leading-tight">{t("app.name")}</div>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              {t("app.tagline")}
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  active
                    ? "bg-eco-600 text-white shadow-sm"
                    : "hover:bg-eco-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t(item.key)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t space-y-2" style={{ borderColor: "var(--border-c)" }}>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>{t("nav.logout")}</span>
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 surface p-4 space-y-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-lg">{t("app.name")}</span>
              <button onClick={() => setMobileOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-eco-50 dark:hover:bg-white/5"
                >
                  <Icon className="w-4 h-4" />
                  <span>{t(item.key)}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600"
            >
              <LogOut className="w-4 h-4" />
              <span>{t("nav.logout")}</span>
            </button>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 surface border-b flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-eco-50 dark:bg-eco-900/40 border border-eco-200 dark:border-eco-800 px-3 py-2 rounded-2xl">
              <Coins className="w-4 h-4 text-eco-700 dark:text-lime-400" />
              <span className="text-sm font-bold text-eco-900 dark:text-lime-300">
                {me?.user?.balance ?? "—"}
              </span>
            </div>

            <div className="relative group">
              <button className="flex items-center gap-1.5 text-sm px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5">
                <Globe className="w-4 h-4" />
                <span className="uppercase font-semibold">{lang}</span>
              </button>
              <div className="absolute right-0 mt-1 hidden group-hover:flex flex-col surface rounded-xl shadow-lg overflow-hidden min-w-[80px]">
                {LANGUAGES.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className="px-3 py-2 text-sm text-left hover:bg-eco-50 dark:hover:bg-white/10 uppercase"
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {me?.user && (
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l" style={{ borderColor: "var(--border-c)" }}>
                <div className="w-9 h-9 rounded-xl bg-eco-600 text-white flex items-center justify-center font-bold text-sm">
                  {me.user.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <span className="text-sm font-semibold">{me.user.name}</span>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
