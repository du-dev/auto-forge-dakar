/**
 * VoiceSearch — Recherche vocale universelle.
 *
 * 1. Enregistre l'audio avec MediaRecorder (TOUS les navigateurs)
 * 2. Envoie à l'API Whisper gratuite de Hugging Face
 * 3. Récupère le texte transcrit
 *
 * Token gratuit : https://huggingface.co/settings/tokens
 * Ajoutez VITE_HF_TOKEN=hf_xxxxx dans le fichier .env
 *
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

export default function VoiceSearch({ onResult, disabled }: VoiceSearchProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [hfToken] = useState(() => {
    const t = import.meta.env.VITE_HF_TOKEN;
    return t && t !== "hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" ? t : null;
  });
  const panelRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onResult);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  callbackRef.current = onResult;

  /* ── Enregistrement audio ── */
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4";

      const recorder = new MediaRecorder(stream, { mimeType: mime });
      audioChunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        setRecording(false);
        setProcessing(true);

        const blob = new Blob(audioChunksRef.current, { type: mime });

        if (blob.size < 1000) {
          toast.info("🤫 Aucune parole détectée", {
            description: "Rien enregistré. Réessayez.",
            duration: 3000,
          });
          setProcessing(false);
          return;
        }

        /* Transcrire via Whisper API */
        try {
          if (!hfToken) {
            toast.error("🔑 Token Hugging Face manquant", {
              description:
                "Créez un token gratuit sur huggingface.co/settings/tokens et ajoutez-le dans le fichier .env",
              duration: 6000,
            });
            setProcessing(false);
            return;
          }

          const response = await fetch("/api/whisper", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${hfToken}`,
              "X-Wait-For-Model": "true",
              "Content-Type": blob.type || "audio/wav",
            },
            body: blob,
          });

          if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            throw new Error(
              `HTTP ${response.status}${errBody.error ? ": " + errBody.error : ""}`,
            );
          }

          const result = await response.json();
          const text = (result?.text || "").trim();

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
        } catch (err: any) {
          console.error("Whisper API error:", err);
          toast.error("Erreur de transcription", {
            description:
              err?.message?.includes("403")
                ? "Token invalide. Vérifiez votre token Hugging Face."
                : err?.message || "Veuillez réessayer.",
            duration: 5000,
          });
        }

        setProcessing(false);
      };

      recorder.start();
      setRecording(true);
      toast.info("🎤 Enregistrement…", {
        description: "Parlez, puis recliquez sur le micro pour arrêter.",
        duration: 5000,
      });
    } catch (err: any) {
      console.error("Mic error:", err);
      if (err.name === "NotAllowedError") {
        toast.error("🔇 Microphone bloqué", {
          description: "Autorisez le micro dans les paramètres du site.",
          duration: 5000,
        });
      } else if (err.name === "NotFoundError") {
        toast.error("🎤 Aucun micro détecté", {
          description: "Branchez un microphone.",
          duration: 5000,
        });
      } else {
        toast.error("Erreur microphone", {
          description: "Impossible d'accéder au micro.",
          duration: 4000,
        });
      }
    }
  }, []);

  /* Arrêter l'enregistrement */
  const stopRecording = useCallback(() => {
    const r = mediaRecorderRef.current;
    if (r && r.state !== "inactive") r.stop();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
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

  const isBusy = processing;

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

      {/* ── Panneau (fixed pour passer au-dessus de TOUT) ── */}
      {panelOpen && !recording && (
        <div
          ref={panelRef}
          className="fixed right-4 top-20 z-[9999] w-72 animate-scale-in rounded-2xl border border-border bg-card shadow-xl shadow-black/20"
        >
          {/* Section enregistrement */}
          <div className="border-b border-border p-4">
            <p className="mb-2 text-xs font-semibold text-foreground">
              🎤 Recherche vocale (Whisper API)
            </p>

            {!hfToken ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                <p className="font-semibold mb-1">🔑 Token requis</p>
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>Va sur huggingface.co/settings/tokens</li>
                  <li>Clique "New token" → Role: "read"</li>
                  <li>Copie le token (hf_xxxxx)</li>
                  <li>Colle-le dans le fichier <code className="bg-amber-100 px-1 rounded">.env</code></li>
                </ol>
              </div>
            ) : (
              <button
                onClick={startRecording}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
              >
                🎤 Cliquez pour parler
              </button>
            )}
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
