import { Bath, BedDouble, ChevronLeft, ChevronRight, Heart, MapPin, Ruler } from "lucide-react";
import { useState } from "react";
import type { Property } from "../types/property";

const propertySlides = [
  "from-[#d4d4d4] via-[#9b9b9b] to-[#5f5f5f]",
  "from-[#cfc4b8] via-[#9f8168] to-[#4d392d]",
  "from-[#c3d1cf] via-[#7e9996] to-[#314542]",
  "from-[#d6cfc2] via-[#a58f6f] to-[#4a3927]",
  "from-[#c7d1bd] via-[#839774] to-[#34462d]",
  "from-[#c2c9d4] via-[#7e8fa7] to-[#303b4e]",
];

export function PropertyCard({ property }: { property: Property }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const previousSlide = () => setActiveSlide((current) => (current === 0 ? propertySlides.length - 1 : current - 1));
  const nextSlide = () => setActiveSlide((current) => (current === propertySlides.length - 1 ? 0 : current + 1));

  return (
    <article className="group overflow-hidden border border-[#e7e0dc] bg-white shadow-[0_12px_30px_rgba(23,23,23,0.08)] transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(23,23,23,0.14)]">
      <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-neutral-200">
        <div
          className="absolute inset-0 flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {propertySlides.map((slide, index) => (
            <div
              key={slide}
              className={`relative min-w-full bg-gradient-to-br ${slide} transition-transform duration-500 group-hover:scale-105`}
              aria-hidden={activeSlide !== index}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.35),transparent_28%),linear-gradient(160deg,transparent_0%,rgba(255,255,255,0.16)_42%,transparent_43%)]" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-bold uppercase tracking-wide text-white drop-shadow">
                Property Image {index + 1}
              </span>
            </div>
          ))}
        </div>
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
        <button
          type="button"
          onClick={previousSlide}
          aria-label={`Previous image for ${property.title}`}
          className="absolute left-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-white/88 text-brand-dark hover:bg-white hover:text-brand-red"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={nextSlide}
          aria-label={`Next image for ${property.title}`}
          className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-white/88 text-brand-dark hover:bg-white hover:text-brand-red"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/35 px-3 py-2">
          {propertySlides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveSlide(index)}
              aria-label={`Show image ${index + 1} for ${property.title}`}
              aria-pressed={activeSlide === index}
              className={`h-2.5 w-2.5 rounded-full transition ${
                activeSlide === index ? "bg-white" : "bg-white/45 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
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
