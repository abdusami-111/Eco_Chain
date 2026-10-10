"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GlassWater,
  Box,
  Wine,
  Cylinder,
  Apple,
  Cpu,
  Upload,
  Camera,
  X,
  ScanLine,
  CheckCircle2,
  QrCode,
  Loader2,
} from "lucide-react";
import { useI18n } from "@/app/providers";
import { api, ApiError } from "@/components/ApiClient";
import { Card, Button, Badge, useToast } from "@/components/ui";
import { MATERIALS } from "@/lib/constants";

const ICONS = {
  PLASTIC: GlassWater,
  PAPER: Box,
  GLASS: Wine,
  ALUMINUM: Cylinder,
  ORGANIC: Apple,
  ELECTRONIC: Cpu,
};

export default function ScanClient() {
  const { t } = useI18n();
  const { push } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [imagePreview, setImagePreview] = useState(null);
  const [phase, setPhase] = useState("select"); // select | classifying | result | done
  const [classification, setClassification] = useState(null);
  const [estimatedKg, setEstimatedKg] = useState(0.5);
  const [stationId, setStationId] = useState("");
  const [eventId, setEventId] = useState(null);
  const [expectedCode, setExpectedCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [verifyPhase, setVerifyPhase] = useState("idle"); // idle | pending | verifying
  const [verifiedEvent, setVerifiedEvent] = useState(null);
  const [error, setError] = useState("");

  const { data: stationsData } = useQuery({
    queryKey: ["stations"],
    queryFn: () => api.get("/api/stations"),
  });

  const stations = (stationsData?.stations ?? []).filter(
    (s) => !classification || s.acceptedMaterials.includes(classification.material)
  );

  useEffect(() => {
    if (stations.length && !stationId) setStationId(stations[0].id);
  }, [stations, stationId]);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setClassification(null);
    setPhase("select");
  }

  function removeImage() {
    setImagePreview(null);
    setClassification(null);
    setPhase("select");
  }

  async function runClassification(material) {
    setPhase("classifying");
    setError("");
    try {
      const [result] = await Promise.all([
        api.post("/api/scan/classify", { material }),
        new Promise((r) => setTimeout(r, 1800)),
      ]);
      setClassification(result);
      setPhase("result");
    } catch (err) {
      setError(err.message);
      setPhase("select");
    }
  }

  async function startVerification() {
    setError("");
    try {
      const result = await api.post("/api/scan/start", {
        material: classification.material,
        estimatedKg: Number(estimatedKg),
        stationId,
        aiConfidence: classification.confidence,
      });
      setEventId(result.eventId);
      setExpectedCode(result.expectedCode);
      setEnteredCode("");
      setVerifyPhase("pending");
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitVerification() {
    setVerifyPhase("verifying");
    setError("");
    try {
      const result = await api.post("/api/scan/verify", { eventId, enteredCode });
      setVerifiedEvent(result.event);
      setPhase("done");
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["auth-me"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      push(`+${result.event.tokensAwarded} ${t("common.tokens")}`, "success");
    } catch (err) {
      setError(err instanceof ApiError ? t(err.message) : err.message);
      setVerifyPhase("pending");
    }
  }

  function resetAll() {
    setImagePreview(null);
    setClassification(null);
    setPhase("select");
    setEstimatedKg(0.5);
    setEventId(null);
    setExpectedCode("");
    setEnteredCode("");
    setVerifyPhase("idle");
    setVerifiedEvent(null);
    setError("");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 fade-in">
      <div className="text-center">
        <Badge tone="amber">{t("scan.demoLabel")}</Badge>
        <h1 className="text-3xl font-extrabold mt-3">{t("scan.title")}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          {t("scan.subtitle")}
        </p>
      </div>

      <Card>
        {/* Viewport */}
        <div className="relative w-full h-72 sm:h-80 rounded-2xl bg-slate-900 overflow-hidden flex items-center justify-center border-2 border-dashed border-slate-700">
          {phase === "done" && verifiedEvent ? (
            <div className="text-center p-6 z-10">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-4 mx-auto shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{t("scan.resultTitle")}</h3>
              <p className="text-lime-400 font-extrabold text-xl mb-6">
                +{verifiedEvent.tokensAwarded} {t("common.tokens")}
              </p>
              <Button onClick={resetAll}>{t("scan.again")}</Button>
            </div>
          ) : phase === "classifying" ? (
            <div className="absolute inset-0">
              {imagePreview && (
                <img src={imagePreview} alt="scanning" className="w-full h-full object-cover opacity-80" />
              )}
              <div className="scanner-laser" />
              <div className="absolute inset-0 bg-eco-900/30 backdrop-blur-[1px]" />
              <div className="absolute bottom-6 left-6 right-6 bg-slate-900/90 p-4 rounded-2xl border border-slate-700 text-white flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-eco-400" />
                <span className="text-sm font-medium">{t("scan.scanning")}</span>
              </div>
            </div>
          ) : imagePreview ? (
            <div className="relative w-full h-full">
              <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
              <button
                onClick={removeImage}
                className="absolute top-3 right-3 bg-black/60 text-white p-2 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center p-6 z-10">
              <div className="w-16 h-16 rounded-2xl bg-eco-800/60 text-lime-400 flex items-center justify-center mx-auto mb-4 border border-eco-600/40">
                <ScanLine className="w-8 h-8" />
              </div>
              <h4 className="text-white font-bold text-base mb-1">{t("scan.selectMaterial")}</h4>
            </div>
          )}
        </div>

        {/* Upload controls */}
        {phase === "select" && !classification && (
          <div className="mt-6 flex flex-wrap gap-3">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFile}
            />
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4" /> Upload
            </Button>
            <Button variant="secondary" onClick={() => cameraInputRef.current?.click()}>
              <Camera className="w-4 h-4" /> Camera
            </Button>
          </div>
        )}

        {/* Material confirmation (always required — demo mode never auto-labels) */}
        {phase === "select" && (
          <div className="mt-6">
            <label className="block text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
              {t("scan.selectMaterial")}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {MATERIALS.map((m) => {
                const Icon = ICONS[m];
                return (
                  <button
                    key={m}
                    onClick={() => runClassification(m)}
                    className="p-4 rounded-2xl border surface hover:border-eco-500 transition text-left flex items-center gap-3"
                    style={{ borderColor: "var(--border-c)" }}
                  >
                    <Icon className="w-5 h-5 text-eco-600" />
                    <span className="text-sm font-bold">{m}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {error && <p className="text-sm text-rose-600 mt-4">{error}</p>}
      </Card>

      {/* Result + verification */}
      {classification && phase !== "done" && (
        <Card className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <Badge tone={classification.recyclable ? "eco" : "rose"}>
                {classification.recyclable ? t("scan.recyclable") : t("scan.notRecyclable")}
              </Badge>
              <h3 className="text-xl font-bold mt-2">{classification.material}</h3>
            </div>
            <div className="text-right">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{t("scan.confidence")}</span>
              <p className="text-lg font-bold text-eco-600">{classification.confidence}%</p>
            </div>
          </div>

          <p className="text-sm surface p-4 rounded-xl">{t(classification.disposalKey)}</p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block">
                {t("common.kg")}
              </label>
              <input
                type="number"
                min="0.05"
                max="25"
                step="0.1"
                value={estimatedKg}
                onChange={(e) => setEstimatedKg(e.target.value)}
                className="w-full border rounded-xl px-3 py-2.5 text-sm bg-transparent"
                style={{ borderColor: "var(--border-c)" }}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block">
                {t("scan.selectStation")}
              </label>
              <select
                value={stationId}
                onChange={(e) => setStationId(e.target.value)}
                className="w-full border rounded-xl px-3 py-2.5 text-sm bg-transparent"
                style={{ borderColor: "var(--border-c)" }}
              >
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {verifyPhase === "idle" && (
            <Button onClick={startVerification} className="w-full" disabled={!stationId}>
              <QrCode className="w-4 h-4" /> {t("scan.verify")}
            </Button>
          )}

          {verifyPhase !== "idle" && (
            <div className="surface rounded-2xl p-4 space-y-3">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t("scan.verifyHint")}</p>
              <div className="flex items-center gap-2 text-xs font-mono bg-slate-900 text-lime-400 px-3 py-2 rounded-xl inline-flex">
                <QrCode className="w-3.5 h-3.5" /> {expectedCode}
              </div>
              <div className="flex gap-2">
                <input
                  value={enteredCode}
                  onChange={(e) => setEnteredCode(e.target.value)}
                  placeholder={expectedCode}
                  className="flex-1 border rounded-xl px-3 py-2.5 text-sm bg-transparent"
                  style={{ borderColor: "var(--border-c)" }}
                />
                <Button variant="secondary" onClick={() => setEnteredCode(expectedCode)}>
                  Scan
                </Button>
              </div>
              <Button
                onClick={submitVerification}
                disabled={!enteredCode || verifyPhase === "verifying"}
                className="w-full"
              >
                {verifyPhase === "verifying" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {t("scan.submit")}
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
