export interface CarVariant {
  id: string;
  name: string;
  price: number;
}

export interface CarColor {
  id: string;
  name: string;
  hex: string;
}

export interface CarAccessory {
  id: string;
  name: string;
  price: number;
}

export interface CarModel {
  id: string;
  name: string;
  tagline: string;
  priceRange: string;
  startingPrice: number;
  image: string;
  variants: CarVariant[];
  colors: CarColor[];
  accessories: CarAccessory[];
}

export const carModels: CarModel[] = [
  {
    id: "myvi",
    name: "Myvi",
    tagline: "The King of the Road",
    priceRange: "RM 46,800 - RM 58,800",
    startingPrice: 46800,
    image: "https://images.unsplash.com/photo-1746393673612-2bf0e811ce79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjBzZWRhbiUyMGNhciUyMG1vZGVybiUyMHNob3dyb29tfGVufDF8fHx8MTc3MTUyMjM5OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    variants: [
      { id: "myvi-g", name: "1.3G MT", price: 46800 },
      { id: "myvi-x", name: "1.3X AT", price: 49800 },
      { id: "myvi-h", name: "1.5H AT", price: 53800 },
      { id: "myvi-av", name: "1.5 AV AT", price: 58800 },
    ],
    colors: [
      { id: "c1", name: "Cranberry Red", hex: "#8B1A1A" },
      { id: "c2", name: "Glittering Silver", hex: "#C0C0C0" },
      { id: "c3", name: "Ivory White", hex: "#FFFFF0" },
      { id: "c4", name: "Granite Grey", hex: "#676767" },
      { id: "c5", name: "Lava Red", hex: "#CF1020" },
    ],
    accessories: [
      { id: "a1", name: "Body Kit", price: 1500 },
      { id: "a2", name: "Tinted Windows", price: 800 },
      { id: "a3", name: "Dash Cam", price: 450 },
      { id: "a4", name: "Floor Mat Set", price: 250 },
    ],
  },
  {
    id: "axia",
    name: "Axia",
    tagline: "Smart Entry Level Choice",
    priceRange: "RM 22,000 - RM 38,600",
    startingPrice: 22000,
    image: "https://images.unsplash.com/photo-1767949374162-5cbb31071b8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wYWN0JTIwaGF0Y2hiYWNrJTIwY2FyJTIwd2hpdGV8ZW58MXx8fHwxNzcxNTIyMzk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    variants: [
      { id: "axia-e", name: "1.0E MT", price: 22000 },
      { id: "axia-g", name: "1.0G AT", price: 31400 },
      { id: "axia-se", name: "1.0 SE AT", price: 35000 },
      { id: "axia-av", name: "1.0 AV AT", price: 38600 },
    ],
    colors: [
      { id: "c1", name: "Pearl White", hex: "#F5F5F0" },
      { id: "c2", name: "Glittering Silver", hex: "#C0C0C0" },
      { id: "c3", name: "Midnight Blue", hex: "#003366" },
      { id: "c4", name: "Passion Red", hex: "#FF0000" },
    ],
    accessories: [
      { id: "a1", name: "Spoiler", price: 600 },
      { id: "a2", name: "Door Visor", price: 200 },
      { id: "a3", name: "Seat Cover", price: 350 },
    ],
  },
  {
    id: "bezza",
    name: "Bezza",
    tagline: "Sedan Comfort Redefined",
    priceRange: "RM 34,580 - RM 49,980",
    startingPrice: 34580,
    image: "https://images.unsplash.com/photo-1763888709588-87beb443e10f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWx2ZXIlMjBzZWRhbiUyMGNhciUyMGNpdHklMjBkcml2aW5nfGVufDF8fHx8MTc3MTUyMjQwMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    variants: [
      { id: "bezza-g", name: "1.0G MT", price: 34580 },
      { id: "bezza-x", name: "1.0X AT", price: 40580 },
      { id: "bezza-av", name: "1.3 AV AT", price: 49980 },
    ],
    colors: [
      { id: "c1", name: "Crystal White", hex: "#F8F8FF" },
      { id: "c2", name: "Jet Black", hex: "#0A0A0A" },
      { id: "c3", name: "Ocean Blue", hex: "#4682B4" },
      { id: "c4", name: "Rose Gold", hex: "#B76E79" },
    ],
    accessories: [
      { id: "a1", name: "Chrome Garnish", price: 400 },
      { id: "a2", name: "Leather Wrap Steering", price: 550 },
      { id: "a3", name: "Trunk Tray", price: 180 },
    ],
  },
  {
    id: "alza",
    name: "Alza",
    tagline: "Space for Everyone",
    priceRange: "RM 62,500 - RM 75,500",
    startingPrice: 62500,
    image: "https://images.unsplash.com/photo-1744424846144-d57267a19ee8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBNUFYlMjBjYXIlMjBzZXZlbiUyMHNlYXRlcnxlbnwxfHx8fDE3NzE1MjI0MDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    variants: [
      { id: "alza-x", name: "1.5X AT", price: 62500 },
      { id: "alza-h", name: "1.5H AT", price: 68000 },
      { id: "alza-av", name: "1.5 AV AT", price: 75500 },
    ],
    colors: [
      { id: "c1", name: "Glittering Silver", hex: "#C0C0C0" },
      { id: "c2", name: "Ivory White", hex: "#FFFFF0" },
      { id: "c3", name: "Granite Grey", hex: "#676767" },
    ],
    accessories: [
      { id: "a1", name: "Roof Rack", price: 900 },
      { id: "a2", name: "Sun Shade", price: 250 },
      { id: "a3", name: "Cargo Net", price: 150 },
    ],
  },
  {
    id: "ativa",
    name: "Ativa",
    tagline: "Born to Stand Out",
    priceRange: "RM 62,500 - RM 73,400",
    startingPrice: 62500,
    image: "https://images.unsplash.com/photo-1767949374180-e5895daa1990?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wYWN0JTIwU1VWJTIwY3Jvc3NvdmVyJTIwbW9kZXJufGVufDF8fHx8MTc3MTUyMjQwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    variants: [
      { id: "ativa-x", name: "1.0T X", price: 62500 },
      { id: "ativa-h", name: "1.0T H", price: 67500 },
      { id: "ativa-av", name: "1.0T AV", price: 73400 },
    ],
    colors: [
      { id: "c1", name: "Passion Red", hex: "#FF0000" },
      { id: "c2", name: "Ocean Blue", hex: "#4682B4" },
      { id: "c3", name: "Pearl White", hex: "#F5F5F0" },
      { id: "c4", name: "Jet Black", hex: "#0A0A0A" },
    ],
    accessories: [
      { id: "a1", name: "Side Step Bar", price: 1200 },
      { id: "a2", name: "Cargo Tray", price: 200 },
      { id: "a3", name: "Door Edge Guard", price: 150 },
    ],
  },
  {
    id: "aruz",
    name: "Aruz",
    tagline: "Adventure Awaits",
    priceRange: "RM 68,000 - RM 77,900",
    startingPrice: 68000,
    image: "https://images.unsplash.com/photo-1760713164476-7eb5063b3d07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwU1VWJTIwcHJlbWl1bSUyMGF1dG9tb3RpdmV8ZW58MXx8fHwxNzcxNTIyNDA0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    variants: [
      { id: "aruz-x", name: "1.5X AT", price: 68000 },
      { id: "aruz-av", name: "1.5 AV AT", price: 77900 },
    ],
    colors: [
      { id: "c1", name: "Glittering Silver", hex: "#C0C0C0" },
      { id: "c2", name: "Granite Grey", hex: "#676767" },
      { id: "c3", name: "Pearl White", hex: "#F5F5F0" },
    ],
    accessories: [
      { id: "a1", name: "Bull Bar", price: 1800 },
      { id: "a2", name: "Roof Box", price: 2500 },
      { id: "a3", name: "LED Light Bar", price: 800 },
    ],
  },
  {
    id: "alza-hybrid",
    name: "Alza Hybrid",
    tagline: "Future Forward Drive",
    priceRange: "RM 78,000 - RM 85,000",
    startingPrice: 78000,
    image: "https://images.unsplash.com/photo-1665519448191-f73fc16d5a74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoeWJyaWQlMjBjYXIlMjBlY28lMjBncmVlbiUyMG1vZGVybnxlbnwxfHx8fDE3NzE1MjI0MDJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    variants: [
      { id: "alzah-h", name: "Hybrid H", price: 78000 },
      { id: "alzah-av", name: "Hybrid AV", price: 85000 },
    ],
    colors: [
      { id: "c1", name: "Eco Green", hex: "#2E8B57" },
      { id: "c2", name: "Pearl White", hex: "#F5F5F0" },
      { id: "c3", name: "Titanium Grey", hex: "#808080" },
    ],
    accessories: [
      { id: "a1", name: "EV Charger Home Kit", price: 3000 },
      { id: "a2", name: "Solar Film Premium", price: 1200 },
      { id: "a3", name: "Premium Floor Mat", price: 350 },
    ],
  },
];

export const regions = [
  "Kuala Lumpur",
  "Selangor",
  "Johor",
  "Penang",
  "Perak",
  "Sabah",
  "Sarawak",
  "Kedah",
  "Kelantan",
  "Negeri Sembilan",
  "Pahang",
  "Terengganu",
  "Melaka",
  "Perlis",
  "Putrajaya",
  "Labuan",
];