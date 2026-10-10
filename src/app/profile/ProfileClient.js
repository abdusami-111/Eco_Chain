"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Award, Save } from "lucide-react";
import { useI18n } from "@/app/providers";
import { api, ApiError } from "@/components/ApiClient";
import { Card, Button, Badge, EmptyState, useToast } from "@/components/ui";
import { useCurrentUser } from "@/components/useCurrentUser";

export default function ProfileClient() {
  const { t } = useI18n();
  const { push } = useToast();
  const queryClient = useQueryClient();
  const { data: me } = useCurrentUser();

  const [form, setForm] = useState({ name: "", district: "", avatarUrl: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (me?.user) {
      setForm({
        name: me.user.name || "",
        district: me.user.district || "",
        avatarUrl: me.user.avatarUrl || "",
      });
    }
  }, [me?.user]);

  const { data: summary } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => api.get("/api/dashboard/summary"),
  });

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/api/profile", form);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      push(t("profile.save"), "success");
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Error", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8 fade-in max-w-3xl mx-auto">
      <h1 className="text-3xl font-extrabold">{t("profile.title")}</h1>

      <Card>
        <form onSubmit={save} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-eco-600 text-white flex items-center justify-center font-bold text-xl overflow-hidden">
              {form.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                form.name?.[0]?.toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block">Avatar URL</label>
              <input
                value={form.avatarUrl}
                onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
                placeholder="https://..."
                className="w-full border rounded-xl px-3 py-2.5 text-sm bg-transparent"
                style={{ borderColor: "var(--border-c)" }}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block">{t("auth.name")}</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border rounded-xl px-3 py-2.5 text-sm bg-transparent"
              style={{ borderColor: "var(--border-c)" }}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block">{t("auth.district")}</label>
            <input
              value={form.district}
              onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
              className="w-full border rounded-xl px-3 py-2.5 text-sm bg-transparent"
              style={{ borderColor: "var(--border-c)" }}
            />
          </div>

          <Button type="submit" disabled={saving}>
            <Save className="w-4 h-4" /> {t("profile.save")}
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-eco-600" /> {t("profile.achievements")}
        </h2>
        {(summary?.achievements ?? []).length === 0 ? (
          <EmptyState icon={Award} title="—" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {summary.achievements.map((a) => (
              <Badge key={a.id} tone="eco">
                {a.achievement.title}
              </Badge>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
