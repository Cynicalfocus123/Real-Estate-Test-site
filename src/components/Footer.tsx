import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { assetPath } from "../utils/assets";

export function Footer() {
  return (
    <footer className="bg-brand-dark text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.2fr_0.8fr_1fr] lg:px-8">
        <div>
          <img
            src={assetPath("images/buy-home-for-less-footer-logo.png")}
            alt="Buy Home For Less"
            className="h-24 w-auto object-contain"
          />
          <p className="mt-5 max-w-sm text-sm leading-6 text-neutral-300">
            Your trusted real estate partner for buying, renting, and leasing. Specializing in luxury
            homes, distressed properties, and exclusive long-term visa packages for foreign buyers.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase text-white">Company</h3>
          <ul className="mt-5 space-y-3 text-sm text-neutral-300">
            <li><a href="#about-us">About Us</a></li>
            <li><a href="#contact-us">Contact Us</a></li>
            <li><a href="#news">News</a></li>
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
            <a href="#contact" aria-label="Facebook" className="inline-flex h-10 w-10 items-center justify-center bg-white/10">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#contact" aria-label="Instagram" className="inline-flex h-10 w-10 items-center justify-center bg-white/10">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#contact" aria-label="WhatsApp" className="inline-flex h-10 w-10 items-center justify-center bg-white/10">
              <MessageCircle className="h-5 w-5" />
            </a>
            <a href="#contact" aria-label="LINE" className="inline-flex h-10 w-10 items-center justify-center bg-white/10 text-[10px] font-black">
              LINE
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs uppercase tracking-wide text-neutral-400">
        © 2026 Buy Home For Less. All rights reserved.
      </div>
    </footer>
  );
}
