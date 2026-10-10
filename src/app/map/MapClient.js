"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Navigation, Clock, Search } from "lucide-react";
import { useI18n } from "@/app/providers";
import { api } from "@/components/ApiClient";
import { Card, Badge, Button, Skeleton } from "@/components/ui";
import { MATERIALS } from "@/lib/constants";
import "leaflet/dist/leaflet.css";

const StationMap = dynamic(() => import("./StationMap"), { ssr: false });

function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export default function MapClient() {
  const { t } = useI18n();
  const [materialFilter, setMaterialFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [geoError, setGeoError] = useState("");
  const [selected, setSelected] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["stations"],
    queryFn: () => api.get("/api/stations"),
  });

  const stations = data?.stations ?? [];

  const filtered = useMemo(() => {
    let list = stations.filter((s) =>
      materialFilter === "all" ? true : s.acceptedMaterials.includes(materialFilter)
    );
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || s.district.toLowerCase().includes(q) || s.address.toLowerCase().includes(q)
      );
    }
    if (userLocation) {
      list = list
        .map((s) => ({ ...s, distanceKm: haversineKm(userLocation, [s.lat, s.lng]) }))
        .sort((a, b) => a.distanceKm - b.distanceKm);
    }
    return list;
  }, [stations, materialFilter, search, userLocation]);

  function findNearby() {
    setGeoError("");
    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => setGeoError("Location permission denied")
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold">{t("map.title")}</h1>
        <Button onClick={findNearby} variant="secondary">
          <Navigation className="w-4 h-4" /> {t("map.findNearby")}
        </Button>
      </div>

      {geoError && <p className="text-sm text-rose-600">{geoError}</p>}

      <Badge tone="amber">{t("map.demoLocations")}</Badge>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 border rounded-xl px-3 py-2 flex-1 min-w-[200px]" style={{ borderColor: "var(--border-c)" }}>
          <Search className="w-4 h-4 opacity-50" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("common.search") || "Search"}
            className="bg-transparent outline-none flex-1 text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setMaterialFilter("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
              materialFilter === "all" ? "bg-eco-600 text-white" : "surface"
            }`}
          >
            All
          </button>
          {MATERIALS.map((m) => (
            <button
              key={m}
              onClick={() => setMaterialFilter(m)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                materialFilter === m ? "bg-eco-600 text-white" : "surface"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 !p-0 h-[480px] overflow-hidden">
          {isLoading ? (
            <Skeleton className="h-full" />
          ) : (
            <StationMap stations={filtered} userLocation={userLocation} onSelect={setSelected} />
          )}
        </Card>

        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
          {filtered.map((s) => (
            <Card
              key={s.id}
              className={`cursor-pointer transition ${selected?.id === s.id ? "ring-2 ring-eco-500" : ""}`}
              onClick={() => setSelected(s)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-eco-600" /> {s.name}
                  </h4>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{s.address}</p>
                  <p className="text-xs flex items-center gap-1 mt-1" style={{ color: "var(--text-muted)" }}>
                    <Clock className="w-3 h-3" /> {s.openingHours}
                  </p>
                  <div className="flex gap-1 flex-wrap mt-2">
                    {s.acceptedMaterials.map((m) => (
                      <Badge key={m} tone="slate">{m}</Badge>
                    ))}
                  </div>
                </div>
                {s.distanceKm !== undefined && (
                  <span className="text-xs font-bold text-eco-600 whitespace-nowrap">
                    {s.distanceKm.toFixed(1)} km
                  </span>
                )}
              </div>
              <a
                href={`https://www.openstreetmap.org/directions?from=&to=${s.lat},${s.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-eco-700 dark:text-lime-400 mt-3 inline-block"
                onClick={(e) => e.stopPropagation()}
              >
                Directions →
              </a>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
