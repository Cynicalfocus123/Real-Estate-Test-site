import {
  Bath,
  BedDouble,
  CalendarRange,
  ChevronDown,
  MapPin,
  Search,
  Share2,
  Sparkles,
  Square,
  Undo2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

function ListingCard({
  copiedId,
  listing,
  mode,
  onShare,
}: {
  copiedId: string | null;
  listing: PropertyListing;
  mode: ListingMode;
  onShare: (listing: PropertyListing) => void;
}) {
  return (
    <article
      id={listing.id}
      className="overflow-hidden border border-[#e3ddd8] bg-white shadow-[0_22px_50px_rgba(15,23,42,0.08)]"
    >
      <div className="grid lg:grid-cols-[360px_1fr]">
        <div className="relative min-h-[260px] overflow-hidden bg-neutral-200">
          <img
            src={assetPath(listing.image)}
            alt={listing.title}
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.12)_40%,rgba(0,0,0,0.55)_100%)]" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="bg-white/95 px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-brand-dark">
              {listing.statusLabel}
            </span>
            {listing.specialCategory ? (
              <span className="bg-brand-red px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-white">
                {listing.specialCategory}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onShare(listing)}
            className="absolute right-4 top-4 inline-flex items-center gap-2 bg-black/55 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-black/70"
            aria-label={`Share ${listing.title}`}
          >
            <Share2 className="h-4 w-4" />
            {copiedId === listing.id ? "Copied" : "Share"}
          </button>
          <div className="absolute inset-x-4 bottom-4 text-white">
            <p className="inline-flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4" />
              {listing.city}, {listing.province}
            </p>
          </div>
        </div>

        <div className="p-6 lg:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <h3 className="text-2xl font-black leading-tight text-brand-dark">{listing.title}</h3>
              <p className="mt-3 text-sm leading-7 text-brand-gray">
                Nearby: {listing.nearby.join(" • ")}
              </p>
            </div>
            <div className="shrink-0">
              <p className="text-3xl font-black text-brand-red">{listing.priceLabel}</p>
              <p className="mt-1 text-right text-xs font-bold uppercase tracking-[0.2em] text-brand-gray">
                For {mode}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <div className="border border-brand-line bg-[#faf8f6] px-4 py-3 text-sm font-semibold text-brand-dark">
              <span className="inline-flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-brand-red" />
                {getBedroomLabel(listing.beds)}
              </span>
            </div>
            <div className="border border-brand-line bg-[#faf8f6] px-4 py-3 text-sm font-semibold text-brand-dark">
              <span className="inline-flex items-center gap-2">
                <Bath className="h-4 w-4 text-brand-red" />
                {getBathroomLabel(listing.baths)}
              </span>
            </div>
            <div className="border border-brand-line bg-[#faf8f6] px-4 py-3 text-sm font-semibold text-brand-dark">
              <span className="inline-flex items-center gap-2">
                <Square className="h-4 w-4 text-brand-red" />
                {listing.areaSqm} sqm
              </span>
            </div>
            <div className="border border-brand-line bg-[#faf8f6] px-4 py-3 text-sm font-semibold text-brand-dark">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-red" />
                {listing.homeType}
              </span>
            </div>
            <div className="border border-brand-line bg-[#faf8f6] px-4 py-3 text-sm font-semibold text-brand-dark">
              <span className="inline-flex items-center gap-2">
                <CalendarRange className="h-4 w-4 text-brand-red" />
                Built {listing.builtYear}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-gray">Amenities</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {listing.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-2 border border-brand-line px-3 py-2 text-sm font-semibold text-brand-dark"
                >
                  <Sparkles className="h-3.5 w-3.5 text-brand-red" />
                  {amenity}
                </span>
              ))}
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
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
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

  async function handleShare(listing: PropertyListing) {
    const shareUrl = `${window.location.origin}${import.meta.env.BASE_URL}properties-for-sale#${listing.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: listing.title,
          text: `${listing.title} in ${listing.city}, ${listing.province}`,
          url: shareUrl,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedId(listing.id);
        window.setTimeout(() => setCopiedId((current) => (current === listing.id ? null : current)), 1800);
      }
    } catch {
      setCopiedId(null);
    }
  }

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
              <div className="flex flex-wrap gap-2 border-b border-[#e3ddd8] pb-4">
                {modeOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleModeChange(option)}
                    className={`px-5 py-3 text-sm font-black uppercase tracking-[0.18em] ${
                      mode === option
                        ? "bg-brand-red text-white"
                        : "border border-brand-line bg-white text-brand-dark"
                    }`}
                  >
                    {option === "sale" ? "Sale" : "Rent"}
                  </button>
                ))}
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,170px))_minmax(0,240px)]">
                <label className="flex items-center gap-3 border border-white bg-white px-4 py-4">
                  <Search className="h-5 w-5 text-brand-red" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(cleanSearchText(event.target.value))}
                    className="w-full text-sm font-medium outline-none"
                    maxLength={80}
                    placeholder="Search by city, province, project, nearby landmark, or property type"
                  />
                </label>

                <input
                  value={minPrice}
                  onChange={(event) => setMinPrice(cleanNumericText(event.target.value))}
                  className="border border-white bg-white px-4 py-4 text-sm font-semibold outline-none"
                  inputMode="numeric"
                  maxLength={12}
                  placeholder={mode === "sale" ? "Min THB" : "Min / month"}
                />
                <input
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(cleanNumericText(event.target.value))}
                  className="border border-white bg-white px-4 py-4 text-sm font-semibold outline-none"
                  inputMode="numeric"
                  maxLength={12}
                  placeholder={mode === "sale" ? "Max THB" : "Max / month"}
                />

                <select
                  value={selectedBedroom}
                  onChange={(event) => setSelectedBedroom(event.target.value)}
                  className="border border-white bg-white px-4 py-4 text-sm font-semibold outline-none"
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
                  className="border border-white bg-white px-4 py-4 text-sm font-semibold outline-none"
                  aria-label="Bathroom filter"
                >
                  {bathroomOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === "Any" ? "Any Bath" : `${option}+ Bath`}
                    </option>
                  ))}
                </select>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSortOpen((current) => !current)}
                    className="flex w-full items-center justify-between gap-3 rounded-[24px] border border-brand-dark bg-white px-5 py-4 text-left text-sm font-semibold"
                    aria-expanded={sortOpen}
                    aria-label="Recommended sort menu"
                  >
                    <span>{sortOptions.find((option) => option.value === sortBy)?.label ?? "Recommended"}</span>
                    <ChevronDown className={`h-4 w-4 transition ${sortOpen ? "rotate-180" : ""}`} />
                  </button>

                  {sortOpen ? (
                    <div className="absolute right-0 top-[calc(100%+10px)] z-20 min-w-full overflow-hidden border border-[#cfd7e3] bg-white shadow-[0_24px_50px_rgba(15,23,42,0.14)]">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setSortBy(option.value);
                            setSortOpen(false);
                          }}
                          className="flex w-full items-center gap-4 border-b border-[#d7dde6] px-5 py-4 text-left text-[15px] text-brand-dark last:border-b-0 hover:bg-[#f7f9fc]"
                        >
                          <span
                            className={`h-6 w-6 rounded-full border ${
                              sortBy === option.value ? "border-brand-dark" : "border-[#6b7280]"
                            } flex items-center justify-center`}
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
                  ) : null}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-start gap-4 border-t border-[#e3ddd8] pt-4">
                <div className="min-w-[220px] flex-1">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-gray">Home Type</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {homeTypeOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSelectedHomeType(option)}
                        className={`px-4 py-2 text-sm font-bold ${
                          selectedHomeType === option
                            ? "bg-brand-red text-white"
                            : "border border-brand-line bg-white text-brand-dark"
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
                        className={`px-4 py-2 text-sm font-bold ${
                          selectedAmenities.includes(amenity)
                            ? "bg-brand-dark text-white"
                            : "border border-brand-line bg-white text-brand-dark"
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
                          className={`px-4 py-2 text-sm font-bold ${
                            selectedCategories.includes(category)
                              ? "bg-[#1f2937] text-white"
                              : "border border-brand-line bg-white text-brand-dark"
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
                    className="inline-flex items-center gap-2 border border-brand-line bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-brand-dark hover:text-brand-red"
                  >
                    <Undo2 className="h-4 w-4" />
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          <div className="flex flex-col gap-3 border border-[#e3ddd8] bg-white px-5 py-4 shadow-[0_14px_32px_rgba(15,23,42,0.05)] sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-red">Results</p>
              <h2 className="mt-2 text-3xl font-black text-brand-dark">
                {filteredListings.length} homes across {provinceCount} provinces
              </h2>
              <p className="mt-2 text-sm text-brand-gray">
                Search works across city, province, nearby landmarks, and property type.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-gray">
              {Array.from(new Set(filteredListings.map((listing) => listing.province))).slice(0, 6).map((province) => (
                <span key={province} className="border border-brand-line px-3 py-2">
                  {province}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {filteredListings.length > 0 ? (
              filteredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  copiedId={copiedId}
                  listing={listing}
                  mode={mode}
                  onShare={handleShare}
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
