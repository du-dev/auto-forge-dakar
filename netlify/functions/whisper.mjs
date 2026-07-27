/**
 * Netlify Function — Proxy pour l'API Whisper de Hugging Face.
 *
 * Reçoit l'audio du navigateur, le forwarde à Hugging Face,
 * et retourne la transcription. Évite les problèmes CORS.
 *
 * Variable d'environnement requise sur Netlify :
 *   HF_TOKEN = hf_votre_token_ici
 */

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const token =
    process.env.HF_TOKEN ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token || token.startsWith("hf_xxxxxxxxx")) {
    return new Response(
      JSON.stringify({ error: "Token Hugging Face manquant" }),
      {
        status: 400,
        headers: { "content-type": "application/json" },
      },
    );
  }

  try {
    const audioBuffer = await req.arrayBuffer();

    const response = await fetch(
      "https://api-inference.huggingface.co/models/openai/whisper-large-v3",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": req.headers.get("content-type") || "audio/wav",
          "X-Wait-For-Model": "true",
        },
        body: audioBuffer,
      },
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return new Response(
        JSON.stringify({
          error: `Hugging Face API error: ${response.status}`,
          detail: errorText.slice(0, 200),
        }),
        {
          status: response.status,
          headers: { "content-type": "application/json" },
        },
      );
    }

    const result = await response.json();

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    console.error("Whisper function error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};
