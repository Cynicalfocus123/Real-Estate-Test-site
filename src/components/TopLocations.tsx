import type { TopLocation } from "../data/topLocations";
import { moreLocations, topLocations } from "../data/topLocations";

function LocationTile({ location, large = false }: { location: TopLocation; large?: boolean }) {
  return (
    <a
      href={`#location-${location.id}`}
      className={`group relative min-h-[276px] overflow-hidden bg-neutral-500 ${
        large ? "lg:min-h-[588px]" : ""
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${location.tone}`} />
      <div
        className={`absolute inset-0 opacity-70 ${
          large
            ? "bg-[radial-gradient(circle_at_25%_18%,rgba(255,255,255,0.22),transparent_34%),radial-gradient(circle_at_82%_14%,rgba(255,255,255,0.16),transparent_28%),linear-gradient(155deg,transparent_0%,rgba(255,255,255,0.08)_40%,transparent_41%)]"
            : "bg-[radial-gradient(circle_at_28%_20%,rgba(255,255,255,0.28),transparent_32%),linear-gradient(155deg,transparent_0%,rgba(255,255,255,0.1)_42%,transparent_43%)]"
        }`}
      />
      <div className="absolute inset-0 bg-black/45 transition-colors duration-500 group-hover:bg-black/34" />
      <div className={`absolute inset-x-6 bottom-6 text-white ${large ? "lg:bottom-8 lg:left-8" : ""}`}>
        <h3 className={`font-serif font-bold leading-tight drop-shadow ${location.name.length > 22 ? "text-2xl" : "text-3xl"}`}>
          {location.name}
        </h3>
        <p className="mt-2 text-sm font-black uppercase tracking-[0.16em] text-[#f4c21b]">
          {location.listingCount} Listings
        </p>
      </div>
    </a>
  );
}

export function TopLocations() {
  const [featuredLocation, ...smallLocations] = topLocations;

  return (
    <section id="locations" className="scroll-mt-28 bg-white pb-20 pt-2">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto mb-16 max-w-6xl text-center">
          <h2 className="font-serif text-5xl font-normal leading-tight text-[#1f1f1f] sm:text-6xl">
            Top Locations
          </h2>
          <p className="mt-8 text-base leading-8 text-black sm:text-xl">
            Thailand's finest destinations - from Bangkok's vibrant streets to Phuket's pristine
            beaches and Chiang Mai's rich culture. Find your perfect home or investment.
          </p>
        </div>

        <div className="grid gap-7 lg:grid-cols-[0.92fr_3fr]">
          <LocationTile location={featuredLocation} large />

          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {smallLocations.map((location) => (
              <LocationTile key={location.id} location={location} />
            ))}
          </div>
        </div>

        <div className="mt-7 grid gap-7 md:grid-cols-2 lg:grid-cols-4">
          {moreLocations.map((location) => (
            <LocationTile key={location.id} location={location} />
          ))}
        </div>
      </div>
    </section>
  );
}
