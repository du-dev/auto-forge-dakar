/* ── Types ─────────────────────────────────────────────── */

type DifyInput = {
  query: string;
  donnees_vendeur?: string;
  user?: string;
};

/**
 * Appelle le workflow Dify directement depuis le navigateur.
 * La clé API est passée via VITE_DIFY_API_KEY (variable d'env Vite).
 */
export async function runDifyWorkflow(data: DifyInput) {
  const apiKey = import.meta.env.VITE_DIFY_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Clé API Dify non configurée. Ajoutez VITE_DIFY_API_KEY dans .env",
    );
  }

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
      throw new Error(`Dify ${res.status}: ${txt.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      data?: { outputs?: { text?: string } };
    };
    const text = json?.data?.outputs?.text ?? "";
    return { text };
  } finally {
    clearTimeout(timeout);
  }
}
