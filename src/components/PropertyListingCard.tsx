import {
  Bath,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Square,
  CalendarRange,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { ListingMode, PropertyListing } from "../types/propertyListing";
import { assetPath } from "../utils/assets";
import { getPropertyBadgeClasses } from "../utils/propertyBadges";
import { propertyDetailHref } from "../utils/propertyLinks";
import { safeHref } from "../utils/security";

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

function getRentDepositLabel() {
  return "Deposit 4,000 THB";
}

export function PropertyListingCard({
  listing,
  mode,
  saved = false,
  onToggleSave,
}: {
  listing: PropertyListing;
  mode: ListingMode;
  saved?: boolean;
  onToggleSave?: (propertyId: string) => void;
}) {
  const [activeSlide, setActiveSlide] = useState(0);
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
      <div className="grid md:grid-cols-[310px_1fr] lg:grid-cols-[340px_1fr]">
        <div className="relative aspect-[4/3] overflow-hidden bg-neutral-200 md:aspect-auto md:min-h-[250px]">
          <a
            href={safeHref(propertyDetailHref(listing.id))}
            aria-label={`View details for ${listing.title}`}
            className="absolute inset-0 z-10"
          />
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
          <div className="absolute left-3 top-3 z-20 flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] ${getPropertyBadgeClasses(listing.statusLabel)}`}>
              {listing.statusLabel}
            </span>
            {listing.specialCategory ? (
              <span className={`rounded-full px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] ${getPropertyBadgeClasses(listing.specialCategory)}`}>
                {listing.specialCategory}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onToggleSave?.(listing.id)}
            className={`absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 transition-all duration-300 hover:scale-105 ${
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
            className="absolute left-3 top-1/2 z-20 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-dark transition hover:bg-white"
            aria-label={`Previous image for ${listing.title}`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-3 top-1/2 z-20 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-dark transition hover:bg-white"
            aria-label={`Next image for ${listing.title}`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/35 px-3 py-2">
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
          <div className="absolute inset-x-3 bottom-3 z-20 text-white">
            <p className="inline-flex items-center gap-2 text-xs font-semibold">
              <MapPin className="h-4 w-4" />
              {listing.city}, {listing.province}
            </p>
          </div>
        </div>

        <div className="p-4 md:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <a href={safeHref(propertyDetailHref(listing.id))} className="inline-block">
                <h3 className="line-clamp-2 text-lg font-black leading-snug text-brand-dark transition hover:text-brand-red md:text-xl">
                  {listing.title}
                </h3>
              </a>
              <p className="mt-1 text-sm font-semibold text-brand-gray">
                {listing.city}, {listing.province}
              </p>
            </div>
            <div className="shrink-0 sm:text-right">
              <p className="text-xl font-black text-brand-red md:text-2xl">{listing.priceLabel}</p>
              {listing.mode === "rent" ? (
                <p className="mt-1 text-sm font-bold text-brand-gray md:text-base">{getRentDepositLabel()}</p>
              ) : null}
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
                <CalendarRange className="h-3.5 w-3.5 text-brand-red" />
                Built {listing.builtYear}
              </span>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-brand-line pt-4">
            <p className="line-clamp-1 text-sm font-semibold text-brand-gray">
              {listing.propertyTypeLabel}
            </p>
            <a
              href={safeHref(propertyDetailHref(listing.id))}
              className="text-sm font-black uppercase tracking-[0.16em] text-brand-red transition hover:text-brand-dark"
            >
              View Details
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
