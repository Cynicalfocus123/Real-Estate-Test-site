import { ChevronDown, MapPin, Search, SlidersHorizontal } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { thaiProvinces } from "../data/thaiProvinces";
import { cleanNumericText, cleanSearchText } from "../utils/security";

const searchTabs = ["All", "For Rent", "For Sale", "Lease to Own", "Senior Nursing Home"];

export function SearchPanel() {
  const [activeTab, setActiveTab] = useState("All");
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const keyword = cleanSearchText(formData.get("keyword"));
    const minPrice = cleanNumericText(formData.get("minPrice"));
    const maxPrice = cleanNumericText(formData.get("maxPrice"));

    if (keyword.length > 80 || minPrice.length > 12 || maxPrice.length > 12) {
      return;
    }
  }

  function toggleProvince(name: string) {
    setSelectedProvinces((current) =>
      current.includes(name) ? current.filter((province) => province !== name) : [...current, name],
    );
  }

  function handleReset() {
    setActiveTab("All");
    setProvinceOpen(false);
    setSelectedProvinces([]);
  }

  const provinceLabel =
    selectedProvinces.length === 0
      ? "All Provinces"
      : selectedProvinces.length === 1
        ? selectedProvinces[0]
        : `${selectedProvinces.length} Provinces`;

  return (
    <form
      onSubmit={handleSearch}
      className="mx-auto -mt-20 max-w-6xl rounded-[28px] border border-[#eee6df] bg-white px-4 py-5 shadow-search sm:px-6 sm:py-6"
    >
      <div className="flex flex-wrap justify-center gap-2 border-b border-brand-line pb-4">
        {searchTabs.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setActiveTab(item)}
            aria-pressed={activeTab === item}
            className={`rounded-full px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.12em] sm:px-5 sm:text-sm ${
              activeTab === item
                ? "bg-brand-red text-white shadow-[0_10px_24px_rgba(163,28,36,0.18)]"
                : "bg-[#f3efeb] text-brand-dark hover:bg-[#ebe3dc]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <input type="hidden" name="listingStatus" value={activeTab} />

      <div className="mt-5 flex justify-center">
        <label className="flex w-full max-w-4xl items-center gap-3 rounded-full border border-brand-line px-5 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
          <Search className="h-5 w-5 text-brand-red" />
          <input
            className="w-full text-sm outline-none sm:text-base"
            autoComplete="off"
            maxLength={80}
            placeholder="Search by keyword, property name, or listing ID"
            name="keyword"
          />
        </label>
      </div>

      <div className="mx-auto mt-5 grid w-full max-w-5xl gap-3 md:grid-cols-2 xl:grid-cols-[1.1fr_0.9fr_0.8fr_0.7fr_0.7fr_auto]">
        <label className="flex items-center gap-3 rounded-2xl border border-brand-line px-4 py-3">
          <MapPin className="h-5 w-5 text-brand-red" />
          <div className="relative w-full">
            <button
              type="button"
              onClick={() => setProvinceOpen((open) => !open)}
              className="flex w-full items-center justify-between text-left text-sm font-medium outline-none"
              aria-expanded={provinceOpen}
              aria-label={`Province dropdown ${provinceLabel}`}
            >
              <span className="truncate">{provinceLabel}</span>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </button>
            {provinceOpen ? (
              <div className="absolute left-0 top-12 z-30 max-h-80 w-[min(90vw,360px)] overflow-y-auto rounded-2xl border border-brand-line bg-white p-3 shadow-search">
                {thaiProvinces.map((province) => (
                  <label
                    key={province.name}
                    className="flex cursor-pointer items-center justify-between gap-3 px-2 py-2 text-sm hover:bg-neutral-100"
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedProvinces.includes(province.name)}
                        onChange={() => toggleProvince(province.name)}
                        className="h-4 w-4 accent-brand-red"
                      />
                      {province.name}
                    </span>
                    <span className="text-xs font-bold text-brand-red">{province.count}</span>
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        </label>

        <select
          className="rounded-2xl border border-brand-line px-4 py-3 text-sm font-medium outline-none"
          name="propertyType"
        >
          <option>Property Type</option>
          <option>Apartment</option>
          <option>Villa</option>
          <option>House</option>
          <option>Condo</option>
          <option>Townhome</option>
          <option>Land</option>
        </select>

        <input
          className="rounded-2xl border border-brand-line px-4 py-3 text-sm font-medium outline-none"
          inputMode="numeric"
          maxLength={12}
          name="minPrice"
          pattern="[0-9]*"
          placeholder="Min Price"
        />

        <input
          className="rounded-2xl border border-brand-line px-4 py-3 text-sm font-medium outline-none"
          inputMode="numeric"
          maxLength={12}
          name="maxPrice"
          pattern="[0-9]*"
          placeholder="Max Price"
        />

        <div className="grid grid-cols-[auto_1fr] gap-3 md:col-span-2 xl:col-span-2">
          <button
            type="button"
            onClick={() => setFilterOpen((open) => !open)}
            className="inline-flex items-center justify-center rounded-2xl border border-brand-line px-4"
            aria-expanded={filterOpen}
            aria-label="Open filters"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-red px-8 py-3 text-sm font-bold uppercase text-white hover:bg-brand-dark"
          >
            <Search className="h-5 w-5" />
            Search
          </button>
        </div>
      </div>

      {filterOpen ? (
        <div className="mt-5 grid gap-6 border-t border-brand-line pt-5 lg:grid-cols-3">
          <fieldset>
            <legend className="text-sm font-black uppercase text-brand-dark">Bedroom</legend>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-3">
              {["Studio", "1", "2", "3", "4", "5+"].map((bedroom) => (
                <label key={bedroom} className="flex items-center gap-2 border border-brand-line px-3 py-2 text-sm">
                  <input type="checkbox" name="bedroom" value={bedroom} className="accent-brand-red" />
                  {bedroom === "Studio" ? bedroom : `${bedroom} BR`}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-black uppercase text-brand-dark">Bathroom</legend>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-3">
              {["1", "2", "3", "4", "5+"].map((bathroom) => (
                <label key={bathroom} className="flex items-center gap-2 border border-brand-line px-3 py-2 text-sm">
                  <input type="checkbox" name="bathroom" value={bathroom} className="accent-brand-red" />
                  {bathroom} BA
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-black uppercase text-brand-dark">Unit Feature</legend>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                "Aircon",
                "Balcony",
                "Bath Tub",
                "Private Pool",
                "Terrace",
                "Gym",
                "Parking",
                "Swimming Pool",
                "Sports Court",
              ].map((feature) => (
                <label key={feature} className="flex items-center gap-2 border border-brand-line px-3 py-2 text-sm">
                  <input type="checkbox" name="unitFeature" value={feature} className="accent-brand-red" />
                  {feature}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col gap-3 border-t border-brand-line pt-5 sm:flex-row sm:items-center sm:justify-between lg:col-span-3">
            <button
              type="reset"
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-2xl border border-brand-line px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-brand-dark hover:border-brand-red hover:text-brand-red"
            >
              Clear Reset
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-red px-8 py-3 text-sm font-bold uppercase text-white hover:bg-brand-dark"
            >
              <Search className="h-5 w-5" />
              Search
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
