"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, MapPin, Power } from "lucide-react";
import { api, ApiError } from "@/components/ApiClient";
import { Card, Button, Badge, Skeleton, useToast } from "@/components/ui";
import { MATERIALS } from "@/lib/constants";

const EMPTY = {
  name: "",
  address: "",
  district: "",
  lat: "41.3",
  lng: "69.25",
  openingHours: "08:00 - 22:00",
  qrCode: "",
  acceptedMaterials: [],
};

export default function StationsTab() {
  const { push } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-stations"],
    queryFn: () => api.get("/api/admin/stations"),
  });

  function toggleMaterial(m) {
    setForm((f) => ({
      ...f,
      acceptedMaterials: f.acceptedMaterials.includes(m)
        ? f.acceptedMaterials.filter((x) => x !== m)
        : [...f.acceptedMaterials, m],
    }));
  }

  async function createStation(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/api/admin/stations", {
        ...form,
        lat: Number(form.lat),
        lng: Number(form.lng),
      });
      queryClient.invalidateQueries({ queryKey: ["admin-stations"] });
      queryClient.invalidateQueries({ queryKey: ["stations"] });
      setForm(EMPTY);
      setShowForm(false);
      push("Station created", "success");
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Error", "error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(station) {
    try {
      await api.patch(`/api/admin/stations/${station.id}`, { isActive: !station.isActive });
      queryClient.invalidateQueries({ queryKey: ["admin-stations"] });
      queryClient.invalidateQueries({ queryKey: ["stations"] });
    } catch (err) {
      push(err.message, "error");
    }
  }

  return (
    <div className="space-y-6">
      <Button onClick={() => setShowForm((s) => !s)}>
        <Plus className="w-4 h-4" /> Add Station
      </Button>

      {showForm && (
        <Card>
          <form onSubmit={createStation} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <input required placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="border rounded-xl px-3 py-2.5 text-sm bg-transparent" style={{ borderColor: "var(--border-c)" }} />
              <input required placeholder="District" value={form.district} onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))} className="border rounded-xl px-3 py-2.5 text-sm bg-transparent" style={{ borderColor: "var(--border-c)" }} />
              <input required placeholder="Address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="border rounded-xl px-3 py-2.5 text-sm bg-transparent sm:col-span-2" style={{ borderColor: "var(--border-c)" }} />
              <input required placeholder="Lat" value={form.lat} onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))} className="border rounded-xl px-3 py-2.5 text-sm bg-transparent" style={{ borderColor: "var(--border-c)" }} />
              <input required placeholder="Lng" value={form.lng} onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))} className="border rounded-xl px-3 py-2.5 text-sm bg-transparent" style={{ borderColor: "var(--border-c)" }} />
              <input required placeholder="Opening hours" value={form.openingHours} onChange={(e) => setForm((f) => ({ ...f, openingHours: e.target.value }))} className="border rounded-xl px-3 py-2.5 text-sm bg-transparent" style={{ borderColor: "var(--border-c)" }} />
              <input required placeholder="QR Code (e.g. ECO-STN-006)" value={form.qrCode} onChange={(e) => setForm((f) => ({ ...f, qrCode: e.target.value }))} className="border rounded-xl px-3 py-2.5 text-sm bg-transparent" style={{ borderColor: "var(--border-c)" }} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider mb-2 block">Accepted Materials</label>
              <div className="flex flex-wrap gap-2">
                {MATERIALS.map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => toggleMaterial(m)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                      form.acceptedMaterials.includes(m) ? "bg-eco-600 text-white" : "surface"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={saving || form.acceptedMaterials.length === 0}>
              Save Station
            </Button>
          </form>
        </Card>
      )}

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="space-y-3">
          {(data?.stations ?? []).map((s) => (
            <Card key={s.id} className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h4 className="font-bold text-sm flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-eco-600" /> {s.name}
                </h4>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{s.address} • {s.district}</p>
                <div className="flex gap-1 flex-wrap mt-2">
                  {s.acceptedMaterials.map((m) => <Badge key={m} tone="slate">{m}</Badge>)}
                </div>
              </div>
              <Button variant={s.isActive ? "secondary" : "primary"} onClick={() => toggleActive(s)}>
                <Power className="w-4 h-4" /> {s.isActive ? "Deactivate" : "Activate"}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
