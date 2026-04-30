import { ChevronDown, ChevronUp, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { thaiProvinces } from "../data/thaiProvinces";
import type { ListingHomeType, ListingMode } from "../types/propertyListing";
import { cleanNumericText, cleanSearchText } from "../utils/security";

type QuickFilter = "price" | "rooms" | "homeType" | "province";
type PriceQuickView = "list-price" | "monthly-payment";
type DownPaymentOption = "amount" | "percentage";
type ThailandLocationSuggestion = {
  id: string;
  label: string;
};
type PhotonFeatureProperties = {
  country?: string;
  countrycode?: string;
  name?: string;
  city?: string;
  district?: string;
  county?: string;
  state?: string;
};
type PhotonResponse = {
  features?: Array<{
    properties?: PhotonFeatureProperties;
  }>;
};
type SearchPanelVariant = "default" | "hero";
type HeroSearchMode = "buy" | "rent" | "sell" | "senior";

const modeOptions: ListingMode[] = ["sale", "rent"];
const heroModeOptions: Array<{ value: HeroSearchMode; label: string }> = [
  { value: "buy", label: "Buy" },
  { value: "rent", label: "Rent" },
  { value: "sell", label: "Sell" },
  { value: "senior", label: "Senior Home" },
];
const bedroomOptions = ["Any", "Studio", "1", "2", "3", "4", "5+"] as const;
const bathroomOptions = ["Any", "1", "2", "3", "4", "5+"] as const;
const homeTypeOptions: Array<"Any" | ListingHomeType> = [
  "Any",
  "House",
  "Condo",
  "Townhouse",
  "Multi Family",
  "Land",
  "Apartment",
  "Single Detach House",
  "Semi Detached House",
];
const PHOTON_THAILAND_API_URL = "https://photon.komoot.io/api/";
const SALE_MAX_PRICE_LIMIT = 500000000;
const RENT_MAX_PRICE_LIMIT = 100000;
const priceBars = [1, 2, 3, 4, 6, 8, 12, 16, 22, 28, 34, 31, 43, 36, 38, 37, 35, 32, 38, 34, 33, 31, 27, 26, 20, 18, 16, 16, 17, 15, 13, 12, 15, 10, 11, 9, 12, 8, 10, 7, 8, 6];

function getBedroomOptionLabel(option: string) {
  if (option === "Any") return "Any bed";
  if (option === "Studio") return "Studio";
  return `${option} bed`;
}

function getBathroomOptionLabel(option: string) {
  return option === "Any" ? "Any bath" : `${option} bath`;
}

function getRoomFilterLabel(selectedBedroom: string, selectedBathroom: string) {
  if (selectedBedroom === "Any" && selectedBathroom === "Any") return "Room";
  if (selectedBedroom !== "Any" && selectedBathroom !== "Any") {
    return `${getBedroomOptionLabel(selectedBedroom)}, ${getBathroomOptionLabel(selectedBathroom)}`;
  }

  return selectedBedroom !== "Any"
    ? getBedroomOptionLabel(selectedBedroom)
    : getBathroomOptionLabel(selectedBathroom);
}

function getSingleFilterLabel(defaultLabel: string, selectedValue: string) {
  return selectedValue || defaultLabel;
}

function normalizeSearchValue(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function buildThailandLocationSuggestion(
  properties: PhotonFeatureProperties,
  index: number,
): ThailandLocationSuggestion | null {
  const countryCode = properties.countrycode?.toLowerCase();
  const country = properties.country?.toLowerCase();

  if (countryCode && countryCode !== "th") return null;
  if (!countryCode && country && !country.includes("thailand")) return null;

  const locality = [properties.name, properties.city, properties.district, properties.county]
    .map((value) => value?.trim() ?? "")
    .find(Boolean);
  const province = [properties.state, properties.county]
    .map((value) => value?.trim() ?? "")
    .find((value) => Boolean(value) && value !== locality);

  if (!locality) return null;

  const labelParts = Array.from(new Set([locality, province].filter(Boolean)));

  if (labelParts.length === 0) return null;

  return {
    id: `${labelParts.join("-")}-${index}`,
    label: labelParts.join(", "),
  };
}

function getPriceInputValue(value: number, limit: number) {
  return value === limit ? "" : String(value);
}

export function SearchPanel({ variant = "default" }: { variant?: SearchPanelVariant }) {
  const isHeroVariant = variant === "hero";
  const [mode, setMode] = useState<ListingMode>("sale");
  const [heroMode, setHeroMode] = useState<HeroSearchMode>("buy");
  const [query, setQuery] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<ThailandLocationSuggestion[]>([]);
  const [locationSuggestionsOpen, setLocationSuggestionsOpen] = useState(false);
  const [locationSuggestionsLoading, setLocationSuggestionsLoading] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [draftQuickProvince, setDraftQuickProvince] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(SALE_MAX_PRICE_LIMIT);
  const [priceQuickView, setPriceQuickView] = useState<PriceQuickView>("list-price");
  const [downPaymentOption, setDownPaymentOption] = useState<DownPaymentOption>("amount");
  const [selectedBedroom, setSelectedBedroom] = useState<string>("Any");
  const [selectedBathroom, setSelectedBathroom] = useState<string>("Any");
  const [draftQuickBedroom, setDraftQuickBedroom] = useState<string>("Any");
  const [draftQuickBathroom, setDraftQuickBathroom] = useState<string>("Any");
  const [selectedHomeType, setSelectedHomeType] = useState<"Any" | ListingHomeType>("Any");
  const [draftQuickHomeType, setDraftQuickHomeType] = useState<"Any" | ListingHomeType>("Any");
  const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilter | null>(null);
  const [mountedQuickFilter, setMountedQuickFilter] = useState<QuickFilter | null>(null);
  const searchBoxRef = useRef<HTMLDivElement | null>(null);
  const quickFilterRef = useRef<HTMLDivElement | null>(null);
  const lastPickedSuggestionRef = useRef("");
  const sanitizedQuery = cleanSearchText(query);
  const maxPriceLimit = mode === "rent" ? RENT_MAX_PRICE_LIMIT : SALE_MAX_PRICE_LIMIT;
  const minPriceLimit = 0;
  const priceStep = mode === "rent" ? 1000 : 1000000;
  const priceRange = maxPriceLimit - minPriceLimit || 1;
  const minThumbPosition = ((minPrice - minPriceLimit) / priceRange) * 100;
  const maxThumbPosition = ((maxPrice - minPriceLimit) / priceRange) * 100;
  const hasActiveProvinceFilter = Boolean(selectedProvince);
  const hasActivePriceFilter = minPrice > minPriceLimit || maxPrice < maxPriceLimit;
  const hasActiveRoomFilter = selectedBedroom !== "Any" || selectedBathroom !== "Any";
  const hasActiveHomeTypeFilter = selectedHomeType !== "Any";

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!quickFilterRef.current?.contains(event.target as Node)) {
        setActiveQuickFilter(null);
      }
      if (!searchBoxRef.current?.contains(event.target as Node)) {
        setLocationSuggestionsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (activeQuickFilter) {
      setMountedQuickFilter(activeQuickFilter);
      return;
    }

    const timeout = window.setTimeout(() => setMountedQuickFilter(null), 220);
    return () => window.clearTimeout(timeout);
  }, [activeQuickFilter]);

  useEffect(() => {
    const trimmedQuery = sanitizedQuery.trim();

    if (!trimmedQuery || trimmedQuery.length < 2 || trimmedQuery === lastPickedSuggestionRef.current) {
      setLocationSuggestions([]);
      setLocationSuggestionsOpen(false);
      setLocationSuggestionsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLocationSuggestionsLoading(true);

      try {
        const response = await fetch(
          `${PHOTON_THAILAND_API_URL}?q=${encodeURIComponent(`${trimmedQuery} Thailand`)}&limit=6&lang=en`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Thailand location search failed");
        }

        const payload = (await response.json()) as PhotonResponse;
        const nextSuggestions = (payload.features ?? [])
          .map((feature, index) => buildThailandLocationSuggestion(feature.properties ?? {}, index))
          .filter((suggestion): suggestion is ThailandLocationSuggestion => Boolean(suggestion))
          .filter(
            (suggestion, index, collection) =>
              collection.findIndex((candidate) => candidate.label === suggestion.label) === index,
          )
          .slice(0, 6);

        setLocationSuggestions(nextSuggestions);
        setLocationSuggestionsOpen(nextSuggestions.length > 0);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setLocationSuggestions([]);
        setLocationSuggestionsOpen(false);
      } finally {
        setLocationSuggestionsLoading(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [sanitizedQuery]);

  useEffect(() => {
    setMinPrice(0);
    setMaxPrice(mode === "rent" ? RENT_MAX_PRICE_LIMIT : SALE_MAX_PRICE_LIMIT);
    setPriceQuickView("list-price");
    setDownPaymentOption("amount");
    setActiveQuickFilter(null);
  }, [mode]);

  function toggleQuickFilter(filter: QuickFilter) {
    if (filter === "rooms") {
      setDraftQuickBedroom(selectedBedroom);
      setDraftQuickBathroom(selectedBathroom);
    }
    if (filter === "homeType") {
      setDraftQuickHomeType(selectedHomeType);
    }
    if (filter === "province") {
      setDraftQuickProvince(selectedProvince);
    }

    setActiveQuickFilter((current) => (current === filter ? null : filter));
  }

  function handleQueryChange(value: string) {
    lastPickedSuggestionRef.current = "";
    setQuery(value.replace(/[<>`]/g, "").slice(0, 80));
  }

  function applyLocationSuggestion(suggestion: ThailandLocationSuggestion) {
    lastPickedSuggestionRef.current = suggestion.label;
    setQuery(suggestion.label);
    setLocationSuggestions([]);
    setLocationSuggestionsOpen(false);
  }

  function applyProvinceQuickFilter() {
    setSelectedProvince(draftQuickProvince);
    setActiveQuickFilter(null);
  }

  function applyRoomsQuickFilter() {
    setSelectedBedroom(draftQuickBedroom);
    setSelectedBathroom(draftQuickBathroom);
    setActiveQuickFilter(null);
  }

  function applyHomeTypeQuickFilter() {
    setSelectedHomeType(draftQuickHomeType);
    setActiveQuickFilter(null);
  }

  function resetProvinceQuickFilter() {
    setSelectedProvince("");
    setDraftQuickProvince("");
    setActiveQuickFilter((current) => (current === "province" ? null : current));
  }

  function resetPriceQuickFilter() {
    setMinPrice(minPriceLimit);
    setMaxPrice(maxPriceLimit);
    setActiveQuickFilter((current) => (current === "price" ? null : current));
  }

  function resetRoomsQuickFilter() {
    setSelectedBedroom("Any");
    setSelectedBathroom("Any");
    setDraftQuickBedroom("Any");
    setDraftQuickBathroom("Any");
    setActiveQuickFilter((current) => (current === "rooms" ? null : current));
  }

  function resetHomeTypeQuickFilter() {
    setSelectedHomeType("Any");
    setDraftQuickHomeType("Any");
    setActiveQuickFilter((current) => (current === "homeType" ? null : current));
  }

  function handleMinPriceChange(value: number) {
    setMinPrice(Math.min(value, maxPrice - priceStep));
  }

  function handleMaxPriceChange(value: number) {
    setMaxPrice(Math.max(value, minPrice + priceStep));
  }

  function handleMinPriceInputChange(value: string) {
    const numericValue = cleanNumericText(value, 12);

    if (!numericValue) {
      setMinPrice(minPriceLimit);
      return;
    }

    const nextValue = Math.min(Math.max(Number(numericValue), minPriceLimit), maxPrice - priceStep);
    setMinPrice(nextValue);
  }

  function handleMaxPriceInputChange(value: string) {
    const numericValue = cleanNumericText(value, 12);

    if (!numericValue) {
      setMaxPrice(maxPriceLimit);
      return;
    }

    const nextValue = Math.max(Math.min(Number(numericValue), maxPriceLimit), minPrice + priceStep);
    setMaxPrice(nextValue);
  }

  function buildListingUrl() {
    if (isHeroVariant && heroMode === "senior") {
      const path = `${import.meta.env.BASE_URL}nursing-home-facility`;
      const queryString = sanitizedQuery ? `?q=${encodeURIComponent(sanitizedQuery)}` : "";
      return `${path}${queryString}`;
    }

    const params = new URLSearchParams();
    const normalizedQuery = normalizeSearchValue(sanitizedQuery);

    if (normalizedQuery) params.set("q", sanitizedQuery);
    if (!isHeroVariant) {
      if (selectedProvince) params.set("province", selectedProvince);
      if (selectedHomeType !== "Any") params.set("homeType", selectedHomeType);
      if (selectedBedroom !== "Any") params.set("bedroom", selectedBedroom);
      if (selectedBathroom !== "Any") params.set("bathroom", selectedBathroom);
      if (minPrice > minPriceLimit) params.set("minPrice", String(minPrice));
      if (maxPrice < maxPriceLimit) params.set("maxPrice", String(maxPrice));
    }

    const resolvedMode =
      isHeroVariant ? (heroMode === "rent" ? "rent" : "sale") : mode;
    const path = `${import.meta.env.BASE_URL}${resolvedMode === "rent" ? "properties-for-rent" : "properties-for-sale"}`;
    const queryString = params.toString();
    return queryString ? `${path}?${queryString}` : path;
  }

  function submitSearch() {
    window.location.href = buildListingUrl();
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitSearch();
  }

  if (isHeroVariant) {
    return (
      <form onSubmit={handleSearchSubmit} className="mx-auto flex w-full max-w-4xl flex-col items-center">
        <div className="flex flex-wrap items-center justify-center gap-5 text-sm font-black uppercase tracking-[0.2em] text-white sm:text-base">
          {heroModeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setHeroMode(option.value)}
              className={`border-b-2 pb-2 transition-colors duration-300 ${
                heroMode === option.value
                  ? "border-white text-white"
                  : "border-transparent text-white/72 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div ref={searchBoxRef} className="relative mt-8 w-full max-w-3xl">
          <label className="flex w-full items-center gap-4 rounded-full border border-white/35 bg-white/96 px-6 py-3 shadow-[0_20px_60px_rgba(15,23,42,0.22)] backdrop-blur-sm transition-shadow duration-300 focus-within:shadow-[0_26px_70px_rgba(15,23,42,0.28)] sm:px-7 sm:py-4">
            <input
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              onFocus={() => {
                if (locationSuggestions.length > 0) {
                  setLocationSuggestionsOpen(true);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setLocationSuggestionsOpen(false);
                }
              }}
              className="min-w-0 flex-1 bg-transparent text-base font-semibold text-brand-dark outline-none placeholder:text-brand-gray/90 sm:text-lg"
              maxLength={80}
              autoComplete="off"
              placeholder="Search Thailand cities, towns, property types"
            />
            <button
              type="submit"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-brand-dark transition hover:text-brand-red sm:text-base"
              aria-label="Search listings"
            >
              <span>Search</span>
              <Search className="h-5 w-5" />
            </button>
          </label>
          {locationSuggestionsLoading || locationSuggestionsOpen ? (
            <div className="absolute inset-x-0 top-[calc(100%+10px)] z-30 overflow-hidden rounded-[24px] border border-[#d8d2cc] bg-white shadow-[0_22px_60px_rgba(15,23,42,0.18)]">
              {locationSuggestionsLoading ? (
                <p className="px-5 py-4 text-sm font-semibold text-brand-gray">Searching Thailand locations...</p>
              ) : (
                locationSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => applyLocationSuggestion(suggestion)}
                    className="flex w-full items-center gap-3 border-b border-[#eee8e3] px-5 py-4 text-left text-sm font-semibold text-brand-dark transition-colors duration-300 last:border-b-0 hover:bg-[#faf7f3] hover:text-brand-red"
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-brand-red" />
                    <span>{suggestion.label}</span>
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSearchSubmit}
      className="mx-auto -mt-20 max-w-5xl rounded-[28px] border border-[#eee6df] bg-white px-3 py-5 shadow-search sm:px-4 sm:py-6"
    >
      <div className="mx-auto max-w-[920px]">
        <div className="flex flex-wrap justify-center gap-2 pb-3">
          {modeOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              className={`rounded-full px-5 py-2.5 text-sm font-black uppercase tracking-[0.14em] transition-all duration-300 ${
                mode === option
                  ? "bg-brand-red text-white shadow-[0_14px_28px_rgba(163,28,36,0.22)]"
                  : "border border-brand-line bg-white text-brand-dark hover:border-brand-red hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
              }`}
            >
              {option === "sale" ? "Sale" : "Rent"}
            </button>
          ))}
        </div>

        <div ref={searchBoxRef} className="relative mx-auto w-full lg:max-w-[700px]">
          <label className="flex w-full items-center gap-3 rounded-full border border-[#1f2937] bg-white px-6 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-shadow duration-300 focus-within:shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
            <Search className="h-5 w-5 text-brand-dark" />
            <input
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              onFocus={() => {
                if (locationSuggestions.length > 0) {
                  setLocationSuggestionsOpen(true);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setLocationSuggestionsOpen(false);
                }
              }}
              className="w-full text-base font-medium outline-none"
              maxLength={80}
              autoComplete="off"
              placeholder="search Thailand cities, towns, property types"
            />
          </label>
          {locationSuggestionsLoading || locationSuggestionsOpen ? (
            <div className="absolute inset-x-0 top-[calc(100%+10px)] z-30 overflow-hidden rounded-[24px] border border-[#d8d2cc] bg-white shadow-[0_22px_60px_rgba(15,23,42,0.18)]">
              {locationSuggestionsLoading ? (
                <p className="px-5 py-4 text-sm font-semibold text-brand-gray">Searching Thailand locations...</p>
              ) : (
                locationSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => applyLocationSuggestion(suggestion)}
                    className="flex w-full items-center gap-3 border-b border-[#eee8e3] px-5 py-4 text-left text-sm font-semibold text-brand-dark transition-colors duration-300 last:border-b-0 hover:bg-[#faf7f3] hover:text-brand-red"
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-brand-red" />
                    <span>{suggestion.label}</span>
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>

        <div ref={quickFilterRef} className="relative mt-4">
          <div className="flex flex-wrap justify-center gap-2 pb-1">
            <button
              type="submit"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#d2d2d2] bg-white px-4 py-3 text-sm font-black text-brand-dark transition-all duration-300 hover:border-brand-dark hover:shadow-[0_10px_22px_rgba(15,23,42,0.08)]"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Search
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => toggleQuickFilter("province")}
                className={`relative inline-flex shrink-0 items-center rounded-xl border bg-white px-4 py-3 pr-12 text-sm font-black text-brand-dark transition-all duration-300 hover:border-brand-dark hover:shadow-[0_10px_22px_rgba(15,23,42,0.08)] ${
                  hasActiveProvinceFilter ? "pr-20" : ""
                } ${
                  activeQuickFilter === "province" ? "border-brand-dark shadow-[0_10px_22px_rgba(15,23,42,0.1)]" : "border-[#d2d2d2]"
                }`}
                aria-expanded={activeQuickFilter === "province"}
              >
                <span className="max-w-[110px] truncate">{getSingleFilterLabel("Province", selectedProvince)}</span>
                {activeQuickFilter === "province" ? (
                  <ChevronUp className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2" />
                ) : (
                  <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2" />
                )}
              </button>
              {hasActiveProvinceFilter ? (
                <button
                  type="button"
                  onClick={resetProvinceQuickFilter}
                  className="absolute right-10 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-[#f3efeb] text-brand-dark transition hover:bg-brand-dark hover:text-white"
                  aria-label="Clear province filter"
                >
                  <X className="h-5 w-5" />
                </button>
              ) : null}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => toggleQuickFilter("price")}
                className={`relative inline-flex shrink-0 items-center rounded-xl border bg-white px-4 py-3 pr-12 text-sm font-black text-brand-dark transition-all duration-300 hover:border-brand-dark hover:shadow-[0_10px_22px_rgba(15,23,42,0.08)] ${
                  hasActivePriceFilter ? "pr-20" : ""
                } ${
                  activeQuickFilter === "price" ? "border-brand-dark shadow-[0_10px_22px_rgba(15,23,42,0.1)]" : "border-[#d2d2d2]"
                }`}
                aria-expanded={activeQuickFilter === "price"}
              >
                Price
                {activeQuickFilter === "price" ? (
                  <ChevronUp className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2" />
                ) : (
                  <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2" />
                )}
              </button>
              {hasActivePriceFilter ? (
                <button
                  type="button"
                  onClick={resetPriceQuickFilter}
                  className="absolute right-10 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-[#f3efeb] text-brand-dark transition hover:bg-brand-dark hover:text-white"
                  aria-label="Clear price filter"
                >
                  <X className="h-5 w-5" />
                </button>
              ) : null}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => toggleQuickFilter("rooms")}
                className={`relative inline-flex shrink-0 items-center rounded-xl border bg-white px-4 py-3 pr-12 text-sm font-black text-brand-dark transition-all duration-300 hover:border-brand-dark hover:shadow-[0_10px_22px_rgba(15,23,42,0.08)] ${
                  hasActiveRoomFilter ? "pr-20" : ""
                } ${
                  activeQuickFilter === "rooms" ? "border-brand-dark shadow-[0_10px_22px_rgba(15,23,42,0.1)]" : "border-[#d2d2d2]"
                }`}
                aria-expanded={activeQuickFilter === "rooms"}
              >
                {getRoomFilterLabel(selectedBedroom, selectedBathroom)}
                {activeQuickFilter === "rooms" ? (
                  <ChevronUp className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2" />
                ) : (
                  <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2" />
                )}
              </button>
              {hasActiveRoomFilter ? (
                <button
                  type="button"
                  onClick={resetRoomsQuickFilter}
                  className="absolute right-10 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-[#f3efeb] text-brand-dark transition hover:bg-brand-dark hover:text-white"
                  aria-label="Clear room filter"
                >
                  <X className="h-5 w-5" />
                </button>
              ) : null}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => toggleQuickFilter("homeType")}
                className={`relative inline-flex shrink-0 items-center rounded-xl border bg-white px-4 py-3 pr-12 text-sm font-black text-brand-dark transition-all duration-300 hover:border-brand-dark hover:shadow-[0_10px_22px_rgba(15,23,42,0.08)] ${
                  hasActiveHomeTypeFilter ? "pr-20" : ""
                } ${
                  activeQuickFilter === "homeType" ? "border-brand-dark shadow-[0_10px_22px_rgba(15,23,42,0.1)]" : "border-[#d2d2d2]"
                }`}
                aria-expanded={activeQuickFilter === "homeType"}
              >
                Home type
                {activeQuickFilter === "homeType" ? (
                  <ChevronUp className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2" />
                ) : (
                  <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2" />
                )}
              </button>
              {hasActiveHomeTypeFilter ? (
                <button
                  type="button"
                  onClick={resetHomeTypeQuickFilter}
                  className="absolute right-10 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-[#f3efeb] text-brand-dark transition hover:bg-brand-dark hover:text-white"
                  aria-label="Clear home type filter"
                >
                  <X className="h-5 w-5" />
                </button>
              ) : null}
            </div>
          </div>

          {mountedQuickFilter ? (
            <div
              className={`absolute left-1/2 top-[calc(100%+10px)] z-40 w-[min(92vw,464px)] -translate-x-1/2 rounded-[22px] border border-[#d8d2cc] bg-white p-5 shadow-[0_22px_60px_rgba(15,23,42,0.18)] transition-all duration-300 ease-out ${
                activeQuickFilter ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
              }`}
            >
              <div className="mb-4">
                <h2 className="text-lg font-black text-brand-dark">
                  {mountedQuickFilter === "price"
                    ? "Price"
                    : mountedQuickFilter === "rooms"
                      ? "Room"
                      : mountedQuickFilter === "homeType"
                        ? "Home type"
                        : "Province"}
                </h2>
              </div>

              {mountedQuickFilter === "price" ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-[#c9c1ba] text-base font-semibold">
                    <button
                      type="button"
                      onClick={() => setPriceQuickView("list-price")}
                      className={`border-r border-[#9f9891] px-4 py-4 text-brand-dark transition-colors ${
                        priceQuickView === "list-price" ? "bg-[#f4f1ee]" : "bg-white"
                      }`}
                    >
                      List price
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriceQuickView("monthly-payment")}
                      className={`px-4 py-4 text-brand-dark transition-colors ${
                        priceQuickView === "monthly-payment" ? "bg-[#f4f1ee]" : "bg-white"
                      }`}
                    >
                      Monthly payment
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <label className="flex items-center gap-3 rounded-xl border border-[#c9c1ba] bg-white px-4 py-4 text-left text-lg font-semibold text-[#7c6f66]">
                      <span className="text-brand-dark">$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={getPriceInputValue(minPrice, minPriceLimit)}
                        onChange={(event) => handleMinPriceInputChange(event.target.value)}
                        placeholder="Min 0"
                        className="w-full bg-transparent text-brand-dark outline-none placeholder:text-[#7c6f66]"
                      />
                    </label>
                    <label className="flex items-center gap-3 rounded-xl border border-[#c9c1ba] bg-white px-4 py-4 text-left text-lg font-semibold text-[#7c6f66]">
                      <span className="text-brand-dark">$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={getPriceInputValue(maxPrice, maxPriceLimit)}
                        onChange={(event) => handleMaxPriceInputChange(event.target.value)}
                        placeholder={mode === "rent" ? "Max 100K" : "Max 500 MB"}
                        className="w-full bg-transparent text-brand-dark outline-none placeholder:text-[#7c6f66]"
                      />
                    </label>
                  </div>
                  {priceQuickView === "list-price" ? (
                    <div className="space-y-5 px-0 pt-1">
                      <div className="flex h-24 items-end gap-1 border-b-2 border-brand-dark">
                        {priceBars.map((height, index) => (
                          <span
                            key={`${height}-${index}`}
                            className="flex-1 rounded-t-full bg-[#202020]"
                            style={{ height: `${Math.max(height * 1.55, 6)}px` }}
                          />
                        ))}
                      </div>
                      <div className="relative h-9">
                        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#ded6cf]" />
                        <div
                          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand-dark"
                          style={{
                            left: `${minThumbPosition}%`,
                            width: `${Math.max(maxThumbPosition - minThumbPosition, 0)}%`,
                          }}
                        />
                        <span
                          className="pointer-events-none absolute top-1/2 z-10 h-7 w-7 -translate-y-1/2 rounded-full border-2 border-brand-dark bg-white shadow-[0_2px_8px_rgba(15,23,42,0.16)]"
                          style={{ left: `calc(${minThumbPosition}% - 14px)` }}
                        />
                        <span
                          className="pointer-events-none absolute top-1/2 z-10 h-7 w-7 -translate-y-1/2 rounded-full border-2 border-brand-dark bg-white shadow-[0_2px_8px_rgba(15,23,42,0.16)]"
                          style={{ left: `calc(${maxThumbPosition}% - 14px)` }}
                        />
                        <input
                          type="range"
                          min={minPriceLimit}
                          max={maxPriceLimit}
                          step={priceStep}
                          value={minPrice}
                          onChange={(event) => handleMinPriceChange(Number(event.target.value))}
                          className="pointer-events-auto absolute inset-x-0 top-0 h-9 w-full cursor-pointer appearance-none bg-transparent opacity-0"
                        />
                        <input
                          type="range"
                          min={minPriceLimit}
                          max={maxPriceLimit}
                          step={priceStep}
                          value={maxPrice}
                          onChange={(event) => handleMaxPriceChange(Number(event.target.value))}
                          className="pointer-events-auto absolute inset-x-0 top-0 h-9 w-full cursor-pointer appearance-none bg-transparent opacity-0"
                        />
                      </div>
                    </div>
                  ) : null}
                  {priceQuickView === "monthly-payment" ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-black text-brand-dark">Down payment</h3>
                        <div className="mt-4 space-y-4">
                          <button
                            type="button"
                            onClick={() => setDownPaymentOption("amount")}
                            className="flex items-center gap-3 text-left text-lg font-medium text-[#5f564f]"
                          >
                            <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#7d6f64]">
                              {downPaymentOption === "amount" ? <span className="h-2.5 w-2.5 rounded-full bg-[#7d6f64]" /> : null}
                            </span>
                            Dollar amount
                          </button>
                          <button
                            type="button"
                            onClick={() => setDownPaymentOption("percentage")}
                            className="flex items-center gap-3 text-left text-lg font-medium text-[#5f564f]"
                          >
                            <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#7d6f64]">
                              {downPaymentOption === "percentage" ? <span className="h-2.5 w-2.5 rounded-full bg-[#7d6f64]" /> : null}
                            </span>
                            Percentage
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActiveQuickFilter(null)}
                      className="rounded-full border border-brand-dark px-5 py-2 text-sm font-black text-brand-dark transition hover:bg-brand-dark hover:text-white"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : null}

              {mountedQuickFilter === "rooms" ? (
                <div className="space-y-5">
                  <div>
                    <h3 className="mb-3 text-sm font-black text-brand-dark">Bedrooms</h3>
                    <div className="flex flex-wrap gap-2">
                      {bedroomOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setDraftQuickBedroom(option)}
                          className={`min-w-16 rounded-xl border px-4 py-2.5 text-sm font-black transition-all duration-300 ${
                            draftQuickBedroom === option
                              ? "border-brand-dark bg-brand-dark text-white"
                              : "border-[#d2d2d2] bg-white text-brand-dark hover:border-brand-dark"
                          }`}
                        >
                          {getBedroomOptionLabel(option)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-3 text-sm font-black text-brand-dark">Bathrooms</h3>
                    <div className="flex flex-wrap gap-2">
                      {bathroomOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setDraftQuickBathroom(option)}
                          className={`min-w-16 rounded-xl border px-4 py-2.5 text-sm font-black transition-all duration-300 ${
                            draftQuickBathroom === option
                              ? "border-brand-dark bg-brand-dark text-white"
                              : "border-[#d2d2d2] bg-white text-brand-dark hover:border-brand-dark"
                          }`}
                        >
                          {getBathroomOptionLabel(option)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={applyRoomsQuickFilter}
                      className="rounded-full border border-brand-dark px-5 py-2 text-sm font-black text-brand-dark transition hover:bg-brand-dark hover:text-white"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : null}

              {mountedQuickFilter === "homeType" ? (
                <div className="space-y-5">
                  <div className="max-h-[360px] overflow-y-auto pr-1">
                    {homeTypeOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setDraftQuickHomeType(option)}
                        className="flex w-full items-center gap-3 border-b border-[#eee8e3] px-1 py-3 text-left text-sm font-semibold text-brand-dark transition-colors duration-300 last:border-b-0 hover:text-brand-red"
                      >
                        <span
                          className={`h-5 w-5 rounded-full border transition-all duration-300 ${
                            draftQuickHomeType === option
                              ? "border-brand-dark bg-brand-dark shadow-[inset_0_0_0_4px_white]"
                              : "border-brand-muted bg-white"
                          }`}
                        />
                        {option}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={applyHomeTypeQuickFilter}
                      className="rounded-full border border-brand-dark px-5 py-2 text-sm font-black text-brand-dark transition hover:bg-brand-dark hover:text-white"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : null}

              {mountedQuickFilter === "province" ? (
                <div className="space-y-5">
                  <div className="max-h-[360px] overflow-y-auto pr-1">
                    {thaiProvinces.map((province) => (
                      <button
                        key={province.name}
                        type="button"
                        onClick={() => setDraftQuickProvince(province.name)}
                        className="flex w-full items-center justify-between gap-3 border-b border-[#eee8e3] px-1 py-3 text-left text-sm font-semibold text-brand-dark transition-colors duration-300 last:border-b-0 hover:text-brand-red"
                      >
                        <span className="inline-flex items-center gap-3">
                          <span
                            className={`h-5 w-5 rounded-full border transition-all duration-300 ${
                              draftQuickProvince === province.name
                                ? "border-brand-dark bg-brand-dark shadow-[inset_0_0_0_4px_white]"
                                : "border-brand-muted bg-white"
                            }`}
                          />
                          {province.name}
                        </span>
                        <span className="text-xs font-black text-brand-red">{province.count}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={applyProvinceQuickFilter}
                      className="rounded-full border border-brand-dark px-5 py-2 text-sm font-black text-brand-dark transition hover:bg-brand-dark hover:text-white"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </form>
  );
}
