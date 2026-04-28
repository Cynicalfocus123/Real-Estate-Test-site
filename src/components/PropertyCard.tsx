import { Bath, BedDouble, Heart, MapPin, Ruler } from "lucide-react";
import type { Property } from "../types/property";

export function PropertyCard({ property }: { property: Property }) {
  return (
    <article className="group overflow-hidden border border-[#e7e0dc] bg-white shadow-[0_12px_30px_rgba(23,23,23,0.08)] transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(23,23,23,0.14)]">
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-neutral-200">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#d4d4d4,#8f8f8f)] transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.35),transparent_28%),linear-gradient(160deg,transparent_0%,rgba(255,255,255,0.16)_42%,transparent_43%)]" />
        <span className="relative text-sm font-bold uppercase tracking-wide text-white drop-shadow">
          Property Image
        </span>
        <span className="absolute left-4 top-4 bg-brand-red px-3 py-2 text-xs font-black uppercase text-white">
          For Sale
        </span>
        <button
          type="button"
          aria-label={`Save ${property.title}`}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center bg-white/92 text-brand-dark hover:text-brand-red"
        >
          <Heart className="h-5 w-5" />
        </button>
      </div>
      <div className="p-5">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-brand-gray">
          <MapPin className="h-4 w-4 text-brand-red" />
          {property.location}
        </p>
        <h3 className="mt-3 text-xl font-black leading-tight text-brand-dark">{property.title}</h3>
        <p className="mt-4 text-2xl font-black text-brand-red">{property.price}</p>
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-brand-line pt-4 text-sm font-semibold text-brand-gray">
          <span className="inline-flex items-center gap-2">
            <BedDouble className="h-4 w-4" />
            {property.beds} Beds
          </span>
          <span className="inline-flex items-center gap-2">
            <Bath className="h-4 w-4" />
            {property.baths} Baths
          </span>
          <span className="inline-flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            {property.areaSqFt}
          </span>
        </div>
      </div>
    </article>
  );
}
