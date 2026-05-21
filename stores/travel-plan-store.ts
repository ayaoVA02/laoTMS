import { create } from "zustand";
import { supabase } from "@/lib/supabase";

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

  setSelectedPlan: (plan: TravelPlan | null) => void;
  addPlan: (plan: TravelPlan) => void;
  removePlan: (id: string) => void;

  addAttractionToPlan: (planId: string, attractionId: string) => Promise<void>;
  removeAttractionFromPlan: (planId: string, attractionId: string) => Promise<void>;

  fetchPlans: (userId: string) => Promise<void>;
  createPlan: (
    userId: string,
    name: string,
    description: string,
    startDate: string,
    endDate: string
  ) => Promise<TravelPlan | null>;

  deletePlan: (planId: string) => Promise<void>;
}

export const useTravelPlanStore = create<TravelPlanState>((set) => ({
  plans: [],
  selectedPlan: null,
  loading: false,

  setSelectedPlan: (selectedPlan) => set({ selectedPlan }),

  addPlan: (plan) =>
    set((state) => ({
      plans: [...state.plans, plan],
    })),

  removePlan: (id) =>
    set((state) => ({
      plans: state.plans.filter((p) => p.id !== id),
    })),

  addAttractionToPlan: async (planId, attractionId) => {
    try {
      const { error } = await supabase.from("travel_plan_details").insert({
        plan_id: planId,
        attraction_id: attractionId,
      });

      if (error) throw error;

      set((state) => ({
        plans: state.plans.map((plan) =>
          plan.id === planId
            ? {
                ...plan,
                attractionIds: Array.from(
                  new Set([...plan.attractionIds, attractionId])
                ),
              }
            : plan
        ),
      }));
    } catch (error) {
      console.error("addAttractionToPlan error:", error);
    }
  },

  removeAttractionFromPlan: async (planId, attractionId) => {
    try {
      const { error } = await supabase
        .from("travel_plan_details")
        .delete()
        .eq("plan_id", planId)
        .eq("attraction_id", attractionId);

      if (error) throw error;

      set((state) => ({
        plans: state.plans.map((plan) =>
          plan.id === planId
            ? {
                ...plan,
                attractionIds: plan.attractionIds.filter(
                  (id) => id !== attractionId
                ),
              }
            : plan
        ),
      }));
    } catch (error) {
      console.error("removeAttractionFromPlan error:", error);
    }
  },

  fetchPlans: async (userId) => {
    set({ loading: true });

    try {
      const { data: planRows, error } = await supabase
        .from("travel_plans")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!planRows?.length) {
        set({ plans: [], loading: false });
        return;
      }

      const planIds = planRows.map((p) => p.plan_id);

      const { data: detailRows, error: detailError } = await supabase
        .from("travel_plan_details")
        .select("plan_id, attraction_id")
        .in("plan_id", planIds);

      if (detailError) throw detailError;

      const detailMap: Record<string, string[]> = {};

      detailRows?.forEach((row) => {
        if (!detailMap[row.plan_id]) {
          detailMap[row.plan_id] = [];
        }
        detailMap[row.plan_id].push(row.attraction_id);
      });

      const plans: TravelPlan[] = planRows.map((row) => ({
        id: row.plan_id,
        name: row.plan_name,
        description: row.description ?? "",
        attractionIds: detailMap[row.plan_id] ?? [],
        startDate: row.d_start ?? "",
        endDate: row.d_end ?? "",
        userId: row.user_id,
        createdAt: row.created_at
          ? new Date(row.created_at).toISOString().split("T")[0]
          : "",
        status: row.status ?? "plan",
        dayNumber: row.day_number ?? 1,
      }));

      set({ plans, loading: false });
    } catch (error) {
      console.error("fetchPlans error:", error);
      set({ loading: false });
    }
  },

  createPlan: async (
    userId,
    name,
    description,
    startDate,
    endDate
  ) => {
    try {
      const { data, error } = await supabase
        .from("travel_plans")
        .insert({
          user_id: userId,
          plan_name: name,
          description,
          d_start: startDate || null,
          d_end: endDate || null,
          status: "plan",
        })
        .select()
        .single();

      if (error || !data) throw error;

      const plan: TravelPlan = {
        id: data.plan_id,
        name: data.plan_name,
        description: data.description ?? "",
        attractionIds: [],
        startDate: data.d_start ?? "",
        endDate: data.d_end ?? "",
        userId: data.user_id,
        createdAt: data.created_at
          ? new Date(data.created_at).toISOString().split("T")[0]
          : "",
        status: data.status ?? "plan",
        dayNumber: data.day_number ?? 1,
      };

      set((state) => ({
        plans: [plan, ...state.plans],
      }));

      return plan;
    } catch (error) {
      console.error("createPlan error:", error);
      return null;
    }
  },

  deletePlan: async (planId) => {
    try {
      const { error: detailError } = await supabase
        .from("travel_plan_details")
        .delete()
        .eq("plan_id", planId);

      if (detailError) throw detailError;

      const { error } = await supabase
        .from("travel_plans")
        .delete()
        .eq("plan_id", planId);

      if (error) throw error;

      set((state) => ({
        plans: state.plans.filter((p) => p.id !== planId),
      }));
    } catch (error) {
      console.error("deletePlan error:", error);
      throw error;
    }
  },
}));