"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Coins, TrendingUp, TrendingDown, ArrowDownCircle, ArrowUpCircle, ShieldCheck } from "lucide-react";
import { useI18n } from "@/app/providers";
import { api } from "@/components/ApiClient";
import { Card, StatCard, Skeleton, EmptyState, Button } from "@/components/ui";

export default function WalletClient() {
  const { t, lang } = useI18n();
  const [direction, setDirection] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["wallet", direction, page],
    queryFn: () => api.get(`/api/wallet?${direction ? `direction=${direction}&` : ""}page=${page}`),
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const filters = [
    { key: "", label: t("wallet.filterAll") },
    { key: "CREDIT", label: t("wallet.filterCredit") },
    { key: "DEBIT", label: t("wallet.filterDebit") },
  ];

  return (
    <div className="space-y-8 fade-in max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold">{t("wallet.title")}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard icon={Coins} label={t("wallet.balance")} value={data.balance} accent="amber" />
        <StatCard icon={TrendingUp} label={t("wallet.earned")} value={data.totalEarned} accent="eco" />
        <StatCard icon={TrendingDown} label={t("wallet.spent")} value={data.totalSpent} accent="sky" />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="text-lg font-bold">{t("wallet.history")}</h2>
          <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => {
                  setDirection(f.key);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  direction === f.key ? "bg-eco-600 text-white" : "text-slate-500"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {data.transactions.length === 0 ? (
          <EmptyState icon={Coins} title="—" />
        ) : (
          <div className="space-y-3">
            {data.transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl surface">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.direction === "CREDIT"
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
                        : "bg-rose-50 text-rose-600 dark:bg-rose-500/10"
                    }`}
                  >
                    {tx.direction === "CREDIT" ? (
                      <ArrowDownCircle className="w-5 h-5" />
                    ) : (
                      <ArrowUpCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{tx.description}</h4>
                    <p className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                      {new Date(tx.createdAt).toLocaleString(lang)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-sm font-bold ${
                      tx.direction === "CREDIT" ? "text-eco-600" : "text-rose-600"
                    }`}
                  >
                    {tx.direction === "CREDIT" ? "+" : "-"}
                    {tx.amount}
                  </span>
                  <span
                    className="block text-[10px] font-mono flex items-center gap-1 justify-end"
                    style={{ color: "var(--text-muted)" }}
                    title={tx.integrityHash}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    {tx.integrityHash.slice(0, 10)}...
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {data.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              ←
            </Button>
            <span className="px-3 py-2 text-sm">
              {page} / {data.totalPages}
            </span>
            <Button variant="secondary" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
              →
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
