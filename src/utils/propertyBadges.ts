function hasAnyKeyword(label: string, keywords: string[]) {
  return keywords.some((keyword) => label.includes(keyword));
}

export function getPropertyBadgeClasses(value: string) {
  const label = value.toLowerCase();
  const baseClasses =
    "border border-white/25 text-white shadow-[0_12px_28px_rgba(15,23,42,0.26)]";

  if (hasAnyKeyword(label, ["pre-foreclosure", "foreclosure", "distress", "urgent"])) {
    return `${baseClasses} bg-[#ff4d4f]`;
  }

  if (hasAnyKeyword(label, ["new"])) {
    return `${baseClasses} bg-[#12b76a]`;
  }

  if (hasAnyKeyword(label, ["prime", "verified", "cbd"])) {
    return `${baseClasses} bg-[#1d4ed8]`;
  }

  if (hasAnyKeyword(label, ["beach", "sea", "coastal", "pool", "resort", "villa"])) {
    return `${baseClasses} bg-[#0284c7]`;
  }

  if (hasAnyKeyword(label, ["rent", "rental"])) {
    return `${baseClasses} bg-[#7c3aed]`;
  }

  if (hasAnyKeyword(label, ["studio", "walkable", "family", "airport", "income", "land"])) {
    return `${baseClasses} bg-[#f97316]`;
  }

  return `${baseClasses} bg-brand-red`;
}
