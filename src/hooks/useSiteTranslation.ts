import { useEffect, useMemo, useRef } from "react";
import { type SiteLanguage, translateBatch } from "../services/translationService";

const TRANSLATION_BATCH_SIZE = 40;
const LANGUAGE_STORAGE_KEY = "bhfl-language";
const CACHE_STORAGE_KEY = "bhfl-language-cache-v1";
const RTL_LANGUAGES = new Set<SiteLanguage>(["AR", "FA"]);

type TextTarget = {
  source: string;
  apply: (translatedText: string) => void;
};

function hasTranslatableEnglishText(value: string) {
  const compact = value.trim();
  return compact.length > 1 && /[A-Za-z]/.test(compact);
}

function splitTextEdges(value: string) {
  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  const compact = value.trim();
  return { leading, compact, trailing };
}

function loadPersistedCache() {
  if (typeof window === "undefined") {
    return new Map<string, string>();
  }

  try {
    const raw = window.localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return new Map<string, string>();
    const parsed = JSON.parse(raw) as Record<string, string>;
    return new Map(Object.entries(parsed));
  } catch {
    return new Map<string, string>();
  }
}

export function getInitialLanguage() {
  if (typeof window === "undefined") {
    return "EN" as SiteLanguage;
  }

  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (savedLanguage === "RU" || savedLanguage === "ZH" || savedLanguage === "TH" || savedLanguage === "AR" || savedLanguage === "FA") {
    return savedLanguage;
  }
  return "EN";
}

export function useSiteTranslation(language: SiteLanguage) {
  const sourceTextNodesRef = useRef(new WeakMap<Text, string>());
  const sourceAttributeValuesRef = useRef(new WeakMap<Element, Map<string, string>>());
  const translationCacheRef = useRef<Map<string, string>>(loadPersistedCache());
  const isApplyingRef = useRef(false);
  const isMountedRef = useRef(false);

  const cachePrefix = useMemo(() => `${language}::`, [language]);

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language.toLowerCase();
    document.documentElement.dir = RTL_LANGUAGES.has(language) ? "rtl" : "ltr";
  }, [language]);

  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return;
    }

    isMountedRef.current = true;
    const abortController = new AbortController();

    function getSourceAttribute(element: Element, attributeName: string, fallback: string) {
      let attributeMap = sourceAttributeValuesRef.current.get(element);
      if (!attributeMap) {
        attributeMap = new Map<string, string>();
        sourceAttributeValuesRef.current.set(element, attributeMap);
      }

      if (!attributeMap.has(attributeName)) {
        attributeMap.set(attributeName, fallback);
      }

      return attributeMap.get(attributeName) ?? fallback;
    }

    function collectTargets() {
      const targets: TextTarget[] = [];
      if (!document.body) return targets;

      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let currentNode = walker.nextNode();

      while (currentNode) {
        if (currentNode instanceof Text) {
          const parent = currentNode.parentElement;
          const rawValue = currentNode.nodeValue ?? "";
          const sourceValue = sourceTextNodesRef.current.get(currentNode) ?? rawValue;
          if (!sourceTextNodesRef.current.has(currentNode)) {
            sourceTextNodesRef.current.set(currentNode, rawValue);
          }

          const isSafeParent =
            parent &&
            !parent.closest("[data-no-translate]") &&
            !parent.closest("svg") &&
            !["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA"].includes(parent.tagName);

          if (isSafeParent && hasTranslatableEnglishText(sourceValue)) {
            const { leading, compact, trailing } = splitTextEdges(sourceValue);
            if (compact) {
              const textNode = currentNode;
              targets.push({
                source: compact,
                apply: (translatedText) => {
                  textNode.nodeValue = `${leading}${translatedText}${trailing}`;
                },
              });
            }
          }
        }

        currentNode = walker.nextNode();
      }

      document
        .querySelectorAll<HTMLElement>("input[placeholder], textarea[placeholder], [title], [aria-label]")
        .forEach((element) => {
          if (element.closest("[data-no-translate]")) return;

          (["placeholder", "title", "aria-label"] as const).forEach((attributeName) => {
            const attributeValue = element.getAttribute(attributeName);
            if (!attributeValue) return;

            const sourceValue = getSourceAttribute(element, attributeName, attributeValue);
            if (!hasTranslatableEnglishText(sourceValue)) return;

            targets.push({
              source: sourceValue.trim(),
              apply: (translatedText) => element.setAttribute(attributeName, translatedText),
            });
          });
        });

      return targets;
    }

    async function applyTranslations() {
      if (isApplyingRef.current || abortController.signal.aborted || !isMountedRef.current) {
        return;
      }

      isApplyingRef.current = true;

      try {
        const targets = collectTargets();
        if (!targets.length) return;

        if (language === "EN") {
          targets.forEach((target) => target.apply(target.source));
          return;
        }

        const uniqueSources = Array.from(new Set(targets.map((target) => target.source)));
        const missingSources = uniqueSources.filter(
          (source) => !translationCacheRef.current.has(`${cachePrefix}${source}`),
        );

        for (let index = 0; index < missingSources.length; index += TRANSLATION_BATCH_SIZE) {
          if (abortController.signal.aborted) {
            return;
          }

          const batch = missingSources.slice(index, index + TRANSLATION_BATCH_SIZE);
          const translatedBatch = await translateBatch(batch, language, abortController.signal);
          translatedBatch.forEach((translatedText, sourceText) => {
            translationCacheRef.current.set(`${cachePrefix}${sourceText}`, translatedText);
          });
        }

        targets.forEach((target) => {
          const translatedText =
            translationCacheRef.current.get(`${cachePrefix}${target.source}`) ?? target.source;
          target.apply(translatedText);
        });

        try {
          const serializedCache = JSON.stringify(Object.fromEntries(translationCacheRef.current.entries()));
          window.localStorage.setItem(CACHE_STORAGE_KEY, serializedCache);
        } catch {
          // Ignore cache persistence errors.
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.warn("Site translation failed:", error);
        }
      } finally {
        isApplyingRef.current = false;
      }
    }

    let scheduled: number | null = null;
    const scheduleTranslation = () => {
      if (scheduled) {
        window.clearTimeout(scheduled);
      }
      scheduled = window.setTimeout(() => {
        scheduled = null;
        void applyTranslations();
      }, 120);
    };

    const observer = new MutationObserver(() => {
      if (!isApplyingRef.current) {
        scheduleTranslation();
      }
    });

    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["placeholder", "title", "aria-label"],
      });
    }

    scheduleTranslation();

    return () => {
      isMountedRef.current = false;
      abortController.abort();
      observer.disconnect();
      if (scheduled) {
        window.clearTimeout(scheduled);
      }
    };
  }, [cachePrefix, language]);
}
