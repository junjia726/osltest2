export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  region: string;
  state: string;
  city: string;
  tiktok: string;
  instagram: string;
  facebook: string;
  xiaohongshu: string;
  defaultSaId: string;
  avatar?: string;
  following?: string[];
  points?: number;
  createdAt: string;
}

export interface SavedConfiguration {
  id: string;
  modelId: string;
  modelName: string;
  variantName: string;
  colorName: string;
  accessories: string[];
  totalPrice: number;
  savedAt: string;
}

export const emptyProfile: UserProfile = {
  id: "",
  name: "",
  email: "",
  phone: "",
  whatsapp: "",
  address: "",
  region: "",
  state: "",
  city: "",
  tiktok: "",
  instagram: "",
  facebook: "",
  xiaohongshu: "",
  defaultSaId: "",
  avatar: "",
  following: [],
  points: 0,
  createdAt: "",
};

// Malaysian geographic data — districts by state (excluding Langkawi, Sabah, Sarawak)
export const malaysianDistrictsByState: Record<string, string[]> = {
  "Johor": [
    "Batu Pahat", "Johor Bahru", "Kluang", "Kota Tinggi", "Kulai",
    "Mersing", "Muar", "Pontian", "Segamat", "Tangkak",
  ],
  "Kedah": [
    "Baling", "Bandar Baharu", "Kota Setar", "Kuala Muda", "Kubang Pasu",
    "Kulim", "Padang Terap", "Pendang", "Pokok Sena", "Sik", "Yan",
  ],
  "Kelantan": [
    "Bachok", "Gua Musang", "Jeli", "Kota Bharu", "Kuala Krai",
    "Machang", "Pasir Mas", "Pasir Puteh", "Tanah Merah", "Tumpat",
  ],
  "Melaka": ["Alor Gajah", "Jasin", "Melaka Tengah"],
  "Negeri Sembilan": [
    "Jelebu", "Jempol", "Kuala Pilah", "Port Dickson", "Rembau",
    "Seremban", "Tampin",
  ],
  "Pahang": [
    "Bentong", "Bera", "Cameron Highlands", "Jerantut", "Kuantan",
    "Lipis", "Maran", "Pekan", "Raub", "Rompin", "Temerloh",
  ],
  "Penang": [
    "Barat Daya", "Seberang Perai Selatan", "Seberang Perai Tengah",
    "Seberang Perai Utara", "Timur Laut",
  ],
  "Perak": [
    "Bagan Datuk", "Batang Padang", "Hilir Perak", "Hulu Perak",
    "Kampar", "Kerian", "Kinta", "Kuala Kangsar",
    "Larut Matang & Selama", "Manjung", "Muallim", "Perak Tengah",
  ],
  "Perlis": ["Perlis"],
  "Selangor": [
    "Gombak", "Hulu Langat", "Hulu Selangor", "Klang", "Kuala Langat",
    "Kuala Selangor", "Petaling", "Sabak Bernam", "Sepang",
  ],
  "Terengganu": [
    "Besut", "Dungun", "Hulu Terengganu", "Kemaman", "Kuala Nerus",
    "Kuala Terengganu", "Marang", "Setiu",
  ],
  "WP Kuala Lumpur": ["Kuala Lumpur"],
  "WP Putrajaya": ["Putrajaya"],
  "WP Labuan": ["Labuan"],
};

// Flat region list — kept for backward compatibility (all districts)
export const malaysianRegions: string[] = Object.entries(malaysianDistrictsByState)
  .flatMap(([state, districts]) =>
    districts.map((d) => `${d}, ${state}`)
  );

// State list for cascading dropdowns
export const malaysianStates = Object.keys(malaysianDistrictsByState);

export const statesByRegion: Record<string, string[]> = {
  Central: ["Kuala Lumpur", "Selangor", "Putrajaya"],
  Northern: ["Penang", "Perak", "Kedah", "Perlis"],
  Southern: ["Johor", "Melaka", "Negeri Sembilan"],
  "East Coast": ["Pahang", "Terengganu", "Kelantan"],
  "East Malaysia": ["Sabah", "Sarawak", "Labuan"],
};

export const citiesByState: Record<string, string[]> = {
  "Kuala Lumpur": [
    "Kuala Lumpur City Centre",
    "Bangsar",
    "Cheras",
    "Setapak",
    "Kepong",
    "Wangsa Maju",
    "Bukit Jalil",
  ],
  Selangor: [
    "Shah Alam",
    "Petaling Jaya",
    "Subang Jaya",
    "Klang",
    "Ampang",
    "Rawang",
    "Puchong",
    "Cyberjaya",
    "Kajang",
    "Bangi",
  ],
  Putrajaya: ["Putrajaya"],
  Penang: [
    "George Town",
    "Butterworth",
    "Bayan Lepas",
    "Bukit Mertajam",
    "Nibong Tebal",
  ],
  Perak: [
    "Ipoh",
    "Taiping",
    "Teluk Intan",
    "Sitiawan",
    "Kampar",
  ],
  Kedah: [
    "Alor Setar",
    "Sungai Petani",
    "Kulim",
    "Langkawi",
  ],
  Perlis: ["Kangar", "Arau", "Padang Besar"],
  Johor: [
    "Johor Bahru",
    "Iskandar Puteri",
    "Batu Pahat",
    "Muar",
    "Kluang",
    "Kulai",
    "Pontian",
  ],
  Melaka: ["Melaka City", "Ayer Keroh", "Alor Gajah"],
  "Negeri Sembilan": [
    "Seremban",
    "Port Dickson",
    "Nilai",
    "Bahau",
  ],
  Pahang: [
    "Kuantan",
    "Temerloh",
    "Bentong",
    "Cameron Highlands",
    "Raub",
  ],
  Terengganu: [
    "Kuala Terengganu",
    "Kemaman",
    "Dungun",
    "Marang",
  ],
  Kelantan: [
    "Kota Bharu",
    "Pasir Mas",
    "Tanah Merah",
    "Tumpat",
  ],
  Sabah: [
    "Kota Kinabalu",
    "Sandakan",
    "Tawau",
    "Lahad Datu",
    "Keningau",
  ],
  Sarawak: [
    "Kuching",
    "Miri",
    "Sibu",
    "Bintulu",
    "Limbang",
  ],
  Labuan: ["Labuan"],
};

// Calculate profile completion percentage
export function getProfileCompletion(profile: UserProfile): number {
  const fields: (keyof UserProfile)[] = [
    "name",
    "email",
    "phone",
    "whatsapp",
    "address",
    "region",
    "state",
    "city",
  ];
  const optionalFields: (keyof UserProfile)[] = [
    "tiktok",
    "instagram",
    "facebook",
    "xiaohongshu",
  ];

  let filled = 0;
  const total = fields.length + optionalFields.length;

  fields.forEach((f) => {
    if (profile[f] && profile[f].trim() !== "") filled++;
  });
  optionalFields.forEach((f) => {
    if (profile[f] && profile[f].trim() !== "") filled++;
  });

  return Math.round((filled / total) * 100);
}

// Generate WhatsApp message with user profile data
export function generateWhatsAppMessage(
  profile: UserProfile,
  config?: {
    modelName: string;
    variantName: string;
    colorName?: string;
    accessories?: string[];
    totalPrice?: number;
  }
): string {
  const parts: string[] = [];

  const name = profile.name || "Guest";
  parts.push(`Hello, my name is ${name}.`);
  parts.push("");

  // Location
  const locationParts: string[] = [];
  if (profile.city) locationParts.push(profile.city);
  if (profile.state) locationParts.push(profile.state);
  if (profile.region) locationParts.push(profile.region);
  if (locationParts.length > 0) {
    parts.push(`Location: ${locationParts.join(", ")}`);
  }

  // Phone — WhatsApp first, fallback to phone
  const contactNumber = profile.whatsapp || profile.phone;
  if (contactNumber) {
    parts.push(`Phone/WhatsApp: ${contactNumber}`);
  }

  parts.push("");

  // Car interest
  if (config) {
    parts.push("Interested in:");
    parts.push(`Model: ${config.modelName}`);
    parts.push(`Variant: ${config.variantName}`);
    if (config.colorName) parts.push(`Color: ${config.colorName}`);
    if (config.accessories && config.accessories.length > 0) {
      parts.push(`Accessories: ${config.accessories.join(", ")}`);
    }
    if (config.totalPrice) {
      parts.push(`Total Price: RM ${config.totalPrice.toLocaleString()}`);
    }
    parts.push("");
  }

  parts.push("Please assist me further. Thank you!");

  return encodeURIComponent(parts.join("\n"));
}