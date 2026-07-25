/**
 * vendor-ai.ts — Moteur IA local pour la page Saisie Vendeur
 *
 * Analyse les données terrain saisies en texte libre et répond
 * à la question du vendeur. Zéro API, zéro clé, zéro coût.
 */

/* ══════════════════════════════════════════════════════════
   Types
   ══════════════════════════════════════════════════════════ */

export type VendorEntry = {
  rawLine: string;
  piece: string;
  brand: string | null;
  zone: string | null;
  price: number | null;
  available: boolean | null; // null = non précisé
  date: string | null;
};

export type VendorAIResult = {
  text: string;
  entries: VendorEntry[];
};

/* ══════════════════════════════════════════════════════════
   Dictionnaires de détection
   ══════════════════════════════════════════════════════════ */

const BRAND_KEYWORDS: Record<string, string[]> = {
  Toyota: ["toyota", "corolla", "hilux", "land cruiser", "yaris", "rav4"],
  Peugeot: ["peugeot", "307", "206", "208", "301", "508"],
  Hyundai: ["hyundai", "tucson", "i10", "i20", "i30", "elantra"],
  Nissan: ["nissan", "qashqai", "navara", "micra", "note"],
  Renault: ["renault", "logan", "duster", "clio", "mégane", "megane"],
  Mitsubishi: ["mitsubishi", "l200", "pajero", "outlander"],
  Universal: ["universal", "toutes marques", "multi-marque"],
};

const ZONE_KEYWORDS: Record<string, string[]> = {
  Colobane: ["colobane"],
  Castors: ["castors"],
  "Thiaroye": ["thiaroye"],
  "Grand Yoff": ["grand yoff", "yoff"],
  "Pikine": ["pikine"],
  Diamniadio: ["diamniadio"],
  Médina: ["médina", "medina"],
  Ouakam: ["ouakam"],
  "Sacré-Cœur": ["sacré", "cœur", "coeur"],
  Mermoz: ["mermoz"],
  HLM: ["hlm"],
};

const PART_KEYWORDS: Record<string, string[]> = {
  Freinage: ["frein", "plaquette", "disque", "tambour", "mâchoire", "maître-cylindre", "flexible de frein"],
  Moteur: ["alternateur", "démarreur", "bobine", "allumage", "courroie", "distribution", "pompe à eau", "injecteur", "radiateur"],
  Électricité: ["batterie", "phare", "feu", "capteur", "recul", "neiman", "électrique"],
  Carrosserie: ["pare-choc", "rétroviseur", "capot", "aile", "calandre"],
  Filtres: ["filtre à huile", "filtre air", "filtre gasoil", "filtre habitacle", "filtre"],
  Embrayage: ["embrayage", "kit embrayage", "câble embrayage"],
  Suspension: ["amortisseur", "triangle", "barre stabilisatrice"],
  Direction: ["crémaillère", "biellette", "direction assistée"],
};

/* ══════════════════════════════════════════════════════════
   Parseur de données vendeur
   ══════════════════════════════════════════════════════════ */

function detectBrand(text: string): string | null {
  const t = text.toLowerCase();
  for (const [brand, keywords] of Object.entries(BRAND_KEYWORDS)) {
    if (keywords.some((kw) => t.includes(kw))) return brand;
  }
  return null;
}

function detectZone(text: string): string | null {
  const t = text.toLowerCase();
  for (const [zone, keywords] of Object.entries(ZONE_KEYWORDS)) {
    if (keywords.some((kw) => t.includes(kw))) return zone;
  }
  return null;
}

function detectPieceName(text: string): string {
  // Retire les informations de contexte (date, zone, prix) pour isoler le nom de la pièce
  return text
    .replace(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g, "") // dates
    .replace(/\d+h\d*/gi, "") // heures
    .replace(/(\d[\d\s]*)\s*(fcfa|cfa|f\.?cfa)/gi, "") // prix
    .replace(/\b(en stock|disponible|dispo|rupture|indisponible|épuisé)\b/gi, "")
    .replace(/[:\-—–|]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .replace(/^[\s,;.]+|[\s,;.]+$/g, "");
}

function detectPrice(text: string): number | null {
  // Cherche des patterns comme : 8 000, 52000, 8.000, "8 000 FCFA"
  const match = text.match(/(\d[\d\s\.,]*)\s*(fcfa|cfa|f\.?cfa)?/i);
  if (!match) return null;
  const raw = match[1].replace(/[\s\.]/g, "").replace(",", "");
  const num = parseInt(raw, 10);
  return isNaN(num) || num < 100 ? null : num; // Filtre les faux positifs (années, heures…)
}

function detectAvailability(text: string): boolean | null {
  const t = text.toLowerCase();
  if (/\b(en stock|disponible|dispo|avoir|trouvé|present)\b/.test(t)) return true;
  if (/\b(rupture|indisponible|épuisé|manquant|pas dispo|pas en stock)\b/.test(t)) return false;
  return null;
}

function detectDate(text: string): string | null {
  const match = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
  return match ? match[1] : null;
}

/**
 * Analyse chaque ligne du texte libre du vendeur et retourne
 * un tableau d'entrées structurées.
 */
export function parseVendorData(raw: string): VendorEntry[] {
  if (!raw.trim()) return [];

  return raw
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 3)
    .map((line) => ({
      rawLine: line,
      piece: detectPieceName(line),
      brand: detectBrand(line),
      zone: detectZone(line),
      price: detectPrice(line),
      available: detectAvailability(line),
      date: detectDate(line),
    }));
}

/* ══════════════════════════════════════════════════════════
   Moteur de réponse aux questions
   ══════════════════════════════════════════════════════════ */

function formatFCFA(n: number) {
  return n.toLocaleString("fr-FR") + " FCFA";
}

function detectQuestionBrands(q: string): string[] {
  const ql = q.toLowerCase();
  return Object.keys(BRAND_KEYWORDS).filter((brand) =>
    BRAND_KEYWORDS[brand].some((kw) => ql.includes(kw)),
  );
}

function detectQuestionParts(q: string): string[] {
  const ql = q.toLowerCase();
  const found: string[] = [];
  for (const keywords of Object.values(PART_KEYWORDS)) {
    for (const kw of keywords) {
      if (ql.includes(kw)) found.push(kw);
    }
  }
  return [...new Set(found)];
}

function detectQuestionZones(q: string): string[] {
  const ql = q.toLowerCase();
  return Object.keys(ZONE_KEYWORDS).filter((zone) =>
    ZONE_KEYWORDS[zone].some((kw) => ql.includes(kw)),
  );
}

/**
 * Filtre les entrées selon la question posée.
 */
function filterEntries(entries: VendorEntry[], question: string): VendorEntry[] {
  const brands = detectQuestionBrands(question);
  const parts = detectQuestionParts(question);
  const zones = detectQuestionZones(question);
  const wantsAvailable = /\b(disponible|en stock|dispo|trouver|avoir)\b/i.test(question);
  const wantsCheapest = /\b(moins cher|pas cher|économique|prix bas|moins chère)\b/i.test(question);
  const wantsAll = /\b(tout|liste|résumé|inventaire|toutes?\s+les?\s+pièces?)\b/i.test(question);

  let filtered = [...entries];

  // Si aucun filtre détecté, retourner tout (résumé global)
  if (brands.length === 0 && parts.length === 0 && zones.length === 0 && !wantsAll) {
    // Recherche textuelle libre sur le nom de la pièce
    const words = question.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const textFiltered = entries.filter((e) =>
      words.some((w) => e.piece.toLowerCase().includes(w) || e.rawLine.toLowerCase().includes(w)),
    );
    if (textFiltered.length > 0) filtered = textFiltered;
  } else {
    if (brands.length > 0) {
      filtered = filtered.filter((e) => e.brand && brands.includes(e.brand));
    }
    if (parts.length > 0) {
      filtered = filtered.filter((e) =>
        parts.some((p) => e.piece.toLowerCase().includes(p) || e.rawLine.toLowerCase().includes(p)),
      );
    }
    if (zones.length > 0) {
      filtered = filtered.filter((e) => e.zone && zones.includes(e.zone));
    }
  }

  if (wantsAvailable) {
    filtered = filtered.filter((e) => e.available === true);
  }
  if (wantsCheapest) {
    filtered = filtered.filter((e) => e.price !== null);
    filtered.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    filtered = filtered.slice(0, 3);
  }

  return filtered;
}

/* ══════════════════════════════════════════════════════════
   Générateur de fiche
   ══════════════════════════════════════════════════════════ */

function buildFiche(question: string, all: VendorEntry[], filtered: VendorEntry[]): string {
  const now = new Date().toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const sep = "─".repeat(38);
  let out = `📋 FICHE VENDEUR AutoForge\n${sep}\n🕐 ${now}\n\n`;
  out += `❓ Question : « ${question.trim()} »\n\n`;

  if (all.length === 0) {
    out += `⚠️  Aucune donnée terrain saisie.\n\n`;
    out += `Pour générer une fiche, entrez vos observations dans le champ\n`;
    out += `« Pièces disponibles observées » (une pièce par ligne).\n\n`;
    out += `💡 Exemple de format :\n`;
    out += `   Colobane — Plaquette frein Toyota Corolla : 15 000 FCFA, en stock\n`;
    out += `   Pikine — Batterie 12V 70Ah : 52 000 FCFA, rupture\n`;
    out += `   Grand Yoff — Alternateur Hyundai Tucson : 65 000 FCFA, disponible`;
    return out;
  }

  if (filtered.length === 0) {
    out += `😕 Aucune pièce trouvée dans vos données pour cette question.\n\n`;

    // Proposer un résumé global comme aide
    const avail = all.filter((e) => e.available === true);
    const unavail = all.filter((e) => e.available === false);
    out += `📦 Votre stock actuel (${all.length} entrée${all.length > 1 ? "s" : ""}) :\n`;
    out += `   ✅ ${avail.length} disponible${avail.length > 1 ? "s" : ""} · `;
    out += `❌ ${unavail.length} en rupture · `;
    out += `❓ ${all.length - avail.length - unavail.length} non précisé${all.length - avail.length - unavail.length > 1 ? "s" : ""}\n\n`;
    out += `💡 Reformulez avec un nom de pièce, une marque ou une zone.`;
    return out;
  }

  // Affichage des résultats
  const avail = filtered.filter((e) => e.available === true);
  const unavail = filtered.filter((e) => e.available === false);
  const unknown = filtered.filter((e) => e.available === null);

  out += `🔍 ${filtered.length} résultat${filtered.length > 1 ? "s" : ""} trouvé${filtered.length > 1 ? "s" : ""} :\n\n`;

  if (avail.length > 0) {
    out += `✅ DISPONIBLES (${avail.length}) :\n`;
    avail.forEach((e, i) => {
      out += `\n${i + 1}. ${e.piece || e.rawLine}\n`;
      if (e.brand) out += `   🏷️  Marque : ${e.brand}\n`;
      if (e.zone) out += `   📍 Zone : ${e.zone}\n`;
      if (e.price) out += `   💰 Prix : ${formatFCFA(e.price)}\n`;
      if (e.date) out += `   📅 Vu le : ${e.date}\n`;
    });
    out += "\n";
  }

  if (unavail.length > 0) {
    out += `❌ EN RUPTURE (${unavail.length}) :\n`;
    unavail.forEach((e, i) => {
      out += `\n${i + 1}. ${e.piece || e.rawLine}\n`;
      if (e.brand) out += `   🏷️  Marque : ${e.brand}\n`;
      if (e.zone) out += `   📍 Zone : ${e.zone}\n`;
      if (e.price) out += `   💰 Dernier prix : ${formatFCFA(e.price)}\n`;
    });
    out += "\n";
  }

  if (unknown.length > 0) {
    out += `❓ STATUT NON PRÉCISÉ (${unknown.length}) :\n`;
    unknown.forEach((e) => {
      out += `   • ${e.piece || e.rawLine}`;
      if (e.price) out += ` — ${formatFCFA(e.price)}`;
      out += "\n";
    });
    out += "\n";
  }

  // Stats
  const prices = filtered.filter((e) => e.price !== null).map((e) => e.price as number);
  if (prices.length > 0) {
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    out += `${sep}\n`;
    out += `📊 Prix : min ${formatFCFA(min)}`;
    if (min !== max) out += ` · max ${formatFCFA(max)}`;
    out += "\n";
  }

  out += `${sep}\n✅ Fiche générée par AutoForge IA locale`;
  return out;
}

/* ══════════════════════════════════════════════════════════
   Export principal
   ══════════════════════════════════════════════════════════ */

/**
 * Génère une fiche structurée à partir des données terrain du vendeur
 * et de sa question, entièrement en local (aucune API requise).
 */
export async function generateVendorFiche(
  question: string,
  donneesVendeur: string,
): Promise<VendorAIResult> {
  // Légère latence pour un retour UX naturel
  await new Promise((r) => setTimeout(r, 500));

  const entries = parseVendorData(donneesVendeur);
  const filtered = filterEntries(entries, question);
  const text = buildFiche(question, entries, filtered);

  return { text, entries };
}
