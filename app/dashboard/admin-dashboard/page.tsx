"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, Variants } from "framer-motion";
import {
  BarChart3,
  Users,
  Building2,
  Star,
  Clock,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  UserCog,
  Briefcase,
  MapPin,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Framer Motion layout configurations
// ---------------------------------------------------------------------------
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface MonthPoint {
  month_label: string;
  month_start: string;
  attraction_count: number;
}

interface RoleCount {
  role: string;
  user_count: number;
}

interface ActivityItem {
  id: string;
  text: string;
  time: string;
  icon: React.ElementType;
  color: string;
  createdAt: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  up?: boolean;
  icon: React.ElementType;
  accent: string;
  loading?: boolean;
}

interface AdminDashboardProps {
  attractionsCount: number;
  reviewsCount?: number;
}

interface ReviewQueryResult {
  review_id: string;
  user_id: string;
  rating: number;
  content: string;
  created_at: string;
  attractions: {
    name_en: string;
  } | null;
}

// Top attractions ranked by a real combined signal (reviews + favorites),
// no fabricated change %.
interface LiveAttraction {
  attractionId: string;
  name: string;
  reviewCount: number;
  favoriteCount: number;
  combinedScore: number;
}

// Category breakdown grouped from attractions.type_id.
interface LiveCategory {
  category: string;
  count: number;
  pct: number;
  color: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const ROLE_DISPLAY: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  ADMIN: { label: "Admin", color: "bg-red-500", icon: ShieldAlert },
  STAFF: { label: "Staff", color: "bg-teal-500", icon: UserCog },
  ENTREPRENEUR: { label: "Entrepreneur", color: "bg-amber-500", icon: Briefcase },
  TOURIST: { label: "Tourist", color: "bg-sky-500", icon: MapPin },
};

const CATEGORY_COLORS = ["bg-amber-500", "bg-emerald-500", "bg-sky-500", "bg-rose-500", "bg-orange-500", "bg-slate-400"];

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------
const StatCard = ({ title, value, change, up, icon: Icon, accent, loading }: StatCardProps) => (
  <motion.div variants={itemVariants}>
    <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
      <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${accent}`} />
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0">
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{title}</p>
            {loading ? (
              <div className="h-7 w-14 rounded bg-muted animate-pulse" />
            ) : (
              <p className="text-xl sm:text-2xl font-bold tracking-tight">{value}</p>
            )}
          </div>
          <div className={`p-2 sm:p-2.5 rounded-xl bg-gradient-to-br ${accent} shadow-sm shrink-0`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>
        {change && (
          <div className="flex items-center gap-1 mt-2 sm:mt-3">
            {up ? (
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
            )}
            <span className={`text-xs sm:text-sm font-medium ${up ? "text-emerald-500" : "text-red-500"}`}>
              {change}
            </span>
            <span className="text-[10px] sm:text-xs text-muted-foreground ml-1">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function AdminDashboard({ attractionsCount, reviewsCount = 0 }: AdminDashboardProps) {
  const { t } = useTranslation();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [roleCounts, setRoleCounts] = useState<RoleCount[]>([]);
  const [roleCountsLoading, setRoleCountsLoading] = useState(true);
  const [roleCountsError, setRoleCountsError] = useState<string | null>(null);

  const [monthlyData, setMonthlyData] = useState<MonthPoint[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState<string | null>(null);

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  const [liveAttractionsCount, setLiveAttractionsCount] = useState<number>(attractionsCount);
  const [liveReviewsCount, setLiveReviewsCount] = useState<number>(reviewsCount);

  // Top attractions (reviews + favorites) and category breakdown — from code 1.
  const [topAttractions, setTopAttractions] = useState<LiveAttraction[]>([]);
  const [topAttractionsLoading, setTopAttractionsLoading] = useState(true);
  const [topAttractionsError, setTopAttractionsError] = useState<string | null>(null);

  const [categories, setCategories] = useState<LiveCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Verify authorization permissions securely
  useEffect(() => {
    async function checkAdminAuthorization() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        let user = session?.user;

        if (!user) {
          const { data: { user: fetchedUser } } = await supabase.auth.getUser();
          user = fetchedUser || undefined;
        }

        if (!user) {
          setIsAdmin(false);
          return;
        }

        const userRole = user.user_metadata?.role;
        setIsAdmin(userRole === "ADMIN");
      } catch (err) {
        console.error("Authorization verification error:", err);
        setIsAdmin(false);
      }
    }

    checkAdminAuthorization();
  }, []);

  // Role distribution via RPC
  const fetchRoleCounts = useCallback(async () => {
    setRoleCountsLoading(true);
    setRoleCountsError(null);
    const { data, error } = await supabase.rpc("get_user_role_counts");
    if (error) {
      console.error("get_user_role_counts error:", error);
      setRoleCountsError(error.message);
    } else {
      setRoleCounts(data ?? []);
    }
    setRoleCountsLoading(false);
  }, []);

  // Monthly attractions chart via RPC
  const fetchMonthlyAttractions = useCallback(async () => {
    setChartLoading(true);
    setChartError(null);
    const { data, error } = await supabase.rpc("get_attractions_per_month", { months_back: 8 });
    if (error) {
      console.error("get_attractions_per_month error:", error);
      setChartError(error.message);
    } else {
      setMonthlyData(data ?? []);
    }
    setChartLoading(false);
  }, []);

  // Live total summary metric updates
  const fetchLiveCounts = useCallback(async () => {
    const [attractionsRes, reviewsRes] = await Promise.all([
      supabase.from("attractions").select("*", { count: "exact", head: true }),
      supabase.from("reviews").select("*", { count: "exact", head: true }),
    ]);
    if (!attractionsRes.error && attractionsRes.count !== null) {
      setLiveAttractionsCount(attractionsRes.count);
    }
    if (!reviewsRes.error && reviewsRes.count !== null) {
      setLiveReviewsCount(reviewsRes.count);
    }
  }, []);

  // Hydrate activity feed with unique reviewer restrictions
  const fetchRecentActivity = useCallback(async () => {
    setActivityLoading(true);

    const [attractionsRes, reviewsRes, notificationsRes] = await Promise.all([
      supabase
        .from("attractions")
        .select("attraction_id, name_en, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("reviews")
        // Selected user_id along with foreign table layout name mapping
        .select("review_id, user_id, rating, content, created_at, attractions(name_en)")
        .order("created_at", { ascending: false })
        // Increased safety check limit buffer to filter out duplicates effectively
        .limit(12),
      supabase
        .from("notifications")
        .select("notification_id, title, message, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const items: ActivityItem[] = [];

    if (!attractionsRes.error && attractionsRes.data) {
      for (const a of attractionsRes.data) {
        items.push({
          id: `attraction-${a.attraction_id}`,
          text: `Attraction submitted: ${a.name_en} (${a.status})`,
          time: relativeTime(a.created_at),
          icon: Building2,
          color: a.status === "approved" ? "text-emerald-500" : "text-amber-500",
          createdAt: a.created_at,
        });
      }
    }

    if (!reviewsRes.error && reviewsRes.data) {
      const seenReviewers = new Set<string>();
      const parsedReviews = reviewsRes.data as unknown as ReviewQueryResult[];

      for (const r of parsedReviews) {
        // Enforce deduplication constraint per loop run cycle
        if (seenReviewers.has(r.user_id)) {
          continue;
        }
        seenReviewers.add(r.user_id);

        const attractionName = r.attractions?.name_en ? ` for ${r.attractions.name_en}` : "";
        const reviewSnippet = r.content && r.content.trim() !== ""
          ? ` ("${r.content.slice(0, 20)}...")`
          : "";

        items.push({
          id: `review-${r.review_id}`,
          text: `New ${r.rating}-star review submitted${attractionName}${reviewSnippet}`,
          time: relativeTime(r.created_at),
          icon: Star,
          color: "text-yellow-500",
          createdAt: r.created_at,
        });
      }
    }

    if (!notificationsRes.error && notificationsRes.data) {
      for (const n of notificationsRes.data) {
        items.push({
          id: `notification-${n.notification_id}`,
          text: n.title,
          time: relativeTime(n.created_at),
          icon: Activity,
          color: "text-teal-500",
          createdAt: n.created_at,
        });
      }
    }

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setActivities(items.slice(0, 6));
    setActivityLoading(false);
  }, []);

  // Top attractions ranked by reviews + favorites (real combined signal,
  // no fabricated multiplier). favorites has no per-attraction aggregate
  // column, so counts are aggregated client-side from the raw rows.
  const fetchTopAttractions = useCallback(async () => {
    setTopAttractionsLoading(true);
    setTopAttractionsError(null);

    const [attractionsRes, favoritesRes] = await Promise.all([
      supabase.from("attractions").select("attraction_id, review_count, name_en"),
      supabase.from("favorites").select("attraction_id"),
    ]);

    if (attractionsRes.error || favoritesRes.error) {
      const message = attractionsRes.error?.message || favoritesRes.error?.message || "Unknown error";
      console.error("fetchTopAttractions error:", message);
      setTopAttractionsError(message);
      setTopAttractionsLoading(false);
      return;
    }

    const attractionsData = attractionsRes.data ?? [];
    const favoritesData = favoritesRes.data ?? [];

    const favoriteCountByAttraction = new Map<string, number>();
    for (const fav of favoritesData) {
      if (!fav.attraction_id) continue;
      favoriteCountByAttraction.set(
        fav.attraction_id,
        (favoriteCountByAttraction.get(fav.attraction_id) ?? 0) + 1
      );
    }

    const ranked: LiveAttraction[] = attractionsData
      .map((a) => {
        const reviewCount = Number(a.review_count || 0);
        const favoriteCount = favoriteCountByAttraction.get(a.attraction_id) ?? 0;
        return {
          attractionId: a.attraction_id,
          name: a.name_en || "Unnamed Location",
          reviewCount,
          favoriteCount,
          combinedScore: reviewCount + favoriteCount,
        };
      })
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, 5);

    setTopAttractions(ranked);
    setTopAttractionsLoading(false);
  }, []);

  // Category breakdown grouped from attractions.type_id.
  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);

    const [attractionsRes, typesRes] = await Promise.all([
      supabase.from("attractions").select("attraction_id, type_id"),
      supabase.from("types").select("type_id, name_en"),
    ]);

    if (attractionsRes.error || typesRes.error) {
      const message = attractionsRes.error?.message || typesRes.error?.message || "Unknown error";
      console.error("fetchCategories error:", message);
      setCategoriesError(message);
      setCategoriesLoading(false);
      return;
    }

    const attractionsData = attractionsRes.data ?? [];
    const typesData = typesRes.data ?? [];
    const totalAttractions = attractionsData.length;

    const computed: LiveCategory[] = typesData
      .map((type, index) => {
        const matches = attractionsData.filter((a) => a.type_id === type.type_id).length;
        return {
          category: type.name_en || "Other",
          count: matches,
          pct: totalAttractions ? Math.round((matches / totalAttractions) * 100) : 0,
          color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
        };
      })
      .sort((a, b) => b.count - a.count);

    setCategories(computed);
    setCategoriesLoading(false);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    fetchRoleCounts();
    fetchMonthlyAttractions();
    fetchLiveCounts();
    fetchRecentActivity();
    fetchTopAttractions();
    fetchCategories();
  }, [
    isAdmin,
    fetchRoleCounts,
    fetchMonthlyAttractions,
    fetchLiveCounts,
    fetchRecentActivity,
    fetchTopAttractions,
    fetchCategories,
  ]);

  if (isAdmin === null) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-2">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">Verifying credentials...</p>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="flex h-[70vh] w-full flex-col items-center justify-center text-center p-6">
        <div className="p-4 bg-red-50 text-red-600 rounded-full mb-4 shadow-sm animate-pulse">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Access Denied</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          You do not have administrative clearance to access this platform module. Direct URL bypass requests are blocked.
        </p>
      </div>
    );
  }

  const roleDistribution = roleCounts.map((r) => {
    const key = r.role?.toUpperCase?.() ?? "UNKNOWN";
    const display = ROLE_DISPLAY[key] ?? { label: r.role || "Unknown", color: "bg-slate-400", icon: Users };
    return { role: display.label, count: r.user_count, color: display.color, icon: display.icon };
  });

  const totalRoleUsers = roleDistribution.reduce((sum, r) => sum + r.count, 0);
  const maxMonthlyValue = Math.max(1, ...monthlyData.map((d) => d.attraction_count));
  const highestCombinedScore = topAttractions[0]?.combinedScore || 1;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">System Management</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Monitor statistics and map system access levels.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          title={t("dashboard.totalAttractions")}
          value={liveAttractionsCount}
          icon={Building2}
          accent="from-teal-500 to-emerald-600"
        />
        <StatCard
          title={t("dashboard.totalUsers")}
          value={roleCountsLoading ? "—" : totalRoleUsers}
          loading={roleCountsLoading}
          icon={Users}
          accent="from-sky-500 to-blue-600"
        />
        <StatCard
          title={t("dashboard.totalReviews")}
          value={liveReviewsCount}
          icon={Star}
          accent="from-amber-500 to-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-500" />
                {t("dashboard.analytics")}
                <span className="text-xs font-normal text-muted-foreground ml-1">— new attractions / month</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartError ? (
                <p className="text-sm text-red-500">Couldn&apos;t load chart data: {chartError}</p>
              ) : chartLoading ? (
                <div className="flex items-end gap-1.5 sm:gap-2 h-36 sm:h-48">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex-1 rounded-t-md bg-muted animate-pulse" style={{ height: `${30 + (i % 4) * 15}%` }} />
                  ))}
                </div>
              ) : (
                <div className="flex items-end gap-1.5 sm:gap-2 h-36 sm:h-48">
                  {monthlyData.map((d, i) => {
                    const heightPercent = (d.attraction_count / maxMonthlyValue) * 100;
                    return (
                      <motion.div key={d.month_start} className="flex-1 flex flex-col items-center gap-1" style={{ height: "100%" }}>
                        <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">{d.attraction_count}</span>
                        <motion.div
                          className="w-full rounded-t-md bg-gradient-to-t from-teal-500 to-emerald-400"
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPercent}%` }}
                          transition={{ delay: 0.1 + i * 0.03, duration: 0.5, ease: "easeOut" }}
                          style={{ minHeight: 4 }}
                        />
                        <span className="text-[10px] sm:text-xs text-muted-foreground mt-auto">{d.month_label}</span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-500" />
                {t("dashboard.recentActivity")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4 max-h-[220px] overflow-y-auto pr-1">
                {activityLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-2 sm:gap-3">
                      <div className="mt-0.5 p-1 sm:p-1.5 rounded-lg bg-muted w-6 h-6 shrink-0 animate-pulse" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-full rounded bg-muted animate-pulse" />
                        <div className="h-2.5 w-1/3 rounded bg-muted animate-pulse" />
                      </div>
                    </div>
                  ))
                ) : activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent activity yet.</p>
                ) : (
                  activities.map((item) => (
                    <div key={item.id} className="flex items-start gap-2 sm:gap-3">
                      <div className={`mt-0.5 p-1 sm:p-1.5 rounded-lg bg-muted ${item.color} shrink-0`}>
                        <item.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm leading-snug line-clamp-2">{item.text}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{item.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Attractions + Category Breakdown — merged in from the analytics page */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-500" />
                Top Attractions
                <span className="text-xs font-normal text-muted-foreground ml-1">— reviews + favorites</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topAttractionsError ? (
                <p className="text-sm text-red-500">Couldn&apos;t load top attractions: {topAttractionsError}</p>
              ) : topAttractionsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-3 w-5 rounded bg-muted animate-pulse" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
                        <div className="h-1.5 w-full rounded-full bg-muted animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {topAttractions.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No attraction activity found.</p>
                  ) : (
                    topAttractions.map((a, i) => (
                      <div key={a.attractionId} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{a.name}</p>
                          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary mt-1">
                            <div
                              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500"
                              style={{ width: `${(a.combinedScore / highestCombinedScore) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold">{a.combinedScore.toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {a.reviewCount} reviews · {a.favoriteCount} saved
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-500" />
                Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoriesError ? (
                <p className="text-sm text-red-500">Couldn&apos;t load categories: {categoriesError}</p>
              ) : categoriesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                      <div className="h-2 w-full rounded-full bg-muted animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {categories.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No categories mapped.</p>
                  ) : (
                    categories.map((c) => (
                      <div key={c.category} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${c.color}`} />
                            <span className="text-sm font-medium">{c.category}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{c.count} ({c.pct}%)</span>
                        </div>
                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                          <div className={`h-full ${c.color} transition-all`} style={{ width: `${c.pct}%` }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-500" />
              User Distribution by Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            {roleCountsError ? (
              <p className="text-sm text-red-500">
                Couldn&apos;t load role counts: {roleCountsError}. Make sure the{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">get_user_role_counts</code> SQL function has
                been created in Supabase.
              </p>
            ) : roleCountsLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
                    <div className="h-2 w-full rounded-full bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            ) : roleDistribution.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users found.</p>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {roleDistribution.map((r) => (
                  <div key={r.role} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${r.color}`} />
                        <span className="text-xs sm:text-sm font-medium">{r.role}</span>
                      </div>
                      <span className="text-xs sm:text-sm text-muted-foreground">{r.count}</span>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all"
                        style={{ width: `${totalRoleUsers > 0 ? (r.count / totalRoleUsers) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}