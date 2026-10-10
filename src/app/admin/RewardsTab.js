"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Power } from "lucide-react";
import { api, ApiError } from "@/components/ApiClient";
import { Card, Button, Badge, Skeleton, useToast } from "@/components/ui";

const EMPTY = {
  category: "food",
  partnerName: "",
  title: "",
  description: "",
  imageUrl: "",
  tokenCost: 50,
};

export default function RewardsTab() {
  const { push } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-rewards"],
    queryFn: () => api.get("/api/admin/rewards"),
  });

  async function createReward(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/api/admin/rewards", { ...form, tokenCost: Number(form.tokenCost) });
      queryClient.invalidateQueries({ queryKey: ["admin-rewards"] });
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      setForm(EMPTY);
      setShowForm(false);
      push("Reward created", "success");
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Error", "error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(reward) {
    try {
      await api.patch(`/api/admin/rewards/${reward.id}`, { isActive: !reward.isActive });
      queryClient.invalidateQueries({ queryKey: ["admin-rewards"] });
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
    } catch (err) {
      push(err.message, "error");
    }
  }

  return (
    <div className="space-y-6">
      <Button onClick={() => setShowForm((s) => !s)}>
        <Plus className="w-4 h-4" /> Add Reward
      </Button>

      {showForm && (
        <Card>
          <form onSubmit={createReward} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <input required placeholder="Category (food, entertainment, ...)" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="border rounded-xl px-3 py-2.5 text-sm bg-transparent" style={{ borderColor: "var(--border-c)" }} />
              <input required placeholder="Partner name" value={form.partnerName} onChange={(e) => setForm((f) => ({ ...f, partnerName: e.target.value }))} className="border rounded-xl px-3 py-2.5 text-sm bg-transparent" style={{ borderColor: "var(--border-c)" }} />
              <input required placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="border rounded-xl px-3 py-2.5 text-sm bg-transparent sm:col-span-2" style={{ borderColor: "var(--border-c)" }} />
              <input required placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} className="border rounded-xl px-3 py-2.5 text-sm bg-transparent sm:col-span-2" style={{ borderColor: "var(--border-c)" }} />
              <input required type="number" placeholder="Token cost" value={form.tokenCost} onChange={(e) => setForm((f) => ({ ...f, tokenCost: e.target.value }))} className="border rounded-xl px-3 py-2.5 text-sm bg-transparent" style={{ borderColor: "var(--border-c)" }} />
            </div>
            <textarea required placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full border rounded-xl px-3 py-2.5 text-sm bg-transparent" style={{ borderColor: "var(--border-c)" }} />
            <Button type="submit" disabled={saving}>Save Reward</Button>
          </form>
        </Card>
      )}

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="space-y-3">
          {(data?.rewards ?? []).map((r) => (
            <Card key={r.id} className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h4 className="font-bold text-sm">{r.title}</h4>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{r.partnerName} • {r.tokenCost} tokens</p>
                <Badge tone={r.isActive ? "eco" : "slate"}>{r.isActive ? "Active" : "Inactive"}</Badge>
              </div>
              <Button variant={r.isActive ? "secondary" : "primary"} onClick={() => toggleActive(r)}>
                <Power className="w-4 h-4" /> {r.isActive ? "Deactivate" : "Activate"}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
