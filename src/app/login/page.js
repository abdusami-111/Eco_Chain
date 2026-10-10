"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, Mail, Lock, LogIn } from "lucide-react";
import { useI18n } from "@/app/providers";
import { api, ApiError } from "@/components/ApiClient";
import { Button } from "@/components/ui";

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState("demo@ecochain.uz");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/api/auth/login", { email, password });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? t(err.message) : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-eco-700 to-lime-500 flex items-center justify-center text-white shadow-md">
            <Leaf className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold">{t("app.name")}</span>
        </div>

        <div className="glass-card rounded-3xl p-8 shadow-lg">
          <h1 className="text-xl font-bold mb-1">{t("auth.login")}</h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            {t("auth.demoHint")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block">
                {t("auth.email")}
              </label>
              <div className="flex items-center gap-2 border rounded-2xl px-3 py-2.5" style={{ borderColor: "var(--border-c)" }}>
                <Mail className="w-4 h-4 opacity-50" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent outline-none flex-1 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block">
                {t("auth.password")}
              </label>
              <div className="flex items-center gap-2 border rounded-2xl px-3 py-2.5" style={{ borderColor: "var(--border-c)" }}>
                <Lock className="w-4 h-4 opacity-50" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent outline-none flex-1 text-sm"
                />
              </div>
            </div>

            {error && <p className="text-sm text-rose-600">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full">
              <LogIn className="w-4 h-4" />
              {t("auth.loginCta")}
            </Button>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: "var(--text-muted)" }}>
            {t("auth.noAccount")}{" "}
            <Link href="/register" className="text-eco-700 dark:text-lime-400 font-semibold">
              {t("auth.register")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
