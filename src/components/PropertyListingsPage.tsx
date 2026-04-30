import {
  Bath,
  BedDouble,
  CalendarRange,
  Filter,
  MapPin,
  Search,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Square,
} from "lucide-react";
import { useEffect, useState } from "react";
import { propertyListings } from "../data/propertyListings";
import type { ListingHomeType, PropertyListing } from "../types/propertyListing";
import { assetPath } from "../utils/assets";
import { cleanNumericText, cleanSearchText } from "../utils/security";
import { Footer } from "./Footer";
import { Header } from "./Header";

const bedroomOptions = ["Studio", "1", "2", "3", "4", "5+"] as const;
const bathroomOptions = ["1", "2", "3", "4", "5+"] as const;
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
  { label: "Newest first", value: "newest" },
  { label: "Price: low to high", value: "price-low" },
  { label: "Price: high to low", value: "price-high" },
] as const;

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
  if (!selected) return true;
  if (selected === "Studio") return listing.beds === 0;
  return listing.beds >= getMinimumFilterValue(selected);
}

function matchesBathroom(listing: PropertyListing, selected: string) {
  if (!selected) return true;
  return listing.baths >= getMinimumFilterValue(selected);
}

function ListingCard({
  copiedId,
  listing,
  onShare,
}: {
  copiedId: string | null;
  listing: PropertyListing;
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
          <span className="absolute left-4 top-4 bg-white/95 px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-brand-dark">
            {listing.statusLabel}
          </span>
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
                For Sale
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
                <Filter className="h-4 w-4 text-brand-red" />
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
  const [query, setQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedBedroom, setSelectedBedroom] = useState("");
  const [selectedBathroom, setSelectedBathroom] = useState("");
  const [selectedHomeType, setSelectedHomeType] = useState<"Any" | ListingHomeType>("Any");
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]["value"]>("newest");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  const sanitizedQuery = cleanSearchText(query);
  const minValue = minPrice ? Number(minPrice) : null;
  const maxValue = maxPrice ? Number(maxPrice) : null;

  const filteredListings = propertyListings
    .filter((listing) => {
      const searchableText = `${listing.title} ${listing.city} ${listing.province} ${listing.homeType} ${listing.nearby.join(" ")}`
        .toLowerCase();
      const matchesQuery = !sanitizedQuery || searchableText.includes(sanitizedQuery.toLowerCase());
      const matchesMin = minValue === null || listing.priceValue >= minValue;
      const matchesMax = maxValue === null || listing.priceValue <= maxValue;
      const matchesType = selectedHomeType === "Any" || listing.homeType === selectedHomeType;

      return (
        matchesQuery &&
        matchesMin &&
        matchesMax &&
        matchesType &&
        matchesBedroom(listing, selectedBedroom) &&
        matchesBathroom(listing, selectedBathroom)
      );
    })
    .sort((left, right) => {
      if (sortBy === "price-low") return left.priceValue - right.priceValue;
      if (sortBy === "price-high") return right.priceValue - left.priceValue;
      return right.builtYear - left.builtYear;
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
    setSelectedBedroom("");
    setSelectedBathroom("");
    setSelectedHomeType("Any");
    setSortBy("newest");
  }

  return (
    <div className="min-h-screen bg-[#f7f3ef] text-brand-dark">
      <Header />
      <main>
        <section className="border-b border-[#e5ddd7] bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
            <div className="max-w-4xl">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-brand-red">For Sale</p>
              <h1 className="mt-4 font-serif text-5xl font-normal leading-tight text-brand-dark sm:text-6xl">
                Property Listings by City and Province
              </h1>
              <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-brand-gray">
                Test layout for our main listing page. Search by location, narrow by budget and home
                type, and browse a modern card view with the key property details surfaced up front.
              </p>
            </div>

            <div className="mt-8 grid gap-4 border border-[#e3ddd8] bg-[#faf7f4] p-4 lg:grid-cols-[1fr_auto] lg:p-5">
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

              <div className="grid gap-4 sm:grid-cols-3 lg:min-w-[360px]">
                <input
                  value={minPrice}
                  onChange={(event) => setMinPrice(cleanNumericText(event.target.value))}
                  className="border border-white bg-white px-4 py-4 text-sm font-semibold outline-none"
                  inputMode="numeric"
                  maxLength={12}
                  placeholder="Min THB"
                />
                <input
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(cleanNumericText(event.target.value))}
                  className="border border-white bg-white px-4 py-4 text-sm font-semibold outline-none"
                  inputMode="numeric"
                  maxLength={12}
                  placeholder="Max THB"
                />
                <label className="flex items-center gap-3 border border-white bg-white px-4 py-4">
                  <SlidersHorizontal className="h-5 w-5 text-brand-red" />
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as (typeof sortOptions)[number]["value"])}
                    className="w-full bg-transparent text-sm font-semibold outline-none"
                    aria-label="Sort listings"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[290px_1fr] lg:px-8">
          <aside className="h-fit border border-[#e3ddd8] bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-brand-red">Filters</p>
                <h2 className="mt-2 text-2xl font-black text-brand-dark">Refine Search</h2>
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-black uppercase tracking-[0.18em] text-brand-gray hover:text-brand-red"
              >
                Reset
              </button>
            </div>

            <div className="mt-8 space-y-8">
              <section>
                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-brand-dark">Bedrooms</h3>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {bedroomOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelectedBedroom((current) => (current === option ? "" : option))}
                      className={`px-3 py-3 text-sm font-bold ${
                        selectedBedroom === option
                          ? "bg-brand-dark text-white"
                          : "border border-brand-line text-brand-dark hover:border-brand-red"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-brand-dark">Bathrooms</h3>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {bathroomOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelectedBathroom((current) => (current === option ? "" : option))}
                      className={`px-3 py-3 text-sm font-bold ${
                        selectedBathroom === option
                          ? "bg-brand-dark text-white"
                          : "border border-brand-line text-brand-dark hover:border-brand-red"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-brand-dark">Home Type</h3>
                <div className="mt-3 grid gap-2">
                  {homeTypeOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelectedHomeType(option)}
                      className={`px-4 py-3 text-left text-sm font-bold ${
                        selectedHomeType === option
                          ? "bg-brand-red text-white"
                          : "border border-brand-line text-brand-dark hover:border-brand-red"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </aside>

          <div>
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
                {Array.from(new Set(filteredListings.map((listing) => listing.province))).slice(0, 5).map((province) => (
                  <span key={province} className="border border-brand-line px-3 py-2">
                    {province}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-6">
              {filteredListings.length > 0 ? (
                filteredListings.map((listing) => (
                  <ListingCard key={listing.id} copiedId={copiedId} listing={listing} onShare={handleShare} />
                ))
              ) : (
                <div className="border border-dashed border-brand-line bg-white px-6 py-16 text-center">
                  <h3 className="text-2xl font-black text-brand-dark">No homes match these filters</h3>
                  <p className="mt-4 text-base leading-7 text-brand-gray">
                    Try widening your budget, changing bedroom count, or clearing the location search.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
