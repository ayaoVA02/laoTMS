import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';

export interface Attraction {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  category: string;
  location: string;
  coordinates: [number, number];
  images: string[];
  videos: string[];
  rating: number;
  reviewCount: number;
  price: number;
  openTime: string;
  closeTime: string;
  facilities: string[];
  status: 'approved' | 'pending' | 'draft';
  featured: boolean;
  createdAt: string;
  entrepreneurId: string;
  entrepreneurName: string;
  socialShare: boolean;
  hasParking: boolean;
  isFreeParking: boolean;
  parkingPrice: number;
  hasRestaurant: boolean;
  hasAccommodation: boolean;
  accPrice: number;
  hasInternet: boolean;
  isFreeWifi: boolean;
  isFreeEntry: boolean;
  bestTimeVisit: string;
  activity: string;
  province: string;
  district: string;
  village: string;
  typeId: string;
  nameLa: string;
  thumbnailImage: string;
}

function mapAttraction(row: Record<string, unknown>, images: string[] = [], videos: string[] = []): Attraction {
  const facilities: string[] = [];
  if (row.has_parking) facilities.push('Parking');
  if (row.is_free_parking) facilities.push('Free Parking');
  if (row.has_restaurant) facilities.push('Restaurant');
  if (row.has_accommodation) facilities.push('Accommodation');
  if (row.has_internet) facilities.push('Internet');
  if (row.is_free_wifi) facilities.push('Free WiFi');
  if (row.is_free_entry) facilities.push('Free Entry');
  if (row.activity) {
    (row.activity as string).split(',').forEach((a: string) => {
      const trimmed = a.trim();
      if (trimmed && !facilities.includes(trimmed)) facilities.push(trimmed);
    });
  }

  return {
    id: row.attraction_id as string,
    name: row.name_en as string,
    nameLa: row.name_la as string,
    description: row.description as string,
    shortDescription: (row.description as string || '').substring(0, 80) + '...',
    category: row.type_id as string,
    location: row.location as string,
    coordinates: [Number(row.latitude) || 0, Number(row.longitude) || 0] as [number, number],
    images: images.length > 0 ? images : (row.thumbnail_image ? [row.thumbnail_image as string] : []),
    videos: videos.length > 0 ? videos : (row.video_url ? [row.video_url as string] : []),
    rating: Number(row.rating) || 0,
    reviewCount: Number(row.review_count) || 0,
    price: Number(row.entry_fee_foreigner) || 0,
    openTime: String(row.open_time || '08:00').substring(0, 5),
    closeTime: String(row.close_time || '17:00').substring(0, 5),
    facilities,
    status: row.status as 'approved' | 'pending' | 'draft',
    featured: Boolean(row.featured),
    createdAt: new Date(row.created_at as string).toISOString().split('T')[0],
    entrepreneurId: row.user_id as string,
    entrepreneurName: '',
    socialShare: Boolean(row.social_share),
    hasParking: Boolean(row.has_parking),
    isFreeParking: Boolean(row.is_free_parking),
    parkingPrice: Number(row.parking_price) || 0,
    hasRestaurant: Boolean(row.has_restaurant),
    hasAccommodation: Boolean(row.has_accommodation),
    accPrice: Number(row.acc_price) || 0,
    hasInternet: Boolean(row.has_internet),
    isFreeWifi: Boolean(row.is_free_wifi),
    isFreeEntry: Boolean(row.is_free_entry),
    bestTimeVisit: row.best_time_visit as string || '',
    activity: row.activity as string || '',
    province: row.province as string || '',
    district: row.district as string || '',
    village: row.village as string || '',
    typeId: row.type_id as string || '',
    thumbnailImage: row.thumbnail_image as string || '',
  };
}

interface AttractionState {
  attractions: Attraction[];
  filteredAttractions: Attraction[];
  selectedAttraction: Attraction | null;
  favorites: string[];
  searchQuery: string;
  selectedCategory: string;
  types: { id: string; name_en: string; name_la: string; icon: string, is_active: boolean }[];
  loading: boolean;
  setSelectedAttraction: (a: Attraction | null) => void;
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (c: string) => void;
  toggleFavorite: (id: string) => Promise<void>;
  filterAttractions: () => void;
  fetchAttractions: () => Promise<void>;
  fetchSingleAttraction: (id: string) => Promise<void>;
  fetchTypes: () => Promise<void>;
  fetchFavorites: (userId: string) => Promise<void>;
  addFavorite: (userId: string, attractionId: string) => Promise<void>;
  removeFavorite: (userId: string, attractionId: string) => Promise<void>;
}

export const useAttractionStore = create<AttractionState>((set, get) => ({
  attractions: [],
  filteredAttractions: [],
  selectedAttraction: null,
  favorites: [],
  searchQuery: '',
  selectedCategory: 'all',
  types: [],
  loading: false,

  setSelectedAttraction: (selectedAttraction) => set({ selectedAttraction }),
  setSearchQuery: (searchQuery) => {
    set({ searchQuery });
    get().filterAttractions();
  },
  setSelectedCategory: (selectedCategory) => {
    set({ selectedCategory });
    get().filterAttractions();
  },

  toggleFavorite: async (id) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const { favorites } = get();
    if (favorites.includes(id)) {
      await get().removeFavorite(user.id, id);
    } else {
      await get().addFavorite(user.id, id);
    }
  },

  filterAttractions: () => {
    const { attractions, searchQuery, selectedCategory } = get();
    let filtered = attractions;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((a) => a.category === selectedCategory || a.typeId === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.province.toLowerCase().includes(q)
      );
    }
    set({ filteredAttractions: filtered });
  },

  fetchAttractions: async () => {
    set({ loading: true });
    try {
      const { data: attractionRows, error } = await supabase
        .from('attractions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) { set({ loading: false }); return; }

      const { data: imageRows } = await supabase
        .from('attraction_images')
        .select('attraction_id, image_url, display_order')
        .order('display_order', { ascending: true });

      const imageMap: Record<string, string[]> = {};
      (imageRows || []).forEach((img) => {
        if (!imageMap[img.attraction_id]) imageMap[img.attraction_id] = [];
        imageMap[img.attraction_id].push(img.image_url);
      });

      const { data: videoRows } = await supabase
        .from('attraction_videos')
        .select('attraction_id, video_url');

      const videoMap: Record<string, string[]> = {};
      (videoRows || []).forEach((v) => {
        if (!videoMap[v.attraction_id]) videoMap[v.attraction_id] = [];
        videoMap[v.attraction_id].push(v.video_url);
      });

      // Then pass to mapAttraction:

      const { data: entrepreneurRows } = await supabase
        .from('entrepreneurs')
        .select('user_id, first_name, last_name');

      const nameMap: Record<string, string> = {};
      (entrepreneurRows || []).forEach((e) => {
        nameMap[e.user_id] = `${e.first_name} ${e.last_name}`.trim();
      });

      // const mapped = (attractionRows || []).map((row) => {
      //   const a = mapAttraction(row, imageMap[row.attraction_id] || []);
      //   a.entrepreneurName = nameMap[row.user_id] || 'Unknown';
      //   return a;
      // });

      const mapped = (attractionRows || []).map((row) => {
        const a = mapAttraction(
          row,
          imageMap[row.attraction_id] || [],
          videoMap[row.attraction_id] || []   // ← add this
        );
        a.entrepreneurName = nameMap[row.user_id] || 'Unknown';
        return a;
      });

      set({ attractions: mapped, filteredAttractions: mapped, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchSingleAttraction: async (attractionId: string) => {
    set({ loading: true });

    try {
      const { data: attractionRow, error } = await supabase
        .from('attractions')
        .select('*')
        .eq('attraction_id', attractionId)
        .single();

      if (error || !attractionRow) {
        console.error('Error fetching attraction rating:', error);
        set({ loading: false });
        return;
      }

      const { data: imageRows } = await supabase
        .from('attraction_images')
        .select('attraction_id, image_url, display_order')
        .eq('attraction_id', attractionId)
        .order('display_order', { ascending: true });

      const images = (imageRows || []).map((img) => img.image_url);


      const { data: videoRows } = await supabase
        .from('attraction_videos')
        .select('attraction_id, video_url')
        .eq('attraction_id', attractionId);
      const videos = (videoRows || []).map((video) => video.video_url);

      const updatedAttraction = mapAttraction(attractionRow, images, videos);

      set((state) => ({
        attractions: state.attractions.some((attraction) => attraction.id === attractionId)
          ? state.attractions.map((attraction) =>
            attraction.id === attractionId
              ? {
                ...updatedAttraction,
                entrepreneurName: attraction.entrepreneurName,
              }
              : attraction
          )
          : [updatedAttraction, ...state.attractions],
        filteredAttractions: state.filteredAttractions.some((attraction) => attraction.id === attractionId)
          ? state.filteredAttractions.map((attraction) =>
            attraction.id === attractionId
              ? {
                ...updatedAttraction,
                entrepreneurName: attraction.entrepreneurName,
              }
              : attraction
          )
          : [updatedAttraction, ...state.filteredAttractions],
        selectedAttraction:
          state.selectedAttraction?.id === attractionId
            ? {
              ...updatedAttraction,
              entrepreneurName: state.selectedAttraction.entrepreneurName,
            }
            : updatedAttraction,
        loading: false,
      }));
    } catch (err) {
      console.error('Exception fetching attraction rating:', err);
      set({ loading: false });
    }
  },

  fetchTypes: async () => {
    try {
      const { data } = await supabase.from('types').select('*').eq('is_active', true).order('name_en');
      if (data) {
        set({ types: data.map((t) => ({ id: t.type_id, name_en: t.name_en, name_la: t.name_la, icon: t.type_icon, is_active: t.is_active })) });
      }
    } catch { /* ignore */ }
  },

  fetchFavorites: async (userId: string) => {
    try {
      const { data } = await supabase.from('favorites').select('attraction_id').eq('user_id', userId);
      if (data) {
        set({ favorites: data.map((f) => f.attraction_id) });
      }
    } catch { /* ignore */ }
  },

  addFavorite: async (userId: string, attractionId: string) => {
    try {
      await supabase.from('favorites').insert({ user_id: userId, attraction_id: attractionId });
      set((s) => ({ favorites: [...s.favorites, attractionId] }));
    } catch { /* ignore */ }
  },

  removeFavorite: async (userId: string, attractionId: string) => {
    try {
      await supabase.from('favorites').delete().eq('user_id', userId).eq('attraction_id', attractionId);
      set((s) => ({ favorites: s.favorites.filter((f) => f !== attractionId) }));
    } catch { /* ignore */ }
  },
}));
