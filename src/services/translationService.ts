import { safeTranslationEndpoint } from "../utils/security";

export type SiteLanguage = "EN" | "RU" | "ZH" | "TH" | "AR" | "FA";

const DEFAULT_DEEPLX_ENDPOINTS = [
  "http://localhost:1188/translate",
  "http://127.0.0.1:1188/translate",
  "https://api.deeplx.org/translate",
  "https://deeplx.vercel.app/translate",
  "https://deeplx-jade.vercel.app/translate",
] as const;

const TRANSLATION_TIMEOUT_MS = 15000;

type DeepLApiResponse = {
  translations?: Array<{ text?: string }>;
  data?: string | string[];
  text?: string | string[];
};

function normalizeWhitespace(value: string) {
  return value.trim();
}

function parseTranslationResponse(payload: DeepLApiResponse): string[] {
  if (Array.isArray(payload.translations)) {
    return payload.translations
      .map((item) => (typeof item.text === "string" ? item.text : ""))
      .filter(Boolean);
  }

  if (Array.isArray(payload.data)) {
    return payload.data.filter((entry): entry is string => typeof entry === "string");
  }

  if (typeof payload.data === "string") {
    return [payload.data];
  }

  if (Array.isArray(payload.text)) {
    return payload.text.filter((entry): entry is string => typeof entry === "string");
  }

  if (typeof payload.text === "string") {
    return [payload.text];
  }

  return [];
}

async function requestTranslation(
  text: string | string[],
  targetLanguage: SiteLanguage,
  translationEndpoint: string,
  signal?: AbortSignal,
) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), TRANSLATION_TIMEOUT_MS);
  const forwardAbort = () => controller.abort();

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener("abort", forwardAbort, { once: true });
    }
  }

  try {
    const response = await fetch(translationEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        source_lang: "EN",
        target_lang: targetLanguage,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Translation request failed (${response.status})`);
    }

    return (await response.json()) as DeepLApiResponse;
  } finally {
    window.clearTimeout(timeout);
    if (signal) {
      signal.removeEventListener("abort", forwardAbort);
    }
  }
}

export async function translateBatch(
  texts: string[],
  targetLanguage: SiteLanguage,
  signal?: AbortSignal,
) {
  if (!texts.length) {
    return new Map<string, string>();
  }

  if (targetLanguage === "EN") {
    return new Map(texts.map((text) => [text, text]));
  }

  const dedupedTexts = Array.from(new Set(texts.map((text) => normalizeWhitespace(text)).filter(Boolean)));
  const endpointCandidates = [
    import.meta.env.VITE_DEEPLX_API_URL,
    ...DEFAULT_DEEPLX_ENDPOINTS,
  ]
    .map((endpoint) => safeTranslationEndpoint(endpoint, ""))
    .filter(Boolean);
  const uniqueEndpoints = Array.from(new Set(endpointCandidates));

  let directTranslations: string[] = [];
  let lastError: Error | null = null;
  let activeEndpoint: string | null = null;

  for (const endpoint of uniqueEndpoints) {
    try {
      const directPayload = await requestTranslation(dedupedTexts, targetLanguage, endpoint, signal);
      directTranslations = parseTranslationResponse(directPayload);
      activeEndpoint = endpoint;
      if (directTranslations.length) {
        break;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      directTranslations = [];
    }
  }

  const translationMap = new Map<string, string>();

  if (directTranslations.length === dedupedTexts.length) {
    dedupedTexts.forEach((source, index) => {
      const translated = directTranslations[index];
      if (translated) {
        translationMap.set(source, translated);
      }
    });
    return translationMap;
  }

  if (!activeEndpoint && !uniqueEndpoints.length) {
    throw new Error("No DeepLX endpoint is configured.");
  }

  if (!activeEndpoint) {
    throw lastError ?? new Error("DeepLX endpoint is unavailable.");
  }

  const settledFallbacks = await Promise.allSettled(
    dedupedTexts.map(async (source) => {
      const payload = await requestTranslation(source, targetLanguage, activeEndpoint, signal);
      const translated = parseTranslationResponse(payload)[0];
      if (translated) {
        translationMap.set(source, translated);
      }
    }),
  );

  const hasAnyFallbackFailures = settledFallbacks.some((result) => result.status === "rejected");
  if (hasAnyFallbackFailures && translationMap.size === 0) {
    throw new Error("DeepLX endpoint did not return any translated text.");
  }

  return translationMap;
}
