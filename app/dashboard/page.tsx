"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Menu, User, ShieldCheck, Users, Briefcase, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth-store";
import { useTravelPlanStore } from "@/stores/travel-plan-store";
import { useAttractionStore } from "@/stores/attraction-store";
import { attractions, type Attraction } from "@/data/attractions";
import Sidebar from "@/components/layout/sidebar";
import { useAppStore, type ViewMode } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

import AdminDashboard from "./admin-dashboard/page";
import StaffDashboard from "./staff-dashboard/page";
import EntrepreneurDashboard from "./entrepreneur-dashboard/page";
import TouristDashboard from "./tourist-dashboard/page";

interface ReviewItem {
  id: string;
  attractionName: string;
  rating: number;
  content: string;
  createdAt: string;
}

const roleLabel: Record<string, { label: string; icon: React.ElementType }> = {
  ADMIN:        { label: "Admin Dashboard",        icon: ShieldCheck },
  STAFF:        { label: "Staff Dashboard",         icon: Users      },
  ENTREPRENEUR: { label: "Entrepreneur Dashboard",  icon: Briefcase  },
  TOURIST:      { label: "Traveler Dashboard",      icon: User       },
};

const CAN_SWITCH = ["ADMIN", "STAFF", "ENTREPRENEUR"];

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();
  const { setSidebarOpen, viewMode, setViewMode, touristTab, setTouristTab } = useAppStore();
  const { favorites = [] } = useAttractionStore();
  const { plans = [] } = useTravelPlanStore();
  const role = user?.role || "TOURIST";

  // Local viewMode state — kept in sync with the store
  const [localViewMode, setLocalViewMode] = useState<ViewMode>("ROLE");

  const [localAttractions, setLocalAttractions] = useState<Attraction[]>(attractions || []);
  const [socialShareStates, setSocialShareStates] = useState<Record<string, boolean>>(() =>
    (attractions || []).reduce(
      (acc, a) => ({ ...acc, [a.attraction_id]: !!a.social_share }),
      {} as Record<string, boolean>,
    ),
  );
  
  // Fixed state initialization syntax error here
  const [myReviews, setMyReviews] = useState<ReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Load saved mode from localStorage on mount, sync to store
  useEffect(() => {
    if (typeof window !== "undefined" && user?.id) {
      const savedMode = localStorage.getItem(`laotms_view_mode_${user.id}`);
      if (savedMode === "ROLE" || savedMode === "TOURIST") {
        setLocalViewMode(savedMode);
        setViewMode(savedMode);
      }
    }
  }, [user?.id, setViewMode]);

  const handleViewModeChange = (mode: ViewMode) => {
    setLocalViewMode(mode);
    setViewMode(mode); // sync to store so sidebar reads it
    if (mode === "TOURIST") {
      setTouristTab("overview"); // reset tab when switching to tourist view
    }
    if (typeof window !== "undefined" && user?.id) {
      localStorage.setItem(`laotms_view_mode_${user.id}`, mode);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !user?.id) { 
      setMyReviews([]); 
      return; 
    }

    const fetchMyReviews = async () => {
      setReviewsLoading(true);
      const { data: reviewRows, error } = await supabase
        .from("reviews")
        .select("review_id, attraction_id, rating, content, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch reviews:", error);
        setMyReviews([]);
        setReviewsLoading(false);
        return;
      }

      const attractionIds = Array.from(new Set((reviewRows || []).map((r) => r.attraction_id)));
      const attractionNames: Record<string, string> = {};

      if (attractionIds.length > 0) {
        const { data: attractionRows, error: aErr } = await supabase
          .from("attractions")
          .select("attraction_id, name_en")
          .in("attraction_id", attractionIds);
          
        if (aErr) console.error("Failed to fetch attraction names:", aErr);
        (attractionRows || []).forEach((a) => { attractionNames[a.attraction_id] = a.name_en; });
      }

      setMyReviews(
        (reviewRows || []).map((r) => ({
          id: r.review_id,
          attractionName: attractionNames[r.attraction_id] || "Unknown Attraction",
          rating: Number(r.rating) || 0,
          content: r.content || "No comment provided.",
          createdAt: r.created_at || "",
        })),
      );
      setReviewsLoading(false);
    };

    fetchMyReviews();
  }, [isAuthenticated, user?.id]);

  const handleDeleteAttraction = (id: string) =>
    setLocalAttractions((prev) => prev.filter((a) => a.attraction_id !== id));

  const handleEditAttraction = (updated: Attraction) =>
    setLocalAttractions((prev) =>
      prev.map((a) => a.attraction_id === updated.attraction_id ? updated : a)
    );

  const handleToggleSocialShare = (id: string) =>
    setSocialShareStates((prev) => ({ ...prev, [id]: !prev[id] }));

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Welcome to LaoTMS Dashboard</h2>
          <p className="text-sm text-muted-foreground mb-6">Sign in to access your personalized dashboard.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
              <a href="/auth/login">Sign In</a>
            </Button>
            <Button asChild variant="outline" className="border-teal-500/30 text-teal-600 hover:bg-teal-500/10">
              <a href="/auth/register">Create Account</a>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const canSwitch = CAN_SWITCH.includes(role);
  const activeView = canSwitch ? localViewMode : "ROLE";
  const myAttractions = localAttractions.filter(() => role === "ENTREPRENEUR");

  const renderContent = () => {
    if (activeView === "TOURIST") {
      return (
        <TouristDashboard
          plansCount={plans.length}
          favoritesCount={favorites.length}
          myReviews={myReviews}
          reviewsLoading={reviewsLoading}
          activeTab={touristTab}
          onTabChange={setTouristTab}
        />
      );
    }
    switch (role) {
      case "ADMIN":
        return <AdminDashboard attractionsCount={localAttractions.length} />;
      case "STAFF":
        return <StaffDashboard />;
      case "ENTREPRENEUR":
        return (
          <EntrepreneurDashboard
            myAttractions={myAttractions}
            socialShareStates={socialShareStates}
            onToggleSocialShare={handleToggleSocialShare}
            onDeleteAttraction={handleDeleteAttraction}
            onEditAttraction={handleEditAttraction}
          />
        );
      default:
        return (
          <TouristDashboard
            plansCount={plans.length}
            favoritesCount={favorites.length}
            myReviews={myReviews}
            reviewsLoading={reviewsLoading}
            activeTab={touristTab}
            onTabChange={setTouristTab}
          />
        );
    }
  };

  const RoleIcon = roleLabel[role]?.icon ?? User;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20">
      {/* Passing activeView ensures your custom Sidebar correctly watches and re-renders navigation matching this view */}
      <Sidebar viewMode={activeView} />

      <div className="lg:pl-[264px] transition-all duration-300">
        <main className="p-3 sm:p-4 lg:p-8 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-4 sm:mb-6 lg:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0 flex flex-col gap-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">
                  {t("dashboard.title")}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                  <RoleIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Welcome back, <strong>{user?.name || "Guest"}</strong> ({roleLabel[role]?.label})
                  </span>
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                {canSwitch && (
                  <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border shadow-sm">
                    <Button
                      variant={activeView === "ROLE" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handleViewModeChange("ROLE")}
                      className={`text-xs gap-1.5 px-3 py-1.5 rounded-lg h-8 font-medium transition-all ${
                        activeView === "ROLE"
                          ? "bg-white dark:bg-slate-800 shadow-sm text-foreground hover:bg-white dark:hover:bg-slate-800"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <RoleIcon className="w-3.5 h-3.5 shrink-0" />
                      <span className="hidden md:inline">Management</span>
                    </Button>
                    <Button
                      variant={activeView === "TOURIST" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handleViewModeChange("TOURIST")}
                      className={`text-xs gap-1.5 px-3 py-1.5 rounded-lg h-8 font-medium transition-all ${
                        activeView === "TOURIST"
                          ? "bg-teal-500 text-white shadow-sm hover:bg-teal-600"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5 shrink-0" />
                      <span>Traveler View</span>
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="lg:hidden relative h-9 w-9 rounded-xl"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {activeView === "TOURIST" && canSwitch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-4 sm:mb-6"
              >
                <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-teal-500/5 border border-teal-500/20 text-teal-700 dark:text-teal-400 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 shrink-0" />
                    <span>You are currently simulating the traveler platform workspace experience.</span>
                  </div>
                  <button
                    onClick={() => handleViewModeChange("ROLE")}
                    className="text-xs font-semibold underline underline-offset-2 hover:no-underline shrink-0"
                  >
                    Return to Management
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* Replaced invalid <motion.key> element with correct <motion.div> layout container */}
            <motion.div
              key={activeView === "TOURIST" ? `tourist-${touristTab}` : activeView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}