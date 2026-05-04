import type { PropertyAddress, PropertyAgent, PropertyFaq, PropertyListing } from "../types/propertyListing";

type PropertyListingSeed = Omit<
  PropertyListing,
  "agent" | "description" | "faqs" | "features" | "floorCount" | "galleryImages" | "garageSpaces" | "propertyTypeLabel"
>;

const basePropertyListings: PropertyListingSeed[] = [
  {
    id: "sale-bkk-phrom-phong-01",
    mode: "sale",
    title: "Skyline Corner Condo near EmQuartier",
    city: "Khlong Toei",
    province: "Bangkok",
    priceLabel: "THB 14,500,000",
    priceValue: 14500000,
    beds: 2,
    baths: 2,
    areaSqm: 77,
    homeType: "Condo",
    builtYear: 2020,
    nearby: ["BTS Phrom Phong", "Emporium", "Benchasiri Park"],
    amenities: ["Pool", "Gym", "Parking", "Security"],
    image: "images/province-banners/bangkok.png",
    statusLabel: "Prime CBD",
  },
  {
    id: "sale-bkk-samyan-02",
    mode: "sale",
    title: "Ready-to-Move City Residence at Sam Yan",
    city: "Bang Rak",
    province: "Bangkok",
    priceLabel: "THB 8,600,000",
    priceValue: 8600000,
    beds: 2,
    baths: 2,
    areaSqm: 80,
    homeType: "Condo",
    builtYear: 2019,
    nearby: ["MRT Sam Yan", "Chamchuri Square", "Silom"],
    amenities: ["Pool", "Co-working", "Gym", "Security"],
    image: "images/province-banners/bangkok.png",
    statusLabel: "Verified Seller",
    specialCategory: "Urgent Sale",
  },
  {
    id: "sale-phuket-patong-03",
    mode: "sale",
    title: "Resort Condo with Mountain and Pool View",
    city: "Patong",
    province: "Phuket",
    priceLabel: "THB 8,900,000",
    priceValue: 8900000,
    beds: 2,
    baths: 2,
    areaSqm: 65,
    homeType: "Condo",
    builtYear: 2018,
    nearby: ["Patong Beach", "Jungceylon", "Bangla Road"],
    amenities: ["Pool", "Balcony", "Parking", "Security"],
    image: "images/province-banners/phuket.png",
    statusLabel: "Beach Access",
  },
  {
    id: "sale-phuket-kathu-04",
    mode: "sale",
    title: "Private Pool Villa in Quiet Kathu Estate",
    city: "Kathu",
    province: "Phuket",
    priceLabel: "THB 26,800,000",
    priceValue: 26800000,
    beds: 4,
    baths: 5,
    areaSqm: 420,
    homeType: "House",
    builtYear: 2022,
    nearby: ["British International School", "Loch Palm Golf Club", "Central Phuket"],
    amenities: ["Private Pool", "Garden", "Parking", "Security"],
    image: "images/province-banners/phuket.png",
    statusLabel: "New Build",
  },
  {
    id: "sale-cnx-nimman-05",
    mode: "sale",
    title: "Modern Apartment Close to Nimman Lifestyle",
    city: "Mueang Chiang Mai",
    province: "Chiang Mai",
    priceLabel: "THB 5,400,000",
    priceValue: 5400000,
    beds: 1,
    baths: 1,
    areaSqm: 48,
    homeType: "Apartment",
    builtYear: 2021,
    nearby: ["MAYA Mall", "Nimman Road", "Chiang Mai University"],
    amenities: ["Gym", "Rooftop Lounge", "Parking", "Security"],
    image: "images/province-banners/chiang-mai.png",
    statusLabel: "Walkable Area",
  },
  {
    id: "sale-cnx-hangdong-06",
    mode: "sale",
    title: "Family House with Large Garden in Hang Dong",
    city: "Hang Dong",
    province: "Chiang Mai",
    priceLabel: "THB 11,900,000",
    priceValue: 11900000,
    beds: 5,
    baths: 4,
    areaSqm: 360,
    homeType: "Single Detach House",
    builtYear: 2017,
    nearby: ["Kad Farang", "Panyaden School", "Night Safari"],
    amenities: ["Garden", "Parking", "Storage", "Security"],
    image: "images/province-banners/chiang-mai.png",
    statusLabel: "Family Layout",
  },
  {
    id: "sale-chon-pattaya-07",
    mode: "sale",
    title: "Sea-View Condo near Central Pattaya",
    city: "Pattaya",
    province: "Chonburi",
    priceLabel: "THB 6,900,000",
    priceValue: 6900000,
    beds: 1,
    baths: 1,
    areaSqm: 43,
    homeType: "Condo",
    builtYear: 2020,
    nearby: ["Central Pattaya", "Pattaya Beach", "Terminal 21 Pattaya"],
    amenities: ["Pool", "Sea View", "Gym", "Security"],
    image: "images/province-banners/pattaya-chonburi.png",
    statusLabel: "Sea View",
    specialCategory: "Foreclosure",
  },
  {
    id: "sale-chon-bangsaray-08",
    mode: "sale",
    title: "Semi Detached Coastal Home with Clubhouse Access",
    city: "Bang Saray",
    province: "Chonburi",
    priceLabel: "THB 7,500,000",
    priceValue: 7500000,
    beds: 3,
    baths: 3,
    areaSqm: 185,
    homeType: "Semi Detached House",
    builtYear: 2021,
    nearby: ["Bang Saray Beach", "Columbia Pictures Aquaverse", "Phoenix Gold Golf"],
    amenities: ["Clubhouse", "Garden", "Parking", "Security"],
    image: "images/province-banners/pattaya-chonburi.png",
    statusLabel: "Coastal Living",
    specialCategory: "Pre-Foreclosure",
  },
  {
    id: "sale-hhk-huahin-09",
    mode: "sale",
    title: "Golf-Course Pool Villa in Hua Hin",
    city: "Hua Hin",
    province: "Prachuap Khiri Khan",
    priceLabel: "THB 18,400,000",
    priceValue: 18400000,
    beds: 4,
    baths: 4,
    areaSqm: 310,
    homeType: "House",
    builtYear: 2019,
    nearby: ["Black Mountain Golf Club", "Bluport", "Hua Hin Beach"],
    amenities: ["Private Pool", "Garden", "Parking", "Security"],
    image: "images/province-banners/hua-hin-prachuap-khiri-khan.png",
    statusLabel: "Pool Villa",
    specialCategory: "Distress Property",
  },
  {
    id: "sale-kri-riverside-10",
    mode: "sale",
    title: "Riverside Land Plot for Boutique Retreat",
    city: "Mueang Kanchanaburi",
    province: "Kanchanaburi",
    priceLabel: "THB 4,200,000",
    priceValue: 4200000,
    beds: 0,
    baths: 0,
    areaSqm: 640,
    homeType: "Land",
    builtYear: 2026,
    nearby: ["River Kwai", "Kanchanaburi Town", "Bridge over the River Kwai"],
    amenities: ["Road Access", "Utilities Nearby", "Riverfront"],
    image: "images/province-banners/kanchanaburi.png",
    statusLabel: "Land Plot",
  },
  {
    id: "sale-spk-srinakarin-11",
    mode: "sale",
    title: "Townhouse Upgrade near Mega Bangna",
    city: "Bang Phli",
    province: "Samut Prakan",
    priceLabel: "THB 5,950,000",
    priceValue: 5950000,
    beds: 3,
    baths: 3,
    areaSqm: 156,
    homeType: "Townhouse",
    builtYear: 2023,
    nearby: ["Mega Bangna", "Suvarnabhumi Airport", "Concordian International School"],
    amenities: ["Clubhouse", "Parking", "Garden", "Security"],
    image: "images/province-banners/samut-prakan.png",
    statusLabel: "Near Airport",
    specialCategory: "Fixer Upper",
  },
  {
    id: "sale-udn-city-12",
    mode: "sale",
    title: "Compact Studio for Urban Starter Buyers",
    city: "Mueang Udon Thani",
    province: "Udon Thani",
    priceLabel: "THB 2,190,000",
    priceValue: 2190000,
    beds: 0,
    baths: 1,
    areaSqm: 31,
    homeType: "Apartment",
    builtYear: 2024,
    nearby: ["Central Udon", "UD Town", "Udon Thani Airport"],
    amenities: ["Gym", "Security", "Parking"],
    image: "images/province-banners/udon-thani.png",
    statusLabel: "Studio",
  },
  {
    id: "sale-bkk-rama9-13",
    mode: "sale",
    title: "Multi-Family Income Home near Rama 9",
    city: "Huai Khwang",
    province: "Bangkok",
    priceLabel: "THB 19,800,000",
    priceValue: 19800000,
    beds: 5,
    baths: 5,
    areaSqm: 340,
    homeType: "Multi Family",
    builtYear: 2016,
    nearby: ["MRT Phra Ram 9", "Central Rama 9", "Jodd Fairs"],
    amenities: ["Parking", "Storage", "Security", "Balcony"],
    image: "images/province-banners/bangkok.png",
    statusLabel: "Income Asset",
  },
  {
    id: "rent-bkk-thonglor-01",
    mode: "rent",
    title: "Thonglor Designer Condo for Long Stay",
    city: "Watthana",
    province: "Bangkok",
    priceLabel: "THB 52,000 / month",
    priceValue: 52000,
    beds: 2,
    baths: 2,
    areaSqm: 72,
    homeType: "Condo",
    builtYear: 2021,
    nearby: ["BTS Thong Lo", "J Avenue", "Samitivej Sukhumvit"],
    amenities: ["Pool", "Gym", "Security", "Parking"],
    image: "images/province-banners/bangkok.png",
    statusLabel: "For Rent",
  },
  {
    id: "rent-phuket-laguna-02",
    mode: "rent",
    title: "Laguna Apartment with Resort Access",
    city: "Choeng Thale",
    province: "Phuket",
    priceLabel: "THB 78,000 / month",
    priceValue: 78000,
    beds: 2,
    baths: 2,
    areaSqm: 96,
    homeType: "Apartment",
    builtYear: 2022,
    nearby: ["Bang Tao Beach", "Boat Avenue", "Laguna Golf"],
    amenities: ["Pool", "Gym", "Shuttle", "Security"],
    image: "images/province-banners/phuket.png",
    statusLabel: "Resort Rental",
  },
  {
    id: "rent-cnx-old-town-03",
    mode: "rent",
    title: "Chiang Mai Townhouse near Old City",
    city: "Mueang Chiang Mai",
    province: "Chiang Mai",
    priceLabel: "THB 28,000 / month",
    priceValue: 28000,
    beds: 3,
    baths: 3,
    areaSqm: 170,
    homeType: "Townhouse",
    builtYear: 2018,
    nearby: ["Old City", "Saturday Walking Street", "Chiang Mai Gate"],
    amenities: ["Parking", "Balcony", "Storage", "Security"],
    image: "images/province-banners/chiang-mai.png",
    statusLabel: "Pet Friendly",
  },
  {
    id: "rent-huahin-garden-04",
    mode: "rent",
    title: "Garden House Close to International School",
    city: "Hua Hin",
    province: "Prachuap Khiri Khan",
    priceLabel: "THB 65,000 / month",
    priceValue: 65000,
    beds: 4,
    baths: 3,
    areaSqm: 240,
    homeType: "House",
    builtYear: 2020,
    nearby: ["Bluport", "Beaconhouse Yamsaard", "Hua Hin Beach"],
    amenities: ["Garden", "Parking", "Pool", "Security"],
    image: "images/province-banners/hua-hin-prachuap-khiri-khan.png",
    statusLabel: "Family Rental",
  },
];

const defaultAgent: PropertyAgent = {
  name: "BuyHomeForLess Agent",
  phone: "+66 82 468 2456",
  email: "agent@buyhomeforless.com",
};

const addressSeedByListingId: Record<string, PropertyAddress> = {
  "sale-bkk-phrom-phong-01": {
    street: "Sukhumvit Road",
    soi: "Sukhumvit 24",
    tambon: "Khlong Tan",
    amphoe: "Khlong Toei",
    city: "Khlong Toei",
    province: "Bangkok",
    postalCode: "10110",
    country: "Thailand",
    latitude: 13.7306,
    longitude: 100.5694,
  },
};

const galleryPool = Array.from(new Set(basePropertyListings.map((listing) => listing.image)));

function rotateGallery(startIndex: number) {
  return galleryPool.slice(startIndex).concat(galleryPool.slice(0, startIndex));
}

function buildGalleryImages(primaryImage: string, index: number) {
  return Array.from(new Set([primaryImage, ...rotateGallery(index % galleryPool.length)])).slice(0, 10);
}

function buildDescription(listing: PropertyListingSeed) {
  const priceContext = listing.mode === "rent" ? "rental" : "purchase";
  return `${listing.title} is a ${listing.homeType.toLowerCase()} in ${listing.city}, ${listing.province} designed for ${priceContext} clients who want quick access to ${listing.nearby.join(", ")}. The layout balances everyday livability with practical resale appeal, while the ${listing.amenities.join(", ").toLowerCase()} package keeps the home ready for future backend-driven listing content.`;
}

function buildFaqs(listing: PropertyListingSeed): PropertyFaq[] {
  const occupancyLabel = listing.mode === "rent" ? "move-in" : "transfer";
  return [
    {
      question: `What stands out about this ${listing.homeType.toLowerCase()} in ${listing.city}?`,
      answer: `This listing combines ${listing.areaSqm} sqm of interior space, ${listing.beds === 0 ? "a studio-style plan" : `${listing.beds} bedroom`}, and convenient access to ${listing.nearby[0]}. Backend property FAQs can replace this seeded content later without changing the page layout.`,
    },
    {
      question: `What amenities are included with this property?`,
      answer: `Current listing data includes ${listing.amenities.join(", ")}. The detail page reads these amenities from structured property data so the backend can supply property-specific facility lists later.`,
    },
    {
      question: `How soon could a buyer or tenant plan for ${occupancyLabel}?`,
      answer: `That timing will depend on the final agreement, due diligence, and agent coordination. The detail page is already prepared to receive backend-written FAQs for exact handover timelines on each property.`,
    },
  ];
}

function getFloorCount(listing: PropertyListingSeed) {
  if (listing.homeType === "Land") return 0;
  if (listing.homeType === "Condo" || listing.homeType === "Apartment") return 1;
  if (listing.areaSqm >= 300) return 2;
  return 1;
}

function getGarageSpaces(listing: PropertyListingSeed) {
  if (listing.homeType === "Land") return 0;
  if (listing.homeType === "Condo" || listing.homeType === "Apartment") return 1;
  if (listing.beds >= 4) return 2;
  return 1;
}

function getPropertyTypeLabel(listing: PropertyListingSeed) {
  return listing.specialCategory ?? listing.statusLabel;
}

function buildPropertyAddress(listing: PropertyListingSeed): PropertyAddress {
  const seededAddress = addressSeedByListingId[listing.id] ?? {};

  return {
    street: seededAddress.street,
    village: seededAddress.village,
    soi: seededAddress.soi,
    tambon: seededAddress.tambon,
    amphoe: seededAddress.amphoe,
    district: seededAddress.district,
    city: seededAddress.city ?? listing.city,
    province: seededAddress.province ?? listing.province,
    postalCode: seededAddress.postalCode,
    country: seededAddress.country ?? "Thailand",
    latitude: seededAddress.latitude,
    longitude: seededAddress.longitude,
  };
}

function buildPropertyFeatures(listing: PropertyListingSeed): string[] {
  const furnishing =
    listing.mode === "rent" || listing.homeType === "Condo" || listing.homeType === "Apartment" ? "Furnished" : "Unfurnished";
  const hasAirConditioner = listing.homeType !== "Land";
  const hasKitchen = listing.homeType !== "Land";

  if (listing.homeType === "Land") {
    return ["Furnishing: Unfurnished", "Air Conditioner: No", "Kitchen: No"];
  }

  return [
    `Furnishing: ${furnishing}`,
    `Air Conditioner: ${hasAirConditioner ? "Yes" : "No"}`,
    `Kitchen: ${hasKitchen ? "Yes" : "No"}`,
  ];
}

export const propertyListings: PropertyListing[] = basePropertyListings.map((listing, index) => ({
  ...listing,
  depositAmount: listing.mode === "rent" ? listing.priceValue * 2 : undefined,
  agent: defaultAgent,
  address: buildPropertyAddress(listing),
  features: buildPropertyFeatures(listing),
  description: buildDescription(listing),
  faqs: buildFaqs(listing),
  floorCount: getFloorCount(listing),
  galleryImages: buildGalleryImages(listing.image, index),
  garageSpaces: getGarageSpaces(listing),
  propertyTypeLabel: getPropertyTypeLabel(listing),
}));
