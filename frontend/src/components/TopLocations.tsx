import type { TopLocation } from "../data/topLocations";
import { moreLocations, topLocations } from "../data/topLocations";
import { assetPath } from "../utils/assets";
import { safeHref } from "../utils/security";

function LocationTile({ location, large = false }: { location: TopLocation; large?: boolean }) {
  const listingHref = `${import.meta.env.BASE_URL}properties-for-sale?province=${encodeURIComponent(location.province)}`;

  return (
    <a
      href={safeHref(listingHref)}
      className={`group relative min-h-[210px] overflow-hidden bg-neutral-500 ${
        large ? "lg:min-h-[452px]" : "lg:min-h-[210px]"
      }`}
    >
      {location.image ? (
        <img
          src={assetPath(location.image)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${location.tone}`} />
      )}
      <div
        className={`absolute inset-0 opacity-70 ${
          large
            ? "bg-[radial-gradient(circle_at_25%_18%,rgba(255,255,255,0.22),transparent_34%),radial-gradient(circle_at_82%_14%,rgba(255,255,255,0.16),transparent_28%),linear-gradient(155deg,transparent_0%,rgba(255,255,255,0.08)_40%,transparent_41%)]"
            : "bg-[radial-gradient(circle_at_28%_20%,rgba(255,255,255,0.28),transparent_32%),linear-gradient(155deg,transparent_0%,rgba(255,255,255,0.1)_42%,transparent_43%)]"
        }`}
      />
      <div className="absolute inset-0 bg-black/45 transition-colors duration-500 group-hover:bg-black/34" />
      <div className={`absolute inset-x-5 bottom-5 text-white ${large ? "lg:bottom-7 lg:left-7" : ""}`}>
        <h3 className={`font-serif font-bold leading-tight drop-shadow ${location.name.length > 22 ? "text-xl" : "text-2xl"}`}>
          {location.name}
        </h3>
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

        <div className="grid gap-5 lg:grid-cols-[0.92fr_3fr]">
          <LocationTile location={featuredLocation} large />

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {smallLocations.map((location) => (
              <LocationTile key={location.id} location={location} />
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {moreLocations.map((location) => (
            <LocationTile key={location.id} location={location} />
          ))}
        </div>
      </div>
    </section>
  );
}
