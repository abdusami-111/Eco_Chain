"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export function Card({ children, className = "" }) {
  return (
    <div className={`glass-card rounded-3xl p-6 shadow-sm ${className}`}>{children}</div>
  );
}

export function StatCard({ icon: Icon, label, value, accent = "eco", tag }) {
  const accents = {
    eco: "bg-eco-100 text-eco-700 dark:bg-eco-900/50 dark:text-lime-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    sky: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  };
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${accents[accent]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {tag && (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-2.5 py-1 rounded-full">
            {tag}
          </span>
        )}
      </div>
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
      <h3 className="text-3xl font-extrabold mt-1">{value}</h3>
    </Card>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-eco-700 hover:bg-eco-800 text-white",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white",
    danger: "bg-rose-600 hover:bg-rose-700 text-white",
    ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-white/5",
  };
  return (
    <button
      className={`px-4 py-2.5 rounded-2xl font-semibold text-sm transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-slate-200 dark:bg-white/10 rounded-xl ${className}`} />;
}

export function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="text-center py-12">
      {Icon && <Icon className="w-10 h-10 mx-auto mb-3 opacity-40" />}
      <p className="font-semibold">{title}</p>
      {subtitle && <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{subtitle}</p>}
    </div>
  );
}

export function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
    eco: "bg-eco-100 text-eco-700 dark:bg-eco-900/50 dark:text-lime-400",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    rose: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${tones[tone]}`}>
      {children}
    </span>
  );
}

// --- Toast system ---
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2 w-[calc(100%-2rem)] sm:w-96">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="glass-card rounded-2xl p-4 shadow-lg flex items-start gap-3 fade-in"
          >
            {t.type === "error" ? (
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            )}
            <p className="text-sm flex-1">{t.message}</p>
            <button onClick={() => dismiss(t.id)}>
              <X className="w-4 h-4 opacity-50" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
