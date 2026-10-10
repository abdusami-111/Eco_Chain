"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Ban } from "lucide-react";
import { api } from "@/components/ApiClient";
import { Card, Button, Badge, Skeleton, useToast } from "@/components/ui";

export default function EventsTab() {
  const { push } = useToast();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-events", status],
    queryFn: () => api.get(`/api/admin/events${status ? `?status=${status}` : ""}`),
  });

  async function reject(id) {
    if (!confirm("Flag this event as fraudulent and reverse its reward if any tokens remain?")) return;
    try {
      await api.post(`/api/admin/events/${id}/reject`);
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      push("Event rejected", "success");
    } catch (err) {
      push(err.message, "error");
    }
  }

  const toneForStatus = { VERIFIED: "eco", PENDING: "amber", REJECTED: "rose" };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1 w-fit">
          {["", "VERIFIED", "PENDING", "REJECTED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${status === s ? "bg-eco-600 text-white" : "text-slate-500"}`}
            >
              {s || "All"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <a href="/api/admin/export?type=events">
            <Button variant="secondary"><Download className="w-4 h-4" /> Export Events</Button>
          </a>
          <a href="/api/admin/export?type=transactions">
            <Button variant="secondary"><Download className="w-4 h-4" /> Export Transactions</Button>
          </a>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="space-y-3">
          {(data?.events ?? []).map((e) => (
            <Card key={e.id} className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h4 className="font-bold text-sm">{e.estimatedKg}kg {e.material} — {e.station.name}</h4>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{e.user.email} • {new Date(e.createdAt).toLocaleString()}</p>
                <Badge tone={toneForStatus[e.status]}>{e.status}</Badge>
              </div>
              {e.status === "VERIFIED" && (
                <Button variant="danger" onClick={() => reject(e.id)}>
                  <Ban className="w-4 h-4" /> Flag as fraudulent
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
