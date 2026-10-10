"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Power } from "lucide-react";
import { api } from "@/components/ApiClient";
import { Card, Button, Badge, Skeleton, useToast } from "@/components/ui";
import { useCurrentUser } from "@/components/useCurrentUser";

export default function UsersTab() {
  const { push } = useToast();
  const queryClient = useQueryClient();
  const { data: me } = useCurrentUser();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api.get("/api/admin/users"),
  });

  async function toggleActive(user) {
    try {
      await api.patch(`/api/admin/users/${user.id}`, { isActive: !user.isActive });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      push("Updated", "success");
    } catch (err) {
      push(err.message, "error");
    }
  }

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <Card className="!p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-white/5 border-b text-xs uppercase font-semibold" style={{ borderColor: "var(--border-c)", color: "var(--text-muted)" }}>
              <th className="py-3 px-5">Name</th>
              <th className="py-3 px-5">Email</th>
              <th className="py-3 px-5">Role</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm" style={{ borderColor: "var(--border-c)" }}>
            {(data?.users ?? []).map((u) => (
              <tr key={u.id}>
                <td className="py-3 px-5 font-semibold">{u.name}</td>
                <td className="py-3 px-5">{u.email}</td>
                <td className="py-3 px-5"><Badge tone="slate">{u.role}</Badge></td>
                <td className="py-3 px-5">
                  <Badge tone={u.isActive ? "eco" : "rose"}>{u.isActive ? "Active" : "Suspended"}</Badge>
                </td>
                <td className="py-3 px-5 text-right">
                  {u.id !== me?.user?.id && (
                    <Button variant="secondary" onClick={() => toggleActive(u)}>
                      <Power className="w-3.5 h-3.5" /> {u.isActive ? "Suspend" : "Reactivate"}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
