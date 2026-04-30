import {
  ArrowUpDown,
  Bath,
  BedDouble,
  CalendarRange,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Square,
  Undo2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { propertyListings } from "../data/propertyListings";
import type {
  ListingHomeType,
  ListingMode,
  ListingSpecialCategory,
  PropertyListing,
} from "../types/propertyListing";
import { assetPath } from "../utils/assets";
import { cleanNumericText, cleanSearchText } from "../utils/security";
import { Footer } from "./Footer";
import { Header } from "./Header";

const modeOptions: ListingMode[] = ["sale", "rent"];
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
const listingSlideImages = [
  "images/province-banners/bangkok.png",
  "images/province-banners/phuket.png",
  "images/province-banners/chiang-mai.png",
  "images/province-banners/pattaya-chonburi.png",
  "images/province-banners/hua-hin-prachuap-khiri-khan.png",
  "images/province-banners/kanchanaburi.png",
];

function getBedroomLabel(beds: number) {
  return beds === 0 ? "Studio" : `${beds} Bed`;
}

function getBathroomLabel(baths: number) {
  return `${baths} Bath`;
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

function ListingCard({ listing, mode }: { listing: PropertyListing; mode: ListingMode }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [saved, setSaved] = useState(false);
  const slides = useMemo(
    () => [listing.image, ...listingSlideImages.filter((image) => image !== listing.image)].slice(0, 6),
    [listing.image],
  );
  const previousSlide = () => setActiveSlide((current) => (current === 0 ? slides.length - 1 : current - 1));
  const nextSlide = () => setActiveSlide((current) => (current === slides.length - 1 ? 0 : current + 1));

  return (
    <article
      id={listing.id}
      className="overflow-hidden border border-[#e3ddd8] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.08)] transition duration-300 hover:shadow-[0_16px_34px_rgba(15,23,42,0.12)]"
    >
      <div className="grid md:grid-cols-[220px_1fr] lg:grid-cols-[250px_1fr]">
        <div className="relative aspect-[4/3] overflow-hidden bg-neutral-200 md:aspect-auto md:min-h-[210px]">
          <div
            className="flex h-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
          >
            {slides.map((image, index) => (
              <img
                key={`${listing.id}-${image}-${index}`}
                src={assetPath(image)}
                alt={`${listing.title} image ${index + 1}`}
                className="h-full min-w-full object-cover"
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.12)_40%,rgba(0,0,0,0.55)_100%)]" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/95 px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-brand-dark">
              {listing.statusLabel}
            </span>
            {listing.specialCategory ? (
              <span className="rounded-full bg-brand-red px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-white">
                {listing.specialCategory}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setSaved((current) => !current)}
            className={`absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 transition-all duration-300 hover:scale-105 ${
              saved ? "text-brand-red" : "text-brand-dark"
            }`}
            aria-label={`${saved ? "Unsave" : "Save"} ${listing.title}`}
            aria-pressed={saved}
          >
            <Heart className={`h-4.5 w-4.5 ${saved ? "fill-current" : ""}`} />
          </button>
          <button
            type="button"
            onClick={previousSlide}
            className="absolute left-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-dark transition hover:bg-white"
            aria-label={`Previous image for ${listing.title}`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-dark transition hover:bg-white"
            aria-label={`Next image for ${listing.title}`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/35 px-3 py-2">
            {slides.map((_, index) => (
              <button
                key={`${listing.id}-dot-${index}`}
                type="button"
                onClick={() => setActiveSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeSlide === index ? "w-5 bg-white" : "w-1.5 bg-white/60"
                }`}
                aria-label={`Show image ${index + 1} for ${listing.title}`}
                aria-pressed={activeSlide === index}
              />
            ))}
          </div>
          <div className="absolute inset-x-3 bottom-3 text-white">
            <p className="inline-flex items-center gap-2 text-xs font-semibold">
              <MapPin className="h-4 w-4" />
              {listing.city}, {listing.province}
            </p>
          </div>
        </div>

        <div className="p-4 md:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="line-clamp-2 text-lg font-black leading-snug text-brand-dark md:text-xl">
                {listing.title}
              </h3>
              <p className="mt-1 text-sm font-semibold text-brand-gray">
                {listing.city}, {listing.province}
              </p>
            </div>
            <div className="shrink-0 sm:text-right">
              <p className="text-xl font-black text-brand-red md:text-2xl">{listing.priceLabel}</p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-gray">
                For {mode}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs md:text-sm">
            <div className="rounded-full border border-brand-line bg-[#faf8f6] px-3 py-1.5 font-semibold text-brand-dark">
              <span className="inline-flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-brand-red" />
                {getBedroomLabel(listing.beds)}
              </span>
            </div>
            <div className="rounded-full border border-brand-line bg-[#faf8f6] px-3 py-1.5 font-semibold text-brand-dark">
              <span className="inline-flex items-center gap-2">
                <Bath className="h-4 w-4 text-brand-red" />
                {getBathroomLabel(listing.baths)}
              </span>
            </div>
            <div className="rounded-full border border-brand-line bg-[#faf8f6] px-3 py-1.5 font-semibold text-brand-dark">
              <span className="inline-flex items-center gap-2">
                <Square className="h-4 w-4 text-brand-red" />
                {listing.areaSqm} sqm
              </span>
            </div>
            <div className="rounded-full border border-brand-line bg-[#faf8f6] px-3 py-1.5 font-semibold text-brand-dark">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-red" />
                {listing.homeType}
              </span>
            </div>
            <div className="rounded-full border border-brand-line bg-[#faf8f6] px-3 py-1.5 text-xs font-semibold text-brand-dark">
              <span className="inline-flex items-center gap-2">
                <CalendarRange className="h-3.5 w-3.5 text-brand-red" />
                Built {listing.builtYear}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function PropertyListingsPage() {
  const [mode, setMode] = useState<ListingMode>("sale");
  const [query, setQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedBedroom, setSelectedBedroom] = useState<string>("Any");
  const [selectedBathroom, setSelectedBathroom] = useState<string>("Any");
  const [selectedHomeType, setSelectedHomeType] = useState<"Any" | ListingHomeType>("Any");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<ListingSpecialCategory[]>([]);
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]["value"]>("recommended");
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!sortMenuRef.current?.contains(event.target as Node)) {
        setSortOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const modeListings = useMemo(
    () => propertyListings.filter((listing) => listing.mode === mode),
    [mode],
  );
  const amenityOptions = useMemo(
    () => Array.from(new Set(modeListings.flatMap((listing) => listing.amenities))).sort(),
    [modeListings],
  );

  const sanitizedQuery = cleanSearchText(query);
  const minValue = minPrice ? Number(minPrice) : null;
  const maxValue = maxPrice ? Number(maxPrice) : null;

  const filteredListings = modeListings
    .filter((listing) => {
      const searchableText = `${listing.title} ${listing.city} ${listing.province} ${listing.homeType} ${listing.nearby.join(" ")}`
        .toLowerCase();
      const matchesQuery = !sanitizedQuery || searchableText.includes(sanitizedQuery.toLowerCase());
      const matchesMin = minValue === null || listing.priceValue >= minValue;
      const matchesMax = maxValue === null || listing.priceValue <= maxValue;
      const matchesType = selectedHomeType === "Any" || listing.homeType === selectedHomeType;
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
    setMinPrice("");
    setMaxPrice("");
    setSelectedBedroom("Any");
    setSelectedBathroom("Any");
    setSelectedHomeType("Any");
    setSelectedAmenities([]);
    setSelectedCategories([]);
    setSortBy("recommended");
    setSortOpen(false);
    setFilterOpen(false);
  }

  function toggleAmenity(amenity: string) {
    setSelectedAmenities((current) =>
      current.includes(amenity)
        ? current.filter((item) => item !== amenity)
        : [...current, amenity],
    );
  }

  function toggleCategory(category: ListingSpecialCategory) {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  }

  function handleModeChange(nextMode: ListingMode) {
    setMode(nextMode);
    setSelectedCategories([]);
    setSelectedAmenities([]);
    setSortOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#f7f3ef] text-brand-dark">
      <Header />
      <main>
        <section className="border-b border-[#e5ddd7] bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
            <div className="max-w-4xl">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-brand-red">
                {mode === "sale" ? "For Sale" : "For Rent"}
              </p>
              <h1 className="mt-4 font-serif text-5xl font-normal leading-tight text-brand-dark sm:text-6xl">
                Property Listings by City and Province
              </h1>
              <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-brand-gray">
                Test layout for our main listing page. Search by location, switch between sale and
                rent, and refine results from one compact filter area below the search.
              </p>
            </div>

            <div className="mt-8 border border-[#e3ddd8] bg-[#faf7f4] p-4 lg:p-5">
              <div className="flex flex-wrap gap-3 border-b border-[#e3ddd8] pb-4">
                {modeOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleModeChange(option)}
                    className={`rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.18em] transition-all duration-300 ${
                      mode === option
                        ? "bg-brand-red text-white shadow-[0_14px_28px_rgba(163,28,36,0.22)]"
                        : "border border-brand-line bg-white text-brand-dark hover:border-brand-red hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
                    }`}
                  >
                    {option === "sale" ? "Sale" : "Rent"}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <label className="flex items-center gap-3 rounded-full border border-[#e4e0db] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-shadow duration-300 focus-within:shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
                  <Search className="h-5 w-5 text-brand-red" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(cleanSearchText(event.target.value))}
                    className="w-full text-sm font-medium outline-none"
                    maxLength={80}
                    placeholder="Search for house type, province, cities"
                  />
                </label>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
                <input
                  value={minPrice}
                  onChange={(event) => setMinPrice(cleanNumericText(event.target.value))}
                  className="rounded-full border border-[#e4e0db] bg-white px-5 py-4 text-sm font-semibold outline-none shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-300 focus:border-brand-red focus:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
                  inputMode="numeric"
                  maxLength={12}
                  placeholder={mode === "sale" ? "Min THB" : "Min / month"}
                />
                <input
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(cleanNumericText(event.target.value))}
                  className="rounded-full border border-[#e4e0db] bg-white px-5 py-4 text-sm font-semibold outline-none shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-300 focus:border-brand-red focus:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
                  inputMode="numeric"
                  maxLength={12}
                  placeholder={mode === "sale" ? "Max THB" : "Max / month"}
                />

                <select
                  value={selectedBedroom}
                  onChange={(event) => setSelectedBedroom(event.target.value)}
                  className="rounded-full border border-[#e4e0db] bg-white px-5 py-4 text-sm font-semibold outline-none shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-300 focus:border-brand-red focus:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
                  aria-label="Bedroom filter"
                >
                  {bedroomOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === "Any" ? "Any Bed" : option === "Studio" ? "Studio" : `${option}+ Bed`}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedBathroom}
                  onChange={(event) => setSelectedBathroom(event.target.value)}
                  className="rounded-full border border-[#e4e0db] bg-white px-5 py-4 text-sm font-semibold outline-none shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-300 focus:border-brand-red focus:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
                  aria-label="Bathroom filter"
                >
                  {bathroomOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === "Any" ? "Any Bath" : `${option}+ Bath`}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setFilterOpen((current) => !current)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-dark bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-brand-dark shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-300 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
                  aria-expanded={filterOpen}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filter
                </button>
              </div>

              <div
                className={`grid overflow-hidden transition-all duration-300 ease-out ${
                  filterOpen ? "mt-4 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="min-h-0">
              <div className="flex flex-wrap items-start gap-4 border-t border-[#e3ddd8] pt-4">
                <div className="min-w-[220px] flex-1">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-gray">Home Type</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {homeTypeOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSelectedHomeType(option)}
                        className={`rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
                          selectedHomeType === option
                            ? "bg-brand-red text-white shadow-[0_12px_24px_rgba(163,28,36,0.2)]"
                            : "border border-brand-line bg-white text-brand-dark hover:border-brand-red hover:shadow-[0_8px_20px_rgba(15,23,42,0.06)]"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="min-w-[220px] flex-1">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-gray">Amenities</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {amenityOptions.map((amenity) => (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => toggleAmenity(amenity)}
                        className={`rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
                          selectedAmenities.includes(amenity)
                            ? "bg-brand-dark text-white shadow-[0_12px_24px_rgba(17,24,39,0.18)]"
                            : "border border-brand-line bg-white text-brand-dark hover:border-brand-red hover:shadow-[0_8px_20px_rgba(15,23,42,0.06)]"
                        }`}
                      >
                        {amenity}
                      </button>
                    ))}
                  </div>
                </div>

                {mode === "sale" ? (
                  <div className="min-w-[240px] flex-1">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-gray">
                      Special Listings
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {saleCategoryOptions.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => toggleCategory(category)}
                          className={`rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
                            selectedCategories.includes(category)
                              ? "bg-[#1f2937] text-white shadow-[0_12px_24px_rgba(17,24,39,0.18)]"
                              : "border border-brand-line bg-white text-brand-dark hover:border-brand-red hover:shadow-[0_8px_20px_rgba(15,23,42,0.06)]"
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-white px-5 py-2.5 text-sm font-black uppercase tracking-[0.18em] text-brand-dark transition-all duration-300 hover:border-brand-red hover:text-brand-red hover:shadow-[0_8px_20px_rgba(15,23,42,0.06)]"
                  >
                    <Undo2 className="h-4 w-4" />
                    Reset
                  </button>
                </div>
              </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-brand-dark">
                {filteredListings.length} homes across {provinceCount} provinces
              </h2>
            </div>
            <div ref={sortMenuRef} className="relative w-full sm:w-[260px]">
              <button
                type="button"
                onClick={() => setSortOpen((current) => !current)}
                className="flex w-full items-center justify-between gap-3 rounded-full border border-brand-dark bg-white px-5 py-4 text-left text-sm font-semibold shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-300 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
                aria-expanded={sortOpen}
                aria-label="Recommended sort menu"
              >
                <span className="inline-flex items-center gap-3">
                  <ArrowUpDown className="h-4 w-4" />
                  {sortOptions.find((option) => option.value === sortBy)?.label ?? "Recommended"}
                </span>
                <ChevronDown className={`h-4 w-4 transition duration-300 ${sortOpen ? "rotate-180" : ""}`} />
              </button>

              <div
                className={`absolute right-0 top-[calc(100%+10px)] z-20 min-w-full overflow-hidden rounded-[28px] border border-[#cfd7e3] bg-white shadow-[0_24px_50px_rgba(15,23,42,0.14)] transition-all duration-300 ${
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
                <ListingCard
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
