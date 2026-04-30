import { ArrowUpDown, ChevronDown, ChevronUp, MapPin, Search, SlidersHorizontal, Undo2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { thaiProvinces } from "../data/thaiProvinces";
import { propertyListings } from "../data/propertyListings";
import type {
  ListingHomeType,
  ListingMode,
  ListingSpecialCategory,
  PropertyListing,
} from "../types/propertyListing";
import { cleanNumericText, cleanSearchText } from "../utils/security";
import { PropertyListingCard } from "./PropertyListingCard";
import { Footer } from "./Footer";
import { Header } from "./Header";

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

const modeOptions: ListingMode[] = ["sale", "rent"];
const listingToolbarModeOptions = [
  { label: "Buy", value: "sale" as ListingMode, href: `${import.meta.env.BASE_URL}buy`, pageVariant: "buy" as const },
  {
    label: "Sale",
    value: "sale" as ListingMode,
    href: `${import.meta.env.BASE_URL}properties-for-sale`,
    pageVariant: "sale" as const,
  },
  {
    label: "Rent",
    value: "rent" as ListingMode,
    href: `${import.meta.env.BASE_URL}properties-for-rent`,
    pageVariant: "rent" as const,
  },
] as const;
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
const sortOptions = [
  { label: "Recommended", value: "recommended" },
  { label: "Newest", value: "newest" },
  { label: "Lowest Price", value: "price-low" },
  { label: "Highest Price", value: "price-high" },
  { label: "Size (high-low)", value: "size-high" },
  { label: "Size (low-high)", value: "size-low" },
] as const;
const saleCategoryOptions: ListingSpecialCategory[] = [
  "Distress Property",
  "Foreclosure",
  "Pre-Foreclosure",
  "Fixer Upper",
  "Urgent Sale",
];
const filterModeOptions = [
  { label: "Buy", value: "sale" },
  { label: "Rent", value: "rent" },
  { label: "Option To Buy", value: "sale" },
] as const;
const SALE_MAX_PRICE_LIMIT = 500000000;
const RENT_MAX_PRICE_LIMIT = 100000;
const PHOTON_THAILAND_API_URL = "https://photon.komoot.io/api/";
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

function getMinimumFilterValue(option: string) {
  if (option === "Studio") return 0;
  if (option === "5+") return 5;
  return Number(option);
}

function matchesBedroom(listing: PropertyListing, selected: string) {
  if (!selected || selected === "Any") return true;
  if (selected === "Studio") return listing.beds === 0;
  return listing.beds >= getMinimumFilterValue(selected);
}

function matchesBathroom(listing: PropertyListing, selected: string) {
  if (!selected || selected === "Any") return true;
  return listing.baths >= getMinimumFilterValue(selected);
}

function formatPriceValue(value: number, mode: ListingMode) {
  if (mode === "rent") {
    return `${value.toLocaleString()}+`;
  }

  if (value >= 1000000) {
    return `${(value / 1000000).toLocaleString(undefined, { maximumFractionDigits: 1 })}M+`;
  }

  return `${value.toLocaleString()}+`;
}

function getPriceInputValue(value: number, limit: number) {
  return value === limit ? "" : String(value);
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

function getCompactSortLabel(value: (typeof sortOptions)[number]["value"]) {
  switch (value) {
    case "recommended":
      return "Sort";
    case "newest":
      return "New";
    case "price-low":
      return "Low $";
    case "price-high":
      return "High $";
    case "size-high":
      return "Big";
    case "size-low":
      return "Small";
    default:
      return "Sort";
  }
}

export function PropertyListingsPage({
  initialMode = "sale",
  pageVariant = "sale",
  initialProvince,
  initialQuery = "",
  initialHomeType,
  initialBedroom,
  initialBathroom,
  initialMinPrice,
  initialMaxPrice,
}: {
  initialMode?: ListingMode;
  pageVariant?: "buy" | "sale" | "rent";
  initialProvince?: string;
  initialQuery?: string;
  initialHomeType?: string;
  initialBedroom?: string;
  initialBathroom?: string;
  initialMinPrice?: string;
  initialMaxPrice?: string;
}) {
  const validatedInitialProvince = initialProvince && thaiProvinces.some((province) => province.name === initialProvince)
    ? initialProvince
    : "";
  const validatedInitialQuery = cleanSearchText(initialQuery);
  const validatedInitialHomeType =
    initialHomeType && homeTypeOptions.includes(initialHomeType as "Any" | ListingHomeType)
      ? (initialHomeType as "Any" | ListingHomeType)
      : "Any";
  const validatedInitialBedroom =
    initialBedroom && bedroomOptions.includes(initialBedroom as (typeof bedroomOptions)[number])
      ? initialBedroom
      : "Any";
  const validatedInitialBathroom =
    initialBathroom && bathroomOptions.includes(initialBathroom as (typeof bathroomOptions)[number])
      ? initialBathroom
      : "Any";
  const initialMaxLimit = initialMode === "rent" ? RENT_MAX_PRICE_LIMIT : SALE_MAX_PRICE_LIMIT;
  const validatedInitialMinPrice = Math.max(
    0,
    Math.min(Number(cleanNumericText(initialMinPrice ?? null, 12)) || 0, initialMaxLimit),
  );
  const validatedInitialMaxPrice = Math.max(
    validatedInitialMinPrice + (initialMode === "rent" ? 1000 : 1000000),
    Math.min(Number(cleanNumericText(initialMaxPrice ?? null, 12)) || initialMaxLimit, initialMaxLimit),
  );
  const [mode, setMode] = useState<ListingMode>(initialMode);
  const [query, setQuery] = useState(validatedInitialQuery);
  const [locationSuggestions, setLocationSuggestions] = useState<ThailandLocationSuggestion[]>([]);
  const [locationSuggestionsOpen, setLocationSuggestionsOpen] = useState(false);
  const [locationSuggestionsLoading, setLocationSuggestionsLoading] = useState(false);
  const [minPrice, setMinPrice] = useState(validatedInitialMinPrice);
  const [maxPrice, setMaxPrice] = useState(validatedInitialMaxPrice);
  const [priceQuickView, setPriceQuickView] = useState<PriceQuickView>("list-price");
  const [downPaymentOption, setDownPaymentOption] = useState<DownPaymentOption>("amount");
  const [selectedBedroom, setSelectedBedroom] = useState<string>(validatedInitialBedroom);
  const [selectedBathroom, setSelectedBathroom] = useState<string>(validatedInitialBathroom);
  const [selectedHomeType, setSelectedHomeType] = useState<"Any" | ListingHomeType>(validatedInitialHomeType);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [draftQuickBedroom, setDraftQuickBedroom] = useState<string>(validatedInitialBedroom);
  const [draftQuickBathroom, setDraftQuickBathroom] = useState<string>(validatedInitialBathroom);
  const [draftQuickHomeType, setDraftQuickHomeType] = useState<"Any" | ListingHomeType>(validatedInitialHomeType);
  const [draftQuickProvince, setDraftQuickProvince] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<ListingSpecialCategory[]>([]);
  const [minLandSize, setMinLandSize] = useState("");
  const [maxLandSize, setMaxLandSize] = useState("");
  const [draftMode, setDraftMode] = useState<ListingMode>(initialMode);
  const [draftHomeType, setDraftHomeType] = useState<"Any" | ListingHomeType>("Any");
  const [draftAmenities, setDraftAmenities] = useState<string[]>([]);
  const [draftCategories, setDraftCategories] = useState<ListingSpecialCategory[]>([]);
  const [draftMinLandSize, setDraftMinLandSize] = useState("");
  const [draftMaxLandSize, setDraftMaxLandSize] = useState("");
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]["value"]>("recommended");
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterMounted, setFilterMounted] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilter | null>(null);
  const [mountedQuickFilter, setMountedQuickFilter] = useState<QuickFilter | null>(null);
  const currentPageVariant = pageVariant;
  const searchBoxRef = useRef<HTMLDivElement | null>(null);
  const sortMenuRef = useRef<HTMLDivElement | null>(null);
  const quickFilterRef = useRef<HTMLDivElement | null>(null);
  const lastPickedSuggestionRef = useRef("");
  const sanitizedQuery = cleanSearchText(query);
  const searchTokens = useMemo(
    () => normalizeSearchValue(sanitizedQuery).split(" ").filter(Boolean),
    [sanitizedQuery],
  );

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  useEffect(() => {
    setMode(initialMode);
    setDraftMode(initialMode);
    setQuery(validatedInitialQuery);
    setLocationSuggestions([]);
    setLocationSuggestionsOpen(false);
    setLocationSuggestionsLoading(false);
    setSelectedBedroom(validatedInitialBedroom);
    setSelectedBathroom(validatedInitialBathroom);
    setSelectedProvince(validatedInitialProvince);
    setDraftQuickBedroom(validatedInitialBedroom);
    setDraftQuickBathroom(validatedInitialBathroom);
    setDraftQuickHomeType(validatedInitialHomeType);
    setDraftQuickProvince(validatedInitialProvince);
    setSelectedCategories([]);
    setSelectedAmenities([]);
    setSelectedHomeType(validatedInitialHomeType);
    setMinLandSize("");
    setMaxLandSize("");
    setMinPrice(validatedInitialMinPrice);
    setMaxPrice(validatedInitialMaxPrice);
    setPriceQuickView("list-price");
    setDownPaymentOption("amount");
    setSortBy("recommended");
    setSortOpen(false);
    setFilterOpen(false);
    setActiveQuickFilter(null);
    lastPickedSuggestionRef.current = "";
  }, [
    initialMode,
    validatedInitialBathroom,
    validatedInitialBedroom,
    validatedInitialHomeType,
    validatedInitialMaxPrice,
    validatedInitialMinPrice,
    validatedInitialProvince,
    validatedInitialQuery,
  ]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!sortMenuRef.current?.contains(event.target as Node)) {
        setSortOpen(false);
      }
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
    if (filterOpen) {
      setDraftMode(mode);
      setDraftHomeType(selectedHomeType);
      setDraftAmenities(selectedAmenities);
      setDraftCategories(selectedCategories);
      setDraftMinLandSize(minLandSize);
      setDraftMaxLandSize(maxLandSize);
      setFilterMounted(true);
      return;
    }

    const timeout = window.setTimeout(() => setFilterMounted(false), 300);
    return () => window.clearTimeout(timeout);
  }, [filterOpen]);

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

  const modeListings = useMemo(
    () => propertyListings.filter((listing) => listing.mode === mode),
    [mode],
  );
  const draftModeListings = useMemo(
    () => propertyListings.filter((listing) => listing.mode === draftMode),
    [draftMode],
  );
  const amenityOptions = useMemo(
    () => Array.from(new Set(modeListings.flatMap((listing) => listing.amenities))).sort(),
    [modeListings],
  );
  const draftAmenityOptions = useMemo(
    () => Array.from(new Set(draftModeListings.flatMap((listing) => listing.amenities))).sort(),
    [draftModeListings],
  );

  const minPriceLimit = mode === "rent" ? 0 : 0;
  const maxPriceLimit = mode === "rent" ? RENT_MAX_PRICE_LIMIT : SALE_MAX_PRICE_LIMIT;
  const priceStep = mode === "rent" ? 1000 : 1000000;
  const minValue = minPrice > minPriceLimit ? minPrice : null;
  const maxValue = maxPrice < maxPriceLimit ? maxPrice : null;
  const minLandValue = minLandSize ? Number(minLandSize) : null;
  const maxLandValue = maxLandSize ? Number(maxLandSize) : null;
  const priceRange = maxPriceLimit - minPriceLimit || 1;
  const minThumbPosition = ((minPrice - minPriceLimit) / priceRange) * 100;
  const maxThumbPosition = ((maxPrice - minPriceLimit) / priceRange) * 100;
  const hasActivePriceFilter = minPrice > minPriceLimit || maxPrice < maxPriceLimit;
  const hasActiveRoomFilter = selectedBedroom !== "Any" || selectedBathroom !== "Any";
  const hasActiveHomeTypeFilter = selectedHomeType !== "Any";
  const hasActiveProvinceFilter = Boolean(selectedProvince);

  const filteredListings = modeListings
    .filter((listing) => {
      const searchableText = normalizeSearchValue(
        `${listing.title} ${listing.city} ${listing.province} ${listing.homeType} ${listing.nearby.join(" ")}`,
      );
      const matchesQuery = searchTokens.length === 0 || searchTokens.every((token) => searchableText.includes(token));
      const matchesMin = minValue === null || listing.priceValue >= minValue;
      const matchesMax = maxValue === null || listing.priceValue <= maxValue;
      const matchesType = selectedHomeType === "Any" || listing.homeType === selectedHomeType;
      const matchesProvince = !selectedProvince || listing.province === selectedProvince;
      const matchesMinLand = minLandValue === null || listing.areaSqm >= minLandValue;
      const matchesMaxLand = maxLandValue === null || listing.areaSqm <= maxLandValue;
      const matchesAmenities =
        selectedAmenities.length === 0 ||
        selectedAmenities.every((amenity) => listing.amenities.includes(amenity));
      const matchesCategory =
        mode === "rent" ||
        selectedCategories.length === 0 ||
        (listing.specialCategory && selectedCategories.includes(listing.specialCategory));

      return (
        matchesQuery &&
        matchesMin &&
        matchesMax &&
        matchesType &&
        matchesProvince &&
        matchesMinLand &&
        matchesMaxLand &&
        matchesAmenities &&
        matchesCategory &&
        matchesBedroom(listing, selectedBedroom) &&
        matchesBathroom(listing, selectedBathroom)
      );
    })
    .sort((left, right) => {
      if (sortBy === "price-low") return left.priceValue - right.priceValue;
      if (sortBy === "price-high") return right.priceValue - left.priceValue;
      if (sortBy === "size-high") return right.areaSqm - left.areaSqm;
      if (sortBy === "size-low") return left.areaSqm - right.areaSqm;
      if (sortBy === "newest") return right.builtYear - left.builtYear;

      const score = (listing: PropertyListing) =>
        listing.builtYear * 1000 +
        listing.areaSqm * 10 +
        listing.amenities.length * 25 +
        (listing.specialCategory ? 5 : 0);

      return score(right) - score(left);
    });

  const provinceCount = new Set(filteredListings.map((listing) => listing.province)).size;

  function resetFilters() {
    setQuery("");
    setMinPrice(minPriceLimit);
    setMaxPrice(maxPriceLimit);
    setPriceQuickView("list-price");
    setDownPaymentOption("amount");
    setSelectedBedroom("Any");
    setSelectedBathroom("Any");
    setSelectedProvince("");
    setDraftQuickBedroom("Any");
    setDraftQuickBathroom("Any");
    setDraftQuickHomeType("Any");
    setDraftQuickProvince("");
    setSelectedHomeType("Any");
    setSelectedAmenities([]);
    setSelectedCategories([]);
    setMinLandSize("");
    setMaxLandSize("");
    setSortBy("recommended");
    setSortOpen(false);
    setFilterOpen(false);
    setActiveQuickFilter(null);
    setLocationSuggestions([]);
    setLocationSuggestionsOpen(false);
    setLocationSuggestionsLoading(false);
    lastPickedSuggestionRef.current = "";
  }

  function resetDraftFilters() {
    setDraftHomeType("Any");
    setDraftAmenities([]);
    setDraftCategories([]);
    setDraftMinLandSize("");
    setDraftMaxLandSize("");
  }

  function handleModeChange(nextMode: ListingMode) {
    setMode(nextMode);
    setMinPrice(0);
    setMaxPrice(nextMode === "rent" ? RENT_MAX_PRICE_LIMIT : SALE_MAX_PRICE_LIMIT);
    setPriceQuickView("list-price");
    setDownPaymentOption("amount");
    setSelectedCategories([]);
    setSelectedAmenities([]);
    setSelectedProvince("");
    setDraftQuickProvince("");
    setSortOpen(false);
    setActiveQuickFilter(null);
    setLocationSuggestionsOpen(false);
  }

  function handleDraftModeChange(nextMode: ListingMode) {
    setDraftMode(nextMode);
    setDraftHomeType("Any");
    setDraftAmenities([]);
    setDraftCategories([]);
    setDraftMinLandSize("");
    setDraftMaxLandSize("");
  }

  function applyFilters() {
    setMode(draftMode);
    setSelectedHomeType(draftHomeType);
    setSelectedAmenities(draftAmenities);
    setSelectedCategories(draftMode === "sale" ? draftCategories : []);
    setMinLandSize(draftMinLandSize);
    setMaxLandSize(draftMaxLandSize);
    setFilterOpen(false);
    setActiveQuickFilter(null);
  }

  function openFilter() {
    setActiveQuickFilter(null);
    setFilterMounted(true);
    window.requestAnimationFrame(() => setFilterOpen(true));
  }

  function closeFilter() {
    setFilterOpen(false);
  }

  function toggleQuickFilter(filter: QuickFilter) {
    setSortOpen(false);
    setFilterOpen(false);
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

  function applyRoomsQuickFilter() {
    setSelectedBedroom(draftQuickBedroom);
    setSelectedBathroom(draftQuickBathroom);
    setActiveQuickFilter(null);
  }

  function applyHomeTypeQuickFilter() {
    setSelectedHomeType(draftQuickHomeType);
    setActiveQuickFilter(null);
  }

  function applyProvinceQuickFilter() {
    setSelectedProvince(draftQuickProvince);
    setActiveQuickFilter(null);
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

  function resetProvinceQuickFilter() {
    setSelectedProvince("");
    setDraftQuickProvince("");
    setActiveQuickFilter((current) => (current === "province" ? null : current));
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

  return (
    <div className="min-h-screen bg-[#f7f3ef] text-brand-dark">
      <Header />
      <main>
        <section className="border-b border-[#e5ddd7] bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-brand-red">
                {mode === "sale" ? "For Sale" : "For Rent"}
              </p>
              <h1 className="mt-2 font-serif text-3xl font-normal leading-tight text-brand-dark sm:text-4xl">
                Property Listings by City and Province
              </h1>
            </div>

            <div className="mx-auto mt-5 max-w-5xl">
              <div className="flex flex-wrap justify-center gap-2 pb-3">
                {listingToolbarModeOptions.map((option) => (
                  <a
                    key={option.label}
                    href={option.href}
                    className={`rounded-full px-5 py-2.5 text-sm font-black uppercase tracking-[0.14em] transition-all duration-300 ${
                      currentPageVariant === option.pageVariant
                        ? "bg-brand-red text-white shadow-[0_14px_28px_rgba(163,28,36,0.22)]"
                        : "border border-brand-line bg-white text-brand-dark hover:border-brand-red hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
                    }`}
                  >
                    {option.label}
                  </a>
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
                    type="button"
                    onClick={openFilter}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#d2d2d2] bg-white px-4 py-3 text-sm font-black text-brand-dark transition-all duration-300 hover:border-brand-dark hover:shadow-[0_10px_22px_rgba(15,23,42,0.08)]"
                    aria-expanded={filterOpen}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
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
                              aria-label="Minimum price"
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
                              aria-label="Maximum price"
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
                                aria-label="Minimum price slider"
                              />
                              <input
                                type="range"
                                min={minPriceLimit}
                                max={maxPriceLimit}
                                step={priceStep}
                                value={maxPrice}
                                onChange={(event) => handleMaxPriceChange(Number(event.target.value))}
                                className="pointer-events-auto absolute inset-x-0 top-0 h-9 w-full cursor-pointer appearance-none bg-transparent opacity-0"
                                aria-label="Maximum price slider"
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
                                  aria-pressed={downPaymentOption === "amount"}
                                >
                                  <span
                                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                                      downPaymentOption === "amount" ? "border-[#7d6f64]" : "border-[#7d6f64]"
                                    }`}
                                  >
                                    {downPaymentOption === "amount" ? (
                                      <span className="h-2.5 w-2.5 rounded-full bg-[#7d6f64]" />
                                    ) : null}
                                  </span>
                                  Dollar amount
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDownPaymentOption("percentage")}
                                  className="flex items-center gap-3 text-left text-lg font-medium text-[#5f564f]"
                                  aria-pressed={downPaymentOption === "percentage"}
                                >
                                  <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#7d6f64]">
                                    {downPaymentOption === "percentage" ? (
                                      <span className="h-2.5 w-2.5 rounded-full bg-[#7d6f64]" />
                                    ) : null}
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
                          <h3 className="mb-3 text-sm font-black text-brand-muted">Bedrooms</h3>
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
                          <h3 className="mb-3 text-sm font-black text-brand-muted">Bathrooms</h3>
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
          </div>
        </section>

        {filterMounted ? (
          <div
            className={`fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/35 px-4 py-4 transition-opacity duration-300 sm:items-center sm:py-6 ${
              filterOpen ? "opacity-100" : "opacity-0"
            }`}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeFilter();
              }
            }}
          >
            <div
              className={`flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-[#e3ddd8] bg-white shadow-[0_26px_70px_rgba(15,23,42,0.22)] transition-all duration-300 ease-out ${
                filterOpen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#eeeeee] px-5 py-4">
                <h2 className="text-lg font-black text-brand-dark">Filters</h2>
                <button
                  type="button"
                  onClick={closeFilter}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-line text-brand-dark transition hover:border-brand-red hover:text-brand-red"
                  aria-label="Close filter"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-3 border-b border-[#d9d9d9] text-center text-sm font-black text-[#9b9b9b] sm:text-base">
                      {filterModeOptions.map((option) => (
                        <button
                          key={option.label}
                          type="button"
                          onClick={() => handleDraftModeChange(option.value)}
                          className={`relative px-3 py-4 transition-colors duration-300 ${
                            draftMode === option.value && option.label !== "Option To Buy"
                              ? "text-brand-dark"
                              : "hover:text-brand-dark"
                          }`}
                        >
                          {option.label}
                          {draftMode === option.value && option.label !== "Option To Buy" ? (
                            <span className="absolute inset-x-0 bottom-[-1px] h-0.5 bg-brand-red" />
                          ) : null}
                        </button>
                      ))}
              </div>

              <div className="flex-1 overflow-y-auto">
                      <section className="border-b border-[#eeeeee] px-5 py-5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-black text-brand-dark">Home Type</h3>
                          <ChevronUp className="h-5 w-5 text-brand-dark" />
                        </div>
                        <div className="mt-4 grid gap-1">
                          {homeTypeOptions.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => setDraftHomeType(option)}
                              className="flex items-center gap-4 border-b border-[#eeeeee] px-1 py-3 text-left text-base font-semibold text-brand-dark last:border-b-0"
                            >
                              <span
                                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                  draftHomeType === option ? "border-brand-red" : "border-brand-dark"
                                }`}
                              >
                                {draftHomeType === option ? <span className="h-3 w-3 rounded-full bg-brand-red" /> : null}
                              </span>
                              {option}
                            </button>
                          ))}
                        </div>
                      </section>

                      <section className="border-b border-[#eeeeee] px-5 py-5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-black text-brand-dark">Land Size</h3>
                          <ChevronUp className="h-5 w-5 text-brand-dark" />
                        </div>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <label>
                            <span className="text-sm font-semibold text-brand-dark">Minimum sqm</span>
                            <input
                              value={draftMinLandSize}
                              onChange={(event) => setDraftMinLandSize(cleanNumericText(event.target.value, 8))}
                              className="mt-2 w-full rounded-lg border border-[#d0d0d0] bg-white px-4 py-3 text-base font-semibold outline-none transition focus:border-brand-red"
                              inputMode="numeric"
                              maxLength={8}
                              placeholder="Min"
                            />
                          </label>
                          <label>
                            <span className="text-sm font-semibold text-brand-dark">Maximum sqm</span>
                            <input
                              value={draftMaxLandSize}
                              onChange={(event) => setDraftMaxLandSize(cleanNumericText(event.target.value, 8))}
                              className="mt-2 w-full rounded-lg border border-[#d0d0d0] bg-white px-4 py-3 text-base font-semibold outline-none transition focus:border-brand-red"
                              inputMode="numeric"
                              maxLength={8}
                              placeholder="Max"
                            />
                          </label>
                        </div>
                      </section>

                      <section className="border-b border-[#eeeeee] px-5 py-5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-black text-brand-dark">Amenities</h3>
                          <ChevronUp className="h-5 w-5 text-brand-dark" />
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3">
                          {draftAmenityOptions.map((amenity) => (
                            <button
                              key={amenity}
                              type="button"
                              onClick={() =>
                                setDraftAmenities((current) =>
                                  current.includes(amenity)
                                    ? current.filter((item) => item !== amenity)
                                    : [...current, amenity],
                                )
                              }
                              className={`rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
                                draftAmenities.includes(amenity)
                                  ? "bg-brand-dark text-white shadow-[0_12px_24px_rgba(17,24,39,0.18)]"
                                  : "border border-brand-line bg-white text-brand-dark hover:border-brand-red"
                              }`}
                            >
                              {amenity}
                            </button>
                          ))}
                        </div>
                      </section>

                      {draftMode === "sale" ? (
                        <section className="px-5 py-5">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-black text-brand-dark">Special Listings</h3>
                            <ChevronUp className="h-5 w-5 text-brand-dark" />
                          </div>
                          <div className="mt-4 flex flex-wrap gap-3">
                            {saleCategoryOptions.map((category) => (
                              <button
                                key={category}
                                type="button"
                                onClick={() =>
                                  setDraftCategories((current) =>
                                    current.includes(category)
                                      ? current.filter((item) => item !== category)
                                      : [...current, category],
                                  )
                                }
                                className={`rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
                                  draftCategories.includes(category)
                                    ? "bg-[#1f2937] text-white shadow-[0_12px_24px_rgba(17,24,39,0.18)]"
                                    : "border border-brand-line bg-white text-brand-dark hover:border-brand-red"
                                }`}
                              >
                                {category}
                              </button>
                            ))}
                          </div>
                        </section>
                      ) : null}
              </div>

              <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-[#eeeeee] bg-white px-5 py-4">
                      <button
                        type="button"
                        onClick={resetDraftFilters}
                        className="inline-flex items-center gap-2 rounded-xl border border-brand-line px-4 py-3 text-sm font-black text-brand-red transition hover:border-brand-red hover:bg-[#fff7f7]"
                      >
                        <Undo2 className="h-4 w-4" />
                        Clear All
                      </button>
                      <button
                        type="button"
                        onClick={applyFilters}
                        className="rounded-xl bg-brand-red px-7 py-3 text-sm font-black text-white shadow-[0_10px_24px_rgba(163,28,36,0.24)] transition hover:bg-brand-dark"
                      >
                        Submit
                      </button>
              </div>
            </div>
          </div>
        ) : null}

        <section className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-brand-dark">
                {filteredListings.length} homes across {provinceCount} provinces
              </h2>
            </div>
            <div ref={sortMenuRef} className="relative w-fit">
              <button
                type="button"
                onClick={() => setSortOpen((current) => !current)}
                className="flex w-fit items-center justify-between gap-3 rounded-full border border-brand-dark bg-white px-4 py-3 text-left text-sm font-semibold shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-300 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
                aria-expanded={sortOpen}
                aria-label="Recommended sort menu"
              >
                <span className="inline-flex items-center gap-3">
                  <ArrowUpDown className="h-4 w-4" />
                  <span>{getCompactSortLabel(sortBy)}</span>
                </span>
                <ChevronDown className={`h-4 w-4 transition duration-300 ${sortOpen ? "rotate-180" : ""}`} />
              </button>

              <div
                className={`absolute right-0 top-[calc(100%+10px)] z-20 min-w-[220px] overflow-hidden rounded-[28px] border border-[#cfd7e3] bg-white shadow-[0_24px_50px_rgba(15,23,42,0.14)] transition-all duration-300 ${
                  sortOpen
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-2 opacity-0"
                }`}
              >
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSortBy(option.value);
                      setSortOpen(false);
                    }}
                    className="flex w-full items-center gap-4 border-b border-[#d7dde6] px-5 py-4 text-left text-[15px] text-brand-dark transition-colors duration-200 last:border-b-0 hover:bg-[#f7f9fc]"
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                        sortBy === option.value ? "border-brand-dark" : "border-[#6b7280]"
                      }`}
                    >
                      <span
                        className={`h-3.5 w-3.5 rounded-full ${
                          sortBy === option.value ? "bg-brand-dark" : "bg-transparent"
                        }`}
                      />
                    </span>
                    <span className="font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredListings.length > 0 ? (
              filteredListings.map((listing) => (
                <PropertyListingCard
                  key={listing.id}
                  listing={listing}
                  mode={mode}
                />
              ))
            ) : (
              <div className="border border-dashed border-brand-line bg-white px-6 py-16 text-center">
                <h3 className="text-2xl font-black text-brand-dark">No homes match these filters</h3>
                <p className="mt-4 text-base leading-7 text-brand-gray">
                  Try widening budget, changing bedroom count, or clearing location search.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
