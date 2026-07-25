import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { generateVendorFiche } from "../lib/vendor-ai";
import { useReveal } from "../lib/useReveal";

export const Route = createFileRoute("/saisie")({
  head: () => ({
    meta: [
      { title: "Saisie Disponibilité Pièces — AutoForge" },
      {
        name: "description",
        content:
          "Espace vendeurs et mécaniciens partenaires : remontez en temps réel la disponibilité et les prix des pièces détachées à Dakar.",
      },
      { property: "og:title", content: "Saisie Disponibilité Pièces — AutoForge" },
      {
        property: "og:description",
        content:
          "Espace vendeurs et mécaniciens partenaires : remontez en temps réel la disponibilité et les prix des pièces détachées à Dakar.",
      },
    ],
  }),
  component: SaisiePage,
});

const PLACEHOLDER_DONNEES = `Ex :
Colobane — Plaquette frein Toyota Corolla : 15 000 FCFA, en stock
Pikine 25/07/2026 — Batterie 12V 70Ah Universal : 52 000 FCFA, disponible
Grand Yoff — Alternateur Hyundai Tucson : 65 000 FCFA, rupture
Thiaroye — Filtre à huile Peugeot 307 : 5 000 FCFA, en stock
Diamniadio — Démarreur Toyota Corolla : 45 000 FCFA, disponible`;

const EXEMPLES_QUESTIONS = [
  "Quelles pièces Toyota sont disponibles ?",
  "Quel est le prix le moins cher ?",
  "Y a-t-il des pièces à Colobane ?",
  "Quels articles sont en rupture ?",
  "Montre-moi tout l'inventaire",
];

function SaisiePage() {
  const [donnees, setDonnees] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const { ref: headerRef, revealed: headerRevealed } = useReveal<HTMLDivElement>({ threshold: 0.2 });
  const { ref: formRef, revealed: formRevealed } = useReveal<HTMLFormElement>({ threshold: 0.1 });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await generateVendorFiche(question.trim(), donnees);
      setResult(res.text);
      toast.success("Fiche générée ✅", {
        description: "Le résultat s'affiche ci-dessous.",
        duration: 3000,
      });
    } catch (err) {
      console.error(err);
      toast.error("Erreur inattendue", {
        description: "Veuillez réessayer.",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground shadow-sm transition-all duration-200 placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 hover:border-brand/50";

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      {/* ── En-tête ── */}
      <div ref={headerRef} className="mb-6">
        <h1
          className={`text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl transition-all duration-700 ${
            headerRevealed ? "revealed opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          🔧 Saisie Disponibilité Pièces
        </h1>
        <p
          className={`mt-2 text-sm text-muted-foreground sm:text-base transition-all duration-700 ${
            headerRevealed ? "revealed opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDelay: "100ms" }}
        >
          Vendeur / Mécanicien partenaire — Analyse IA locale, sans connexion requise
        </p>
      </div>

      {/* ── Étapes ── */}
      <div
        className={`mb-8 flex flex-wrap items-center gap-3 transition-all duration-700 ${
          headerRevealed ? "revealed opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
        style={{ transitionDelay: "200ms" }}
      >
        {[
          { n: "1", t: "Saisir les données terrain", icon: "📝" },
          { n: "2", t: "Poser votre question", icon: "❓" },
          { n: "3", t: "Obtenir la fiche", icon: "📋" },
        ].map((step, i) => (
          <div key={step.n} className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white shadow-sm">
              {step.n}
            </span>
            <span className="hidden text-xs font-medium text-foreground/70 sm:inline">
              {step.icon} {step.t}
            </span>
            {i < 2 && <span className="text-muted-foreground/40 ml-1">→</span>}
          </div>
        ))}
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          IA locale — aucune API
        </span>
      </div>

      {/* ── Formulaire ── */}
      <form
        ref={formRef}
        onSubmit={onSubmit}
        className={`rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-700 ${
          formRevealed ? "revealed opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="space-y-5">
          {/* Données terrain */}
          <div>
            <label htmlFor="donnees" className="block text-sm font-semibold text-foreground">
              Pièces observées sur le terrain
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                (une pièce par ligne)
              </span>
            </label>
            <textarea
              id="donnees"
              rows={7}
              value={donnees}
              onChange={(e) => setDonnees(e.target.value)}
              placeholder={PLACEHOLDER_DONNEES}
              className={inputCls + " resize-y font-mono text-xs leading-relaxed dark:bg-background"}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Format libre : zone, pièce, marque, prix en FCFA, statut (en stock / rupture)
            </p>
          </div>

          {/* Question */}
          <div>
            <label htmlFor="question" className="block text-sm font-semibold text-foreground">
              Votre question
            </label>
            <input
              id="question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ex : Quelles pièces Toyota sont disponibles à Colobane ?"
              className={inputCls + " dark:bg-background"}
              required
            />

            {/* Questions exemples */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {EXEMPLES_QUESTIONS.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setQuestion(ex)}
                  className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-all hover:border-brand hover:text-brand hover:bg-brand/5"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Bouton */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="absolute inset-0 animate-shimmer" />
              {loading ? (
                <span className="relative inline-flex items-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Analyse en cours…
                </span>
              ) : (
                <span className="relative">🔧 Générer la fiche</span>
              )}
            </button>

            {(donnees || question || result) && (
              <button
                type="button"
                onClick={() => {
                  setDonnees("");
                  setQuestion("");
                  setResult(null);
                }}
                className="rounded-lg border border-border px-4 py-3 text-sm text-muted-foreground transition-all hover:border-danger/50 hover:text-danger hover:bg-danger/5"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      </form>

      {/* ── Résultat ── */}
      {result !== null && (
        <div className="mt-6 animate-fade-in-up">
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            {/* Barre de titre */}
            <div className="flex items-center justify-between border-b border-border bg-brand/5 px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="text-brand">📋</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-brand">
                  Fiche générée
                </span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result);
                  toast.success("Copié !", { duration: 2000 });
                }}
                className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition-all hover:text-foreground hover:bg-muted"
              >
                📋 Copier
              </button>
            </div>

            {/* Contenu */}
            <pre className="whitespace-pre-wrap break-words px-5 py-4 font-mono text-xs leading-relaxed text-foreground sm:text-sm">
              {result}
            </pre>
          </div>
        </div>
      )}
    </section>
  );
}
