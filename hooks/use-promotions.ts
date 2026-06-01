import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export type PromotionType = "percentage" | "fixed";

export interface Promotion {
  promotion_id: string;
  user_id: string;
  attraction_id: string;
  title: string;
  type: PromotionType;
  price: number;
  d_start: string | null;
  d_end: string | null;
  image: string;
  children: number;
  adult: number;
  is_active: boolean;
  uses_count: number;
  created_at: string;
  // joined
  attraction_name?: string;
  attraction_thumbnail?: string;
}

export interface NewPromotion {
  attraction_id: string;
  title: string;
  type: PromotionType;
  price: number;
  adult: number;
  children: number;
  d_start: string;
  d_end: string;
}

export function usePromotions() {
  const { user } = useAuthStore();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("promotions")
        .select(`
          promotion_id, user_id, attraction_id, title, type,
          price, d_start, d_end, image, children, adult,
          is_active, uses_count, created_at,
          attractions ( name_en, thumbnail_image )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (err) throw err;

      const mapped: Promotion[] = (data || []).map((row: any) => ({
        ...row,
        attraction_name: row.attractions?.name_en ?? "",
        attraction_thumbnail: row.attractions?.thumbnail_image ?? "",
      }));

      setPromotions(mapped);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load promotions");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (payload: NewPromotion): Promise<boolean> => {
    console.log(payload);
    console.log(user?.id);
    if (!user?.id) return false;
    try {
      const { data, error: err } = await supabase
        .from("promotions")
        .insert({ ...payload, user_id: user.id })
        .select(`
          promotion_id, user_id, attraction_id, title, type,
          price, d_start, d_end, image, children, adult,
          is_active, uses_count, created_at,
          attractions ( name_en, thumbnail_image )
        `)
        .single();

      if (err) throw err;

      const mapped: Promotion = {
        ...data,
        attraction_name: (data as any).attractions?.name_en ?? "",
        attraction_thumbnail: (data as any).attractions?.thumbnail_image ?? "",
      };

      setPromotions((prev) => [mapped, ...prev]);
      toast.success("Promotion created");
      return true;
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to create promotion");
      return false;
    }
  };

  const toggle = async (id: string, current: boolean) => {
    try {
      const { error: err } = await supabase
        .from("promotions")
        .update({ is_active: !current })
        .eq("promotion_id", id)
        .eq("user_id", user!.id);
      if (err) throw err;
      setPromotions((prev) =>
        prev.map((p) => p.promotion_id === id ? { ...p, is_active: !current } : p)
      );
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update");
    }
  };

  const remove = async (id: string) => {
    try {
      const { error: err } = await supabase
        .from("promotions")
        .delete()
        .eq("promotion_id", id)
        .eq("user_id", user!.id);
      if (err) throw err;
      setPromotions((prev) => prev.filter((p) => p.promotion_id !== id));
      toast.success("Promotion deleted");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to delete");
    }
  };

  const counts = {
    active: promotions.filter((p) => p.is_active).length,
    inactive: promotions.filter((p) => !p.is_active).length,
    total: promotions.length,
  };

  return { promotions, loading, error, counts, refetch: fetch, create, toggle, remove };
}