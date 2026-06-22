export type PGType =
  | "SINGLE_ROOM"
  | "DOUBLE_SHARING"
  | "TRIPLE_SHARING"
  | "DORMITORY"
  | "STUDIO"
  | "ENTIRE_FLAT";

export type GenderType = "BOYS" | "GIRLS" | "COED";

export type ListingStatus =
  | "PENDING"
  | "ACTIVE"
  | "INACTIVE"
  | "REJECTED"
  | "EXPIRED";

export interface ListingPhoto {
  id: number;
  url: string;
  publicId: string;
  caption?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface Amenity {
  id: number;
  name: string;
  slug: string;
  icon: string;
  category: string;
}

export interface City {
  id: number;
  name: string;
  slug: string;
  state: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface Locality {
  id: number;
  cityId: number;
  name: string;
  slug: string;
}

export interface ListingOwner {
  id: number;
  name: string;
  phone?: string;
  avatar?: string;
}

export interface Listing {
  id: number;
  uuid: string;
  slug: string;
  title: string;
  description: string;
  pgType: PGType;
  genderAllowed: GenderType;
  address: string;
  landmark?: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  priceMin: number;
  priceMax: number;
  securityDeposit?: number;
  foodIncluded: boolean;
  totalRooms?: number;
  availableRooms?: number;
  totalBeds?: number;
  availableBeds?: number;
  status: ListingStatus;
  isVerified: boolean;
  isFeatured: boolean;
  featuredUntil?: string;
  isActive: boolean;
  totalViews: number;
  totalLeads: number;
  totalReviews: number;
  avgRating: number;
  createdAt: string;
  updatedAt: string;
  owner: ListingOwner;
  city: City;
  locality?: Locality;
  photos: ListingPhoto[];
  amenities: Amenity[];
}

export interface ListingCard {
  id: number;
  slug: string;
  title: string;
  pgType: PGType;
  genderAllowed: GenderType;
  priceMin: number;
  priceMax: number;
  foodIncluded: boolean;
  availableRooms?: number;
  isVerified: boolean;
  isFeatured: boolean;
  avgRating: number;
  totalReviews: number;
  city: Pick<City, "name" | "slug">;
  locality?: Pick<Locality, "name" | "slug">;
  coverPhoto?: string;
  amenities: Pick<Amenity, "name" | "icon">[];
}

export interface SearchFilters {
  city?: string;
  locality?: string;
  gender?: GenderType;
  minPrice?: number;
  maxPrice?: number;
  pgType?: PGType;
  amenities?: string[];
  foodIncluded?: boolean;
  page: number;
  limit: number;
  sortBy: "price_asc" | "price_desc" | "newest" | "rating";
}

export interface PaginatedListings {
  data: ListingCard[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
