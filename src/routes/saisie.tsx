import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { runDifyWorkflow } from "../lib/dify.functions";

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
    } catch (err) {
      console.error(err);
      setError("❌ Erreur — réessayer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: "#EA580C" }}>
        🔧 Saisie Disponibilité Pièces
      </h1>
      <p className="mt-2 text-sm text-muted-foreground sm:text-base">
        Vendeur / Mécanicien partenaire — Données en temps réel
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
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
            className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-[#EA580C] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/30"
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
            className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-[#EA580C] focus:outline-none focus:ring-2 focus:ring-[#EA580C]/30"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md px-4 py-3 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto"
          style={{ backgroundColor: "#EA580C" }}
        >
          {loading ? "⏳ Génération en cours..." : "🔧 Générer la fiche"}
        </button>
      </form>

      {error && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {result !== null && !error && (
        <div
          className="mt-6 rounded-md border border-border bg-[#F3F4F6] px-4 py-4 text-sm text-foreground"
          style={{ whiteSpace: "pre-line" }}
        >
          {result}
        </div>
      )}
    </div>
  );
}
