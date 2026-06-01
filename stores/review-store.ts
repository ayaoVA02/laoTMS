import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { useAttractionStore } from '@/stores/attraction-store';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating?: number;
  content: string;
  createdAt: string;
  attractionId: string;
}

interface ReviewState {
  reviews: Review[];
  averageRating: number;
  loading: boolean;
  submitting: boolean;

  fetchReviews: (id: string) => Promise<void>;

  submitReview: (
    id: string,
    content: string,
    rating?: number
  ) => Promise<{ success: boolean }>;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: [],
  averageRating: 0,
  loading: false,
  submitting: false,

  fetchReviews: async (attractionId: string) => {
    set({ loading: true });

    try {
      if (!attractionId?.trim()) {
        console.error('Invalid attractionId');
        set({
          reviews: [],
          averageRating: 0,
          loading: false,
        });
        return;
      }

      const { data, error } = await supabase
        .from('reviews')
        .select(
          'review_id, user_id, attraction_id, rating, content, created_at'
        )
        .eq('attraction_id', attractionId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const mapped: Review[] = (data || []).map((row: any) => ({
        id: row.review_id,
        userId: row.user_id,
        userName: row.user_id
          ? `User ${row.user_id.slice(0, 8)}`
          : 'Anonymous',
        userAvatar: '',
        rating:
          row.rating !== null && row.rating !== undefined
            ? Number(row.rating)
            : undefined,
        content: row.content || '',
        createdAt: row.created_at,
        attractionId: row.attraction_id,
      }));

      const ratings = mapped
        .map((r) => r.rating)
        .filter((r): r is number => r !== undefined);

      const avg =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0;

      set({
        reviews: mapped,
        averageRating: Number(avg.toFixed(2)),
        loading: false,
      });
    } catch (err) {
      console.error('Error fetching reviews:', err);

      set({
        reviews: [],
        averageRating: 0,
        loading: false,
      });
    }
  },

  submitReview: async (
    attractionId: string,
    content: string,
    rating?: number
  ) => {
    const user = useAuthStore.getState().user;

    if (!user?.id) {
      console.error('No authenticated user');
      return { success: false };
    }

    set({ submitting: true });

    try {
      const { error: insertError } = await supabase
        .from('reviews')
        .insert([
          {
            user_id: user.id,
            attraction_id: attractionId,
            rating: rating ?? null,
            content: content || '',
          },
        ]);

      if (insertError) {
        throw insertError;
      }

      // Refresh reviews
      await get().fetchReviews(attractionId);

      // Update attraction stats
      const state = get();

      const { error: updateError } = await supabase
        .from('attractions')
        .update({
          rating: state.averageRating,
          review_count: state.reviews.filter(
            (r) => r.rating !== undefined
          ).length,
        })
        .eq('attraction_id', attractionId);

      if (updateError) {
        console.error(
          'Error updating attraction rating:',
          updateError
        );
      }

      await useAttractionStore
        .getState()
        .fetchSingleAttraction(attractionId);

      set({ submitting: false });

      return { success: true };
    } catch (err) {
      console.error('Error submitting review:', err);

      set({ submitting: false });

      return { success: false };
    }
  },
}));
