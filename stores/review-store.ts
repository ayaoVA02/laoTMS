import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';

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
  submitReview: (id: string, content: string, rating?: number) => Promise<{ success: boolean }>;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: [],
  averageRating: 0,
  loading: false,
  submitting: false,

  fetchReviews: async (attractionId: string) => {
    set({ loading: true });
    try {
      console.log('Fetching reviews for attraction:', attractionId);
      
      // First check if attractionId is valid
      if (!attractionId || attractionId.trim() === '') {
        console.error('Invalid attractionId');
        set({ reviews: [], averageRating: 0, loading: false });
        return;
      }

      const { data, error } = await supabase
        .from('reviews')
        .select('review_id, user_id, attraction_id, rating, content, created_at')
        .eq('attraction_id', attractionId)
        .order('created_at', { ascending: false });

      console.log('Reviews query result:', { data, error });

      if (error) {
        console.error('Error fetching reviews - Details:', {
          code: error.code,
          message: error.message,
          details: error.details,
        });
        
        // If RLS error, try with minimal select
        if (error.code === 'PGRST301' || error.message?.includes('permission')) {
          console.warn('RLS policy may be blocking access. Attempting alternative query...');
          const { data: altData, error: altError } = await supabase
            .from('reviews')
            .select('*', { count: 'exact' })
            .eq('attraction_id', attractionId);
          
          if (altError) {
            console.error('Alternative query also failed:', altError);
            set({ reviews: [], averageRating: 0, loading: false });
            return;
          }
          
          const altMapped: Review[] = (altData || []).map((row: any) => ({
            id: row.review_id,
            userId: row.user_id,
            userName: `User ${row.user_id.substring(0, 8)}`,
            userAvatar: '',
            rating: row.rating !== null ? Number(row.rating) : undefined,
            content: row.content || '',
            createdAt: row.created_at,
            attractionId: row.attraction_id,
          }));
          
          const withRating = altMapped.filter(r => r.rating !== undefined);
          const avg = withRating.length > 0 
            ? withRating.reduce((a, b) => a + (b.rating || 0), 0) / withRating.length 
            : 0;
          
          set({ reviews: altMapped, averageRating: Number(avg.toFixed(2)), loading: false });
          return;
        }
        
        set({ reviews: [], averageRating: 0, loading: false });
        return;
      }

      // Map reviews
      const mapped: Review[] = (data || []).map((row: any) => ({
        id: row.review_id,
        userId: row.user_id,
        userName: `User ${row.user_id.substring(0, 8)}`,
        userAvatar: '',
        rating: row.rating !== null ? Number(row.rating) : undefined,
        content: row.content || '',
        createdAt: row.created_at,
        attractionId: row.attraction_id,
      }));

      console.log('Mapped reviews count:', mapped.length);

      // Calculate average rating
      const withRating = mapped.filter(r => r.rating !== undefined);
      const avg = withRating.length > 0 
        ? withRating.reduce((a, b) => a + (b.rating || 0), 0) / withRating.length 
        : 0;
      
      console.log('Average rating:', avg);
      
      set({ reviews: mapped, averageRating: Number(avg.toFixed(2)), loading: false });
    } catch (err) {
      console.error('Exception in fetchReviews:', err);
      set({ reviews: [], averageRating: 0, loading: false });
    }
  },

  submitReview: async (attractionId: string, content: string, rating?: number) => {
    const authState = useAuthStore.getState();
    const user = authState.user;
    
    if (!user?.id) {
      console.error('No authenticated user');
      return { success: false };
    }

    set({ submitting: true });

    try {
      const { error } = await supabase
        .from('reviews')
        .insert([{
          user_id: user.id,
          attraction_id: attractionId,
          rating: rating ?? null,
          content: content || '',
        }]);

      if (error) {
        console.error('Error submitting review:', error);
        set({ submitting: false });
        return { success: false };
      }

      // Refetch reviews after successful submit
      await get().fetchReviews(attractionId);
      set({ submitting: false });
      return { success: true };
    } catch (err) {
      console.error('Exception submitting review:', err);
      set({ submitting: false });
      return { success: false };
    }
  }
}));