export type SiteLanguage = "EN" | "RU" | "ZH" | "TH" | "AR" | "FA";

const TRANSLATION_PROXY_PATH = "/api/deepl-translate";
const TRANSLATION_TIMEOUT_MS = 15000;

type DeepLApiResponse = {
  translations?: Array<{ text?: string }>;
};

function normalizeWhitespace(value: string) {
  return value.trim();
}

function parseTranslationResponse(payload: DeepLApiResponse): string[] {
  if (!Array.isArray(payload.translations)) {
    return [];
  }

  return payload.translations
    .map((item) => (typeof item.text === "string" ? item.text : ""))
    .filter(Boolean);
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
    const response = await fetch(TRANSLATION_PROXY_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        source_lang: "EN",
        target_lang: targetLanguage === "ZH" ? "ZH-HANS" : targetLanguage,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      let message = `Translation request failed (${response.status})`;
      try {
        const payload = (await response.json()) as { error?: string };
        if (payload?.error) {
          message = payload.error;
        }
      } catch {
        // Keep the fallback message when JSON parsing fails.
      }
      throw new Error(message);
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

  let translatedTexts: string[] = [];
  try {
    const responsePayload = await requestTranslation(dedupedTexts, targetLanguage, signal);
    translatedTexts = parseTranslationResponse(responsePayload);
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("DeepL proxy request failed.");
  }

  const translationMap = new Map<string, string>();

  if (translatedTexts.length === dedupedTexts.length) {
    dedupedTexts.forEach((source, index) => {
      const translated = translatedTexts[index];
      if (translated) {
        translationMap.set(source, translated);
      }
    });
    return translationMap;
  }

  for (const source of dedupedTexts) {
    const payload = await requestTranslation(source, targetLanguage, signal);
    const translated = parseTranslationResponse(payload)[0];
    if (translated) {
      translationMap.set(source, translated);
    }
  }

  if (translationMap.size === 0) {
    throw new Error("DeepL returned no translated text.");
  }

  return translationMap;
}

