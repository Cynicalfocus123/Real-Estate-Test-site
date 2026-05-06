import { ChevronLeft, X } from "lucide-react";
import { useEffect } from "react";
import type { PropertyListing } from "../types/propertyListing";
import { assetPath } from "../utils/assets";

export type PropertyCompareRow = {
  label: string;
  leftValue: string;
  rightValue: string;
};

type PropertyCompareModalProps = {
  open: boolean;
  leftListing: PropertyListing;
  rightListing: PropertyListing;
  rows: PropertyCompareRow[];
  onClose: () => void;
  onCloseAndReset: () => void;
  onRemove: (listingId: string) => void;
};

function getCompareImage(listing: PropertyListing) {
  return listing.galleryImages[0] ?? listing.image;
}

export function PropertyCompareModal({
  open,
  leftListing,
  rightListing,
  rows,
  onClose,
  onCloseAndReset,
  onRemove,
}: PropertyCompareModalProps) {
  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] bg-[rgba(15,23,42,0.7)] px-0 py-0 sm:px-4 sm:py-5">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col bg-white sm:h-[calc(100vh-2.5rem)] sm:rounded-[18px]">
        <header className="flex items-center justify-between border-b border-[#e7e0da] px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#ddd4cc] text-brand-dark transition hover:border-brand-red"
            aria-label="Back from compare"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="px-3 text-center text-sm font-black text-brand-dark sm:text-base">
            2 of 2: Compare properties
          </h2>
          <button
            type="button"
            onClick={onCloseAndReset}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#ddd4cc] text-brand-dark transition hover:border-brand-red"
            aria-label="Close compare modal"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4 sm:px-6 sm:pt-5">
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {[leftListing, rightListing].map((item) => (
              <article key={item.id} className="min-w-0 rounded-lg border border-[#e8e1db] bg-white p-2.5 sm:rounded-xl sm:p-3">
                <div className="aspect-[16/11] overflow-hidden rounded-lg bg-[#f3efea] sm:rounded-xl">
                  <img
                    src={assetPath(getCompareImage(item))}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="mt-2 break-words text-sm font-black leading-5 text-brand-dark sm:text-base">
                  {item.title}
                </p>
                <p className="mt-1 break-words text-xs leading-5 text-brand-gray sm:text-sm">
                  {item.city}, {item.province}
                </p>
                <p className="mt-1.5 break-words text-sm font-black text-brand-dark sm:text-base">
                  {item.priceLabel}
                </p>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="mt-2 inline-flex rounded-full border border-[#ddd4cc] px-3 py-1.5 text-xs font-black text-brand-dark transition hover:border-brand-red"
                >
                  Remove
                </button>
              </article>
            ))}
          </div>

          <div className="mt-4 space-y-4">
            {rows.map((row) => (
              <section key={row.label} className="min-w-0">
                <div className="rounded-md bg-[#f0ece8] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-brand-dark sm:text-sm">
                  {row.label}
                </div>
                <div className="mt-2 grid grid-cols-1 gap-3 min-[440px]:grid-cols-2">
                  <div className="rounded-lg border border-[#e8e1db] bg-white px-3 py-3 text-sm leading-6 text-brand-dark">
                    <span className="break-words">{row.leftValue}</span>
                  </div>
                  <div className="rounded-lg border border-[#e8e1db] bg-white px-3 py-3 text-sm leading-6 text-brand-dark">
                    <span className="break-words">{row.rightValue}</span>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
