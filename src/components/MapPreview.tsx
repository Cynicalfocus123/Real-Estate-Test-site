import { MapPinned } from "lucide-react";

export function MapPreview() {
  return (
    <section id="map" className="bg-neutral-100 py-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase text-brand-red">Map Search Ready</p>
          <h2 className="mt-3 text-3xl font-black text-brand-dark sm:text-4xl">Find homes by area</h2>
          <p className="mt-4 max-w-xl text-brand-gray">
            Frontend slot prepared for OpenStreetMap or Leaflet. Backend can feed listings by bounds,
            coordinates, filters, and viewport.
          </p>
          <div className="mt-8 grid gap-3 text-sm font-semibold text-brand-dark sm:grid-cols-2">
            <span className="border border-brand-line bg-white px-4 py-3">Bounds-based GraphQL query</span>
            <span className="border border-brand-line bg-white px-4 py-3">Marker clustering ready</span>
            <span className="border border-brand-line bg-white px-4 py-3">Listing page compatible</span>
            <span className="border border-brand-line bg-white px-4 py-3">Open-source map API ready</span>
          </div>
        </div>
        <div className="relative min-h-[360px] overflow-hidden border border-brand-line bg-white">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#eee_1px,transparent_1px),linear-gradient(#eee_1px,transparent_1px)] bg-[size:42px_42px]" />
          <div className="absolute left-[18%] top-[30%] h-5 w-5 rounded-full bg-brand-red ring-8 ring-red-200" />
          <div className="absolute left-[58%] top-[45%] h-5 w-5 rounded-full bg-brand-dark ring-8 ring-neutral-300" />
          <div className="absolute left-[72%] top-[22%] h-5 w-5 rounded-full bg-brand-red ring-8 ring-red-200" />
          <div className="absolute inset-x-8 bottom-8 flex items-center gap-3 bg-white p-4 shadow-search">
            <MapPinned className="h-6 w-6 text-brand-red" />
            <div>
              <p className="font-bold text-brand-dark">Map module placeholder</p>
              <p className="text-sm text-brand-gray">Replace with Leaflet map component later.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
