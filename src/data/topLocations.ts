export type TopLocation = {
  id: string;
  name: string;
  listingCount: number;
  size: "large" | "small";
  tone: string;
  image?: string;
};

export const topLocations: TopLocation[] = [
  {
    id: "phuket",
    name: "Phuket",
    listingCount: 0,
    size: "large",
    tone: "from-[#92806a] via-[#505437] to-[#1d2118]",
    image: "images/province-banners/phuket.png",
  },
  {
    id: "chiang-mai",
    name: "Chiang Mai",
    listingCount: 0,
    size: "small",
    tone: "from-[#6e6a58] via-[#4a4f48] to-[#161814]",
    image: "images/province-banners/chiang-mai.png",
  },
  {
    id: "pattaya-chonburi",
    name: "Pattaya / Chonburi",
    listingCount: 0,
    size: "small",
    tone: "from-[#547286] via-[#30525e] to-[#171c1c]",
    image: "images/province-banners/pattaya-chonburi.png",
  },
  {
    id: "bangkok",
    name: "Bangkok",
    listingCount: 0,
    size: "small",
    tone: "from-[#77614d] via-[#473f3a] to-[#171411]",
    image: "images/province-banners/bangkok.png",
  },
  {
    id: "kanchanaburi",
    name: "Kanchanaburi",
    listingCount: 1,
    size: "small",
    tone: "from-[#61795c] via-[#374f43] to-[#181d16]",
    image: "images/province-banners/kanchanaburi.png",
  },
  {
    id: "chiang-rai",
    name: "Chiang Rai",
    listingCount: 0,
    size: "small",
    tone: "from-[#8d9aa1] via-[#59656a] to-[#202523]",
    image: "images/province-banners/chiang-rai.png",
  },
  {
    id: "hua-hin-prachuap-khiri-khan",
    name: "Hua Hin / Prachuap Khiri Khan",
    listingCount: 0,
    size: "small",
    tone: "from-[#4f526f] via-[#30364f] to-[#141720]",
    image: "images/province-banners/hua-hin-prachuap-khiri-khan.png",
  },
];

export const moreLocations: TopLocation[] = [
  {
    id: "kao-yai",
    name: "Kao Yai",
    listingCount: 0,
    size: "small",
    tone: "from-[#626f5d] via-[#3b493c] to-[#171b16]",
    image: "images/province-banners/kao-yai.png",
  },
  {
    id: "udon-thani",
    name: "Udon Thani",
    listingCount: 0,
    size: "small",
    tone: "from-[#806866] via-[#50495f] to-[#181824]",
    image: "images/province-banners/udon-thani.png",
  },
  {
    id: "nakhon-ratchasima",
    name: "Nakhon Ratchasima",
    listingCount: 0,
    size: "small",
    tone: "from-[#715f56] via-[#493c35] to-[#171310]",
    image: "images/province-banners/nakhon-ratchasima.png",
  },
  {
    id: "samut-sakhon",
    name: "Samut Sakhon",
    listingCount: 0,
    size: "small",
    tone: "from-[#56534e] via-[#383632] to-[#151412]",
    image: "images/province-banners/samut-sakhon.png",
  },
  {
    id: "samut-prakan",
    name: "Samut Prakan",
    listingCount: 0,
    size: "small",
    tone: "from-[#6c6f48] via-[#454a2f] to-[#171b10]",
    image: "images/province-banners/samut-prakan.png",
  },
  {
    id: "nan",
    name: "Nan",
    listingCount: 0,
    size: "small",
    tone: "from-[#62737a] via-[#40555c] to-[#161d20]",
    image: "images/province-banners/nan.png",
  },
  {
    id: "phetchaburi",
    name: "Phetchaburi",
    listingCount: 0,
    size: "small",
    tone: "from-[#856347] via-[#4a3326] to-[#17100c]",
    image: "images/province-banners/phetchaburi.png",
  },
  {
    id: "surat-thani",
    name: "Surat Thani",
    listingCount: 0,
    size: "small",
    tone: "from-[#667a6b] via-[#3e5543] to-[#152018]",
  },
];
