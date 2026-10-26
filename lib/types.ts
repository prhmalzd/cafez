export type CafeStatus = "draft" | "pending_review" | "approved" | "suspended" | "rejected";
export type PriceRange = "اقتصادی" | "متوسط" | "ویژه";

export type BusinessHours = {
  day: number;
  label: string;
  opensAt: string | null;
  closesAt: string | null;
  closed?: boolean;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  available: boolean;
  featured?: boolean;
  ingredients?: string[];
  badges?: string[];
  orderable?: boolean;
};

export type MenuCategory = {
  id: string;
  name: string;
  items: MenuItem[];
};

export type Offer = {
  id: string;
  slug: string;
  cafeId: string;
  title: string;
  description: string;
  terms: string;
  badge: string;
  startsAt: string;
  endsAt: string;
  validFrom?: string;
  validUntil?: string;
  dailyCap?: number;
  claimedToday?: number;
  image: string;
  status: "draft" | "active" | "paused" | "expired";
};

export type Cafe = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  neighborhood: string;
  address: string;
  type: string;
  priceRange: PriceRange;
  cover: string;
  logo: string;
  gallery: string[];
  phone: string;
  instagram?: string;
  website?: string;
  mapUrl: string;
  amenities: string[];
  hours: BusinessHours[];
  menu: MenuCategory[];
  offerIds: string[];
  featured?: boolean;
  sponsored?: boolean;
  status: CafeStatus;
  createdAt: string;
  theme?: CafeTheme;
  orderSettings?: OrderSettings;
};

export type CafeThemePreset = "classic" | "warm" | "minimal";
export type CafeThemeMode = "light" | "dark";

export type CafeTheme = {
  preset: CafeThemePreset;
  primaryColor: string;
  accentColor: string;
  mode: CafeThemeMode;
  font: "default" | "rounded";
  tier: "standard" | "advanced";
};

export type OrderSettings = {
  enabled: boolean;
  minimumPrepMinutes: number;
  slotIntervalMinutes: number;
  capacityPerSlot: number;
  acceptanceTimeoutMinutes: number;
  opensAt: string;
  closesAt: string;
};

export type PickupOrderStatus = "pending" | "accepted" | "ready" | "collected" | "rejected" | "cancelled" | "expired" | "no_show";

export type PickupOrderItem = {
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
};

export type PickupOrder = {
  id: string;
  cafeId: string;
  cafeName: string;
  code: string;
  accessToken: string;
  status: PickupOrderStatus;
  requestedFor: string;
  promisedFor?: string;
  note: string;
  totalPrice: number;
  items: PickupOrderItem[];
  createdAt: string;
  expiresAt: string;
  rejectionReason?: string;
};

export type PromotionPlacement = "home_hero" | "home_card" | "cafes_card" | "offers_banner";

export type Promotion = {
  id: string;
  cafeId: string;
  cafeName: string;
  placement: PromotionPlacement;
  title: string;
  image: string;
  targetUrl: string;
  startsAt: string;
  endsAt: string;
  status: "requested" | "scheduled" | "active" | "paused" | "completed" | "rejected";
  impressions?: number;
  clicks?: number;
};

export type AnalyticsSummary = {
  profileViews: number;
  menuViews: number;
  directionClicks: number;
  offerClaims: number;
  redemptions: number;
};

export type ClaimRecord = {
  id: string;
  offerId: string;
  cafeId: string;
  anonymousId: string;
  code: string;
  status: "active" | "redeemed" | "expired" | "rejected";
  createdAt: string;
  expiresAt: string;
  redeemedAt?: string;
};
