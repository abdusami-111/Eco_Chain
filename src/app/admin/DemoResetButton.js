"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { RotateCcw, Loader2 } from "lucide-react";
import { api } from "@/components/ApiClient";
import { Button, useToast } from "@/components/ui";

export default function DemoResetButton() {
  const { push } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function reset() {
    if (!confirm("Reset all demo data? You will be logged out and need to log in again.")) return;
    setLoading(true);
    try {
      await api.post("/api/admin/demo-reset");
      push("Demo data reset. Please log in again.", "success");
      queryClient.clear();
      setTimeout(() => router.push("/login"), 800);
    } catch (err) {
      push(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="secondary" onClick={reset} disabled={loading}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
      Reset Demo Data
    </Button>
  );
}
