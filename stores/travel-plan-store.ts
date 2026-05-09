import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface TravelPlan {
  id: string;
  name: string;
  description: string;
  attractionIds: string[];
  startDate: string;
  endDate: string;
  userId: string;
  createdAt: string;
  status: string;
  dayNumber: number;
}

interface TravelPlanState {
  plans: TravelPlan[];
  selectedPlan: TravelPlan | null;
  loading: boolean;
  setSelectedPlan: (p: TravelPlan | null) => void;
  addPlan: (plan: TravelPlan) => void;
  removePlan: (id: string) => void;
  addAttractionToPlan: (planId: string, attractionId: string) => void;
  removeAttractionFromPlan: (planId: string, attractionId: string) => void;
  fetchPlans: (userId: string) => Promise<void>;
  createPlan: (userId: string, name: string, description: string, startDate: string, endDate: string) => Promise<TravelPlan | null>;
  deletePlan: (planId: string) => Promise<void>;
}

export const useTravelPlanStore = create<TravelPlanState>((set, get) => ({
  plans: [],
  selectedPlan: null,
  loading: false,

  setSelectedPlan: (selectedPlan) => set({ selectedPlan }),

  addPlan: (plan) => set((s) => ({ plans: [...(s.plans || []), plan] })),
  removePlan: (id) => set((s) => ({ plans: (s.plans || []).filter((p) => p.id !== id) })),

  addAttractionToPlan: (planId, attractionId) =>
    set((s) => ({
      plans: (s.plans || []).map((p) =>
        p.id === planId ? { ...p, attractionIds: [...(p.attractionIds || []), attractionId] } : p
      ),
    })),

  removeAttractionFromPlan: (planId, attractionId) =>
    set((s) => ({
      plans: (s.plans || []).map((p) =>
        p.id === planId
          ? { ...p, attractionIds: (p.attractionIds || []).filter((a) => a !== attractionId) }
          : p
      ),
    })),

  fetchPlans: async (userId: string) => {
    set({ loading: true });
    try {
      const { data: planRows, error } = await supabase
        .from('travel_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) { set({ loading: false }); return; }

      const planIds = (planRows || []).map((p) => p.plan_id);

      const { data: detailRows } = await supabase
        .from('travel_plan_details')
        .select('plan_id, attraction_id')
        .in('plan_id', planIds.length > 0 ? planIds : ['00000000-0000-0000-0000-000000000000']);

      const detailMap: Record<string, string[]> = {};
      (detailRows || []).forEach((d) => {
        if (!detailMap[d.plan_id]) detailMap[d.plan_id] = [];
        detailMap[d.plan_id].push(d.attraction_id);
      });

      const plans: TravelPlan[] = (planRows || []).map((row) => ({
        id: row.plan_id,
        name: row.plan_name,
        description: row.description || '',
        attractionIds: detailMap[row.plan_id] || [],
        startDate: row.d_start || '',
        endDate: row.d_end || '',
        userId: row.user_id,
        createdAt: new Date(row.created_at).toISOString().split('T')[0],
        status: row.status || 'plan',
        dayNumber: row.day_number || 1,
      }));

      set({ plans, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createPlan: async (userId, name, description, startDate, endDate) => {
    try {
      const { data, error } = await supabase
        .from('travel_plans')
        .insert({
          user_id: userId,
          plan_name: name,
          description,
          d_start: startDate || null,
          d_end: endDate || null,
          status: 'plan',
        })
        .select('*')
        .single();

      if (error || !data) return null;

      const plan: TravelPlan = {
        id: data.plan_id,
        name: data.plan_name,
        description: data.description || '',
        attractionIds: [],
        startDate: data.d_start || '',
        endDate: data.d_end || '',
        userId: data.user_id,
        createdAt: new Date(data.created_at).toISOString().split('T')[0],
        status: data.status || 'plan',
        dayNumber: data.day_number || 1,
      };

      set((s) => ({ plans: [plan, ...(s.plans || [])] }));
      return plan;
    } catch {
      return null;
    }
  },

  deletePlan: async (planId: string) => {
    try {
      await supabase.from('travel_plans').delete().eq('plan_id', planId);
      set((s) => ({ plans: (s.plans || []).filter((p) => p.id !== planId) }));
    } catch { /* ignore */ }
  },
}));
