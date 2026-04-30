import {
  Bath,
  BedDouble,
  Building2,
  ChevronLeft,
  ChevronRight,
  Heart,
  Mail,
  MapPin,
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
  const similarScrollRef = useRef<HTMLDivElement | null>(null);

  const previewImages = useMemo(() => {
    const sourceImages = listing.galleryImages.length > 0 ? listing.galleryImages : [listing.image];
    return Array.from({ length: Math.min(5, Math.max(sourceImages.length, 5)) }, (_, index) => sourceImages[index % sourceImages.length]);
  }, [listing.galleryImages, listing.image]);

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
      <Header />
      <main className="pb-20">
        <section className="mx-auto max-w-7xl px-4 pb-8 pt-8 lg:px-8">
          <a
            href={safeHref(buildListingHref(listing.mode))}
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-brand-red"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to listings
          </a>

          <div className="mt-6 grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div>
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-brand-dark shadow-sm">
                  For {listing.mode}
                </span>
                <span className="rounded-full bg-brand-red px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white shadow-sm">
                  {listing.propertyTypeLabel}
                </span>
              </div>

              <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="max-w-4xl text-4xl font-black leading-tight text-brand-dark sm:text-5xl">
                    {listing.title}
                  </h1>
                  <p className="mt-4 inline-flex items-center gap-2 text-base font-semibold text-brand-gray">
                    <MapPin className="h-5 w-5 text-brand-red" />
                    {listing.city}, {listing.province}
                  </p>
                </div>
                <div className="rounded-[28px] border border-[#eadfd6] bg-white px-6 py-5 shadow-[0_16px_35px_rgba(15,23,42,0.07)]">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-gray">Asking Price</p>
                  <p className="mt-2 text-3xl font-black text-brand-red">{listing.priceLabel}</p>
                </div>
              </div>

              <div className="mt-8 overflow-hidden rounded-[34px] bg-white p-2 shadow-[0_20px_48px_rgba(15,23,42,0.12)]">
                <div className="grid gap-2 lg:grid-cols-[1.45fr_1fr]">
                  <div className="relative min-h-[280px] overflow-hidden rounded-[28px]">
                    <img
                      src={assetPath(previewImages[0])}
                      alt={`${listing.title} main photo`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute left-4 top-4 rounded-full bg-white/96 px-4 py-2 text-sm font-black text-brand-dark shadow-sm">
                      {listing.statusLabel}
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {previewImages.slice(1, 5).map((image, index) => (
                      <div key={`${listing.id}-preview-${index}`} className="relative min-h-[135px] overflow-hidden rounded-[24px]">
                        <img
                          src={assetPath(image)}
                          alt={`${listing.title} preview ${index + 2}`}
                          className="h-full w-full object-cover"
                        />
                        {index === 3 ? (
                          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.5)_100%)]" />
                        ) : null}
                        {index === 3 ? (
                          <button
                            type="button"
                            onClick={() => setGalleryOpen(true)}
                            className="absolute bottom-4 right-4 rounded-2xl bg-white px-5 py-3 text-sm font-black text-brand-dark shadow-[0_12px_28px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5"
                          >
                            See all {listing.galleryImages.length} photos
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
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

              <div className="mt-8 rounded-[32px] border border-[#e8ded7] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)] sm:p-8">
                <h2 className="text-2xl font-black text-brand-dark">Property Details</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-[24px] bg-[#f8f5f2] p-5">
                    <p className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.18em] text-brand-gray">
                      <BedDouble className="h-4 w-4 text-brand-red" />
                      Bedrooms
                    </p>
                    <p className="mt-3 text-2xl font-black text-brand-dark">{getBedroomLabel(listing.beds)}</p>
                  </div>
                  <div className="rounded-[24px] bg-[#f8f5f2] p-5">
                    <p className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.18em] text-brand-gray">
                      <Bath className="h-4 w-4 text-brand-red" />
                      Bathrooms
                    </p>
                    <p className="mt-3 text-2xl font-black text-brand-dark">{getBathroomLabel(listing.baths)}</p>
                  </div>
                  <div className="rounded-[24px] bg-[#f8f5f2] p-5">
                    <p className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.18em] text-brand-gray">
                      <Building2 className="h-4 w-4 text-brand-red" />
                      Floors
                    </p>
                    <p className="mt-3 text-2xl font-black text-brand-dark">{listing.floorCount || "N/A"}</p>
                  </div>
                  <div className="rounded-[24px] bg-[#f8f5f2] p-5">
                    <p className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.18em] text-brand-gray">
                      <Warehouse className="h-4 w-4 text-brand-red" />
                      Garage
                    </p>
                    <p className="mt-3 text-2xl font-black text-brand-dark">{listing.garageSpaces || "N/A"}</p>
                  </div>
                  <div className="rounded-[24px] bg-[#f8f5f2] p-5">
                    <p className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.18em] text-brand-gray">
                      <Square className="h-4 w-4 text-brand-red" />
                      Living Area
                    </p>
                    <p className="mt-3 text-2xl font-black text-brand-dark">{listing.areaSqm} sqm</p>
                  </div>
                  <div className="rounded-[24px] bg-[#f8f5f2] p-5">
                    <p className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.18em] text-brand-gray">
                      <Building2 className="h-4 w-4 text-brand-red" />
                      Property Type
                    </p>
                    <p className="mt-3 text-2xl font-black text-brand-dark">{listing.propertyTypeLabel}</p>
                  </div>
                </div>

                <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                  <div>
                    <h3 className="text-lg font-black text-brand-dark">Overview</h3>
                    <p className="mt-4 text-base leading-8 text-brand-gray">{listing.description}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-brand-dark">Nearby Highlights</h3>
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

            <aside className="xl:pt-14">
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
                        href={`tel:${listing.agent.phone.replace(/\s+/g, "")}`}
                        className="flex items-center gap-3 text-sm font-bold text-brand-dark"
                      >
                        <Phone className="h-4 w-4 text-brand-red" />
                        {listing.agent.phone}
                      </a>
                      <a href={`mailto:${listing.agent.email}`} className="flex items-center gap-3 text-sm font-bold text-brand-dark">
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
    </div>
  );
}
