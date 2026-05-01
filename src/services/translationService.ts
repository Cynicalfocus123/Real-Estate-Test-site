import { safeTranslationEndpoint } from "../utils/security";

export type SiteLanguage = "EN" | "RU" | "ZH" | "TH" | "AR" | "FA";

const DEFAULT_DEEPLX_ENDPOINT = "https://deeplx.vercel.app/translate";
const TRANSLATION_ENDPOINT = safeTranslationEndpoint(
  import.meta.env.VITE_DEEPLX_API_URL,
  DEFAULT_DEEPLX_ENDPOINT,
);

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
    const response = await fetch(TRANSLATION_ENDPOINT, {
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
  let directTranslations: string[] = [];

  try {
    const directPayload = await requestTranslation(dedupedTexts, targetLanguage, signal);
    directTranslations = parseTranslationResponse(directPayload);
  } catch {
    directTranslations = [];
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

  const settledFallbacks = await Promise.allSettled(
    dedupedTexts.map(async (source) => {
      const payload = await requestTranslation(source, targetLanguage, signal);
      const translated = parseTranslationResponse(payload)[0];
      if (translated) {
        translationMap.set(source, translated);
      }
    }),
  );

  const hasAnyFallbackFailures = settledFallbacks.some((result) => result.status === "rejected");
  if (hasAnyFallbackFailures && translationMap.size === 0) {
    throw new Error("Translation endpoint did not return any translated text.");
  }

  return translationMap;
}
