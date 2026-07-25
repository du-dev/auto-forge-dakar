import type { Part } from "./types";
import { formatFCFA } from "./utils";

/* ── Moteur de recherche local intelligent ──────────────
 * Remplace Dify pour l'Expert IA du catalogue.
 * Zéro API, zéro coût, zéro surprise.
 */

type SearchResult = {
  type: "success" | "no_results" | "clarify";
  message: string;
  parts?: Part[];
};

/* Mots-clés par catégorie */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Freinage: ["frein", "plaquette", "disque", "tambour", "mâchoire", "maître-cylindre", "flexible"],
  Moteur: ["alternateur", "démarreur", "bobine", "allumage", "courroie", "distribution", "pompe", "eau", "injecteur", "radiateur"],
  Électricité: ["batterie", "phare", "feu", "capteur", "recul", "neiman", "électrique", "12v"],
  Carrosserie: ["pare-choc", "rétroviseur", "capot", "aile", "calandre", "carrosserie"],
  Filtres: ["filtre", "huile", "air", "gasoil", "habitacle"],
  Embrayage: ["embrayage", "disque", "câble", "kit embrayage"],
  Suspension: ["amortisseur", "triangle", "suspension", "barre stabilisatrice"],
  Direction: ["crémaillère", "biellette", "direction assistée"],
};

/* Mots-clés par marque */
const BRAND_KEYWORDS: Record<string, string[]> = {
  Toyota: ["toyota", "corolla", "hilux"],
  Peugeot: ["peugeot", "307", "206"],
  Hyundai: ["hyundai", "tucson", "i10"],
  Nissan: ["nissan", "qashqai"],
  Renault: ["renault", "logan"],
  Mitsubishi: ["mitsubishi", "l200"],
  Universal: ["universal", "batterie"],
};

/* Zones */
const ZONE_KEYWORDS: Record<string, string[]> = {
  Colobane: ["colobane"],
  Castors: ["castors"],
  "Thiaroye Gare": ["thiaroye"],
  "Grand Yoff": ["grand yoff", "yoff"],
  "Pikine Icotaf": ["pikine", "icotaf"],
  Diamniadio: ["diamniadio"],
  Médina: ["médina", "medina"],
  Ouakam: ["ouakam"],
  "Sacré-Cœur": ["sacré", "cœur", "coeur"],
  Mermoz: ["mermoz"],
  HLM: ["hlm", "marché hlm"],
};

export function searchCatalogue(question: string, parts: Part[]): SearchResult {
  const q = question.toLowerCase().trim();

  if (!q) {
    return {
      type: "clarify",
      message: "🧐 Posez-moi une question précise ! Par exemple :\n" +
        "• « Prix d'un alternateur pour Hyundai Tucson »\n" +
        "• « Où trouver des plaquettes de frein à Colobane ? »\n" +
        "• « Y a-t-il des batteries disponibles à Grand Yoff ? »\n" +
        "• « Quelle est la pièce la moins chère pour Toyota ? »",
    };
  }

  /* Détection des filtres */
  const detectedCategories = detectCategories(q);
  const detectedBrands = detectBrands(q);
  const detectedZones = detectZones(q);
  const wantsAvailable = /\b(disponible|stock|en stock|avoir|trouver)\b/i.test(q);
  const wantsCheapest = /\b(moins cher|pas cher|moins chère|économique|bon marché|prix bas)\b/i.test(q);

  /* Filtrer les pièces */
  let filtered = [...parts];

  if (detectedCategories.length > 0) {
    filtered = filtered.filter((p) => detectedCategories.includes(p.category));
  }
  if (detectedBrands.length > 0) {
    filtered = filtered.filter((p) => detectedBrands.includes(p.brand));
  }
  if (detectedZones.length > 0) {
    filtered = filtered.filter((p) =>
      detectedZones.some((z) => p.zone.toLowerCase().includes(z.toLowerCase())),
    );
  }
  if (wantsAvailable) {
    filtered = filtered.filter((p) => p.available);
  }
  if (wantsCheapest) {
    filtered.sort((a, b) => a.price - b.price);
    filtered = filtered.slice(0, 3);
  }

  /* Pas de résultats */
  if (filtered.length === 0) {
    /* Suggestions */
    const suggestion =
      detectedCategories.length > 0
        ? `dans la catégorie "${detectedCategories[0]}"`
        : detectedBrands.length > 0
          ? `pour la marque "${detectedBrands[0]}"`
          : "correspondant à votre recherche";

    return {
      type: "no_results",
      message: `😕 Je n'ai trouvé aucune pièce ${suggestion}.\n\n` +
        `🔍 Essayez de reformuler votre question ou de parcourir le catalogue manuellement.\n` +
        `💡 Vous pouvez aussi essayer : « Quelles sont toutes les pièces disponibles ? »`,
    };
  }

  /* Formatage de la réponse */
  const response = formatResponse(filtered, q);
  return { type: "success", message: response, parts: filtered };
}

/* ── Détection ───────────────────────────────────────── */

function detectCategories(q: string): string[] {
  return (Object.keys(CATEGORY_KEYWORDS) as Array<keyof typeof CATEGORY_KEYWORDS>).filter((cat) =>
    CATEGORY_KEYWORDS[cat].some((kw) => q.includes(kw)),
  );
}

function detectBrands(q: string): string[] {
  return (Object.keys(BRAND_KEYWORDS) as Array<keyof typeof BRAND_KEYWORDS>).filter((brand) =>
    BRAND_KEYWORDS[brand].some((kw) => q.includes(kw)),
  );
}

function detectZones(q: string): string[] {
  return (Object.keys(ZONE_KEYWORDS) as Array<keyof typeof ZONE_KEYWORDS>).filter((zone) =>
    ZONE_KEYWORDS[zone].some((kw) => q.includes(kw)),
  );
}

/* ── Formatage de la réponse ─────────────────────────── */

function formatResponse(parts: Part[], _query: string): string {
  const available = parts.filter((p) => p.available);
  const unavailable = parts.filter((p) => !p.available);

  let msg = `🔍 Résultat de ma recherche\n\n`;
  msg += `J'ai trouvé ${parts.length} pièce${parts.length > 1 ? "s" : ""} correspondant à votre demande :\n\n`;

  /* Top 5 disponibles */
  if (available.length > 0) {
    msg += `✅ Pièces disponibles :\n`;
    const top = available.slice(0, 5);
    top.forEach((p, i) => {
      msg += `${i + 1}. 🔧 ${p.name}\n`;
      msg += `   💰 ${formatFCFA(p.price)} · 📍 ${p.zone} · 🏷️ ${p.brand}\n`;
      msg += `   📞 WhatsApp: ${p.phone.replace(/[^0-9]/g, "")} — Réf. ${p.ref}\n\n`;
    });
    if (available.length > 5) {
      msg += `...et ${available.length - 5} autre${available.length - 5 > 1 ? "s" : ""} pièce${available.length - 5 > 1 ? "s" : ""} disponible${available.length - 5 > 1 ? "s" : ""} (voir le catalogue)\n\n`;
    }
  }

  /* Indisponibles */
  if (unavailable.length > 0 && parts.length <= 8) {
    msg += `❌ Actuellement en rupture :\n`;
    unavailable.slice(0, 3).forEach((p) => {
      msg += `   • ${p.name} — ${formatFCFA(p.price)} — ${p.zone}\n`;
    });
    msg += `\n`;
  }

  /* Stats */
  const brands = [...new Set(parts.map((p) => p.brand))];
  const zones = [...new Set(parts.map((p) => p.zone))];
  msg += `📊 En résumé : ${available.length} disponible${available.length > 1 ? "s" : ""}`;
  if (unavailable.length > 0) msg += `, ${unavailable.length} en rupture`;
  msg += ` · ${brands.length} marque${brands.length > 1 ? "s" : ""} · ${zones.length} zone${zones.length > 1 ? "s" : ""}\n`;

  const cheapest = [...parts].sort((a, b) => a.price - b.price)[0];
  msg += `💰 Prix le plus bas : ${formatFCFA(cheapest.price)} (${cheapest.name})\n\n`;

  msg += `💡 Conseil : utilisez les filtres au-dessus du catalogue pour affiner votre recherche.`;

  return msg;
}
