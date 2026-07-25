import { createServerFn } from "@tanstack/react-start";

/* ── Types ─────────────────────────────────────────────── */

type DifyInput = {
  query: string;
  donnees_vendeur?: string;
  user?: string;
};

type ExpertInput = {
  question: string;
};

/* ── Saisie partenaire (existante) ─────────────────────── */

export const runDifyWorkflow = createServerFn({ method: "POST" })
  .inputValidator((data: DifyInput) => {
    if (!data || typeof data.query !== "string") {
      throw new Error("query is required");
    }
    return {
      query: data.query,
      donnees_vendeur: data.donnees_vendeur ?? "",
      user: data.user ?? "vendeur-terrain",
    };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.DIFY_API_KEY;
    if (!apiKey) throw new Error("DIFY_API_KEY not configured");

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
            donnees_vendeur: data.donnees_vendeur,
          },
          response_mode: "blocking",
          user: data.user,
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
  });


