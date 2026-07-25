/* ── Types ─────────────────────────────────────────────── */

type DifyInput = {
  query: string;
  donnees_vendeur?: string;
  user?: string;
};

/* ── Moteur local de génération de fiche (fallback sans API) ── */

/**
 * Extrait les lignes qui ressemblent à des entrées de prix/stock depuis
 * le texte libre du vendeur.
 * Exemples acceptés :
 *   "Plaquette frein Toyota : 8 000 FCFA, en stock"
 *   "Pikine 23/07/2026 14h — Batterie 12V : 52000 FCFA, rupture"
 */
function parseDonneesVendeur(raw: string): string {
  if (!raw.trim()) return "";

  const lines = raw
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const entries = lines.map((line, i) => {
    // Détecte le prix (5 000, 52000, 8 000 FCFA…)
    const priceMatch = line.match(/(\d[\d\s]*)\s*(fcfa|cfa|f\.?cfa)?/i);
    const price = priceMatch
      ? parseInt(priceMatch[1].replace(/\s/g, ""), 10)
      : null;

    // Disponibilité
    const dispo =
      /\b(stock|disponible|dispo)\b/i.test(line)
        ? "✅ En stock"
        : /\b(rupture|indisponible|épuisé|manquant)\b/i.test(line)
          ? "❌ En rupture"
          : "❓ Statut inconnu";

    // Formatage FCFA
    const priceStr = price
      ? `${price.toLocaleString("fr-FR")} FCFA`
      : "Prix non précisé";

    return `${i + 1}. ${line}\n   └─ Prix : ${priceStr} · ${dispo}`;
  });

  return entries.join("\n\n");
}

/**
 * Répond à la question du vendeur en s'appuyant sur ses données terrain.
 */
function generateLocalFiche(query: string, donnees: string): string {
  const now = new Date().toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const parsedData = parseDonneesVendeur(donnees);
  const hasData = donnees.trim().length > 0;

  let fiche = `📋 FICHE VENDEUR — ${now}\n`;
  fiche += `${"─".repeat(40)}\n\n`;

  fiche += `❓ Question posée :\n« ${query.trim()} »\n\n`;

  if (hasData) {
    fiche += `📦 Données terrain saisies :\n\n`;
    fiche += parsedData + "\n\n";

    // Analyser la question et répondre
    const qLower = query.toLowerCase();

    // Détection de la marque
    const brands = ["toyota", "peugeot", "hyundai", "nissan", "renault", "mitsubishi"];
    const detectedBrand = brands.find((b) => qLower.includes(b));

    // Détection de pièce
    const partWords = qLower.match(/\b(plaquette|frein|alternateur|démarreur|batterie|filtre|courroie|radiateur|amortisseur|embrayage|direction|injecteur|pompe)\b/);
    const detectedPart = partWords ? partWords[0] : null;

    fiche += `🤖 Analyse AutoForge :\n`;

    if (detectedPart || detectedBrand) {
      // Chercher dans les données du vendeur
      const lines = donnees.split(/\n/).filter(Boolean);
      const relevant = lines.filter((l) => {
        const ll = l.toLowerCase();
        return (
          (detectedPart && ll.includes(detectedPart)) ||
          (detectedBrand && ll.includes(detectedBrand))
        );
      });

      if (relevant.length > 0) {
        fiche += `Voici ce que j'ai trouvé dans vos données${detectedPart ? ` pour "${detectedPart}"` : ""}${detectedBrand ? ` (${detectedBrand})` : ""} :\n\n`;
        relevant.forEach((l) => {
          fiche += `   • ${l.trim()}\n`;
        });
      } else {
        fiche += `Aucune donnée sur${detectedPart ? ` "${detectedPart}"` : ""}${detectedBrand ? ` pour ${detectedBrand}` : ""} dans votre saisie du jour.\n`;
        fiche += `💡 Conseil : Ajoutez cette pièce à votre relevé terrain pour la prochaine mise à jour.\n`;
      }
    } else {
      // Résumé général des données
      const lines = donnees.split(/\n/).filter(Boolean);
      const inStock = lines.filter((l) => /\b(stock|disponible|dispo)\b/i.test(l)).length;
      const outOfStock = lines.filter((l) => /\b(rupture|indisponible|épuisé)\b/i.test(l)).length;
      fiche += `Vous avez saisi ${lines.length} ligne(s) de données terrain.\n`;
      if (inStock > 0) fiche += `   ✅ ${inStock} pièce(s) en stock\n`;
      if (outOfStock > 0) fiche += `   ❌ ${outOfStock} pièce(s) en rupture\n`;
    }
  } else {
    fiche += `⚠️  Aucune donnée terrain saisie.\n`;
    fiche += `Pour obtenir une fiche complète, renseignez les pièces observées dans le champ « Données terrain ».\n\n`;
    fiche += `💡 Exemple :\n`;
    fiche += `   Pikine 25/07/2026 10h — Plaquette frein Toyota : 8 000 FCFA, en stock\n`;
    fiche += `   Colobane — Batterie 12V 70Ah : 52 000 FCFA, disponible\n`;
    fiche += `   Grand Yoff — Alternateur Hyundai : rupture\n`;
  }

  fiche += `\n${"─".repeat(40)}\n`;
  fiche += `✅ Fiche générée localement par AutoForge\n`;
  fiche += `📤 Pour une analyse IA avancée, configurez VITE_DIFY_API_KEY dans .env`;

  return fiche;
}

/* ── Export principal ─────────────────────────────────── */

/**
 * Appelle le workflow Dify si VITE_DIFY_API_KEY est configurée,
 * sinon génère une fiche structurée localement (fallback sans API).
 */
export async function runDifyWorkflow(data: DifyInput): Promise<{ text: string }> {
  const apiKey = import.meta.env.VITE_DIFY_API_KEY;

  // ── Fallback local (pas de clé Dify configurée) ──────────
  if (!apiKey) {
    // Simuler une légère latence pour l'UX
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      text: generateLocalFiche(data.query, data.donnees_vendeur ?? ""),
    };
  }

  // ── Appel Dify réel ───────────────────────────────────────
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch("https://api.dify.ai/v1/workflows/run", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {
          query: data.query,
          donnees_vendeur: data.donnees_vendeur ?? "",
        },
        response_mode: "blocking",
        user: data.user ?? "vendeur-terrain",
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const txt = await res.text();
      // En cas d'erreur Dify, fallback local plutôt qu'une erreur rouge
      console.warn(`Dify ${res.status}: ${txt.slice(0, 200)} — fallback local activé`);
      return {
        text: generateLocalFiche(data.query, data.donnees_vendeur ?? ""),
      };
    }

    const json = (await res.json()) as {
      data?: { outputs?: { text?: string } };
    };
    const text = json?.data?.outputs?.text ?? "";
    return { text };
  } catch (err) {
    // Timeout ou erreur réseau → fallback local
    console.warn("Dify inaccessible, fallback local activé", err);
    return {
      text: generateLocalFiche(data.query, data.donnees_vendeur ?? ""),
    };
  } finally {
    clearTimeout(timeout);
  }
}
