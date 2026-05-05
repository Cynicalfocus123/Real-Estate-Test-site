import { useEffect, useMemo, useState } from "react";
import { useMockAuth } from "./useMockAuth";
import {
  getFavorites as getFavoritesByUser,
  toggleFavorite as toggleFavoriteByUser,
} from "../services/favoritesService";
import { requestAuthModal } from "../utils/authModal";

const FAVORITES_UPDATED_EVENT = "bhfl:favorites-updated";

export function useFavorites() {
  const { mockUser, isSignedIn } = useMockAuth();
  const userKey = useMemo(() => mockUser?.userKey || null, [mockUser?.userKey]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!userKey || !isSignedIn) {
      setFavoriteIds([]);
      return;
    }
    setFavoriteIds(getFavoritesByUser(userKey));
  }, [isSignedIn, userKey]);

  useEffect(() => {
    function syncFavorites() {
      if (!userKey || !isSignedIn) {
        setFavoriteIds([]);
        return;
      }
      setFavoriteIds(getFavoritesByUser(userKey));
    }

    window.addEventListener("storage", syncFavorites);
    window.addEventListener(FAVORITES_UPDATED_EVENT, syncFavorites);
    return () => {
      window.removeEventListener("storage", syncFavorites);
      window.removeEventListener(FAVORITES_UPDATED_EVENT, syncFavorites);
    };
  }, [isSignedIn, userKey]);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(""), 2400);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  function toggleFavorite(propertyId: string) {
    if (!isSignedIn || !userKey) {
      setNotice("Please log in to save properties.");
      requestAuthModal("login");
      return false;
    }

    const nextSaved = toggleFavoriteByUser(userKey, propertyId);
    const nextFavorites = getFavoritesByUser(userKey);
    setFavoriteIds(nextFavorites);
    window.dispatchEvent(new CustomEvent(FAVORITES_UPDATED_EVENT));
    return nextSaved;
  }

  function isFavorite(propertyId: string) {
    return favoriteIdSet.has(propertyId);
  }

  return {
    favoriteIds,
    isFavorite,
    toggleFavorite,
    isSignedIn,
    notice,
  };
}

// TODO: replace with GraphQL/PostgreSQL getSavedProperties.
// TODO: replace with GraphQL/PostgreSQL saveProperty.
// TODO: replace with GraphQL/PostgreSQL unsaveProperty.
