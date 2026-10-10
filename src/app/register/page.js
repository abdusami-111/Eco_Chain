"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, Mail, Lock, User as UserIcon, MapPin, UserPlus } from "lucide-react";
import { useI18n } from "@/app/providers";
import { api, ApiError } from "@/components/ApiClient";
import { Button } from "@/components/ui";

export default function RegisterPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", district: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/api/auth/register", form);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? t(err.message) : "Error");
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { key: "name", label: "auth.name", icon: UserIcon, type: "text" },
    { key: "email", label: "auth.email", icon: Mail, type: "email" },
    { key: "password", label: "auth.password", icon: Lock, type: "password" },
    { key: "district", label: "auth.district", icon: MapPin, type: "text" },
  ];

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
          <h1 className="text-xl font-bold mb-6">{t("auth.register")}</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block">
                  {t(f.label)}
                </label>
                <div className="flex items-center gap-2 border rounded-2xl px-3 py-2.5" style={{ borderColor: "var(--border-c)" }}>
                  <f.icon className="w-4 h-4 opacity-50" />
                  <input
                    type={f.type}
                    required={f.key !== "district"}
                    value={form[f.key]}
                    onChange={update(f.key)}
                    className="bg-transparent outline-none flex-1 text-sm"
                  />
                </div>
              </div>
            ))}

            {error && <p className="text-sm text-rose-600">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full">
              <UserPlus className="w-4 h-4" />
              {t("auth.registerCta")}
            </Button>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: "var(--text-muted)" }}>
            {t("auth.haveAccount")}{" "}
            <Link href="/login" className="text-eco-700 dark:text-lime-400 font-semibold">
              {t("auth.login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
