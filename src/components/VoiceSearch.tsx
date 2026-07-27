/**
 * VoiceSearch — Recherche vocale par API Web Speech native.
 *
 * Fonctionne sur Chrome/Edge/Safari (HTTPS requis ou localhost).
 * Ne nécessite AUCUN backend, token, ou déploiement.
 * Suggestions de recherche en fallback (marche TOUJOURS).
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";

type VoiceSearchProps = {
  onResult: (text: string) => void;
  disabled?: boolean;
};

/* ── Suggestions rapides (marche TOUJOURS) ── */
const QUICK_SEARCHES = [
  { label: "🚗 Plaquettes de frein", query: "plaquettes de frein" },
  { label: "🔧 Alternateur", query: "alternateur" },
  { label: "🔋 Batterie", query: "batterie" },
  { label: "🛞 Filtre à huile", query: "filtre à huile" },
  { label: "💡 Phare avant", query: "phare" },
  { label: "📍 Colobane", query: "colobane" },
  { label: "🔩 Amortisseur", query: "amortisseur" },
  { label: "⚙️ Embrayage", query: "embrayage" },
];

/* Détection du support de l'API Web Speech */
const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const isSpeechSupported = !!SpeechRecognition;

export default function VoiceSearch({ onResult, disabled }: VoiceSearchProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onResult);
  const recognitionRef = useRef<any>(null);

  callbackRef.current = onResult;

  /* ── Démarrer la reconnaissance vocale ── */
  const startRecording = useCallback(() => {
    if (!isSpeechSupported) {
      toast.error("🌐 Reconnaissance vocale non supportée", {
        description:
          "Utilisez Chrome ou Edge. Les suggestions cliquables fonctionnent sur tous les navigateurs.",
        duration: 6000,
      });
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "fr-FR";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setRecording(true);
        toast.info("🎤 Écoute…", {
          description: "Parlez maintenant.",
          duration: 10000,
        });
      };

      recognition.onresult = (event: any) => {
        const text = (event.results[0][0]?.transcript || "").trim();
        if (text) {
          callbackRef.current(text);
          setPanelOpen(false);
          toast.success("✅ Résultat vocal", {
            description: `« ${text} »`,
            duration: 3000,
          });
        } else {
          toast.info("🤫 Aucune parole détectée", {
            description: "Parlez plus près du micro.",
            duration: 3000,
          });
        }
        setProcessing(false);
        setRecording(false);
      };

      recognition.onerror = (event: any) => {
        console.error("SpeechRecognition error:", event.error);
        setRecording(false);
        setProcessing(false);

        const messages: Record<string, string> = {
          "not-allowed":
            "Autorisez le micro dans les paramètres du site.",
          "no-speech":
            "Aucune parole détectée. Réessayez.",
          "network":
            "Désactivez les Shields Brave ou utilisez Chrome/Edge.",
          "aborted":
            "Reconnaissance interrompue.",
          "audio-capture":
            "Aucun microphone détecté.",
        };

        toast.error("🎤 Erreur de reconnaissance", {
          description:
            messages[event.error] || `Erreur: ${event.error}. Réessayez.`,
          duration: 5000,
        });
      };

      recognition.onend = () => {
        setRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error("SpeechRecognition error:", err);
      setProcessing(false);
      toast.error("🎤 Erreur", {
        description:
          err.message || "Impossible de démarrer la reconnaissance vocale.",
        duration: 4000,
      });
    }
  }, []);

  /* Arrêter la reconnaissance */
  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignorer les erreurs de stop
      }
      recognitionRef.current = null;
    }
    setRecording(false);
    setProcessing(false);
  }, []);

  /* ── Nettoyage ── */
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  /* Fermer panneau au clic extérieur */
  useEffect(() => {
    if (!panelOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [panelOpen]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          if (recording) {
            stopRecording();
          } else {
            setPanelOpen((p) => !p);
          }
        }}
        disabled={disabled || processing}
        className={`relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
          recording
            ? "border-red-400 bg-red-50 text-red-500 shadow-lg shadow-red-200 animate-pulse dark:bg-red-900/20 dark:border-red-500"
            : "border-border text-muted-foreground hover:border-brand hover:text-brand hover:bg-brand/5"
        }`}
        title={
          recording
            ? "Arrêter l'enregistrement"
            : processing
              ? "Transcription en cours…"
              : "Recherche vocale"
        }
        aria-label="Recherche vocale"
      >
        {recording ? "⏹️" : processing ? "⏳" : "🎤"}

        {recording && (
          <span className="absolute -right-1 -top-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
          </span>
        )}
      </button>

      {/* ── Panneau ── */}
      {panelOpen && !recording && (
        <div
          ref={panelRef}
          className="fixed right-4 top-20 z-[9999] w-72 animate-scale-in rounded-2xl border border-border bg-card shadow-xl shadow-black/20"
        >
          {/* Section enregistrement */}
          <div className="border-b border-border p-4">
            <p className="mb-2 text-xs font-semibold text-foreground">
              🎤 Recherche vocale
            </p>

            {!isSpeechSupported ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                <p className="font-semibold mb-1">
                  🌐 Navigateur non supporté
                </p>
                <p>
                  Utilisez <strong>Chrome</strong> ou <strong>Edge</strong>{" "}
                  pour la reconnaissance vocale. Les suggestions cliquables
                  ci-dessous fonctionnent sur tous les navigateurs.
                </p>
              </div>
            ) : (
              <button
                onClick={startRecording}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]"
              >
                🎤 Cliquez pour parler
              </button>
            )}

            <p className="mt-2 text-[10px] text-muted-foreground text-center">
              ℹ️ Chrome/Edge recommandé — fonctionne sur HTTPS
            </p>
          </div>

          {/* Suggestions */}
          <div className="p-3">
            <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              🔍 Recherche rapide
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SEARCHES.map((s) => (
                <button
                  key={s.query}
                  onClick={() => {
                    callbackRef.current(s.query);
                    setPanelOpen(false);
                    toast.success("🔍 Recherche lancée", {
                      description: `« ${s.label} »`,
                      duration: 2000,
                    });
                  }}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:border-brand hover:text-brand hover:bg-brand/5"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
