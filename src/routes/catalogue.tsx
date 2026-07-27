import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import SupplierMap from "../components/SupplierMap";
import { searchCatalogue } from "../lib/catalogue-search";
import { useReveal } from "../lib/useReveal";
import type { Part } from "../lib/types";
import VoiceSearch from "../components/VoiceSearch";
import { formatFCFA } from "../lib/utils";

export const Route = createFileRoute("/catalogue")({
  head: () => ({
    meta: [
      { title: "Catalogue — Pièces auto disponibles à Dakar | AutoForge" },
      {
        name: "description",
        content:
          "Parcourez les pièces détachées auto disponibles à Dakar : prix en FCFA, zone du fournisseur et statut en temps réel.",
      },
      { property: "og:title", content: "Catalogue AutoForge — Pièces auto à Dakar" },
      {
        property: "og:description",
        content: "Toyota, Peugeot, Hyundai, Nissan et plus : prix et dispo en direct.",
      },
    ],
  }),
  component: CataloguePage,
});

/* ───────── 30+ pièces réalistes Dakar ─────────────── */

const PARTS: Part[] = [
  // ── Freinage ──
  { name: "Jeu de plaquettes de frein avant (Toyota Corolla 2010)", zone: "Colobane", price: 15000, available: true, brand: "Toyota", category: "Freinage", phone: "+221778001001", ref: "P-FR-001" },
  { name: "Kit de plaquettes de frein arrière (Peugeot 307)", zone: "Castors (AutoPieces Castors)", price: 18500, available: true, brand: "Peugeot", category: "Freinage", phone: "+221778001002", ref: "P-FR-002" },
  { name: "Disques de frein avant ventilés (Hyundai Tucson 2015)", zone: "Thiaroye Gare (Garage & Pièces Mbacké)", price: 32000, available: false, brand: "Hyundai", category: "Freinage", phone: "+221778001003", ref: "P-FR-003" },
  { name: "Tambours de frein arrière (Nissan Qashqai)", zone: "Médina (Garage Modou Fall)", price: 28000, available: true, brand: "Nissan", category: "Freinage", phone: "+221778001004", ref: "P-FR-004" },
  { name: "Mâchoires de frein à main (Mitsubishi L200)", zone: "Pikine Icotaf (Sénégal Auto Négoce)", price: 12000, available: true, brand: "Mitsubishi", category: "Freinage", phone: "+221778001005", ref: "P-FR-005" },
  { name: "Maître-cylindre de frein (Renault Logan)", zone: "Ouakam (Auto Pièces Ouakam)", price: 22000, available: true, brand: "Renault", category: "Freinage", phone: "+221778001006", ref: "P-FR-006" },
  { name: "Flexibles de frein avant (Hyundai i10)", zone: "Sacré-Cœur (Éts NDIAYE)", price: 8500, available: true, brand: "Hyundai", category: "Freinage", phone: "+221778001007", ref: "P-FR-007" },

  // ── Moteur ──
  { name: "Alternateur 12V 90A (Hyundai Tucson 2015)", zone: "Thiaroye Gare (Garage & Pièces Mbacké)", price: 65000, available: false, brand: "Hyundai", category: "Moteur", phone: "+221778001003", ref: "P-MT-001" },
  { name: "Démarreur 12V (Toyota Corolla)", zone: "Diamniadio (Pièces Express)", price: 45000, available: true, brand: "Toyota", category: "Moteur", phone: "+221778001008", ref: "P-MT-002" },
  { name: "Bobine d'allumage (Peugeot 307)", zone: "Grand Yoff (Dakar Batterie Plus)", price: 18000, available: true, brand: "Peugeot", category: "Moteur", phone: "+221778001009", ref: "P-MT-003" },
  { name: "Courroie de distribution + galets (Nissan Qashqai)", zone: "Mermoz (Pièces Auto Mermoz)", price: 55000, available: true, brand: "Nissan", category: "Moteur", phone: "+221778001010", ref: "P-MT-004" },
  { name: "Pompe à eau (Mitsubishi L200)", zone: "Pikine Icotaf (Sénégal Auto Négoce)", price: 25000, available: true, brand: "Mitsubishi", category: "Moteur", phone: "+221778001005", ref: "P-MT-005" },
  { name: "Injecteur diesel (Renault Logan 1.5 DCI)", zone: "HLM (Grand Garage Sénégal)", price: 38000, available: true, brand: "Renault", category: "Moteur", phone: "+221778001011", ref: "P-MT-006" },
  { name: "Radiateur d'eau (Hyundai Tucson)", zone: "Sacré-Cœur (Éts NDIAYE)", price: 42000, available: false, brand: "Hyundai", category: "Moteur", phone: "+221778001007", ref: "P-MT-007" },

  // ── Électricité ──
  { name: "Batterie 12V 70Ah 640A (Universal / Toyota / Nissan)", zone: "Grand Yoff (Dakar Batterie Plus)", price: 52000, available: true, brand: "Universal", category: "Électricité", phone: "+221778001009", ref: "P-EL-001" },
  { name: "Phare avant droit (Toyota Corolla 2010)", zone: "Colobane", price: 35000, available: true, brand: "Toyota", category: "Électricité", phone: "+221778001001", ref: "P-EL-002" },
  { name: "Feu arrière gauche (Peugeot 307)", zone: "Castors (AutoPieces Castors)", price: 15000, available: true, brand: "Peugeot", category: "Électricité", phone: "+221778001002", ref: "P-EL-003" },
  { name: "Capteur de recul (Nissan Qashqai)", zone: "Médina (Garage Modou Fall)", price: 12000, available: true, brand: "Nissan", category: "Électricité", phone: "+221778001004", ref: "P-EL-004" },
  { name: "Neiman complet (Hyundai i10)", zone: "Mermoz (Pièces Auto Mermoz)", price: 18000, available: true, brand: "Hyundai", category: "Électricité", phone: "+221778001010", ref: "P-EL-005" },

  // ── Carrosserie ──
  { name: "Pare-choc avant (Hyundai i10)", zone: "Colobane", price: 60000, available: false, brand: "Hyundai", category: "Carrosserie", phone: "+221778001001", ref: "P-CR-001" },
  { name: "Rétroviseur extérieur droit électrique (Nissan Qashqai)", zone: "Colobane", price: 35000, available: true, brand: "Nissan", category: "Carrosserie", phone: "+221778001001", ref: "P-CR-002" },
  { name: "Capot moteur (Toyota Corolla 2010)", zone: "Ouakam (Auto Pièces Ouakam)", price: 75000, available: true, brand: "Toyota", category: "Carrosserie", phone: "+221778001006", ref: "P-CR-003" },
  { name: "Aile avant droite (Peugeot 307)", zone: "Diamniadio (Pièces Express)", price: 28000, available: true, brand: "Peugeot", category: "Carrosserie", phone: "+221778001008", ref: "P-CR-004" },
  { name: "Calandre chromée (Mitsubishi L200)", zone: "Pikine Icotaf (Sénégal Auto Négoce)", price: 22000, available: true, brand: "Mitsubishi", category: "Carrosserie", phone: "+221778001005", ref: "P-CR-005" },

  // ── Filtres ──
  { name: "Filtre à huile (Peugeot 206 / 307)", zone: "HLM (Grand Garage Sénégal)", price: 5000, available: true, brand: "Peugeot", category: "Filtres", phone: "+221778001011", ref: "P-FL-001" },
  { name: "Filtre à air moteur (Toyota Corolla)", zone: "Grand Yoff (Dakar Batterie Plus)", price: 8000, available: true, brand: "Toyota", category: "Filtres", phone: "+221778001009", ref: "P-FL-002" },
  { name: "Filtre à gasoil (Renault Logan 1.5 DCI)", zone: "Sacré-Cœur (Éts NDIAYE)", price: 6500, available: true, brand: "Universal", category: "Filtres", phone: "+221778001007", ref: "P-FL-003" },
  { name: "Filtre d'habitacle (Nissan Qashqai)", zone: "Mermoz (Pièces Auto Mermoz)", price: 7000, available: true, brand: "Nissan", category: "Filtres", phone: "+221778001010", ref: "P-FL-004" },

  // ── Embrayage ──
  { name: "Kit d'embrayage complet (Mitsubishi L200 Pick-up)", zone: "Pikine Icotaf (Sénégal Auto Négoce)", price: 85000, available: true, brand: "Mitsubishi", category: "Embrayage", phone: "+221778001005", ref: "P-EM-001" },
  { name: "Disque d'embrayage (Toyota Corolla)", zone: "Colobane", price: 32000, available: true, brand: "Toyota", category: "Embrayage", phone: "+221778001001", ref: "P-EM-002" },
  { name: "Câble d'embrayage (Peugeot 307)", zone: "Castors (AutoPieces Castors)", price: 12000, available: true, brand: "Peugeot", category: "Embrayage", phone: "+221778001002", ref: "P-EM-003" },

  // ── Suspension ──
  { name: "Jeu d'amortisseurs avant (Toyota Corolla 2010)", zone: "Colobane", price: 45000, available: true, brand: "Toyota", category: "Suspension", phone: "+221778001001", ref: "P-SP-001" },
  { name: "Amortisseurs arrière (Hyundai Tucson)", zone: "Thiaroye Gare (Garage & Pièces Mbacké)", price: 38000, available: false, brand: "Hyundai", category: "Suspension", phone: "+221778001003", ref: "P-SP-002" },
  { name: "Triangle de suspension inférieur (Renault Logan)", zone: "Ouakam (Auto Pièces Ouakam)", price: 25000, available: true, brand: "Renault", category: "Suspension", phone: "+221778001006", ref: "P-SP-003" },
  { name: "Barre stabilisatrice (Nissan Qashqai)", zone: "Médina (Garage Modou Fall)", price: 20000, available: true, brand: "Nissan", category: "Suspension", phone: "+221778001004", ref: "P-SP-004" },

  // ── Direction ──
  { name: "Crémaillère de direction (Toyota Corolla)", zone: "Diamniadio (Pièces Express)", price: 55000, available: true, brand: "Toyota", category: "Direction", phone: "+221778001008", ref: "P-DR-001" },
  { name: "Biellette de direction (Peugeot 307)", zone: "Castors (AutoPieces Castors)", price: 12000, available: true, brand: "Peugeot", category: "Direction", phone: "+221778001002", ref: "P-DR-002" },
  { name: "Pompe de direction assistée (Hyundai Tucson)", zone: "Thiaroye Gare (Garage & Pièces Mbacké)", price: 48000, available: true, brand: "Hyundai", category: "Direction", phone: "+221778001003", ref: "P-DR-003" },
];

/* ───────── Helpers ────────────────────────────────── */

const CATEGORIES = ["Toutes", "Freinage", "Moteur", "Électricité", "Carrosserie", "Filtres", "Embrayage", "Suspension", "Direction"] as const;
const BRANDS = ["Toutes", "Toyota", "Peugeot", "Hyundai", "Nissan", "Renault", "Mitsubishi", "Universal"] as const;

function openWhatsApp(phone: string, partName: string) {
  const msg = encodeURIComponent(
    `Bonjour ! Je suis intéressé(e) par la pièce suivante vue sur AutoForge :\n\n🔧 *${partName}*\n\nEst-elle toujours disponible ?`,
  );
  window.open(`https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${msg}`, "_blank");
  toast.success("WhatsApp ouvert", {
    description: "Discussion avec le vendeur lancée dans un nouvel onglet.",
    duration: 3000,
  });
}

/* ───────── Page ───────────────────────────────────── */

function CataloguePage() {
  /* filters */
  const [category, setCategory] = useState<string>("Toutes");
  const [brand, setBrand] = useState<string>("Toutes");
  const [search, setSearch] = useState("");
  const [availFilter, setAvailFilter] = useState<"all" | "available" | "unavailable">("all");

  /* view */
  const [view, setView] = useState<"grid" | "list">("grid");

  /* map */
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);

  /* AI expert */
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* derived */
  const st = search.trim().toLowerCase();
  const filtered = PARTS.filter((p) => {
    if (category !== "Toutes" && p.category !== category) return false;
    if (brand !== "Toutes" && p.brand !== brand) return false;
    if (st && !p.name.toLowerCase().includes(st) && !p.zone.toLowerCase().includes(st)) return false;
    if (availFilter === "available" && !p.available) return false;
    if (availFilter === "unavailable" && p.available) return false;
    if (selectedZone && !p.zone.includes(selectedZone)) return false;
    return true;
  });

  /* Staggered reveal for cards */
  const { ref: cardsContainerRef, revealed: cardsRevealed } = useReveal<HTMLDivElement>({ threshold: 0.05 });

  function askExpert(e: FormEvent) {
    e.preventDefault();
    if (!query.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);

    setTimeout(() => {
      const res = searchCatalogue(query, PARTS);
      setResult(res.message);
      setLoading(false);
    }, 600);
  }

  const availableCount = PARTS.filter((p) => p.available).length;
  const unavailableCount = PARTS.length - availableCount;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* Header */}
      <header className="mb-6 animate-fade-in">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Catalogue des pièces
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          <strong>{PARTS.length} pièces</strong> suivies · <span className="text-success font-semibold">{availableCount} disponibles</span> ·{" "}
          <span className="text-danger font-semibold">{unavailableCount} en rupture</span> · Prix en FCFA
        </p>
      </header>

      {/* ── AI Expert ── */}
      <section className="mb-8 rounded-2xl border border-border bg-gradient-to-br from-brand-soft to-white p-5 shadow-sm animate-fade-in animation-delay-100 sm:p-6 dark:from-brand-soft/30 dark:to-card">
        <h2 className="text-lg font-bold text-foreground sm:text-xl">
          🤖 Expert IA AutoForge
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Posez votre question sur un prix, une disponibilité ou un fournisseur à Dakar.
        </p>
        <form onSubmit={askExpert} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: Prix d'un alternateur Tucson 2015 à Colobane ?"
            className="flex-1 rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-all duration-200 focus:border-brand focus:ring-2 focus:ring-brand/30 dark:bg-card dark:placeholder:text-muted-foreground"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="absolute inset-0 animate-shimmer" />
            {loading ? (
              <span className="relative inline-flex items-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Analyse…
              </span>
            ) : (
              <span className="relative">🚗 Consulter l'expert</span>
            )}
          </button>
        </form>

        {(loading || result || error) && (
          <div className="mt-4 rounded-xl border border-border bg-white p-4 text-sm shadow-sm animate-scale-in dark:bg-card" aria-live="polite">
            {loading && (
              <div className="flex items-center gap-3 text-foreground">
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                Analyse des stocks et prix à Dakar…
              </div>
            )}
            {!loading && error && (
              <p className="font-medium text-danger">{error}</p>
            )}
            {!loading && !error && result && (
              <div className="whitespace-pre-wrap break-words font-sans text-foreground leading-relaxed animate-fade-in">
                {result}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Map toggle ── */}
      <button
        onClick={() => setShowMap(!showMap)}
        className="group mb-6 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-brand hover:text-brand hover:-translate-y-0.5"
      >
        <span className="transition-transform duration-300 group-hover:scale-110" aria-hidden>
          {showMap ? "📋" : "🗺️"}
        </span>
        {showMap ? "Afficher la liste" : "Voir la carte des fournisseurs"}
      </button>

      {showMap && (
        <div className="mb-8 animate-scale-in">
          <SupplierMap
            parts={filtered.length > 0 ? filtered : PARTS}
            onZoneClick={(z) => {
              setSelectedZone((prev) => (prev === z ? null : z));
            }}
          />
          {selectedZone && (
            <div className="mt-2 flex animate-fade-in items-center gap-2 text-sm text-muted-foreground">
              <span>📍 Filtre actif : <strong className="text-foreground">{selectedZone}</strong></span>
              <button
                onClick={() => setSelectedZone(null)}
                className="text-xs text-brand underline transition-all hover:no-underline hover:text-brand/80"
              >
                Réinitialiser
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Filters bar ── */}
      <div className="mb-6 space-y-4 animate-fade-in animation-delay-200">
        {/* Search + Voice */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden>
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une pièce, une zone ou utilisez le micro…"
              className="w-full rounded-lg border border-border bg-background py-3 pl-11 pr-4 text-sm text-foreground outline-none transition-all duration-200 focus:border-brand focus:ring-2 focus:ring-brand/30"
            />
          </div>
          <VoiceSearch onResult={(text) => setSearch(text)} disabled={loading} />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Catégories — scrollable horizontalement sur mobile */}
          <div className="scrollbar-hide flex w-full gap-1.5 overflow-x-auto pb-1 sm:w-auto sm:flex-wrap sm:overflow-visible">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 " +
                  (category === c
                    ? "border-brand bg-brand text-brand-foreground scale-105 shadow-sm"
                    : "border-border bg-background text-foreground hover:border-brand hover:text-brand hover:scale-105")
                }
              >
                {c}
              </button>
            ))}
          </div>

          {/* Marques */}
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground outline-none transition-all duration-200 focus:border-brand"
          >
            {BRANDS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Disponibilité */}
          <select
            value={availFilter}
            onChange={(e) => setAvailFilter(e.target.value as typeof availFilter)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground outline-none transition-all duration-200 focus:border-brand"
          >
            <option value="all">Toutes dispo</option>
            <option value="available">Disponibles</option>
            <option value="unavailable">Indisponibles</option>
          </select>

          {/* Vue */}
          <div className="flex w-full items-center gap-1 rounded-lg border border-border p-1 sm:w-auto">
            <button
              onClick={() => setView("grid")}
              className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                view === "grid"
                  ? "bg-brand text-brand-foreground scale-110"
                  : "text-muted-foreground hover:text-foreground hover:scale-110"
              }`}
              title="Vue grille"
            >
              ▦
            </button>
            <button
              onClick={() => setView("list")}
              className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                view === "list"
                  ? "bg-brand text-brand-foreground scale-110"
                  : "text-muted-foreground hover:text-foreground hover:scale-110"
              }`}
              title="Vue liste"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="mb-6 text-xs text-muted-foreground animate-fade-in animation-delay-300">
        {filtered.length} pièce{filtered.length > 1 ? "s" : ""} sur {PARTS.length}
        {selectedZone && <span> · Zone : <strong>{selectedZone}</strong></span>}
      </div>

      {/* ── Results ── */}
      {filtered.length === 0 ? (
        <p className="mt-10 animate-fade-in text-center text-sm text-muted-foreground">
          Aucune pièce ne correspond à votre recherche.
        </p>
      ) : view === "grid" ? (
        <div ref={cardsContainerRef} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <PartCard key={p.ref} part={p} index={i} revealed={cardsRevealed} />
          ))}
        </div>
      ) : (
        <div ref={cardsContainerRef} className="space-y-3">
          {filtered.map((p, i) => (
            <PartRow key={p.ref} part={p} index={i} revealed={cardsRevealed} />
          ))}
        </div>
      )}
    </section>
  );
}

export default CataloguePage;

/* ───────── Card (grid) ────────────────────────────── */

function PartCard({ part: p, index, revealed }: { part: Part; index: number; revealed: boolean }) {
  return (
    <article
      className={`group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-md transition-all duration-500 hover:scale-[1.03] hover:shadow-xl hover:border-brand/30 ${
        revealed
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8"
      }`}
      style={{
        transitionDelay: `${index * 50}ms`,
        transitionProperty: "opacity, transform, box-shadow, border-color",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="inline-block rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand transition-colors group-hover:bg-brand/20">
            {p.category}
          </span>
          <h2 className="mt-1.5 text-sm font-semibold leading-snug text-foreground">
            {p.name}
          </h2>
        </div>
        <span
          className={
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold " +
            (p.available ? "bg-success/10 text-success" : "bg-danger/10 text-danger")
          }
        >
          <span className={`h-2 w-2 rounded-full ${p.available ? "bg-success animate-pulse-ring" : "bg-danger"}`} />
          {p.available ? "Disponible" : "Rupture"}
        </span>
      </div>

      {/* Zone */}
      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <span aria-hidden>📍</span>
        {p.zone}
      </p>
      <p className="mt-0.5 text-[11px] text-muted-foreground/60">Réf. {p.ref}</p>

      {/* Price + WhatsApp */}
      <div className="mt-4 flex items-end justify-between border-t border-border pt-3">
        <span className="text-lg font-extrabold text-brand transition-all duration-300 group-hover:scale-105 group-hover:text-brand/90">
          {formatFCFA(p.price)}
        </span>
        <div className="flex gap-1.5">
          <span className="rounded bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">
            {p.brand}
          </span>
          <button
            onClick={() => openWhatsApp(p.phone, p.name)}
            className="inline-flex items-center gap-1 rounded-lg bg-green-500 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-all hover:bg-green-600 hover:shadow-md hover:scale-110 active:scale-95"
            title="Contacter le vendeur"
          >
            💬
          </button>
        </div>
      </div>
    </article>
  );
}

/* ───────── Row (list) ─────────────────────────────── */

function PartRow({ part: p, index, revealed }: { part: Part; index: number; revealed: boolean }) {
  return (
    <div
      className={`flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm transition-all duration-500 hover:shadow-md hover:border-brand/20 hover:-translate-y-0.5 ${
        revealed
          ? "opacity-100 translate-x-0"
          : "opacity-0 -translate-x-4"
      }`}
      style={{
        transitionDelay: `${index * 40}ms`,
        transitionProperty: "opacity, transform, box-shadow, border-color",
      }}
    >
      {/* Status dot */}
      <span className={`h-3 w-3 shrink-0 rounded-full transition-all duration-300 ${p.available ? "bg-success animate-pulse-ring" : "bg-danger"}`} />

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-brand">
            {p.category}
          </span>
          <span className="text-xs text-muted-foreground">Réf. {p.ref}</span>
        </div>
        <p className="mt-0.5 text-sm font-semibold text-foreground truncate">{p.name}</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>📍{p.zone}</span>
          <span>·</span>
          <span className="rounded bg-muted px-1.5 py-0.5 font-medium">{p.brand}</span>
          <span>·</span>
          <span className={p.available ? "text-success font-medium" : "text-danger font-medium"}>
            {p.available ? "Disponible" : "Rupture"}
          </span>
        </p>
      </div>

      {/* Price + CTA */}
      <div className="flex shrink-0 items-center gap-3">
        <span className="text-lg font-extrabold text-brand">{formatFCFA(p.price)}</span>
        <button
          onClick={() => openWhatsApp(p.phone, p.name)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-green-500 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-green-600 hover:shadow-md hover:scale-105 active:scale-95"
        >
          💬 WhatsApp
        </button>
      </div>
    </div>
  );
}
