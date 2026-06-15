

import { createBrowserClient } from '@supabase/ssr'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase Environment Variables')
}
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // บังคับให้จำ Session ไว้ใน Storage (สำคัญสำหรับ Production)
    autoRefreshToken: true, // ให้ต่ออายุ Access Token อัตโนมัติเมื่อหมดอายุ
    detectSessionInUrl: true // จำเป็นสำหรับการทำ Google Login (OAuth)
  }
},

);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          user_id: string;
          email: string;
          password_hash: string;
          role: 'ADMIN' | 'STAFF' | 'ENTREPRENEUR' | 'TOURIST';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id?: string;
          email: string;
          password_hash: string;
          role?: 'ADMIN' | 'STAFF' | 'ENTREPRENEUR' | 'TOURIST';
          is_active?: boolean;
        };
        Update: {
          email?: string;
          password_hash?: string;
          role?: 'ADMIN' | 'STAFF' | 'ENTREPRENEUR' | 'TOURIST';
          is_active?: boolean;
        };
      };
      entrepreneurs: {
        Row: {
          en_id: string;
          user_id: string;
          position: string;
          first_name: string;
          last_name: string;
          gender: 'MALE' | 'FEMALE';
          profile_img: string;
          phone: string;
          nationality: string;
          province: string;
          district: string;
          village: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          en_id?: string;
          user_id: string;
          position?: string;
          first_name?: string;
          last_name?: string;
          gender?: 'MALE' | 'FEMALE';
          profile_img?: string;
          phone?: string;
          nationality?: string;
          province?: string;
          district?: string;
          village?: string;
        };
      };
      tourists: {
        Row: {
          tourist_id: string;
          user_id: string;
          preferences: string;
          first_name: string;
          last_name: string;
          gender: 'MALE' | 'FEMALE';
          profile_img: string;
          phone: string;
          nationality: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          tourist_id?: string;
          user_id: string;
          preferences?: string;
          first_name?: string;
          last_name?: string;
          gender?: 'MALE' | 'FEMALE';
          profile_img?: string;
          phone?: string;
          nationality?: string;
        };
      };
      staffs: {
        Row: {
          staff_id: string;
          user_id: string;
          staff_code: string;
          first_name: string;
          last_name: string;
          gender: 'MALE' | 'FEMALE';
          profile_img: string;
          phone: string;
          nationality: string;
          province: string;
          district: string;
          village: string;
          status: 'active' | 'inactive' | 'suspended';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          staff_id?: string;
          user_id: string;
          staff_code?: string;
          first_name?: string;
          last_name?: string;
          gender?: 'MALE' | 'FEMALE';
          profile_img?: string;
          phone?: string;
          nationality?: string;
          province?: string;
          district?: string;
          village?: string;
          status?: 'active' | 'inactive' | 'suspended';
        };
      };
      types: {
        Row: {
          type_id: string;
          name_la: string;
          name_en: string;
          description: string;
          type_icon: string;
          type_image: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      attractions: {
        Row: {
          attraction_id: string;
          user_id: string;
          type_id: string;
          name_la: string;
          name_en: string;
          thumbnail_image: string;
          description: string;
          vdo_reviews: string;
          province: string;
          district: string;
          village: string;
          latitude: number | null;
          longitude: number | null;
          location: string;
          entry_fee_foreigner: number;
          best_time_visit: string;
          has_parking: boolean;
          is_free_parking: boolean;
          parking_price: number;
          has_restaurant: boolean;
          has_accommodation: boolean;
          acc_price: number;
          has_internet: boolean;
          is_free_wifi: boolean;
          is_free_entry: boolean;
          open_time: string;
          close_time: string;
          status: 'draft' | 'pending' | 'approved';
          activity: string;
          license: string;
          social_share: boolean;
          rating: number;
          review_count: number;
          featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          attraction_id?: string;
          user_id: string;
          type_id?: string;
          name_la?: string;
          name_en: string;
          thumbnail_image?: string;
          description?: string;
          vdo_reviews?: string;
          province?: string;
          district?: string;
          village?: string;
          latitude?: number;
          longitude?: number;
          location?: string;
          entry_fee_foreigner?: number;
          best_time_visit?: string;
          has_parking?: boolean;
          is_free_parking?: boolean;
          parking_price?: number;
          has_restaurant?: boolean;
          has_accommodation?: boolean;
          acc_price?: number;
          has_internet?: boolean;
          is_free_wifi?: boolean;
          is_free_entry?: boolean;
          open_time?: string;
          close_time?: string;
          status?: 'draft' | 'pending' | 'approved';
          activity?: string;
          license?: string;
          social_share?: boolean;
          rating?: number;
          review_count?: number;
          featured?: boolean;
        };
        Update: {
          name_la?: string;
          name_en?: string;
          thumbnail_image?: string;
          description?: string;
          province?: string;
          district?: string;
          village?: string;
          latitude?: number;
          longitude?: number;
          location?: string;
          entry_fee_foreigner?: number;
          best_time_visit?: string;
          has_parking?: boolean;
          is_free_parking?: boolean;
          parking_price?: number;
          has_restaurant?: boolean;
          has_accommodation?: boolean;
          acc_price?: number;
          has_internet?: boolean;
          is_free_wifi?: boolean;
          is_free_entry?: boolean;
          open_time?: string;
          close_time?: string;
          status?: 'draft' | 'pending' | 'approved';
          activity?: string;
          social_share?: boolean;
          rating?: number;
          review_count?: number;
          featured?: boolean;
        };
      };
      attraction_images: {
        Row: {
          image_id: string;
          attraction_id: string;
          image_url: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          image_id?: string;
          attraction_id: string;
          image_url: string;
          display_order?: number;
        };
      };
      reviews: {
        Row: {
          review_id: string;
          user_id: string;
          attraction_id: string;
          rating: number;
          content: string;
          created_at: string;
        };
        Insert: {
          review_id?: string;
          user_id: string;
          attraction_id: string;
          rating?: number;
          content?: string;
        };
      };
      travel_plans: {
        Row: {
          plan_id: string;
          user_id: string;
          plan_name: string;
          description: string;
          d_start: string | null;
          d_end: string | null;
          status: 'plan' | 'progress' | 'done' | 'reject';
          day_number: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          plan_id?: string;
          user_id: string;
          plan_name: string;
          description?: string;
          d_start?: string;
          d_end?: string;
          status?: 'plan' | 'progress' | 'done' | 'reject';
          day_number?: number;
        };
      };
      travel_plan_details: {
        Row: {
          detail_id: string;
          plan_id: string;
          attraction_id: string;
          day_number: number;
          visit_order: number;
          created_at: string;
        };
        Insert: {
          detail_id?: string;
          plan_id: string;
          attraction_id: string;
          day_number?: number;
          visit_order?: number;
        };
      };
      favorites: {
        Row: {
          favorite_id: string;
          user_id: string;
          attraction_id: string;
          created_at: string;
        };
        Insert: {
          favorite_id?: string;
          user_id: string;
          attraction_id: string;
        };
      };
      promotions: {
        Row: {
          promotion_id: string;
          user_id: string;
          attraction_id: string;
          title: string;
          type: 'Free' | 'fixed' | 'percentage';
          price: number;
          d_start: string | null;
          d_end: string | null;
          image: string;
          children: number;
          adult: number;
          is_active: boolean;
          uses_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          promotion_id?: string;
          user_id: string;
          attraction_id: string;
          title: string;
          type?: 'Free' | 'fixed' | 'percentage';
          price?: number;
          d_start?: string;
          d_end?: string;
          image?: string;
          children?: number;
          adult?: number;
          is_active?: boolean;
          uses_count?: number;
        };
      };
      notifications: {
        Row: {
          notification_id: string;
          user_id: string;
          type: 'approved' | 'rejected' | 'update_reminder' | 'auto_hidden' | 'social_post' | 'info';
          title: string;
          message: string;
          read: boolean;
          related_id: string;
          created_at: string;
        };
        Insert: {
          notification_id?: string;
          user_id: string;
          type: 'approved' | 'rejected' | 'update_reminder' | 'auto_hidden' | 'social_post' | 'info';
          title: string;
          message?: string;
          read?: boolean;
          related_id?: string;
        };
        Update: {
          read?: boolean;
        };
      };
    };
  };
};
