import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const DEFAULT_DEEPL_API_URL = "https://api-free.deepl.com/v2/translate";
const ALLOWED_TARGET_LANGS = new Set(["EN", "RU", "ZH", "ZH-HANS", "TH", "AR", "FA"]);

type TranslationProxyBody = {
  source_lang?: string;
  target_lang?: string;
  text?: string | string[];
};

async function readJsonBody(req: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    if (typeof chunk === "string") {
      chunks.push(Buffer.from(chunk));
    } else {
      chunks.push(chunk);
    }
  }

  const raw = Buffer.concat(chunks).toString("utf-8");
  return JSON.parse(raw) as TranslationProxyBody;
}

function sendJson(res: ServerResponse, status: number, body: Record<string, unknown>) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function createDeepLProxyPlugin(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), "");
  const deeplApiKey = env.DEEPL_API_KEY?.trim();
  const deeplApiUrl = env.DEEPL_API_URL?.trim() || DEFAULT_DEEPL_API_URL;

  return {
    name: "deepl-translate-proxy",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/api/deepl-translate", async (req, res) => {
        if (req.method !== "POST") {
          sendJson(res, 405, { error: "Method Not Allowed" });
          return;
        }

        if (!deeplApiKey) {
          sendJson(res, 503, {
            error: "DeepL proxy is not configured. Set DEEPL_API_KEY and restart dev server.",
          });
          return;
        }

        let incomingBody: TranslationProxyBody;
        try {
          incomingBody = await readJsonBody(req);
        } catch {
          sendJson(res, 400, { error: "Invalid JSON body." });
          return;
        }

        const incomingTexts = Array.isArray(incomingBody.text)
          ? incomingBody.text
          : [incomingBody.text];
        const text = incomingTexts
          .filter((value): value is string => typeof value === "string")
          .map((value) => value.trim())
          .filter(Boolean)
          .slice(0, 50);
        const targetLang = incomingBody.target_lang?.toUpperCase();
        const sourceLang = incomingBody.source_lang?.toUpperCase() || "EN";

        if (!text.length || !targetLang || !ALLOWED_TARGET_LANGS.has(targetLang)) {
          sendJson(res, 400, {
            error: "Invalid translation request. Provide text and target_lang (EN/RU/ZH/TH/AR/FA).",
          });
          return;
        }

        try {
          const deepLResponse = await fetch(deeplApiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `DeepL-Auth-Key ${deeplApiKey}`,
            },
            body: JSON.stringify({
              text,
              source_lang: sourceLang,
              target_lang: targetLang,
            }),
          });

          const deepLPayload = (await deepLResponse.json()) as Record<string, unknown>;
          sendJson(res, deepLResponse.status, deepLPayload);
        } catch {
          sendJson(res, 502, { error: "Failed to reach DeepL API endpoint." });
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  base: "/Real-Estate-Test-site/",
  plugins: [react(), createDeepLProxyPlugin(mode)],
}));

