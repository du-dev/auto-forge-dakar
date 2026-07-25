import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { runDifyWorkflow } from "../lib/dify.functions";
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

function SaisiePage() {
  const runDify = useServerFn(runDifyWorkflow);
  const [donnees, setDonnees] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { ref: headerRef, revealed: headerRevealed } = useReveal<HTMLDivElement>({ threshold: 0.2 });
  const { ref: formRef, revealed: formRevealed } = useReveal<HTMLFormElement>({ threshold: 0.1 });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await runDify({
        data: {
          query: question,
          donnees_vendeur: donnees,
          user: "vendeur-terrain",
        },
      });
      setResult(res.text || "(Aucune réponse)");
      toast.success("Fiche générée ✅", {
        description: "Le résultat s'affiche ci-dessous.",
        duration: 3000,
      });
    } catch (err) {
      console.error(err);
      setError("❌ Erreur — réessayer");
      toast.error("Erreur lors de la génération", {
        description: "Vérifiez votre connexion et réessayez.",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground shadow-sm transition-all duration-200 placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 hover:border-brand/50";

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 dark:bg-card/30">
      {/* Header */}
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
          Vendeur / Mécanicien partenaire — Données en temps réel
        </p>
      </div>

      {/* Step indicators */}
      <div
        className={`mb-8 flex items-center gap-4 transition-all duration-700 ${
          headerRevealed ? "revealed opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
        style={{ transitionDelay: "200ms" }}
      >
        {[
          { n: "1", t: "Saisir les données terrain" },
          { n: "2", t: "Poser votre question" },
          { n: "3", t: "Obtenir la fiche" },
        ].map((step, i) => (
          <div key={step.n} className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
              {step.n}
            </span>
            <span className="hidden text-xs font-medium text-foreground/70 sm:inline">{step.t}</span>
            {i < 2 && <span className="text-muted-foreground/30">→</span>}
          </div>
        ))}
      </div>

      {/* Form */}
      <form
        ref={formRef}
        onSubmit={onSubmit}
        className={`rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-700 ${
          formRevealed ? "revealed opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="space-y-5">
          <div>
            <label htmlFor="donnees" className="block text-sm font-semibold text-foreground">
              Pièces disponibles observées
            </label>
            <textarea
              id="donnees"
              rows={6}
              value={donnees}
              onChange={(e) => setDonnees(e.target.value)}
              placeholder="Ex: Pikine 23/07/2026 14h — Plaquette de frein Toyota Corolla : 8000 FCFA, en stock"
              className={inputCls + " resize-y dark:bg-background dark:placeholder:text-muted-foreground"}
            />
          </div>

          <div>
            <label htmlFor="question" className="block text-sm font-semibold text-foreground">
              Votre question
            </label>
            <input
              id="question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ex: Quel est le prix d'un alternateur pour Renault Logan ?"
              className={inputCls + " dark:bg-background dark:placeholder:text-muted-foreground"}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <span className="absolute inset-0 animate-shimmer" />
            {loading ? (
              <span className="relative inline-flex items-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Génération en cours…
              </span>
            ) : (
              <span className="relative">🔧 Générer la fiche</span>
            )}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="mt-6 animate-scale-in rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </div>
      )}

      {/* Result */}
      {result !== null && !error && (
        <div
          className="mt-6 animate-fade-in rounded-xl border border-border bg-card px-5 py-4 text-sm text-foreground shadow-sm"
          style={{ whiteSpace: "pre-line" }}
        >
          <div className="mb-3 flex items-center gap-2 border-b border-border pb-2">
            <span className="text-brand">📋</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand">
              Résultat
            </span>
          </div>
          {result}
        </div>
      )}
    </section>
  );
}
