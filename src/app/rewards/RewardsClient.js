"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Coins, Ticket, Gift } from "lucide-react";
import { useI18n } from "@/app/providers";
import { api, ApiError } from "@/components/ApiClient";
import { Card, Button, Badge, Skeleton, EmptyState, useToast } from "@/components/ui";

const CATEGORIES = ["all", "food", "entertainment", "eco-products", "grocery", "mobility", "donation"];

export default function RewardsClient() {
  const { t } = useI18n();
  const { push } = useToast();
  const queryClient = useQueryClient();
  const [category, setCategory] = useState("all");
  const [tab, setTab] = useState("store");
  const [redeemingId, setRedeemingId] = useState(null);

  const { data: walletData } = useQuery({
    queryKey: ["wallet-balance"],
    queryFn: () => api.get("/api/wallet"),
  });

  const { data: rewardsData, isLoading } = useQuery({
    queryKey: ["rewards", category],
    queryFn: () => api.get(`/api/rewards?category=${category}`),
  });

  const { data: redemptionsData } = useQuery({
    queryKey: ["redemptions"],
    queryFn: () => api.get("/api/redemptions"),
    enabled: tab === "mine",
  });

  async function redeem(reward) {
    setRedeemingId(reward.id);
    try {
      await api.post(`/api/rewards/${reward.id}/redeem`);
      push(t("rewards.redeemSuccess"), "success");
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["redemptions"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    } catch (err) {
      push(err instanceof ApiError ? t(err.message) : err.message, "error");
    } finally {
      setRedeemingId(null);
    }
  }

  const balance = walletData?.balance ?? 0;

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">{t("rewards.title")}</h1>
        </div>
        <div className="bg-eco-50 dark:bg-eco-900/40 border border-eco-200 dark:border-eco-800 px-4 py-2.5 rounded-2xl flex items-center gap-2">
          <Coins className="w-5 h-5 text-eco-600 dark:text-lime-400" />
          <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{t("rewards.balance")}:</span>
          <span className="text-base font-bold">{balance}</span>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("store")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === "store" ? "bg-eco-600 text-white" : "text-slate-500"}`}
        >
          {t("rewards.title")}
        </button>
        <button
          onClick={() => setTab("mine")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === "mine" ? "bg-eco-600 text-white" : "text-slate-500"}`}
        >
          {t("rewards.myRedemptions")}
        </button>
      </div>

      {tab === "store" ? (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  category === c ? "bg-eco-600 text-white" : "surface"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-72" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(rewardsData?.rewards ?? []).map((r) => (
                <Card key={r.id} className="!p-0 overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="relative h-44 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.imageUrl} alt={r.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">
                        {r.tokenCost} {t("common.tokens")}
                      </div>
                    </div>
                    <div className="p-6">
                      <span className="text-[10px] font-bold text-eco-600 uppercase tracking-widest">{r.partnerName}</span>
                      <h3 className="text-lg font-bold mt-1 mb-1">{r.title}</h3>
                      <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>{r.description}</p>
                      {r.isDemo && <Badge tone="amber">{t("rewards.demoVoucher")}</Badge>}
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <Button
                      className="w-full"
                      disabled={balance < r.tokenCost || redeemingId === r.id}
                      onClick={() => redeem(r)}
                    >
                      <Ticket className="w-4 h-4" />
                      {t("rewards.redeem")} ({r.tokenCost})
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <Card>
          {(redemptionsData?.redemptions ?? []).length === 0 ? (
            <EmptyState icon={Gift} title="—" />
          ) : (
            <div className="space-y-3">
              {redemptionsData.redemptions.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-4 rounded-2xl surface">
                  <div>
                    <h4 className="text-sm font-bold">{r.reward.title}</h4>
                    <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{r.couponCode}</p>
                  </div>
                  <Badge tone={r.status === "ACTIVE" ? "eco" : "slate"}>{r.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
