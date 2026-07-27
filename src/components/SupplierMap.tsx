import { useEffect, useState } from "react";
import type { Part } from "../lib/types";
import { formatFCFA } from "../lib/utils";
import "leaflet/dist/leaflet.css";

/* ── Coordonnées réelles des zones de Dakar ──────────── */

export const ZONE_COORDS: Record<string, [number, number]> = {
  Colobane: [14.678, -17.4417],
  "Castors (AutoPieces Castors)": [14.69, -17.45],
  "Thiaroye Gare (Garage & Pièces Mbacké)": [14.7333, -17.3667],
  "Grand Yoff (Dakar Batterie Plus)": [14.7, -17.4667],
  "Marché HLM": [14.676, -17.44],
  "Pikine Icotaf (Sénégal Auto Négoce)": [14.75, -17.3833],
  "Diamniadio (Pièces Express)": [14.7167, -17.2],
  "Médina (Garage Modou Fall)": [14.678, -17.45],
  "Ouakam (Auto Pièces Ouakam)": [14.7167, -17.4833],
  "Sacré-Cœur (Éts NDIAYE)": [14.7, -17.45],
  "Mermoz (Pièces Auto Mermoz)": [14.7167, -17.4667],
  "HLM (Grand Garage Sénégal)": [14.676, -17.44],
};

export function getCoords(zone: string): [number, number] {
  for (const [key, coord] of Object.entries(ZONE_COORDS)) {
    if (zone.includes(key)) return coord;
  }
  return [14.7, -17.45]; // fallback centre Dakar
}

/* ── Client‑only wrapper ────────────────────────────── */

export default function SupplierMap({
  parts,
  onZoneClick,
}: {
  parts: Part[];
  onZoneClick?: (zone: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
        Chargement de la carte…
      </div>
    );
  }

  return <SupplierMapClient parts={parts} onZoneClick={onZoneClick} />;
}

/* ── Client component that lazy‑imports react‑leaflet ── */

function SupplierMapClient({
  parts,
  onZoneClick,
}: {
  parts: Part[];
  onZoneClick?: (zone: string) => void;
}) {
  const [RL, setRL] = useState<{
    MapContainer: React.FC<any>;
    TileLayer: React.FC<any>;
    Marker: React.FC<any>;
    Popup: React.FC<any>;
  } | null>(null);

  const [L, setL] = useState<{
    divIcon: (options: any) => any;
    Icon: any;
  } | null>(null);

  useEffect(() => {
    Promise.all([import("react-leaflet"), import("leaflet")]).then(
      ([rlMod, lMod]) => {
        const leaflet = lMod.default ?? lMod;
        setRL({
          MapContainer: rlMod.MapContainer,
          TileLayer: rlMod.TileLayer,
          Marker: rlMod.Marker,
          Popup: rlMod.Popup,
        });
        setL({
          divIcon: leaflet.divIcon.bind(leaflet),
          Icon: leaflet.Icon,
        });
      },
    );
  }, []);

  if (!RL || !L) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
        Initialisation de la carte…
      </div>
    );
  }

  /* Group parts by zone */
  const zoneGroups = new Map<string, Part[]>();
  for (const p of parts) {
    const existing = zoneGroups.get(p.zone) ?? [];
    existing.push(p);
    zoneGroups.set(p.zone, existing);
  }

  const markers = Array.from(zoneGroups.entries()).map(([zone, zoneParts]) => {
    const coord = getCoords(zone);
    const available = zoneParts.some((p) => p.available);
    const total = zoneParts.length;
    const cheapest = Math.min(...zoneParts.map((p) => p.price));
    return { zone, coord, available, total, cheapest, parts: zoneParts };
  });

  const { MapContainer: MapC, TileLayer, Marker, Popup } = RL;
  const { divIcon } = L;

  return (
    <div className="relative h-80 w-full overflow-hidden rounded-xl border border-border shadow-sm sm:h-96 dark:border-brand/10">
      <MapC center={[14.7, -17.45]} zoom={12} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Siège AutoForge */}
        <Marker
          position={[14.7, -17.45]}
          icon={divIcon({
            className: "",
            html: `<div style="background:#1565C0;color:white;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.3)">📍 AutoForge</div>`,
            iconSize: [0, 0],
            iconAnchor: [40, 20],
          })}
        >
          <Popup>
            <div className="font-semibold text-sm">AutoForge — Siège</div>
            <div className="text-xs text-muted-foreground">Zone Industrielle, Diamniadio</div>
          </Popup>
        </Marker>

        {/* Marqueurs par zone */}
        {markers.map((m) => (
          <Marker
            key={m.zone}
            position={m.coord}
            icon={divIcon({
              className: "",
              html: `<div style="background:${m.available ? "#16A34A" : "#DC2626"};color:white;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.3)">${m.total} pièce${m.total > 1 ? "s" : ""}</div>`,
              iconSize: [0, 0],
              iconAnchor: [35, 16],
            })}
          >
            <Popup>
              <div className="font-semibold text-sm">{m.zone}</div>
              <div className="mt-1 space-y-1">
                <div className="text-xs">
                  <span className={m.available ? "text-green-600" : "text-red-600"}>
                    ● {m.available ? "Disponible" : "Rupture"}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {m.total} pièce{m.total > 1 ? "s" : ""} · À partir de {formatFCFA(m.cheapest)}
                </div>
              </div>
              <button
                onClick={() => onZoneClick?.(m.zone)}
                className="mt-2 w-full rounded bg-brand px-2 py-1 text-xs font-medium text-white hover:opacity-90"
              >
                Voir les pièces
              </button>
              <a
                href={`/fournisseurs?zone=${encodeURIComponent(m.zone)}`}
                className="mt-1 block w-full rounded border border-brand bg-white px-2 py-1 text-center text-xs font-medium text-brand hover:bg-brand/5"
              >
                🏪 Détail fournisseur →
              </a>
            </Popup>
          </Marker>
        ))}
      </MapC>
    </div>
  );
}
