import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useReveal } from "../lib/useReveal";
import type { Part } from "../lib/types";
import { formatFCFA } from "../lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/fournisseurs")({
  validateSearch: (search: Record<string, unknown>) => ({
    zone: typeof search.zone === "string" ? search.zone : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Fournisseurs partenaires — AutoForge Dakar" },
      {
        name: "description",
        content:
          "Découvrez les fournisseurs partenaires AutoForge à Dakar : pièces disponibles, contacts WhatsApp, localisation.",
      },
      { property: "og:title", content: "Fournisseurs AutoForge — Dakar" },
      {
        property: "og:description",
        content: "Consultez les stocks et coordonnées de nos fournisseurs partenaires à Dakar.",
      },
    ],
  }),
  component: FournisseursPage,
});

/* ── Les mêmes 36 pièces que le catalogue ── */
const PARTS: Part[] = [
  { name: "Jeu de plaquettes de frein avant (Toyota Corolla 2010)", zone: "Colobane", price: 15000, available: true, brand: "Toyota", category: "Freinage", phone: "+221778001001", ref: "P-FR-001" },
  { name: "Kit de plaquettes de frein arrière (Peugeot 307)", zone: "Castors (AutoPieces Castors)", price: 18500, available: true, brand: "Peugeot", category: "Freinage", phone: "+221778001002", ref: "P-FR-002" },
  { name: "Disques de frein avant ventilés (Hyundai Tucson 2015)", zone: "Thiaroye Gare (Garage & Pièces Mbacké)", price: 32000, available: false, brand: "Hyundai", category: "Freinage", phone: "+221778001003", ref: "P-FR-003" },
  { name: "Tambours de frein arrière (Nissan Qashqai)", zone: "Médina (Garage Modou Fall)", price: 28000, available: true, brand: "Nissan", category: "Freinage", phone: "+221778001004", ref: "P-FR-004" },
  { name: "Mâchoires de frein à main (Mitsubishi L200)", zone: "Pikine Icotaf (Sénégal Auto Négoce)", price: 12000, available: true, brand: "Mitsubishi", category: "Freinage", phone: "+221778001005", ref: "P-FR-005" },
  { name: "Maître-cylindre de frein (Renault Logan)", zone: "Ouakam (Auto Pièces Ouakam)", price: 22000, available: true, brand: "Renault", category: "Freinage", phone: "+221778001006", ref: "P-FR-006" },
  { name: "Flexibles de frein avant (Hyundai i10)", zone: "Sacré-Cœur (Éts NDIAYE)", price: 8500, available: true, brand: "Hyundai", category: "Freinage", phone: "+221778001007", ref: "P-FR-007" },
  { name: "Alternateur 12V 90A (Hyundai Tucson 2015)", zone: "Thiaroye Gare (Garage & Pièces Mbacké)", price: 65000, available: false, brand: "Hyundai", category: "Moteur", phone: "+221778001003", ref: "P-MT-001" },
  { name: "Démarreur 12V (Toyota Corolla)", zone: "Diamniadio (Pièces Express)", price: 45000, available: true, brand: "Toyota", category: "Moteur", phone: "+221778001008", ref: "P-MT-002" },
  { name: "Bobine d'allumage (Peugeot 307)", zone: "Grand Yoff (Dakar Batterie Plus)", price: 18000, available: true, brand: "Peugeot", category: "Moteur", phone: "+221778001009", ref: "P-MT-003" },
  { name: "Courroie de distribution + galets (Nissan Qashqai)", zone: "Mermoz (Pièces Auto Mermoz)", price: 55000, available: true, brand: "Nissan", category: "Moteur", phone: "+221778001010", ref: "P-MT-004" },
  { name: "Pompe à eau (Mitsubishi L200)", zone: "Pikine Icotaf (Sénégal Auto Négoce)", price: 25000, available: true, brand: "Mitsubishi", category: "Moteur", phone: "+221778001005", ref: "P-MT-005" },
  { name: "Injecteur diesel (Renault Logan 1.5 DCI)", zone: "HLM (Grand Garage Sénégal)", price: 38000, available: true, brand: "Renault", category: "Moteur", phone: "+221778001011", ref: "P-MT-006" },
  { name: "Radiateur d'eau (Hyundai Tucson)", zone: "Sacré-Cœur (Éts NDIAYE)", price: 42000, available: false, brand: "Hyundai", category: "Moteur", phone: "+221778001007", ref: "P-MT-007" },
  { name: "Batterie 12V 70Ah 640A (Universal / Toyota / Nissan)", zone: "Grand Yoff (Dakar Batterie Plus)", price: 52000, available: true, brand: "Universal", category: "Électricité", phone: "+221778001009", ref: "P-EL-001" },
  { name: "Phare avant droit (Toyota Corolla 2010)", zone: "Colobane", price: 35000, available: true, brand: "Toyota", category: "Électricité", phone: "+221778001001", ref: "P-EL-002" },
  { name: "Feu arrière gauche (Peugeot 307)", zone: "Castors (AutoPieces Castors)", price: 15000, available: true, brand: "Peugeot", category: "Électricité", phone: "+221778001002", ref: "P-EL-003" },
  { name: "Capteur de recul (Nissan Qashqai)", zone: "Médina (Garage Modou Fall)", price: 12000, available: true, brand: "Nissan", category: "Électricité", phone: "+221778001004", ref: "P-EL-004" },
  { name: "Neiman complet (Hyundai i10)", zone: "Mermoz (Pièces Auto Mermoz)", price: 18000, available: true, brand: "Hyundai", category: "Électricité", phone: "+221778001010", ref: "P-EL-005" },
  { name: "Pare-choc avant (Hyundai i10)", zone: "Colobane", price: 60000, available: false, brand: "Hyundai", category: "Carrosserie", phone: "+221778001001", ref: "P-CR-001" },
  { name: "Rétroviseur extérieur droit électrique (Nissan Qashqai)", zone: "Colobane", price: 35000, available: true, brand: "Nissan", category: "Carrosserie", phone: "+221778001001", ref: "P-CR-002" },
  { name: "Batterie Kia Picanto 12V", zone: "Diamniadio", price: 55000, available: true, brand: "Kia", category: "Électricité", phone: "+221778001012", ref: "P-EL-006" },
  { name: "Rétroviseur droit Toyota Hilux", zone: "Marché Petersen", price: 20000, available: true, brand: "Toyota", category: "Carrosserie", phone: "+221778001013", ref: "P-CR-006" },
  { name: "Filtre à huile Peugeot 206", zone: "Marché HLM", price: 5000, available: true, brand: "Peugeot", category: "Filtres", phone: "+221778001014", ref: "P-FL-005" },
];

/* ── Zone coordonnées ── */
const ZONE_COORDS: Record<string, [number, number]> = {
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
  Diamniadio: [14.7167, -17.2],
  "Marché Petersen": [14.678, -17.4417],
};

function getCoords(zone: string): [number, number] {
  if (ZONE_COORDS[zone]) return ZONE_COORDS[zone];
  for (const [key, coord] of Object.entries(ZONE_COORDS)) {
    if (zone.includes(key)) return coord;
  }
  return [14.7, -17.45];
}

/* ── Regrouper les pièces par zone ── */
type ZoneGroup = {
  zone: string;
  parts: Part[];
  coord: [number, number];
};

function groupByZone(parts: Part[]): ZoneGroup[] {
  const map = new Map<string, Part[]>();
  for (const p of parts) {
    const existing = map.get(p.zone) ?? [];
    existing.push(p);
    map.set(p.zone, existing);
  }
  return Array.from(map.entries()).map(([zone, zoneParts]) => ({
    zone,
    parts: zoneParts,
    coord: getCoords(zone),
  }));
}

/* ── Page Dashboard Fournisseurs ── */
function FournisseursPage() {
  const { zone: initialZone } = Route.useSearch();
  const [selectedZone, setSelectedZone] = useState<string | null>(initialZone ?? null);
  const [mounted, setMounted] = useState(false);

  /* Leaflet lazy import via useEffect */
  useEffect(() => {
    if (typeof window !== "undefined") {
      setMounted(true);
      Promise.all([import("react-leaflet"), import("leaflet")]).then(([rlMod, lMod]) => {
        const leaflet = (lMod as any).default ?? lMod;
        setRL({
          MapContainer: (rlMod as any).MapContainer,
          TileLayer: (rlMod as any).TileLayer,
          Marker: (rlMod as any).Marker,
          Popup: (rlMod as any).Popup,
        });
        setL({ divIcon: leaflet.divIcon.bind(leaflet) });
      });
    }
  }, []);

  const { ref: headerRef, revealed: headerRevealed } = useReveal<HTMLDivElement>({ threshold: 0.2 });

  const zones = groupByZone(PARTS);

  const selectedParts = selectedZone
    ? PARTS.filter((p) => p.zone.includes(selectedZone))
    : [];

  /* Leaflet map client-side only */
  const [RL, setRL] = useState<{
    MapContainer: React.FC<any>;
    TileLayer: React.FC<any>;
    Marker: React.FC<any>;
    Popup: React.FC<any>;
  } | null>(null);
  const [L, setL] = useState<{ divIcon: (o: any) => any } | null>(null);

  function openWhatsApp(phone: string, partName: string) {
    const msg = encodeURIComponent(
      `Bonjour ! Je suis intéressé(e) par la pièce suivante vue sur AutoForge :\n\n🔧 *${partName}*\n\nEst-elle toujours disponible ?`,
    );
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${msg}`, "_blank");
    toast.success("WhatsApp ouvert", {
      description: "Discussion avec le vendeur lancée.",
      duration: 3000,
    });
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div ref={headerRef} className="mb-8">
        <h1
          className={`text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl transition-all duration-700 ${
            headerRevealed ? "revealed opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          🏪 Fournisseurs partenaires
        </h1>
        <p
          className={`mt-2 text-sm text-muted-foreground sm:text-base transition-all duration-700 ${
            headerRevealed ? "revealed opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDelay: "100ms" }}
        >
          Consultez les stocks des fournisseurs AutoForge par zone à Dakar. Cliquez sur une carte pour voir le détail.
        </p>
      </div>

      {/* Stats bar */}
      <div className="mb-6 flex flex-wrap gap-4 text-sm">
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <span className="text-2xl font-extrabold text-brand">{zones.length}</span>
          <span className="ml-2 text-muted-foreground">zones couvertes</span>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <span className="text-2xl font-extrabold text-brand">{PARTS.length}</span>
          <span className="ml-2 text-muted-foreground">pièces référencées</span>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <span className="text-2xl font-extrabold text-green-600">{PARTS.filter(p => p.available).length}</span>
          <span className="ml-2 text-muted-foreground">disponibles</span>
        </div>
      </div>

      {/* Grille des fournisseurs */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {zones.map((z, i) => {
          const avail = z.parts.filter((p) => p.available).length;
          const total = z.parts.length;
          return (
            <button
              key={z.zone}
              onClick={() => setSelectedZone(selectedZone === z.zone ? null : z.zone)}
              className={`group rounded-2xl border-2 p-5 text-left shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                selectedZone === z.zone
                  ? "border-brand bg-brand/5"
                  : "border-border bg-card hover:border-brand/30"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground group-hover:text-brand transition-colors">
                    📍 {z.zone}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {total} pièce{total > 1 ? "s" : ""}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  {avail}/{total} dispo
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {[...new Set(z.parts.map((p) => p.category))].slice(0, 3).map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand"
                  >
                    {cat}
                  </span>
                ))}
                {[...new Set(z.parts.map((p) => p.category))].length > 3 && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                    +{[...new Set(z.parts.map((p) => p.category))].length - 3}
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Prix : {formatFCFA(Math.min(...z.parts.map((p) => p.price)))} –{" "}
                {formatFCFA(Math.max(...z.parts.map((p) => p.price)))}
              </p>
            </button>
          );
        })}
      </div>

      {/* Carte Leaflet */}
      {mounted && RL && L && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-foreground">🗺️ Carte des fournisseurs</h2>
          <div className="h-80 w-full overflow-hidden rounded-xl border border-border shadow-sm sm:h-96">
            <RL.MapContainer center={[14.7, -17.45]} zoom={12} scrollWheelZoom className="h-full w-full">
              <RL.TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {zones.map((z) => (
                <RL.Marker
                  key={z.zone}
                  position={z.coord}
                  icon={L.divIcon({
                    className: "",
                    html: `<div style="background:${z.parts.some((p) => p.available) ? "#16A34A" : "#DC2626"};color:white;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.3);cursor:pointer">${z.parts.length} pièce${z.parts.length > 1 ? "s" : ""}</div>`,
                    iconSize: [0, 0],
                    iconAnchor: [35, 16],
                  })}
                >
                  <RL.Popup>
                    <div className="font-semibold text-sm">{z.zone}</div>
                    <div className="mt-1 space-y-1">
                      {z.parts.slice(0, 4).map((p) => (
                        <div key={p.ref} className="flex items-center justify-between gap-2 text-xs">
                          <span className="truncate max-w-[140px]">{p.name}</span>
                          <span className={p.available ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                            {formatFCFA(p.price)}
                          </span>
                        </div>
                      ))}
                      {z.parts.length > 4 && (
                        <div className="text-xs text-muted-foreground">…et {z.parts.length - 4} autre(s)</div>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedZone(z.zone)}
                      className="mt-2 w-full rounded bg-brand px-2 py-1 text-xs font-medium text-white hover:opacity-90"
                    >
                      Voir le détail →
                    </button>
                  </RL.Popup>
                </RL.Marker>
              ))}
            </RL.MapContainer>
          </div>
        </div>
      )}

      {/* Détail d'une zone sélectionnée */}
      {selectedZone && selectedParts.length > 0 && (
        <div className="mt-8 animate-fade-in-up">
          <div className="rounded-2xl border-2 border-brand/20 bg-card shadow-lg overflow-hidden">
            {/* Header zone */}
            <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-brand/5 to-transparent px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">📍 {selectedZone}</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {selectedParts.length} pièce{selectedParts.length > 1 ? "s" : ""} référencée{selectedParts.length > 1 ? "s" : ""}
                </p>
              </div>
              <Link
                to="/catalogue"
                className="rounded-lg border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition-all hover:border-brand hover:text-brand"
              >
                ← Retour au catalogue
              </Link>
            </div>

            {/* Liste des pièces */}
            <div className="divide-y divide-border px-6 py-4">
              {selectedParts.map((p) => (
                <div key={p.ref} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-brand">
                        {p.category}
                      </span>
                      <span className={`h-2 w-2 rounded-full ${p.available ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                    </div>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">🏷️ {p.brand} · Réf. {p.ref}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-base font-extrabold text-brand">{formatFCFA(p.price)}</span>
                    <button
                      onClick={() => openWhatsApp(p.phone, p.name)}
                      className="rounded-lg bg-green-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-green-600 hover:shadow-md hover:scale-105"
                    >
                      💬 WhatsApp
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="border-t border-border bg-muted/50 px-6 py-3">
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>✅ {selectedParts.filter((p) => p.available).length} disponible{selectedParts.filter((p) => p.available).length > 1 ? "s" : ""}</span>
                <span>❌ {selectedParts.filter((p) => !p.available).length} en rupture</span>
                <span>💰 Min {formatFCFA(Math.min(...selectedParts.map((p) => p.price)))}</span>
                <span>💰 Max {formatFCFA(Math.max(...selectedParts.map((p) => p.price)))}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
