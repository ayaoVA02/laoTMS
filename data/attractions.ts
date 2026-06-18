export interface Attraction {
  id: string;
  attraction_id: string;
  name_en: string;
  name_la: string;
  description: string;
  province: string;
  district: string;
  location: string;
  thumbnail_image: string;
  rating: number;
  review_count: number;
  status: "approved" | "pending" | "draft" | "rejected";
  social_share: boolean;
  has_parking: boolean;
  has_restaurant: boolean;
  has_accommodation: boolean;
  has_internet: boolean;
  is_free_entry: boolean;
  entry_fee_foreigner: number;
  open_time: string;
  close_time: string;
  created_at: string;
  type_name?: string;
  thumbnailUrl?: string;
  updated_at?: string;
  isSixmonthOld: boolean;

}

// ─── Constants ────────────────────────────────────────────────────────────────
export const PROVINCES = [
  "Vientiane Capital", "Phongsali", "Luang Namtha", "Oudomxay", "Bokeo",
  "Luang Prabang", "Huaphanh", "Xayabury", "Xieng Khouang", "Vientiane",
  "Borikhamxay", "Khammouane", "Savannakhet", "Saravane", "Sekong",
  "Champasack", "Attapeu", "Xaysomboun",
];

export const BEST_TIMES = [
  "All year round",
  "November to April (dry season)",
  "May to October (green season)",
  "December to February (cool season)",
  "March to May (hot season)",
];

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  uploadedUrl: string | null;
  uploading: boolean;
  error: boolean;
  isThumbnail: boolean;
}

export interface VideoItem {
  id: string;
  file: File;
  previewUrl: string;
  uploadedUrl: string | null;
  uploading: boolean;
  error: boolean;
}

export interface AttractionType {
  type_id: string;
  name_en: string;
}

