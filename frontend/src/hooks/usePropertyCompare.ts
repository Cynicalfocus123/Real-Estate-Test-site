import { useEffect, useMemo, useState } from "react";
import {
  clearComparePropertyIds,
  getComparePropertyIds,
  removeComparePropertyId,
  toggleComparePropertyId,
} from "../services/propertyCompareService";

const COMPARE_UPDATED_EVENT = "bhfl:compare-updated";

export function usePropertyCompare() {
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setCompareIds(getComparePropertyIds());
  }, []);

  useEffect(() => {
    function syncCompare() {
      setCompareIds(getComparePropertyIds());
    }

    window.addEventListener("storage", syncCompare);
    window.addEventListener(COMPARE_UPDATED_EVENT, syncCompare);
    return () => {
      window.removeEventListener("storage", syncCompare);
      window.removeEventListener(COMPARE_UPDATED_EVENT, syncCompare);
    };
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const compareIdSet = useMemo(() => new Set(compareIds), [compareIds]);

  function toggleCompare(propertyId: string) {
    const result = toggleComparePropertyId(propertyId);
    setCompareIds(result.compareIds);
    window.dispatchEvent(new CustomEvent(COMPARE_UPDATED_EVENT));

    if (result.limitReached) {
      setNotice("2 of 2 selected. Remove one property before adding another.");
    } else {
      setNotice(`${result.compareIds.length} of 2 selected`);
    }

    return result;
  }

  function removeCompare(propertyId: string) {
    const nextIds = removeComparePropertyId(propertyId);
    setCompareIds(nextIds);
    window.dispatchEvent(new CustomEvent(COMPARE_UPDATED_EVENT));
    setNotice(nextIds.length > 0 ? `${nextIds.length} of 2 selected` : "Compare list cleared");
    return nextIds;
  }

  function clearCompare() {
    clearComparePropertyIds();
    setCompareIds([]);
    window.dispatchEvent(new CustomEvent(COMPARE_UPDATED_EVENT));
    setNotice("Compare list cleared");
  }

  function isCompared(propertyId: string) {
    return compareIdSet.has(propertyId);
  }

  return {
    compareIds,
    compareCount: compareIds.length,
    isCompared,
    toggleCompare,
    removeCompare,
    clearCompare,
    notice,
  };
}
