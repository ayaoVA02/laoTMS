"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Eye,
  MapPin,
  Building2,
  Star,
  X,
  ImageIcon,
  Video,
  Navigation,
  RefreshCw,
  BadgeCheck,
  AlertTriangle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/shared/dashboard-layout";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getR2Url } from "@/lib/upload";
const IMAGE= process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL_IMAGE
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

type AttractionStatus = "pending" | "approved" | "rejected" | "draft" | string;

type AttractionListItem = {
  attraction_id: string;
  user_id: string;
  type_id: string | null;
  name_en: string | null;
  name_la: string | null;
  description: string | null;
  province: string | null;
  district: string | null;
  village: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  open_time: string | null;
  close_time: string | null;
  entry_fee_foreigner: number | null;
  is_free_entry: boolean | null;
  best_time_visit: string | null;
  activity: string | null;
  license: string | null;
  thumbnail_image: string | null;
  vdo_reviews: string | null;
  social_share: boolean | null;
  has_parking: boolean | null;
  is_free_parking: boolean | null;
  parking_price: number | null;
  has_restaurant: boolean | null;
  has_accommodation: boolean | null;
  acc_price: number | null;
  has_internet: boolean | null;
  is_free_wifi: boolean | null;
  rating: number | null;
  review_count: number | null;
  featured: boolean | null;
  status: AttractionStatus;
  created_at: string | null;
};

type MediaState = {
  images: string[];
  videos: string[];
  loading: boolean;
};

const statusBadge: Record<string, string> = {
  approved: "bg-emerald-500/15 text-emerald-600 border-emerald-500/25",
  pending: "bg-amber-500/15 text-amber-600 border-amber-500/25",
  rejected: "bg-red-500/15 text-red-600 border-red-500/25",
};

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return String(dateStr);
  return d.toISOString().split("T")[0];
}

function buildFacilities(a: AttractionListItem) {
  const facilities: string[] = [];
  if (a.has_parking) facilities.push("Parking");
  if (a.is_free_parking) facilities.push("Free Parking");
  if (a.parking_price && a.parking_price > 0) facilities.push(`Parking: ${a.parking_price.toLocaleString()} LAK`);
  if (a.has_restaurant) facilities.push("Restaurant / Food");
  if (a.has_accommodation) facilities.push("Accommodation");
  if (a.acc_price && a.acc_price > 0) facilities.push(`Accommodation: ${a.acc_price.toLocaleString()} LAK`);
  if (a.has_internet) facilities.push("Internet / WiFi");
  if (a.is_free_wifi) facilities.push("Free WiFi");
  if (a.is_free_entry) facilities.push("Free Entry");
  if (a.activity) {
    a.activity
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((x) => {
        if (!facilities.includes(x)) facilities.push(x);
      });
  }
  return facilities;
}

export default function ApproveAttractionsPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [filterStatus, setFilterStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [search, setSearch] = useState("");

  const [rows, setRows] = useState<AttractionListItem[]>([]);
  const [entrepreneurNameMap, setEntrepreneurNameMap] = useState<Record<string, string>>({});
  const [typeNameMap, setTypeNameMap] = useState<Record<string, string>>({});

  const [selected, setSelected] = useState<AttractionListItem | null>(null);
  const [media, setMedia] = useState<MediaState>({ images: [], videos: [], loading: false });

  useEffect(() => setMounted(true), []);

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0 };
    rows.forEach((r) => {
      if (r.status === "pending") c.pending += 1;
      else if (r.status === "approved") c.approved += 1;
      else if (r.status === "rejected") c.rejected += 1;
    });
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows
      .filter((r) => r.status === filterStatus)
      .filter((r) => {
        if (!q) return true;
        const name = (r.name_en || "").toLowerCase();
        const nameLa = (r.name_la || "").toLowerCase();
        const location = (r.location || "").toLowerCase();
        const province = (r.province || "").toLowerCase();
        return name.includes(q) || nameLa.includes(q) || location.includes(q) || province.includes(q);
      });
  }, [rows, filterStatus, search]);

  const loadList = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("attractions")
        .select(
          "attraction_id, user_id, type_id, name_en, name_la, description, province, district, village, location, latitude, longitude, open_time, close_time, entry_fee_foreigner, is_free_entry, best_time_visit, activity, license, thumbnail_image, vdo_reviews, social_share, has_parking, is_free_parking, parking_price, has_restaurant, has_accommodation, acc_price, has_internet, is_free_wifi, rating, review_count, featured, status, created_at"
        )
        .neq("status", "draft")
        .order("created_at", { ascending: false });

      if (error) throw error;
      const list = (data || []) as AttractionListItem[];
      setRows(list);

      const userIds = Array.from(new Set(list.map((x) => x.user_id).filter(Boolean)));
      if (userIds.length > 0) {
        const { data: entrepreneurs } = await supabase
          .from("entrepreneurs")
          .select("user_id, first_name, last_name")
          .in("user_id", userIds);

        const map: Record<string, string> = {};
        (entrepreneurs || []).forEach((e: any) => {
          map[e.user_id] = `${e.first_name || ""} ${e.last_name || ""}`.trim() || e.user_id;
        });
        setEntrepreneurNameMap(map);
      }

      const typeIds = Array.from(new Set(list.map((x) => x.type_id).filter(Boolean))) as string[];
      if (typeIds.length > 0) {
        const { data: types } = await supabase.from("types").select("type_id, name_en").in("type_id", typeIds);
        const map: Record<string, string> = {};
        (types || []).forEach((tt: any) => (map[tt.type_id] = tt.name_en));
        setTypeNameMap(map);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Failed to load attractions");
    } finally {
      setLoading(false);
    }
  };

  const loadMedia = async (attractionId: string, thumb?: string | null, vdo?: string | null) => {
    setMedia({ images: [], videos: [], loading: true });
    try {
      const [{ data: imgRows }, { data: vidRows }] = await Promise.all([
        supabase
          .from("attraction_images")
          .select("image_url, display_order")
          .eq("attraction_id", attractionId)
          .order("display_order", { ascending: true }),
        supabase
          .from("attraction_videos")
          .select("video_url, display_order")
          .eq("attraction_id", attractionId)
          .order("display_order", { ascending: true }),
      ]);

      const imageUrls = [
        ...(thumb ? [thumb] : []),
        ...((imgRows || []) as any[]).map((x) => x.image_url).filter(Boolean),
      ].filter((x, idx, arr) => arr.indexOf(x) === idx);

      const videoUrls = [
        ...(vdo ? [vdo] : []),
        ...((vidRows || []) as any[]).map((x) => x.video_url).filter(Boolean),
      ].filter((x, idx, arr) => arr.indexOf(x) === idx);

      setMedia({ images: imageUrls, videos: videoUrls, loading: false });
    } catch (err) {
      console.error(err);
      setMedia({ images: thumb ? [thumb] : [], videos: vdo ? [vdo] : [], loading: false });
    }
  };

  const handleSelect = async (row: AttractionListItem) => {
    setSelected(row);
    await loadMedia(row.attraction_id, row.thumbnail_image, row.vdo_reviews);
  };

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      // Step 1: Update attraction status — pending → approved or rejected
      const { error } = await supabase
        .from("attractions")
        .update({ status })
        .eq("attraction_id", id);
      if (error) throw error;

      // Step 2: Insert notification for the entrepreneur
      const targetRow = rows.find((r) => r.attraction_id === id);
      if (targetRow) {
        const nameStr = targetRow.name_en || targetRow.name_la || "Your attraction submission";
        await supabase.from("notifications").insert({
          user_id: targetRow.user_id,
          type: status === "approved" ? "approved" : "rejected",
          title: status === "approved" ? "Submission Approved! 🎉" : "Submission Rejected",
          message:
            status === "approved"
              ? `Your listing "${nameStr}" is now verified and active for public viewing.`
              : `Your listing "${nameStr}" did not meet our verification standards.`,
          read: false,
          related_id: id,
        });
      }

      // Step 3: If approved, check social row — only post to Facebook if facebook = true
      if (status === "approved") {
        try {
          const { data: socialData } = await supabase
            .from("social")
            .select("s_id, facebook")
            .eq("attraction_id", id)
            .maybeSingle();

          if (socialData?.s_id && socialData.facebook === true) {
            // Both conditions met: status = approved AND facebook = true → post
            toast.loading("Publishing to Facebook...", { id: "fb-sync" });

            const fbRes = await fetch("/api/social/publish", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ s_id: socialData.s_id }),
            });

            const fbData = await fbRes.json();
            if (fbRes.ok && fbData.success) {
              toast.success("Approved and posted to Facebook!", { id: "fb-sync" });
            } else {
              toast.error(`Approved, but Facebook post failed: ${fbData.error}`, { id: "fb-sync" });
            }
          } else {
            // facebook = false or no social row — approve only, no FB post needed
            toast.success("Approved successfully");
          }
        } catch (fbErr: any) {
          console.error("Facebook publish error:", fbErr);
          toast.error("Approved, but Facebook sync failed.", { id: "fb-sync" });
        }
      } else {
        toast.success("Rejected successfully");
      }

      // Step 4: Sync local UI state
      setRows((prev) =>
        prev.map((r) => (r.attraction_id === id ? { ...r, status } : r))
      );
      if (selected?.attraction_id === id) {
        setSelected((p) => (p ? { ...p, status } : p));
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Failed to update status");
    }
  };

  useEffect(() => {
    if (!mounted) return;
    if (!user) return;
    if (user.role !== "STAFF" && user.role !== "ADMIN") return;
    loadList();
  }, [mounted, user?.id, user?.role]);

  useEffect(() => {
    setSelected(null);
    setMedia({ images: [], videos: [], loading: false });
  }, [filterStatus]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadList();
    setRefreshing(false);
  };

  if (!mounted) return null;

  if (!user) {
    return (
      <DashboardLayout title={t("sidebar.approveAttractions")} subtitle="Review and approve submitted attractions">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            Please login as staff to approve attractions.
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (user.role !== "STAFF" && user.role !== "ADMIN") {
    return (
      <DashboardLayout title={t("sidebar.approveAttractions")} subtitle="Review and approve submitted attractions">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            Only staff can access this page.
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t("sidebar.approveAttractions")} subtitle="Review and approve submitted attractions">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">

        {/* Status filter cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: "pending" as const, label: "Pending", count: counts.pending, icon: Clock, color: "text-amber-500" },
            { key: "approved" as const, label: "Approved", count: counts.approved, icon: CheckCircle, color: "text-emerald-500" },
            { key: "rejected" as const, label: "Rejected", count: counts.rejected, icon: AlertTriangle, color: "text-red-500" },
          ].map((s) => {
            const IconComponent = s.icon;
            return (
              <motion.div key={s.key} variants={itemVariants}>
                <Card
                  className={`border-0 shadow-md text-center cursor-pointer hover:shadow-lg transition-all ${
                    filterStatus === s.key ? "ring-2 ring-teal-500 bg-teal-500/5" : ""
                  }`}
                  onClick={() => setFilterStatus(s.key)}
                >
                  <CardContent className="p-3 sm:p-4">
                    <IconComponent className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 ${s.color}`} />
                    <p className="text-lg sm:text-2xl font-bold">{s.count}</p>
                    <p className="text-[10px] sm:text-sm text-muted-foreground">{s.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Master-Detail layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 items-start">

          {/* Left: List */}
          <motion.div variants={itemVariants} className="lg:col-span-2 h-full">
            <Card className="border-0 shadow-md flex flex-col h-full min-h-[450px]">
              <CardHeader className="pb-3 border-b">
                <div className="flex flex-col gap-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-teal-500" />
                    {filterStatus[0].toUpperCase() + filterStatus.slice(1)} ({filtered.length})
                  </CardTitle>
                  <div className="flex items-center gap-2 w-full">
                    <div className="relative flex-1">
                      <Input
                        placeholder="Search name / location / province..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9 text-sm w-full"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 px-3 shrink-0"
                      onClick={handleRefresh}
                      disabled={refreshing || loading}
                      title="Refresh"
                    >
                      <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-1 overflow-y-auto max-h-[600px]">
                {loading ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">Loading...</div>
                ) : filtered.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">No attractions found.</div>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {filtered.map((a) => (
                        <motion.div
                          key={a.attraction_id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            selected?.attraction_id === a.attraction_id
                              ? "border-teal-500 bg-teal-500/5 shadow-sm"
                              : "bg-card hover:border-teal-500/30 border-transparent"
                          }`}
                          onClick={() => handleSelect(a)}
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/20 flex items-center justify-center shrink-0 overflow-hidden">
                            {a.thumbnail_image ? (
                              <img src={IMAGE+a.thumbnail_image} alt={a.name_en || ""} className="w-full h-full object-cover" />
                            ) : (
                              <Building2 className="w-4 h-4 text-teal-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium truncate max-w-[140px]">{a.name_en || a.name_la || "Untitled"}</p>
                              <Badge variant="outline" className={`${statusBadge[String(a.status)] || ""} text-[9px] px-1 py-0`}>
                                {String(a.status)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="text-xs truncate max-w-[100px]">{a.location || "-"}</span>
                              <span className="text-muted-foreground/40 mx-0.5">•</span>
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                              <span className="text-xs font-medium text-foreground">{Number(a.rating || 0).toFixed(1)}</span>
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 shrink-0 hover:bg-teal-500/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelect(a);
                            }}
                          >
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right: Detail */}
          <motion.div variants={itemVariants} className="lg:col-span-3 h-full">
            <Card className="border-0 shadow-md overflow-hidden min-h-[450px] flex flex-col">
              {selected ? (
                <>
                  <CardHeader className="pb-3 border-b bg-muted/10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="text-base sm:text-lg font-semibold truncate">
                          {selected.name_en || selected.name_la || "Untitled"}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          Submitted: {formatDate(selected.created_at)}
                          {entrepreneurNameMap[selected.user_id] ? ` • ${entrepreneurNameMap[selected.user_id]}` : ""}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full shrink-0"
                        onClick={() => setSelected(null)}
                        title="Close"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-[10px]">
                        Type: {selected.type_id ? typeNameMap[selected.type_id] || selected.type_id : "-"}
                      </Badge>
                      <Badge variant="outline" className={`${statusBadge[String(selected.status)] || ""} text-[10px]`}>
                        {String(selected.status)}
                      </Badge>
                      {selected.featured && (
                        <Badge variant="outline" className="text-[10px] bg-teal-500/10 border-teal-500/25 text-teal-600">
                          <BadgeCheck className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 sm:p-5 space-y-5 flex-1 overflow-y-auto">

                    {/* Media */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Media Files</h4>
                        {media.loading && (
                          <span className="text-[10px] text-muted-foreground animate-pulse">Loading files...</span>
                        )}
                      </div>
                      {media.images.length === 0 && media.videos.length === 0 ? (
                        <div className="p-6 rounded-xl bg-muted/30 border border-dashed text-center text-xs text-muted-foreground">
                          <ImageIcon className="w-6 h-6 mx-auto mb-2 text-muted-foreground/40" />
                          No media attached to this submission.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {media.images.length > 0 && (
                            <div>
                              <div className="flex items-center gap-1.5 text-xs font-medium mb-2 text-muted-foreground">
                                <ImageIcon className="w-3.5 h-3.5 text-teal-500" />
                                Images ({media.images.length})
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {media.images.slice(0, 9).map((img) => (
                                  <div key={img} className="rounded-xl overflow-hidden border bg-muted aspect-[4/3] hover:opacity-90 transition-opacity">
                                    <img src={IMAGE+img} alt="" className="w-full h-full object-cover" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {media.videos.length > 0 && (
                            <div>
                              <div className="flex items-center gap-1.5 text-xs font-medium mb-2 text-muted-foreground">
                                <Video className="w-3.5 h-3.5 text-teal-500" />
                                Videos ({media.videos.length})
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {media.videos.slice(0, 4).map((v) => (
                                  <div key={v} className="rounded-xl overflow-hidden border bg-black shadow-inner">
                                    <video src={getR2Url(v)} controls className="w-full h-40 object-cover" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="bg-muted/20 p-3 rounded-xl border border-muted/40">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Description</h4>
                      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                        {selected.description || "No description provided."}
                      </p>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-muted/40 border border-muted/20">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Address / Direction</p>
                        <p className="text-sm font-semibold mt-0.5 line-clamp-2">{selected.location || "-"}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/40 border border-muted/20">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Province</p>
                        <p className="text-sm font-semibold mt-0.5 line-clamp-1">{selected.province || "-"}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/40 border border-muted/20">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Operating Hours</p>
                        <p className="text-sm font-semibold mt-0.5">
                          {String(selected.open_time || "08:00").substring(0, 5)} – {String(selected.close_time || "17:00").substring(0, 5)}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/40 border border-muted/20">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Entry Fee (Foreigner)</p>
                        <p className="text-sm font-semibold mt-0.5 text-teal-600 dark:text-teal-400">
                          {selected.is_free_entry ? "Free Entry" : `${Number(selected.entry_fee_foreigner || 0).toLocaleString()} LAK`}
                        </p>
                      </div>
                    </div>

                    {/* Coordinates */}
                    <div className="p-3 rounded-xl bg-muted/30 border border-muted/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Geographic Coordinates</div>
                        <div className="mt-1 font-mono text-xs text-foreground/80">
                          Lat: {selected.latitude ?? "-"} • Lng: {selected.longitude ?? "-"}
                        </div>
                      </div>
                      {typeof selected.latitude === "number" && typeof selected.longitude === "number" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs shrink-0 bg-background"
                          onClick={() => window.open(`https://maps.google.com/?q=${selected.latitude},${selected.longitude}`, "_blank")}
                        >
                          <Navigation className="w-3.5 h-3.5 mr-1.5 text-teal-500" />
                          Open Map
                        </Button>
                      )}
                    </div>

                    {/* Facilities */}
                    {buildFacilities(selected).length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Facilities & Activities</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {buildFacilities(selected).map((f) => (
                            <Badge key={f} variant="secondary" className="text-[10px] bg-muted hover:bg-muted font-normal text-muted-foreground border">
                              {f}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-3 pt-4 border-t mt-2">
                      <Button
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                        disabled={selected.status === "approved"}
                        onClick={() => updateStatus(selected.attraction_id, "approved")}
                      >
                        <CheckCircle className="w-4 h-4 mr-1.5" />
                        Approve Submission
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1 shadow-sm"
                        disabled={selected.status === "rejected"}
                        onClick={() => updateStatus(selected.attraction_id, "rejected")}
                      >
                        <AlertTriangle className="w-4 h-4 mr-1.5" />
                        Reject Submission
                      </Button>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex-1 flex flex-col items-center justify-center p-8 text-center my-auto min-h-[350px]">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 border">
                    <Eye className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-sm font-medium text-foreground">Select an attraction to view details</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                    Choose an item from the left pane. Default filter is set to Pending.
                  </p>
                </CardContent>
              )}
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}