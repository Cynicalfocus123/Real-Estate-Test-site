import {
  Bath,
  BedDouble,
  Building2,
  ChevronLeft,
  ChevronRight,
  Heart,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Share2,
  Square,
  Warehouse,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { propertyListings } from "../data/propertyListings";
import type { ListingMode, PropertyListing } from "../types/propertyListing";
import { assetPath } from "../utils/assets";
import { propertyDetailHref } from "../utils/propertyLinks";
import { safeHref } from "../utils/security";
import { Footer } from "./Footer";
import { Header } from "./Header";

function buildListingHref(mode: ListingMode) {
  return mode === "rent" ? `${import.meta.env.BASE_URL}properties-for-rent` : `${import.meta.env.BASE_URL}properties-for-sale`;
}

function getBedroomLabel(beds: number) {
  return beds === 0 ? "Studio" : `${beds} Bed`;
}

function getBathroomLabel(baths: number) {
  return baths === 0 ? "N/A" : `${baths} Bath`;
}

function getAgentInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function SimilarPropertyCard({ listing }: { listing: PropertyListing }) {
  return (
    <a
      href={safeHref(propertyDetailHref(listing.id))}
      className="flex w-[285px] shrink-0 flex-col overflow-hidden rounded-[28px] border border-[#e8e1db] bg-white shadow-[0_16px_35px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_22px_42px_rgba(15,23,42,0.12)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={assetPath(listing.galleryImages[0] ?? listing.image)}
          alt={listing.title}
          className="h-full w-full object-cover transition duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.05)_0%,rgba(15,23,42,0.32)_100%)]" />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-brand-dark">
          {listing.propertyTypeLabel}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-brand-gray">
          <MapPin className="h-4 w-4 text-brand-red" />
          {listing.city}, {listing.province}
        </p>
        <h3 className="mt-3 line-clamp-2 text-lg font-black leading-snug text-brand-dark">{listing.title}</h3>
        <p className="mt-3 text-xl font-black text-brand-red">{listing.priceLabel}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-brand-dark">
          <span className="rounded-full bg-[#f7f3ef] px-3 py-2">{getBedroomLabel(listing.beds)}</span>
          <span className="rounded-full bg-[#f7f3ef] px-3 py-2">{getBathroomLabel(listing.baths)}</span>
          <span className="rounded-full bg-[#f7f3ef] px-3 py-2">{listing.areaSqm} sqm</span>
        </div>
      </div>
    </a>
  );
}

export function PropertyDetailPage({ listing }: { listing: PropertyListing }) {
  const [saved, setSaved] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);
  const [shareMessage, setShareMessage] = useState("Share");
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const similarScrollRef = useRef<HTMLDivElement | null>(null);
  const phoneHref = `tel:${listing.agent.phone.replace(/\s+/g, "")}`;
  const emailHref = `mailto:${listing.agent.email}`;
  const metricSummary = `${getBedroomLabel(listing.beds)} • ${getBathroomLabel(listing.baths)} • ${listing.areaSqm} sqm`;

  const previewImages = useMemo(() => {
    const sourceImages = listing.galleryImages.length > 0 ? listing.galleryImages : [listing.image];
    return Array.from({ length: Math.min(5, Math.max(sourceImages.length, 5)) }, (_, index) => sourceImages[index % sourceImages.length]);
  }, [listing.galleryImages, listing.image]);

  useEffect(() => {
    setActivePreviewIndex(0);
  }, [listing.id]);

  const similarProperties = useMemo(() => {
    const sameProvince = propertyListings.filter(
      (candidate) =>
        candidate.id !== listing.id && candidate.mode === listing.mode && candidate.province === listing.province,
    );

    if (sameProvince.length >= 4) {
      return sameProvince.slice(0, 8);
    }

    const fallbackListings = propertyListings.filter(
      (candidate) => candidate.id !== listing.id && candidate.mode === listing.mode,
    );

    return Array.from(new Map([...sameProvince, ...fallbackListings].map((candidate) => [candidate.id, candidate])).values()).slice(0, 8);
  }, [listing.id, listing.mode, listing.province]);

  useEffect(() => {
    if (!galleryOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setGalleryOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [galleryOpen]);

  async function handleShare() {
    const detailUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title: listing.title, text: listing.title, url: detailUrl });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(detailUrl);
      }

      setShareMessage("Link copied");
      window.setTimeout(() => setShareMessage("Share"), 2200);
    } catch {
      setShareMessage("Share unavailable");
      window.setTimeout(() => setShareMessage("Share"), 2200);
    }
  }

  function scrollSimilar(direction: "left" | "right") {
    similarScrollRef.current?.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth",
    });
  }

  return (
    <div className="min-h-screen bg-[#f8f5f2] text-brand-dark">
      <div className="hidden md:block">
        <Header />
      </div>
      <main className="pb-28 md:pb-20">
        <section className="mx-auto max-w-7xl px-4 pb-8 pt-0 md:pt-8 lg:px-8">
          <div className="md:hidden -mx-4 mb-5">
            <div className="relative aspect-[4/5] overflow-hidden bg-brand-dark">
              <img
                src={assetPath(previewImages[activePreviewIndex])}
                alt={`${listing.title} main photo`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.22)_0%,rgba(15,23,42,0.02)_34%,rgba(15,23,42,0.6)_100%)]" />
              <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3">
                <a
                  href={safeHref(buildListingHref(listing.mode))}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/94 text-brand-dark shadow-[0_10px_24px_rgba(15,23,42,0.18)]"
                  aria-label="Back to listings"
                >
                  <ChevronLeft className="h-7 w-7" />
                </a>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 rounded-full bg-white/94 px-3 py-2 shadow-[0_10px_24px_rgba(15,23,42,0.18)]">
                    <button
                      type="button"
                      onClick={() => setSaved((current) => !current)}
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition ${
                        saved ? "text-brand-red" : "text-brand-dark"
                      }`}
                      aria-label={`${saved ? "Unsave" : "Save"} ${listing.title}`}
                      aria-pressed={saved}
                    >
                      <Heart className={`h-6 w-6 ${saved ? "fill-current" : ""}`} />
                    </button>
                    <button
                      type="button"
                      onClick={handleShare}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-dark transition"
                      aria-label={`Share ${listing.title}`}
                    >
                      <Share2 className="h-6 w-6" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setContactVisible((current) => !current)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-dark transition"
                      aria-label="More property actions"
                    >
                      <MoreHorizontal className="h-6 w-6" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setContactVisible((current) => !current)}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-brand-red text-sm font-black text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]"
                    aria-label="Show agent contact"
                  >
                    {getAgentInitials(listing.agent.name)}
                  </button>
                </div>
              </div>
              <div className="absolute left-4 bottom-20 rounded-2xl bg-[rgba(17,24,39,0.72)] px-4 py-3 text-sm font-black text-white backdrop-blur">
                {listing.propertyTypeLabel}
              </div>
              <div className="absolute inset-x-4 bottom-6 flex items-center gap-2">
                {previewImages.map((_, index) => (
                  <button
                    key={`${listing.id}-mobile-progress-${index}`}
                    type="button"
                    onClick={() => setActivePreviewIndex(index)}
                    className={`h-1.5 flex-1 rounded-full transition ${
                      activePreviewIndex === index ? "bg-white" : "bg-white/45"
                    }`}
                    aria-label={`Show mobile photo ${index + 1} for ${listing.title}`}
                    aria-pressed={activePreviewIndex === index}
                  />
                ))}
              </div>
            </div>
            <div className="border-b border-[#e6ddd7] bg-white px-4 py-4">
              <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <button
                  type="button"
                  onClick={() => setGalleryOpen(true)}
                  className="shrink-0 rounded-full border border-[#232735] px-4 py-3 text-sm font-black text-brand-dark shadow-[inset_0_0_0_1px_rgba(17,24,39,0.2)]"
                >
                  See all photos
                </button>
                <button
                  type="button"
                  onClick={() => setContactVisible((current) => !current)}
                  className="shrink-0 rounded-full border border-[#232735] px-4 py-3 text-sm font-black text-brand-dark shadow-[inset_0_0_0_1px_rgba(17,24,39,0.2)]"
                >
                  Contact agent
                </button>
                <div className="shrink-0 rounded-full border border-[#d7dbe5] bg-[#f4f6fb] px-4 py-3 text-sm font-bold text-brand-gray">
                  Photo {activePreviewIndex + 1} of {previewImages.length}
                </div>
              </div>
            </div>
          </div>

          <a
            href={safeHref(buildListingHref(listing.mode))}
            className="hidden items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-brand-red md:inline-flex"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to listings
          </a>

          <div className="mt-6 grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div>
              <div className="hidden flex-wrap gap-3 md:flex">
                <span className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-brand-dark shadow-sm">
                  For {listing.mode}
                </span>
                <span className="rounded-full bg-brand-red px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white shadow-sm">
                  {listing.propertyTypeLabel}
                </span>
              </div>

              <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="md:hidden text-[11px] font-black uppercase tracking-[0.22em] text-brand-red">
                    For {listing.mode} • {listing.statusLabel}
                  </p>
                  <h1 className="max-w-4xl text-[2rem] font-black leading-[1.04] text-brand-dark sm:text-5xl">
                    {listing.title}
                  </h1>
                  <p className="mt-3 text-lg font-black text-brand-dark md:hidden">{metricSummary}</p>
                  <p className="mt-3 inline-flex items-center gap-2 text-base font-semibold text-brand-gray md:mt-4">
                    <MapPin className="h-5 w-5 text-brand-red" />
                    {listing.city}, {listing.province}
                  </p>
                </div>
                <div className="rounded-[28px] border border-[#eadfd6] bg-white px-5 py-4 shadow-[0_16px_35px_rgba(15,23,42,0.07)] md:px-6 md:py-5">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-gray">Asking Price</p>
                  <p className="mt-2 text-3xl font-black text-brand-red">{listing.priceLabel}</p>
                </div>
              </div>

              <div className="mt-4 hidden overflow-hidden rounded-[34px] bg-white p-3 shadow-[0_20px_48px_rgba(15,23,42,0.12)] md:block md:p-4">
                <div className="space-y-4">
                  <div className="relative min-h-[340px] overflow-hidden rounded-[30px] sm:min-h-[430px] lg:min-h-[560px]">
                    <img
                      src={assetPath(previewImages[activePreviewIndex])}
                      alt={`${listing.title} main photo`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute left-4 top-4 rounded-full bg-white/96 px-4 py-2 text-sm font-black text-brand-dark shadow-sm">
                      {listing.statusLabel}
                    </div>
                    <button
                      type="button"
                      onClick={() => setGalleryOpen(true)}
                      className="absolute bottom-4 right-4 rounded-xl bg-white/96 px-3 py-2 text-xs font-black text-brand-dark shadow-[0_10px_24px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5 sm:px-4 sm:text-sm"
                    >
                      See all {listing.galleryImages.length} photos
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {previewImages.map((image, index) => (
                      <button
                        key={`${listing.id}-preview-${index}`}
                        type="button"
                        onClick={() => setActivePreviewIndex(index)}
                        className={`relative aspect-square overflow-hidden rounded-[24px] border-2 transition ${
                          activePreviewIndex === index
                            ? "border-brand-red shadow-[0_14px_32px_rgba(163,28,36,0.16)]"
                            : "border-transparent hover:border-[#d9c9be]"
                        }`}
                        aria-label={`Show photo ${index + 1} for ${listing.title}`}
                        aria-pressed={activePreviewIndex === index}
                      >
                        <img
                          src={assetPath(image)}
                          alt={`${listing.title} preview ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <div
                          className={`absolute inset-0 transition ${
                            activePreviewIndex === index ? "bg-[rgba(163,28,36,0.14)]" : "bg-transparent"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 hidden flex-wrap gap-3 md:flex">
                <button
                  type="button"
                  onClick={() => setSaved((current) => !current)}
                  className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-black transition ${
                    saved
                      ? "border-brand-red bg-[#fff1f1] text-brand-red"
                      : "border-[#dfd5ce] bg-white text-brand-dark hover:border-brand-red"
                  }`}
                  aria-pressed={saved}
                >
                  <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
                  {saved ? "Saved" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 rounded-full border border-[#dfd5ce] bg-white px-5 py-3 text-sm font-black text-brand-dark transition hover:border-brand-red"
                >
                  <Share2 className="h-4 w-4" />
                  {shareMessage}
                </button>
              </div>

              <div className="mt-5 rounded-[28px] border border-[#e7dcd5] bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:hidden">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[22px] bg-[#f5f4f8] px-4 py-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-gray">Type</p>
                    <p className="mt-2 text-lg font-black leading-tight text-brand-dark">{listing.homeType}</p>
                  </div>
                  <div className="rounded-[22px] bg-[#f5f4f8] px-4 py-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-gray">Built</p>
                    <p className="mt-2 text-lg font-black leading-tight text-brand-dark">{listing.builtYear}</p>
                  </div>
                  <div className="rounded-[22px] bg-[#f5f4f8] px-4 py-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-gray">Garage</p>
                    <p className="mt-2 text-lg font-black leading-tight text-brand-dark">{listing.garageSpaces} spaces</p>
                  </div>
                  <div className="rounded-[22px] bg-[#f5f4f8] px-4 py-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-gray">Floor</p>
                    <p className="mt-2 text-lg font-black leading-tight text-brand-dark">{listing.floorCount || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-[28px] border border-[#e7dcd5] bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:hidden">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-gray">BuyHomeForLess Agent</p>
                <div className="mt-3 flex items-start gap-4">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-red text-lg font-black text-white">
                    {getAgentInitials(listing.agent.name)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-black leading-tight text-brand-dark">{listing.agent.name}</h2>
                    <p className="mt-1 text-sm leading-6 text-brand-gray">
                      Ask for a viewing, ownership guidance, and closing support.
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <a
                    href={phoneHref}
                    className="inline-flex items-center justify-center rounded-2xl border border-brand-red px-4 py-3 text-sm font-black text-brand-red"
                  >
                    Call Agent
                  </a>
                  <button
                    type="button"
                    onClick={() => setContactVisible((current) => !current)}
                    className="inline-flex items-center justify-center rounded-2xl bg-brand-red px-4 py-3 text-sm font-black text-white"
                  >
                    {contactVisible ? "Hide Contact" : "Show Contact"}
                  </button>
                </div>
                {contactVisible ? (
                  <div className="mt-4 space-y-3 rounded-[20px] bg-[#fff7f4] p-4 text-sm font-bold text-brand-dark">
                    <a href={phoneHref} className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-brand-red" />
                      {listing.agent.phone}
                    </a>
                    <a href={emailHref} className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-brand-red" />
                      {listing.agent.email}
                    </a>
                  </div>
                ) : null}
              </div>

              <div className="mt-6 rounded-[28px] border border-[#e8ded7] bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.06)] sm:p-8 md:mt-8 md:rounded-[32px] md:p-6">
                <h2 className="text-[1.9rem] font-black leading-tight text-brand-dark md:text-2xl">Property Details</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 md:mt-6 md:gap-4">
                  <div className="rounded-[22px] bg-[#f5f4f8] p-4 md:rounded-[24px] md:p-5">
                    <p className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.18em] text-brand-gray">
                      <BedDouble className="h-4 w-4 text-brand-red" />
                      Bedrooms
                    </p>
                    <p className="mt-3 text-xl font-black text-brand-dark md:text-2xl">{getBedroomLabel(listing.beds)}</p>
                  </div>
                  <div className="rounded-[22px] bg-[#f5f4f8] p-4 md:rounded-[24px] md:p-5">
                    <p className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.18em] text-brand-gray">
                      <Bath className="h-4 w-4 text-brand-red" />
                      Bathrooms
                    </p>
                    <p className="mt-3 text-xl font-black text-brand-dark md:text-2xl">{getBathroomLabel(listing.baths)}</p>
                  </div>
                  <div className="rounded-[22px] bg-[#f5f4f8] p-4 md:rounded-[24px] md:p-5">
                    <p className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.18em] text-brand-gray">
                      <Building2 className="h-4 w-4 text-brand-red" />
                      Floors
                    </p>
                    <p className="mt-3 text-xl font-black text-brand-dark md:text-2xl">{listing.floorCount || "N/A"}</p>
                  </div>
                  <div className="rounded-[22px] bg-[#f5f4f8] p-4 md:rounded-[24px] md:p-5">
                    <p className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.18em] text-brand-gray">
                      <Warehouse className="h-4 w-4 text-brand-red" />
                      Garage
                    </p>
                    <p className="mt-3 text-xl font-black text-brand-dark md:text-2xl">{listing.garageSpaces || "N/A"}</p>
                  </div>
                  <div className="rounded-[22px] bg-[#f5f4f8] p-4 md:rounded-[24px] md:p-5">
                    <p className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.18em] text-brand-gray">
                      <Square className="h-4 w-4 text-brand-red" />
                      Living Area
                    </p>
                    <p className="mt-3 text-xl font-black text-brand-dark md:text-2xl">{listing.areaSqm} sqm</p>
                  </div>
                  <div className="rounded-[22px] bg-[#f5f4f8] p-4 md:rounded-[24px] md:p-5">
                    <p className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.18em] text-brand-gray">
                      <Building2 className="h-4 w-4 text-brand-red" />
                      Property Type
                    </p>
                    <p className="mt-3 text-xl font-black text-brand-dark md:text-2xl">{listing.propertyTypeLabel}</p>
                  </div>
                </div>

                <div className="mt-8 grid gap-7 lg:grid-cols-[1.15fr_0.85fr]">
                  <div>
                    <h3 className="text-[2rem] font-black leading-tight text-brand-dark md:text-lg">What's Special</h3>
                    <p className="mt-4 text-[1.05rem] leading-8 text-brand-gray md:text-base">{listing.description}</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-brand-dark md:text-lg">Nearby Highlights</h3>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {listing.nearby.map((item) => (
                        <span
                          key={`${listing.id}-nearby-${item}`}
                          className="rounded-full border border-[#e4d8cf] bg-[#fffaf6] px-4 py-2 text-sm font-bold text-brand-dark"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <section className="mt-8 rounded-[32px] border border-[#e8ded7] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] sm:p-8">
                <h2 className="text-2xl font-black text-brand-dark">Amenities</h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {listing.amenities.map((amenity) => (
                    <div
                      key={`${listing.id}-amenity-${amenity}`}
                      className="rounded-[22px] border border-[#ece2da] bg-[#fffaf6] px-5 py-4 text-sm font-bold text-brand-dark"
                    >
                      {amenity}
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-8 rounded-[32px] border border-[#e8ded7] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] sm:p-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-brand-dark">FAQ</h2>
                    <p className="mt-2 text-sm leading-6 text-brand-gray">
                      This section already reads from structured property FAQ data so backend-written answers can plug in per listing later.
                    </p>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  {listing.faqs && listing.faqs.length > 0 ? (
                    listing.faqs.map((faq, index) => {
                      const open = openFaqIndex === index;
                      return (
                        <div key={`${listing.id}-faq-${index}`} className="overflow-hidden rounded-[24px] border border-[#eee4dd]">
                          <button
                            type="button"
                            onClick={() => setOpenFaqIndex(open ? -1 : index)}
                            className="flex w-full items-center justify-between gap-4 bg-white px-5 py-4 text-left"
                          >
                            <span className="text-base font-black text-brand-dark">{faq.question}</span>
                            <ChevronRight className={`h-5 w-5 shrink-0 text-brand-red transition ${open ? "rotate-90" : ""}`} />
                          </button>
                          {open ? (
                            <div className="border-t border-[#eee4dd] bg-[#fffaf6] px-5 py-4 text-sm leading-7 text-brand-gray">
                              {faq.answer}
                            </div>
                          ) : null}
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-[24px] border border-dashed border-[#d8ccc4] bg-[#fffaf6] px-5 py-6 text-sm leading-7 text-brand-gray">
                      Property-specific FAQs will appear here once the backend sends them for this listing.
                    </div>
                  )}
                </div>
              </section>

              <section className="mt-8 rounded-[32px] border border-[#e8ded7] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-brand-dark">Similar Properties</h2>
                    <p className="mt-2 text-sm leading-6 text-brand-gray">
                      More homes matched from the same province first, with fallback listings from the same sale or rent channel.
                    </p>
                  </div>
                  <div className="hidden items-center gap-3 md:flex">
                    <button
                      type="button"
                      onClick={() => scrollSimilar("left")}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#dfd5ce] bg-white text-brand-dark transition hover:border-brand-red"
                      aria-label="Scroll similar properties left"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollSimilar("right")}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#dfd5ce] bg-white text-brand-dark transition hover:border-brand-red"
                      aria-label="Scroll similar properties right"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div
                  ref={similarScrollRef}
                  className="mt-6 flex gap-5 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {similarProperties.map((candidate) => (
                    <SimilarPropertyCard key={candidate.id} listing={candidate} />
                  ))}
                </div>
              </section>
            </div>

            <aside className="hidden xl:block xl:pt-14">
              <div className="xl:sticky xl:top-28">
                <div className="rounded-[32px] border border-[#e4d9d1] bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.1)]">
                  <p className="text-sm font-bold uppercase tracking-[0.22em] text-brand-gray">Your Agent</p>
                  <h2 className="mt-3 text-3xl font-black text-brand-dark">{listing.agent.name}</h2>
                  <p className="mt-4 text-sm leading-7 text-brand-gray">
                    Ask for a viewing, ownership guidance, pricing history, or closing support for this property.
                  </p>
                  <button
                    type="button"
                    onClick={() => setContactVisible((current) => !current)}
                    className="mt-6 w-full rounded-2xl bg-brand-red px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-brand-dark"
                  >
                    {contactVisible ? "Hide Contact" : "Contact Agent"}
                  </button>
                  {contactVisible ? (
                    <div className="mt-5 space-y-4 rounded-[24px] bg-[#fff7f4] p-5">
                      <a
                        href={phoneHref}
                        className="flex items-center gap-3 text-sm font-bold text-brand-dark"
                      >
                        <Phone className="h-4 w-4 text-brand-red" />
                        {listing.agent.phone}
                      </a>
                      <a href={emailHref} className="flex items-center gap-3 text-sm font-bold text-brand-dark">
                        <Mail className="h-4 w-4 text-brand-red" />
                        {listing.agent.email}
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />

      {galleryOpen ? (
        <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-[rgba(17,24,39,0.78)] px-4 py-8">
          <div className="w-full max-w-6xl rounded-[34px] bg-white p-5 shadow-[0_24px_64px_rgba(15,23,42,0.28)] sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-gray">Gallery</p>
                <h2 className="mt-2 text-2xl font-black text-brand-dark">{listing.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setGalleryOpen(false)}
                className="rounded-full border border-[#dfd5ce] px-4 py-2 text-sm font-black text-brand-dark transition hover:border-brand-red"
              >
                Close
              </button>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {listing.galleryImages.map((image, index) => (
                <div key={`${listing.id}-gallery-${index}`} className="overflow-hidden rounded-[24px] bg-[#f8f5f2]">
                  <img
                    src={assetPath(image)}
                    alt={`${listing.title} photo ${index + 1}`}
                    className="h-full min-h-[220px] w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e3dad4] bg-white/96 p-3 backdrop-blur md:hidden">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setContactVisible((current) => !current)}
            className="rounded-2xl border border-brand-red px-4 py-3 text-sm font-black text-brand-red"
          >
            Contact Agent
          </button>
          <a
            href={phoneHref}
            className="inline-flex items-center justify-center rounded-2xl bg-brand-red px-4 py-3 text-sm font-black text-white"
          >
            Request a Call
          </a>
        </div>
      </div>
    </div>
  );
}
