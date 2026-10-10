"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Target, Users, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/app/providers";
import { api, ApiError } from "@/components/ApiClient";
import { Card, Button, Badge, Skeleton, EmptyState, useToast } from "@/components/ui";

export default function ChallengesClient() {
  const { t } = useI18n();
  const { push } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["challenges"],
    queryFn: () => api.get("/api/challenges"),
  });

  async function join(id) {
    try {
      await api.post(`/api/challenges/${id}/join`);
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      push(t("challenges.join") + " ✓", "success");
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Error", "error");
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }

  const challenges = data?.challenges ?? [];

  return (
    <div className="space-y-8 fade-in">
      <h1 className="text-3xl font-extrabold">{t("challenges.title")}</h1>

      {challenges.length === 0 ? (
        <EmptyState icon={Target} title="—" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {challenges.map((c) => {
            const progress = c.myParticipation?.progress ?? 0;
            const pct = Math.min(100, Math.round((progress / c.goalValue) * 100));
            const completed = c.myParticipation?.isCompleted;

            return (
              <Card key={c.id}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {c.isCommunity && <Badge tone="amber"><Users className="w-3 h-3 inline mr-1" />Community</Badge>}
                    <Badge tone="slate">{c.period}</Badge>
                  </div>
                  <span className="text-xs font-bold text-eco-600">+{c.rewardTokens} {t("common.tokens")}</span>
                </div>
                <h3 className="text-lg font-bold mb-1">{c.title}</h3>
                <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>{c.description}</p>

                {c.myParticipation ? (
                  <>
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden mb-2">
                      <div className="h-full bg-eco-600 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-muted)" }}>
                      <span>{t("challenges.progress")}: {Math.round(progress * 100) / 100} / {c.goalValue}</span>
                      {completed && (
                        <span className="text-eco-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {t("challenges.completed")}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <Button onClick={() => join(c.id)} variant="secondary" className="w-full">
                    {t("challenges.join")}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
