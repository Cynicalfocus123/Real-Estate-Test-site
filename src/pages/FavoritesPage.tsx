import { Heart } from "lucide-react";
import { propertyListings } from "../data/propertyListings";
import { useFavorites } from "../hooks/useFavorites";
import { requestAuthModal } from "../utils/authModal";
import { safeHref } from "../utils/security";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { PropertyListingCard } from "../components/PropertyListingCard";

export function FavoritesPage() {
  const { favoriteIds, isFavorite, toggleFavorite, isSignedIn, notice } = useFavorites();
  const favorites = propertyListings.filter((listing) => favoriteIds.includes(listing.id));

  return (
    <div className="min-h-screen bg-[#f8f5f2] text-brand-dark">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 lg:px-8 lg:pt-14">
        <h1 className="text-4xl font-black text-brand-dark sm:text-5xl">Favorites</h1>
        <p className="mt-3 text-base text-brand-gray sm:text-lg">
          Saved properties you want to review later.
        </p>

        {notice ? (
          <div className="mt-6 rounded-xl border border-brand-red/30 bg-[#fff3f1] px-4 py-3 text-sm font-semibold text-brand-red">
            {notice}
          </div>
        ) : null}

        {!isSignedIn ? (
          <section className="mt-10 rounded-2xl border border-dashed border-brand-line bg-white px-6 py-12 text-center">
            <p className="text-2xl font-black text-brand-dark">Log in to view your favorites.</p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => requestAuthModal("login")}
                className="inline-flex items-center justify-center rounded-xl border border-brand-line px-5 py-3 text-sm font-bold uppercase tracking-wide text-brand-dark hover:border-brand-red hover:text-brand-red"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => requestAuthModal("signup")}
                className="inline-flex items-center justify-center rounded-xl border border-brand-dark bg-brand-dark px-5 py-3 text-sm font-bold uppercase tracking-wide text-white hover:border-brand-red hover:bg-brand-red"
              >
                Sign Up
              </button>
            </div>
          </section>
        ) : null}

        {isSignedIn && favorites.length === 0 ? (
          <section className="mt-10 rounded-2xl border border-dashed border-brand-line bg-white px-6 py-12 text-center">
            <p className="text-2xl font-black text-brand-dark">No favorites yet.</p>
            <p className="mt-3 text-base text-brand-gray">Tap the heart on any property to save it here.</p>
            <a
              href={safeHref(`${import.meta.env.BASE_URL}properties-for-sale`)}
              className="mt-7 inline-flex items-center justify-center rounded-xl border border-brand-dark bg-brand-dark px-5 py-3 text-sm font-bold uppercase tracking-wide text-white hover:border-brand-red hover:bg-brand-red"
            >
              Browse Properties
            </a>
          </section>
        ) : null}

        {isSignedIn && favorites.length > 0 ? (
          <section className="mt-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-brand-dark shadow-sm">
              <Heart className="h-4 w-4 fill-current text-brand-red" />
              {favorites.length} saved
            </div>
            <div className="grid gap-6">
              {favorites.map((listing) => (
                <PropertyListingCard
                  key={listing.id}
                  listing={listing}
                  mode={listing.mode}
                  saved={isFavorite(listing.id)}
                  onToggleSave={toggleFavorite}
                />
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
