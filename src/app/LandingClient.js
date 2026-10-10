"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Leaf,
  ScanLine,
  Wallet,
  Gift,
  MapPin,
  Trophy,
  ShieldCheck,
  ArrowRight,
  Sun,
  Moon,
  Globe,
  Recycle,
  Wind,
  Coins,
  Camera,
  QrCode,
  Award,
  TrendingUp,
  Trash2,
  EyeOff,
  Sparkles,
  Link2,
} from "lucide-react";
import { useI18n, useTheme } from "./providers";
import { api } from "@/components/ApiClient";
import { Card, Badge, Button } from "@/components/ui";
import { LANGUAGES } from "@/lib/constants";

const FEATURES = [
  { icon: ScanLine, titleKey: "landing.features.scan.title", descKey: "landing.features.scan.desc" },
  { icon: Wallet, titleKey: "landing.features.wallet.title", descKey: "landing.features.wallet.desc" },
  { icon: Gift, titleKey: "landing.features.rewards.title", descKey: "landing.features.rewards.desc" },
  { icon: MapPin, titleKey: "landing.features.map.title", descKey: "landing.features.map.desc" },
  { icon: Trophy, titleKey: "landing.features.leaderboard.title", descKey: "landing.features.leaderboard.desc" },
  { icon: ShieldCheck, titleKey: "landing.features.admin.title", descKey: "landing.features.admin.desc" },
];

const STEPS = [
  { icon: Camera, titleKey: "landing.how.step1.title", descKey: "landing.how.step1.desc" },
  { icon: QrCode, titleKey: "landing.how.step2.title", descKey: "landing.how.step2.desc" },
  { icon: Award, titleKey: "landing.how.step3.title", descKey: "landing.how.step3.desc" },
];

const PROBLEMS = [
  { icon: TrendingUp, titleKey: "landing.problem.point1.title", descKey: "landing.problem.point1.desc" },
  { icon: Trash2, titleKey: "landing.problem.point2.title", descKey: "landing.problem.point2.desc" },
  { icon: EyeOff, titleKey: "landing.problem.point3.title", descKey: "landing.problem.point3.desc" },
];

const SOLUTIONS = [
  { icon: Sparkles, titleKey: "landing.solution.point1.title", descKey: "landing.solution.point1.desc" },
  { icon: Link2, titleKey: "landing.solution.point2.title", descKey: "landing.solution.point2.desc" },
  { icon: Coins, titleKey: "landing.solution.point3.title", descKey: "landing.solution.point3.desc" },
];

const FOOTER_PRODUCT_LINKS = [
  { href: "/scan", labelKey: "nav.scan" },
  { href: "/wallet", labelKey: "nav.wallet" },
  { href: "/rewards", labelKey: "nav.rewards" },
  { href: "/map", labelKey: "nav.map" },
];

const FOOTER_COMPANY_LINKS = [
  { href: "/register", labelKey: "landing.nav.signup" },
  { href: "/login", labelKey: "landing.nav.login" },
  { href: "/leaderboard", labelKey: "nav.leaderboard" },
  { href: "/learn", labelKey: "nav.learn" },
];

export default function LandingClient() {
  const { t, lang, setLang } = useI18n();
  const { theme, toggleTheme } = useTheme();

  const { data: stats } = useQuery({
    queryKey: ["public-stats"],
    queryFn: () => api.get("/api/public/stats"),
  });

  return (
    <div style={{ background: "var(--bg)" }} className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-30 surface border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
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

          <div className="flex items-center gap-2">
            <div className="relative group">
              <button className="flex items-center gap-1.5 text-sm px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5">
                <Globe className="w-4 h-4" />
                <span className="uppercase font-semibold hidden sm:inline">{lang}</span>
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
            <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link href="/login" className="text-sm font-semibold px-3 py-2 hover:text-eco-700 dark:hover:text-lime-400 transition">
              {t("landing.nav.login")}
            </Link>
            <Link href="/register">
              <Button className="!py-2">{t("landing.nav.signup")}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-eco-900 via-eco-800 to-eco-700 text-white p-8 sm:p-14 shadow-xl">
          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-lime-500/20 text-lime-400 text-xs font-semibold mb-5 border border-lime-500/30">
              <Leaf className="w-3.5 h-3.5" />
              <span>{t("landing.hero.badge")}</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
              {t("landing.hero.title")}
            </h1>
            <p className="text-slate-200 text-base sm:text-lg mb-8 max-w-xl">{t("landing.hero.subtitle")}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/register">
                <Button className="!px-6 !py-3.5 bg-lime-500 hover:bg-lime-400 !text-eco-900">
                  {t("landing.hero.cta")} <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" className="!px-6 !py-3.5 !bg-white/10 hover:!bg-white/20 !text-white">
                  {t("landing.hero.secondaryCta")}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Live stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <StatPill icon={Recycle} label={t("landing.stats.recycled")} value={stats ? `${stats.totalRecycledKg} kg` : "—"} />
          <StatPill icon={Wind} label={t("landing.stats.co2")} value={stats ? `${stats.totalCo2SavedKg} kg` : "—"} />
          <StatPill icon={Coins} label={t("landing.stats.tokens")} value={stats?.totalTokensAwarded ?? "—"} />
          <StatPill icon={MapPin} label={t("landing.stats.stations")} value={stats?.stationCount ?? "—"} />
        </div>
        <p className="text-xs text-center mt-3" style={{ color: "var(--text-muted)" }}>
          {t("landing.stats.disclaimer")}
        </p>
      </section>

      {/* Problem & Solution */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">{t("landing.problemSolution.title")}</h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("landing.problemSolution.subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="!p-6 sm:!p-8 border border-rose-200/70 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-500/5">
            <Badge tone="rose">{t("landing.problem.badge")}</Badge>
            <h3 className="text-lg sm:text-xl font-extrabold mt-3 mb-6">{t("landing.problem.title")}</h3>
            <div className="space-y-5">
              {PROBLEMS.map((p) => (
                <div key={p.titleKey} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <p.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-0.5">{t(p.titleKey)}</h4>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t(p.descKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="!p-6 sm:!p-8 border border-eco-200/70 dark:border-lime-500/20 bg-eco-50/50 dark:bg-eco-500/5">
            <Badge tone="eco">{t("landing.solution.badge")}</Badge>
            <h3 className="text-lg sm:text-xl font-extrabold mt-3 mb-6">{t("landing.solution.title")}</h3>
            <div className="space-y-5">
              {SOLUTIONS.map((s) => (
                <div key={s.titleKey} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-eco-100 dark:bg-eco-900/50 text-eco-700 dark:text-lime-400 flex items-center justify-center shrink-0">
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-0.5">{t(s.titleKey)}</h4>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t(s.descKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">{t("landing.features.title")}</h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("landing.features.subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <Card key={f.titleKey}>
              <div className="w-12 h-12 rounded-2xl bg-eco-100 dark:bg-eco-900/50 text-eco-700 dark:text-lime-400 flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-1">{t(f.titleKey)}</h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t(f.descKey)}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-10">{t("landing.how.title")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.titleKey} className="text-center">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-eco-700 to-lime-500 text-white flex items-center justify-center mx-auto mb-4 shadow-md">
                <s.icon className="w-7 h-7" />
              </div>
              <h3 className="font-bold mb-1">{t(s.titleKey)}</h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t(s.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="text-center py-12">
          <Badge tone="eco">{t("app.name")}</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 mb-6">{t("landing.hero.cta")}</h2>
          <Link href="/register">
            <Button className="!px-8 !py-3.5">
              {t("landing.nav.signup")} <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </Card>
      </section>

      <footer className="border-t pt-12 pb-8" style={{ borderColor: "var(--border-c)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-10">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-eco-700 to-lime-500 flex items-center justify-center text-white">
                  <Leaf className="w-4 h-4" />
                </div>
                <span className="font-bold">{t("app.name")}</span>
              </div>
              <p className="text-sm max-w-xs" style={{ color: "var(--text-muted)" }}>{t("landing.footer.tagline")}</p>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                {t("landing.footer.product")}
              </div>
              <ul className="space-y-2 text-sm">
                {FOOTER_PRODUCT_LINKS.map((l) => (
                  <li key={l.href + l.labelKey}>
                    <Link href={l.href} className="hover:text-eco-700 dark:hover:text-lime-400 transition">
                      {t(l.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                {t("landing.footer.company")}
              </div>
              <ul className="space-y-2 text-sm">
                {FOOTER_COMPANY_LINKS.map((l) => (
                  <li key={l.href + l.labelKey}>
                    <Link href={l.href} className="hover:text-eco-700 dark:hover:text-lime-400 transition">
                      {t(l.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div
            className="pt-6 border-t text-xs text-center"
            style={{ borderColor: "var(--border-c)", color: "var(--text-muted)" }}
          >
            © 2026 EcoChain
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatPill({ icon: Icon, label, value }) {
  return (
    <Card className="!p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-eco-100 dark:bg-eco-900/50 text-eco-700 dark:text-lime-400 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className="text-lg font-extrabold truncate">{value}</div>
        <div className="text-[11px] uppercase tracking-wide truncate" style={{ color: "var(--text-muted)" }}>
          {label}
        </div>
      </div>
    </Card>
  );
}
