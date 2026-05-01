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
  Ruler,
  Search,
  Share2,
  Warehouse,
} from "lucide-react";
import maplibregl from "maplibre-gl";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { propertyListings } from "../data/propertyListings";
import type { ListingMode, PropertyListing } from "../types/propertyListing";
import { assetPath } from "../utils/assets";
import { getPropertyBadgeClasses } from "../utils/propertyBadges";
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

function getRentDepositLabel() {
  return "Deposit 4,000 THB";
}

function getAgentInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type GeocodedMapPoint = {
  lat: number;
  lon: number;
  label: string;
};

const OSMAND_SEARCH_URL = import.meta.env.VITE_OSMAND_SEARCH_URL?.trim() || "https://nominatim.openstreetmap.org/search";
const OSMAND_PUBLIC_FALLBACK_URL = "https://nominatim.openstreetmap.org/search";
const OSMAND_COUNTRY = import.meta.env.VITE_OSMAND_COUNTRY?.trim() || "th";
const OSMAND_LANGUAGE = import.meta.env.VITE_OSMAND_LANGUAGE?.trim() || "en,th";
const OSMAND_EMAIL = import.meta.env.VITE_OSMAND_EMAIL?.trim();
const MAPLIBRE_STYLE_URL = import.meta.env.VITE_MAPLIBRE_STYLE_URL?.trim();
const MAPLIBRE_FALLBACK_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    "osm-tiles": {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "osm-tiles",
      type: "raster",
      source: "osm-tiles",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

function createPropertyPinElement() {
  const pin = document.createElement("span");
  pin.className = "property-map-pin";
  pin.style.display = "block";
  pin.style.width = "18px";
  pin.style.height = "18px";
  pin.style.borderRadius = "9999px";
  pin.style.background = "#a31c24";
  pin.style.border = "3px solid #ffffff";
  pin.style.boxShadow = "0 6px 18px rgba(15,23,42,0.35)";
  return pin;
}

function normalizeAddressValue(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function buildGeocodeQueryCandidates(query: string) {
  const normalized = query.trim();
  if (!normalized) return [];

  const parts = normalized
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const candidates = [normalized];

  if (parts.length >= 4) {
    candidates.push(parts.slice(-4).join(", "));
  }
  if (parts.length >= 3) {
    candidates.push(parts.slice(-3).join(", "));
  }
  if (parts.length >= 2) {
    candidates.push(parts.slice(-2).join(", "));
  }

  if (!/\bthailand\b/i.test(normalized)) {
    candidates.push(`${normalized}, Thailand`);
  }

  return Array.from(new Set(candidates.map((item) => item.trim()).filter(Boolean)));
}

function buildAddressQuery(listing: PropertyListing) {
  const address = listing.address;
  const parts = [
    normalizeAddressValue(address?.street),
    normalizeAddressValue(address?.village),
    normalizeAddressValue(address?.soi),
    normalizeAddressValue(address?.tambon),
    normalizeAddressValue(address?.amphoe),
    normalizeAddressValue(address?.district),
    normalizeAddressValue(address?.city) ?? listing.city,
    normalizeAddressValue(address?.province) ?? listing.province,
    normalizeAddressValue(address?.postalCode),
    normalizeAddressValue(address?.country) ?? "Thailand",
  ].filter(Boolean);

  return parts.join(", ");
}

async function geocodeWithOsmAndSearch(
  query: string,
  signal: AbortSignal,
  endpointUrl: string,
) {
  if (!query.trim()) return null;

  const endpoint = new URL(endpointUrl);
  endpoint.searchParams.set("format", "jsonv2");
  endpoint.searchParams.set("limit", "50");
  endpoint.searchParams.set("addressdetails", "1");
  endpoint.searchParams.set("namedetails", "1");
  endpoint.searchParams.set("accept-language", OSMAND_LANGUAGE);
  endpoint.searchParams.set("countrycodes", OSMAND_COUNTRY);
  endpoint.searchParams.set("dedupe", "1");
  endpoint.searchParams.set("q", query);
  if (OSMAND_EMAIL) {
    endpoint.searchParams.set("email", OSMAND_EMAIL);
  }

  const response = await fetch(endpoint.toString(), {
    method: "GET",
    signal,
    headers: {
      Accept: "application/json",
      "Accept-Language": OSMAND_LANGUAGE,
    },
  });

  if (!response.ok) {
    throw new Error(`Thailand geocoding failed with status ${response.status}`);
  }

  const payload = (await response.json()) as Array<{
    lat?: string;
    lon?: string;
    display_name?: string;
    name?: string;
    importance?: number;
    namedetails?: Record<string, string | undefined>;
  }>;
  const firstMatch = payload
    .filter((item) => item.lat && item.lon)
    .sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0))[0];
  const lat = firstMatch?.lat ? Number.parseFloat(firstMatch.lat) : Number.NaN;
  const lon = firstMatch?.lon ? Number.parseFloat(firstMatch.lon) : Number.NaN;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const englishName = firstMatch?.namedetails?.["name:en"]?.trim();
  const thaiName = firstMatch?.namedetails?.["name:th"]?.trim();
  const displayName = firstMatch?.display_name?.trim();
  const labelParts = [englishName, thaiName, displayName].filter(Boolean) as string[];
  const label = Array.from(new Set(labelParts)).join(" • ");

  return {
    lat: lat as number,
    lon: lon as number,
    label: label || firstMatch?.name || query,
  };
}

async function geocodeAddressQuery(query: string, signal: AbortSignal) {
  const candidates = buildGeocodeQueryCandidates(query);

  for (const candidate of candidates) {
    try {
      const osmandPoint = await geocodeWithOsmAndSearch(candidate, signal, OSMAND_SEARCH_URL);
      if (osmandPoint) return osmandPoint;
    } catch {
      // Fall through to public fallback.
    }
  }

  const usesPublicAsPrimary = OSMAND_SEARCH_URL === OSMAND_PUBLIC_FALLBACK_URL;
  if (usesPublicAsPrimary) return null;

  for (const candidate of candidates) {
    try {
      const fallbackPoint = await geocodeWithOsmAndSearch(
        candidate,
        signal,
        OSMAND_PUBLIC_FALLBACK_URL,
      );
      if (fallbackPoint) return fallbackPoint;
    } catch {
      // No more fallbacks.
    }
  }

  return null;
}

function SimilarPropertyCard({ listing }: { listing: PropertyListing }) {
  return (
    <a
      href={safeHref(propertyDetailHref(listing.id))}
      className="flex w-[78vw] max-w-[285px] shrink-0 snap-start flex-col overflow-hidden rounded-[22px] border border-[#e8e1db] bg-white shadow-[0_16px_35px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_22px_42px_rgba(15,23,42,0.12)] md:w-[285px] md:rounded-[28px]"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={assetPath(listing.galleryImages[0] ?? listing.image)}
          alt={listing.title}
          className="h-full w-full object-cover transition duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.05)_0%,rgba(15,23,42,0.32)_100%)]" />
        <span className={`absolute left-4 top-4 rounded-full px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] ${getPropertyBadgeClasses(listing.propertyTypeLabel)}`}>
          {listing.propertyTypeLabel}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-4 md:p-5">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-brand-gray">
          <MapPin className="h-4 w-4 text-brand-red" />
          <span className="min-w-0 break-words">{listing.city}, {listing.province}</span>
        </p>
        <h3 className="mt-3 line-clamp-2 break-words text-base font-black leading-snug text-brand-dark md:text-lg">{listing.title}</h3>
        <p className="mt-3 break-words text-lg font-black text-brand-red md:text-xl">{listing.priceLabel}</p>
        {listing.mode === "rent" ? (
          <p className="mt-1 break-words text-sm font-bold text-brand-gray md:text-base">{getRentDepositLabel()}</p>
        ) : null}
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
  const [galleryFocusIndex, setGalleryFocusIndex] = useState<number | null>(null);
  const [contactVisible, setContactVisible] = useState(false);
  const [shareMessage, setShareMessage] = useState("Share");
  const [openFaqIndex, setOpenFaqIndex] = useState(-1);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const similarScrollRef = useRef<HTMLDivElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const mapMarkerRef = useRef<maplibregl.Marker | null>(null);
  const phoneHref = `tel:${listing.agent.phone.replace(/\s+/g, "")}`;
  const emailHref = `mailto:${listing.agent.email}`;
  const defaultAddressQuery = useMemo(() => buildAddressQuery(listing), [listing]);
  const backendMapPoint = useMemo(() => {
    const lat = listing.address?.latitude;
    const lon = listing.address?.longitude;

    if (typeof lat !== "number" || typeof lon !== "number") return null;
    const mapLat = lat;
    const mapLon = lon;

    return {
      lat: mapLat,
      lon: mapLon,
      label: defaultAddressQuery,
    };
  }, [defaultAddressQuery, listing.address?.latitude, listing.address?.longitude]);
  const [mapSearchQuery, setMapSearchQuery] = useState(defaultAddressQuery);
  const [mapPoint, setMapPoint] = useState<GeocodedMapPoint | null>(backendMapPoint);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const metricSummary = `${getBedroomLabel(listing.beds)} • ${getBathroomLabel(listing.baths)} • ${listing.areaSqm} sqm`;

  const previewImages = useMemo(() => {
    const sourceImages = listing.galleryImages.length > 0 ? listing.galleryImages : [listing.image];
    return Array.from({ length: Math.min(5, Math.max(sourceImages.length, 5)) }, (_, index) => sourceImages[index % sourceImages.length]);
  }, [listing.galleryImages, listing.image]);

  useEffect(() => {
    setActivePreviewIndex(0);
  }, [listing.id]);

  useEffect(() => {
    setOpenFaqIndex(-1);
  }, [listing.id]);

  useEffect(() => {
    setMapSearchQuery(defaultAddressQuery);
    setMapError(null);

    if (backendMapPoint) {
      setMapPoint(backendMapPoint);
      setMapLoading(false);
      return undefined;
    }

    let active = true;
    const controller = new AbortController();

    async function resolveInitialMapPoint() {
      if (!defaultAddressQuery) {
        setMapPoint(null);
        setMapLoading(false);
        return;
      }

      setMapLoading(true);
      try {
        const resolvedPoint = await geocodeAddressQuery(defaultAddressQuery, controller.signal);
        if (!active) return;

        if (resolvedPoint) {
          setMapPoint(resolvedPoint);
          setMapError(null);
        } else {
          setMapPoint(null);
          setMapError("No map result found for this property address yet. Try a nearby district, city, or province.");
        }
      } catch (error) {
        if (!active || (error instanceof DOMException && error.name === "AbortError")) return;
        setMapPoint(null);
        setMapError("Map lookup is temporarily unavailable. Please try the search box again.");
      } finally {
        if (active) setMapLoading(false);
      }
    }

    void resolveInitialMapPoint();

    return () => {
      active = false;
      controller.abort();
    };
  }, [backendMapPoint, defaultAddressQuery, listing.id]);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return undefined;

    const initialCenter: [number, number] = mapPoint ? [mapPoint.lon, mapPoint.lat] : [100.5018, 13.7563];
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAPLIBRE_STYLE_URL || MAPLIBRE_FALLBACK_STYLE,
      center: initialCenter,
      zoom: mapPoint ? 15 : 11,
    });
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    mapInstanceRef.current = map;
    window.setTimeout(() => map.resize(), 0);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      mapMarkerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!mapPoint) {
      if (mapMarkerRef.current) {
        mapMarkerRef.current.remove();
        mapMarkerRef.current = null;
      }
      return;
    }

    const position: [number, number] = [mapPoint.lon, mapPoint.lat];
    if (!mapMarkerRef.current) {
      const popup = new maplibregl.Popup({ offset: 18 }).setText(mapPoint.label);
      mapMarkerRef.current = new maplibregl.Marker({ element: createPropertyPinElement() })
        .setLngLat(position)
        .setPopup(popup)
        .addTo(map);
    } else {
      mapMarkerRef.current.setLngLat(position);
      mapMarkerRef.current.getPopup()?.setText(mapPoint.label);
    }

    map.flyTo({ center: position, zoom: 15, essential: true });
    window.setTimeout(() => map.resize(), 0);
  }, [mapPoint]);

  useEffect(() => {
    if (!galleryOpen) {
      setGalleryFocusIndex(null);
    }
  }, [galleryOpen]);

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

  function showPreviousPreview() {
    setActivePreviewIndex((current) => (current === 0 ? previewImages.length - 1 : current - 1));
  }

  function showNextPreview() {
    setActivePreviewIndex((current) => (current === previewImages.length - 1 ? 0 : current + 1));
  }

  function showPreviousGalleryImage() {
    setGalleryFocusIndex((current) => {
      if (current === null) return 0;
      return current === 0 ? listing.galleryImages.length - 1 : current - 1;
    });
  }

  function showNextGalleryImage() {
    setGalleryFocusIndex((current) => {
      if (current === null) return 0;
      return current === listing.galleryImages.length - 1 ? 0 : current + 1;
    });
  }

  async function handleMapSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = mapSearchQuery.trim();
    if (!query) return;

    const controller = new AbortController();
    setMapLoading(true);
    setMapError(null);

    try {
      const resolvedPoint = await geocodeAddressQuery(query, controller.signal);
      if (!resolvedPoint) {
        setMapError("No location matched yet. Try district, city, or province.");
        return;
      }

      setMapPoint(resolvedPoint);
    } catch {
      setMapError("Search failed right now. Please try again in a moment.");
    } finally {
      setMapLoading(false);
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f5f2] text-brand-dark">
      <Header logoClassName="h-20 w-auto object-contain sm:h-24 md:h-20" />
      <main className="overflow-x-hidden pb-16 md:pb-20">
        <section className="mx-auto w-full max-w-7xl overflow-hidden px-4 pb-8 pt-0 md:pt-8 lg:px-8">
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
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(17,24,39,0.78)] text-white shadow-[0_10px_24px_rgba(15,23,42,0.3)] backdrop-blur"
                  aria-label="Back to listings"
                >
                  <ChevronLeft className="h-7 w-7" />
                </a>
                <div className="flex items-center gap-1 rounded-full bg-[rgba(17,24,39,0.78)] px-2 py-2 text-white shadow-[0_10px_24px_rgba(15,23,42,0.3)] backdrop-blur">
                  <button
                    type="button"
                    onClick={() => setSaved((current) => !current)}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition ${
                      saved ? "bg-white text-brand-red" : "text-white"
                    }`}
                    aria-label={`${saved ? "Unsave" : "Save"} ${listing.title}`}
                    aria-pressed={saved}
                  >
                    <Heart className={`h-6 w-6 ${saved ? "fill-current" : ""}`} />
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition"
                    aria-label={`Share ${listing.title}`}
                  >
                    <Share2 className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactVisible((current) => !current)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition"
                    aria-label="More property actions"
                  >
                    <MoreHorizontal className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="absolute left-4 top-20 z-10 flex max-w-[74%] flex-wrap gap-2">
                <span className={`rounded-full px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] ${getPropertyBadgeClasses(`for ${listing.mode}`)}`}>
                  For {listing.mode}
                </span>
                <span className={`rounded-full px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] ${getPropertyBadgeClasses(listing.propertyTypeLabel)}`}>
                  {listing.propertyTypeLabel}
                </span>
                {listing.propertyTypeLabel !== listing.statusLabel ? (
                  <span className={`rounded-full px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] ${getPropertyBadgeClasses(listing.statusLabel)}`}>
                    {listing.statusLabel}
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={showPreviousPreview}
                className="absolute left-4 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(17,24,39,0.78)] text-white shadow-[0_10px_24px_rgba(15,23,42,0.3)] backdrop-blur"
                aria-label={`Previous image for ${listing.title}`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={showNextPreview}
                className="absolute right-4 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(17,24,39,0.78)] text-white shadow-[0_10px_24px_rgba(15,23,42,0.3)] backdrop-blur"
                aria-label={`Next image for ${listing.title}`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
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

          <div className="mt-6 grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0">
              <div className="hidden">
                <span className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.2em] ${getPropertyBadgeClasses(`for ${listing.mode}`)}`}>
                  For {listing.mode}
                </span>
                <span className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.2em] ${getPropertyBadgeClasses(listing.propertyTypeLabel)}`}>
                  {listing.propertyTypeLabel}
                </span>
                {listing.propertyTypeLabel !== listing.statusLabel ? (
                  <span className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.2em] ${getPropertyBadgeClasses(listing.statusLabel)}`}>
                    {listing.statusLabel}
                  </span>
                ) : null}
              </div>

              <div className="mt-5 flex flex-col gap-4 md:hidden">
                <div>
                  <p className="md:hidden text-[11px] font-black uppercase tracking-[0.22em] text-brand-red">
                    For {listing.mode} • {listing.statusLabel}
                  </p>
                  <h1 className="max-w-full break-words text-[1.65rem] font-black leading-[1.08] text-brand-dark sm:text-5xl">
                    {listing.title}
                  </h1>
                  <p className="mt-3 break-words text-base font-black leading-7 text-brand-dark md:hidden">{metricSummary}</p>
                  <p className="mt-3 flex min-w-0 items-start gap-2 break-words text-sm font-semibold leading-6 text-brand-gray md:mt-4 md:inline-flex md:text-base">
                    <MapPin className="h-5 w-5 text-brand-red" />
                    <span className="min-w-0 break-words">{listing.city}, {listing.province}</span>
                  </p>
                  <p className="mt-3 text-[2.05rem] font-black leading-none text-brand-dark">
                    {listing.priceLabel}
                  </p>
                  {listing.mode === "rent" ? (
                    <p className="mt-1 text-sm font-bold text-brand-gray md:text-base">{getRentDepositLabel()}</p>
                  ) : null}
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
                    <div className="absolute left-4 top-4 z-10 flex max-w-[76%] flex-wrap gap-2">
                      <span className={`rounded-full px-4 py-2 text-sm font-black uppercase tracking-[0.18em] ${getPropertyBadgeClasses(listing.propertyTypeLabel)}`}>
                        {listing.propertyTypeLabel}
                      </span>
                      {listing.propertyTypeLabel !== listing.statusLabel ? (
                        <span className={`rounded-full px-4 py-2 text-sm font-black uppercase tracking-[0.18em] ${getPropertyBadgeClasses(listing.statusLabel)}`}>
                          {listing.statusLabel}
                        </span>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => setGalleryOpen(true)}
                      className="absolute bottom-5 right-5 z-20 rounded-2xl border border-[#d8cec6] bg-white px-5 py-3 text-sm font-black text-brand-dark shadow-[0_14px_30px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover:border-brand-red"
                    >
                      See all {listing.galleryImages.length} photos
                    </button>
                    <button
                      type="button"
                      onClick={showPreviousPreview}
                      className="absolute left-4 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(17,24,39,0.72)] text-white shadow-[0_10px_24px_rgba(15,23,42,0.28)] backdrop-blur"
                      aria-label={`Previous image for ${listing.title}`}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={showNextPreview}
                      className="absolute right-4 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(17,24,39,0.72)] text-white shadow-[0_10px_24px_rgba(15,23,42,0.28)] backdrop-blur"
                      aria-label={`Next image for ${listing.title}`}
                    >
                      <ChevronRight className="h-5 w-5" />
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
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setGalleryOpen(true)}
                      className="mr-auto inline-flex items-center justify-center rounded-full border border-[#d8cec6] bg-white px-5 py-3 text-sm font-black text-brand-dark transition hover:border-brand-red"
                    >
                      See all {listing.galleryImages.length} photos
                    </button>
                    <button
                      type="button"
                      onClick={showPreviousPreview}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d8cec6] bg-white text-brand-dark transition hover:border-brand-red"
                      aria-label={`Show previous desktop image for ${listing.title}`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={showNextPreview}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d8cec6] bg-white text-brand-dark transition hover:border-brand-red"
                      aria-label={`Show next desktop image for ${listing.title}`}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 hidden md:block">
                <div className="flex flex-wrap gap-3">
                  <span className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.2em] ${getPropertyBadgeClasses(`for ${listing.mode}`)}`}>
                    For {listing.mode}
                  </span>
                  <span className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.2em] ${getPropertyBadgeClasses(listing.propertyTypeLabel)}`}>
                    {listing.propertyTypeLabel}
                  </span>
                  {listing.propertyTypeLabel !== listing.statusLabel ? (
                    <span className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.2em] ${getPropertyBadgeClasses(listing.statusLabel)}`}>
                      {listing.statusLabel}
                    </span>
                  ) : null}
                </div>

                <h1 className="mt-4 max-w-5xl text-[2.6rem] font-black leading-[1.06] text-brand-dark">
                  {listing.title}
                </h1>
                <p className="mt-3 inline-flex items-center gap-2 text-[1.1rem] font-semibold text-brand-gray">
                  <MapPin className="h-5 w-5 text-brand-red" />
                  {listing.city}, {listing.province}
                </p>
                <p className="mt-3 text-[2.35rem] font-black leading-none text-brand-dark">
                  {listing.priceLabel}
                </p>
                {listing.mode === "rent" ? (
                  <p className="mt-1 text-base font-bold text-brand-gray">{getRentDepositLabel()}</p>
                ) : null}
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

              <div className="mt-7 w-full max-w-full overflow-hidden border-t border-[#ded6d0] pt-7 md:mt-8 md:pt-8">
                <h2 className="break-words text-3xl font-black leading-tight text-brand-dark md:text-4xl">Property Details</h2>
                <div className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="flex min-w-0 items-center gap-4">
                    <BedDouble className="h-6 w-6 shrink-0 text-brand-dark" />
                    <p className="break-words text-lg text-brand-dark">
                      <span className="font-black">{getBedroomLabel(listing.beds)}</span>
                    </p>
                  </div>
                  <div className="flex min-w-0 items-center gap-4">
                    <Bath className="h-6 w-6 shrink-0 text-brand-dark" />
                    <p className="break-words text-lg text-brand-dark">
                      <span className="font-black">{getBathroomLabel(listing.baths)}</span>
                    </p>
                  </div>
                  <div className="flex min-w-0 items-center gap-4">
                    <Ruler className="h-6 w-6 shrink-0 text-brand-dark" />
                    <p className="break-words text-lg text-brand-dark">
                      <span className="font-black">{listing.areaSqm} sqm</span>
                    </p>
                  </div>
                  <div className="flex min-w-0 items-start gap-4">
                    <Building2 className="mt-0.5 h-6 w-6 shrink-0 text-brand-dark" />
                    <p className="break-words text-lg text-brand-dark">
                      <span className="font-black">Property type:</span> {listing.propertyTypeLabel}
                    </p>
                  </div>
                  <div className="flex min-w-0 items-start gap-4">
                    <Building2 className="mt-0.5 h-6 w-6 shrink-0 text-brand-dark" />
                    <p className="break-words text-lg text-brand-dark">
                      <span className="font-black">Built:</span> {listing.builtYear}
                    </p>
                  </div>
                  <div className="flex min-w-0 items-start gap-4">
                    <Warehouse className="mt-0.5 h-6 w-6 shrink-0 text-brand-dark" />
                    <p className="break-words text-lg text-brand-dark">
                      <span className="font-black">Garage:</span> {listing.garageSpaces || "N/A"} spaces
                    </p>
                  </div>
                  <div className="flex min-w-0 items-start gap-4">
                    <Building2 className="mt-0.5 h-6 w-6 shrink-0 text-brand-dark" />
                    <p className="break-words text-lg text-brand-dark">
                      <span className="font-black">Floor:</span> {listing.floorCount || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="mt-7 w-full max-w-full overflow-hidden border-t border-[#ded6d0] pt-7 md:hidden">
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

                <div className="mt-8 grid gap-7 lg:grid-cols-[1.15fr_0.85fr]">
                  <div>
                    <h3 className="break-words text-2xl font-black leading-tight text-brand-dark md:text-lg">What's Special</h3>
                    <p className="mt-4 break-words text-base leading-7 text-brand-gray md:text-base">{listing.description}</p>
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

              <section className="mt-7 w-full max-w-full overflow-hidden border-t border-[#ded6d0] pt-7 md:mt-8 md:pt-8">
                <h2 className="break-words text-3xl font-black text-brand-dark md:text-4xl">Amenities</h2>
                <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                  {listing.amenities.map((amenity) => (
                    <div
                      key={`${listing.id}-amenity-${amenity}`}
                      className="flex min-w-0 items-center gap-4 text-lg text-brand-dark"
                    >
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand-dark" />
                      <span className="break-words">{amenity}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-7 w-full max-w-full overflow-hidden border-t border-[#ded6d0] pt-7 md:mt-8 md:pt-8">
                <h2 className="break-words text-3xl font-black text-brand-dark md:text-4xl">Features</h2>
                <div className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-2xl border border-[#e8ded7] bg-white px-4 py-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-gray">Furnishing</p>
                    <p className="mt-2 text-lg font-black text-brand-dark">{listing.features.furnishing}</p>
                  </div>
                  <div className="rounded-2xl border border-[#e8ded7] bg-white px-4 py-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-gray">Air Conditioner</p>
                    <p className="mt-2 text-lg font-black text-brand-dark">{listing.features.airConditioner ? "Yes" : "No"}</p>
                  </div>
                  <div className="rounded-2xl border border-[#e8ded7] bg-white px-4 py-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-gray">Kitchen</p>
                    <p className="mt-2 text-lg font-black text-brand-dark">{listing.features.kitchen ? "Yes" : "No"}</p>
                  </div>
                </div>
              </section>

              <section className="mt-7 w-full max-w-full overflow-hidden border-t border-[#ded6d0] pt-7 md:mt-8 md:pt-8">
                <h2 className="break-words text-3xl font-black text-brand-dark md:text-4xl">Property Location</h2>
                <p className="mt-3 max-w-4xl break-words text-sm leading-6 text-brand-gray md:text-base">
                  Backend-ready map logic: this section uses the OsmAnd online search engine (Nominatim-based), with a configurable endpoint for Thailand-focused deployment.
                </p>
                <form onSubmit={handleMapSearch} className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <label className="sr-only" htmlFor={`${listing.id}-map-search`}>
                    Property map search
                  </label>
                  <input
                    id={`${listing.id}-map-search`}
                    value={mapSearchQuery}
                    onChange={(event) => setMapSearchQuery(event.target.value)}
                    placeholder="Search street, tambon, amphoe, city, province, zip"
                    className="w-full rounded-2xl border border-[#d8cec6] bg-white px-4 py-3 text-sm font-semibold text-brand-dark outline-none transition focus:border-brand-red focus:ring-2 focus:ring-[rgba(163,28,36,0.12)]"
                  />
                  <button
                    type="submit"
                    className="inline-flex min-w-[150px] items-center justify-center gap-2 rounded-2xl border border-brand-red bg-brand-red px-5 py-3 text-sm font-black text-white transition hover:bg-[#7d1620]"
                    disabled={mapLoading}
                  >
                    <Search className="h-4 w-4" />
                    {mapLoading ? "Searching..." : "Search map"}
                  </button>
                </form>

                <div className="mt-5 overflow-hidden rounded-[24px] border border-[#ded6d0] bg-white">
                  <div ref={mapContainerRef} className="h-[360px] w-full md:h-[440px]" />
                </div>

                {mapPoint ? (
                  <p className="mt-4 break-words text-sm font-semibold text-brand-gray">
                    Mapped location: {mapPoint.label}
                  </p>
                ) : null}
                {mapLoading ? (
                  <p className="mt-2 break-words text-sm font-semibold text-brand-gray">Finding map location...</p>
                ) : null}
                {mapError ? (
                  <p className="mt-2 break-words text-sm font-semibold text-brand-red">{mapError}</p>
                ) : null}
                <p className="mt-2 text-xs font-semibold text-brand-gray">
                  Map data © OpenStreetMap contributors
                </p>
              </section>

              <section className="mt-6 w-full max-w-full overflow-hidden rounded-[24px] border border-[#e8ded7] bg-white p-4 shadow-[0_14px_30px_rgba(15,23,42,0.06)] sm:p-8 md:mt-8 md:rounded-[32px]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="break-words text-2xl font-black text-brand-dark">FAQ</h2>
                    <p className="mt-2 break-words text-sm leading-6 text-brand-gray">
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
                            className="flex w-full min-w-0 items-start justify-between gap-3 bg-white px-4 py-4 text-left md:px-5"
                          >
                            <span className="min-w-0 break-words text-sm font-black leading-6 text-brand-dark md:text-base">{faq.question}</span>
                            <ChevronRight className={`h-5 w-5 shrink-0 text-brand-red transition ${open ? "rotate-90" : ""}`} />
                          </button>
                          {open ? (
                            <div className="break-words border-t border-[#eee4dd] bg-[#fffaf6] px-4 py-4 text-sm leading-7 text-brand-gray md:px-5">
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

              <section className="mt-6 w-full max-w-full overflow-hidden rounded-[24px] border border-[#e8ded7] bg-white p-4 shadow-[0_14px_30px_rgba(15,23,42,0.06)] sm:p-8 md:mt-8 md:rounded-[32px]">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="break-words text-2xl font-black text-brand-dark">Similar Properties</h2>
                    <p className="mt-2 break-words text-sm leading-6 text-brand-gray">
                      More homes matched from the same province first, with fallback listings from the same sale or rent channel.
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 md:gap-3">
                    <button
                      type="button"
                      onClick={() => scrollSimilar("left")}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dfd5ce] bg-white text-brand-dark transition hover:border-brand-red md:h-11 md:w-11"
                      aria-label="Scroll similar properties left"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollSimilar("right")}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dfd5ce] bg-white text-brand-dark transition hover:border-brand-red md:h-11 md:w-11"
                      aria-label="Scroll similar properties right"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div
                  ref={similarScrollRef}
                  className="-mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden md:mx-0 md:gap-5 md:px-0"
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
              <div className="flex items-center gap-3">
                {galleryFocusIndex !== null ? (
                  <button
                    type="button"
                    onClick={() => setGalleryFocusIndex(null)}
                    className="rounded-full border border-[#dfd5ce] px-4 py-2 text-sm font-black text-brand-dark transition hover:border-brand-red"
                  >
                    Back to all
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setGalleryOpen(false)}
                  className="rounded-full border border-[#dfd5ce] px-4 py-2 text-sm font-black text-brand-dark transition hover:border-brand-red"
                >
                  Close
                </button>
              </div>
            </div>
            {galleryFocusIndex === null ? (
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {listing.galleryImages.map((image, index) => (
                  <button
                    key={`${listing.id}-gallery-${index}`}
                    type="button"
                    onClick={() => setGalleryFocusIndex(index)}
                    className="overflow-hidden rounded-[24px] bg-[#f8f5f2] text-left transition hover:-translate-y-1"
                  >
                    <img
                      src={assetPath(image)}
                      alt={`${listing.title} photo ${index + 1}`}
                      className="h-full min-h-[220px] w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-6">
                <div className="relative flex min-h-[66vh] items-center justify-center overflow-hidden rounded-[28px] bg-brand-dark">
                  <img
                    src={assetPath(listing.galleryImages[galleryFocusIndex])}
                    alt={`${listing.title} full photo ${galleryFocusIndex + 1}`}
                    className="max-h-[78vh] w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={showPreviousGalleryImage}
                    className="absolute left-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(17,24,39,0.72)] text-white shadow-[0_10px_24px_rgba(15,23,42,0.28)] backdrop-blur"
                    aria-label={`Previous full gallery image for ${listing.title}`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={showNextGalleryImage}
                    className="absolute right-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(17,24,39,0.72)] text-white shadow-[0_10px_24px_rgba(15,23,42,0.28)] backdrop-blur"
                    aria-label={`Next full gallery image for ${listing.title}`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-gray">
                    Photo {galleryFocusIndex + 1} of {listing.galleryImages.length}
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={showPreviousGalleryImage}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d8cec6] bg-white text-brand-dark transition hover:border-brand-red"
                      aria-label={`Previous full image for ${listing.title}`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={showNextGalleryImage}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d8cec6] bg-white text-brand-dark transition hover:border-brand-red"
                      aria-label={`Next full image for ${listing.title}`}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

    </div>
  );
}
