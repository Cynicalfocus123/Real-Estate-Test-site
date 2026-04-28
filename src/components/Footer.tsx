import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { assetPath } from "../utils/assets";

export function Footer() {
  return (
    <footer className="bg-brand-dark text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr] lg:px-8">
        <div>
          <img
            src={assetPath("images/buy-home-for-less-logo.png")}
            alt="Buy Home For Less"
            className="h-20 w-auto bg-white p-2"
          />
          <p className="mt-5 max-w-sm text-sm leading-6 text-neutral-300">
            Buy Home For Less by Mstar Capital Group. Real estate search frontend ready for listings,
            GraphQL, maps, and future PostgreSQL backend.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase text-white">Company</h3>
          <ul className="mt-5 space-y-3 text-sm text-neutral-300">
            <li><a href="#buy">Buy</a></li>
            <li><a href="#rent">Rent</a></li>
            <li><a href="#sell">Sell</a></li>
            <li><a href="#listings">Listings</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase text-white">Resources</h3>
          <ul className="mt-5 space-y-3 text-sm text-neutral-300">
            <li><a href="#map">Map Search</a></li>
            <li><a href="#agents">Agents</a></li>
            <li><a href="#contact">Mortgage</a></li>
            <li><a href="#contact">Help Center</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase text-white">Contact</h3>
          <ul className="mt-5 space-y-3 text-sm text-neutral-300">
            <li className="flex gap-3"><MapPin className="h-4 w-4 text-brand-red" /> Bangkok, Thailand</li>
            <li className="flex gap-3"><Phone className="h-4 w-4 text-brand-red" /> +1 000 000 0000</li>
            <li className="flex gap-3"><Mail className="h-4 w-4 text-brand-red" /> hello@buyhomeforless.com</li>
          </ul>
          <div className="mt-6 flex gap-3">
            {[Facebook, Instagram, Linkedin].map((Icon, index) => (
              <a key={index} href="#contact" className="inline-flex h-10 w-10 items-center justify-center bg-white/10">
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs uppercase tracking-wide text-neutral-400">
        © 2026 Buy Home For Less. All rights reserved.
      </div>
    </footer>
  );
}
