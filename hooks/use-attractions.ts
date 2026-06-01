import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { supabase } from "@/lib/supabase";
import { Attraction } from "@/data/attractions";

const R2_BASE = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL;

function resolveImage(filename: string | null | undefined): string {
  if (!filename) return "";
  if (filename.startsWith("http")) return filename;
  return `${R2_BASE}/attractions/images/${filename}`;
}

interface UseAttractionsOptions {
  statusFilter?: "approved" | "pending" | "draft" | "rejected";
}

export function useAttractions(opts: UseAttractionsOptions = {}) {
  const { user } = useAuthStore();
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("attractions")
        .select(`
          attraction_id, name_en, name_la, description,
          province, district, location,
          thumbnail_image, rating, review_count, status,
          social_share, has_parking, has_restaurant,
          has_accommodation, has_internet, is_free_entry,
          entry_fee_foreigner, open_time, close_time, created_at,
          types ( name_en )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (opts.statusFilter) {
        query = query.eq("status", opts.statusFilter);
      }

      const { data, error: err } = await query;
      if (err) throw err;

      setAttractions(
        (data || []).map((row: any) => ({
          ...row,
          type_name: row.types?.name_en ?? "",
          thumbnailUrl: resolveImage(row.thumbnail_image),
        }))
      );
    } catch (e: any) {
      setError(e?.message ?? "Failed to load attractions");
    } finally {
      setLoading(false);
    }
  }, [user?.id, opts.statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  return { attractions, loading, error, refetch: fetch };
}