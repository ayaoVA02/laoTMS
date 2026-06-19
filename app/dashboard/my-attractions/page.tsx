"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Star, MapPin, Edit, Trash2, Share2, Plus,
  Clock, DollarSign, Wifi, Car, Utensils, BedDouble,
  RefreshCw, AlertCircle, ImageOff,
  CheckCircle2, XCircle, Timer, FileEdit,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { Attraction } from "@/data/attractions";

// ─── Types ────────────────────────────────────────────────────────────────────

// ─── Constants ────────────────────────────────────────────────────────────────
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL_IMAGE || "";

function resolveImage(f?: string | null) {
  if (!f) return "";
  if (f.startsWith("http")) return f;
  return `${IMAGE_BASE_URL}${f.startsWith("/") ? f.substring(1) : f}`;
}

// ─── Status config ─────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
    dot: "bg-emerald-500",
  },
  pending: {
    label: "Pending Review",
    icon: Timer,
    className: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    dot: "bg-amber-500",
  },
  draft: {
    label: "Draft",
    icon: FileEdit,
    className: "bg-slate-500/15 text-slate-600 border-slate-500/30",
    dot: "bg-slate-400",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-red-500/15 text-red-600 border-red-500/30",
    dot: "bg-red-500",
  },
};

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, count, color, icon: Icon }: {
  label: string; count: number; color: string; icon: React.ElementType;
}) {
  return (
    <Card className="border-0 shadow-md text-center overflow-hidden relative">
      <div className={`absolute inset-x-0 top-0 h-0.5 ${color}`} />
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-center mb-1">
          <Icon className={`w-4 h-4 ${color.replace("bg-", "text-")}`} />
        </div>
        <p className={`text-2xl sm:text-3xl font-bold ${color.replace("bg-", "text-")}`}>{count}</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{label}</p>


        
      </CardContent>
    </Card>
  );
}

// ─── Facility pill ────────────────────────────────────────────────────────────
function FacilityPill({ icon: Icon, label, active }: {
  icon: React.ElementType; label: string; active: boolean;
}) {
  if (!active) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-teal-500/10 text-teal-600 border border-teal-500/20">
      <Icon className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}

// ─── Attraction card ──────────────────────────────────────────────────────────
function AttractionCard({
  attraction,
  onDelete,
  onToggleSocial,
  onEdit,
}: {
  attraction: Attraction;
  onDelete: (id: string) => void;
  onToggleSocial: (id: string, current: boolean) => void;
  onEdit: (id: string) => void;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const status = STATUS_CONFIG[attraction.status] ?? STATUS_CONFIG.draft;
  const StatusIcon = status.icon;

  const onConfirmDelete = async () => {
    setDeleting(true);
    await onDelete(attraction.attraction_id);
    setDeleting(false);
    setShowConfirm(false);
  };

  const handleToggle = async () => {
    setToggling(true);
    await onToggleSocial(attraction.attraction_id, attraction.social_share);
    setToggling(false);
  };

  return (
    <>
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
    >
      {/* Thumbnail */}
      <div className="w-full sm:w-16 sm:h-16 h-36 rounded-xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/15 flex items-center justify-center shrink-0 overflow-hidden">
        {attraction.thumbnailUrl ? (
          <img
            src={attraction.thumbnailUrl}
            alt={attraction.name_en}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
         <ImageOff className="w-6 h-6 text-teal-500/40" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start gap-2 flex-wrap">
          <p className="text-sm font-semibold leading-tight">{attraction.name_en}</p>
          <Badge variant="outline" className={`${status.className} text-[10px] flex items-center gap-1 shrink-0`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </Badge>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          {(attraction.province || attraction.location) && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" />
              {attraction.province || attraction.location}
            </span>
          )}
          {attraction.rating > 0 && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              {attraction.rating.toFixed(1)}
              <span className="text-muted-foreground/60">({attraction.review_count})</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 shrink-0" />
            {attraction.open_time?.slice(0, 5)} – {attraction.close_time?.slice(0, 5)}
          </span>
          {attraction.type_name && (
            <span className="px-1.5 py-0.5 rounded bg-muted text-[10px]">{attraction.type_name}</span>
          )}
        </div>

        {/* Facility pills */}
        <div className="flex flex-wrap gap-1">
          <FacilityPill icon={Car} label="Parking" active={attraction.has_parking} />
          <FacilityPill icon={Wifi} label="WiFi" active={attraction.has_internet} />
          <FacilityPill icon={Utensils} label="Food" active={attraction.has_restaurant} />
          <FacilityPill icon={BedDouble} label="Stay" active={attraction.has_accommodation} />
          <FacilityPill icon={DollarSign} label="Free Entry" active={attraction.is_free_entry} />
        </div>

        <p className="text-xs text-muted-foreground/60">
          Added {new Date(attraction.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 shrink-0">
        {/* Social share toggle */}
        <div className="flex items-center gap-1.5">
          <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
          <Switch
            checked={attraction.social_share}
            onCheckedChange={handleToggle}
            disabled={toggling}
            className="scale-90"
          />
        </div>

        {/* Edit / Delete */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-teal-500"
            onClick={() => onEdit(attraction.attraction_id)}
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-red-500"
            onClick={() => setShowConfirm(true)}
            disabled={deleting}
            title="Delete"
          >
            {deleting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </motion.div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete <strong>{attraction.name_en}</strong>?
              <br />
              This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={onConfirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function MyAttractionsPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => { setMounted(true); }, []);

  // ── Fetch user's attractions ─────────────────────────────────────────────
  const fetchAttractions = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
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

      if (fetchError) throw fetchError;

      const mapped: Attraction[] = (data || []).map((row: any) => ({
        ...row,
        type_name: row.types?.name_en ?? "",
        thumbnailUrl: resolveImage(row.thumbnail_image),
      }));

      setAttractions(mapped);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Failed to load attractions");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (mounted && user?.id) fetchAttractions();
  }, [mounted, user?.id, fetchAttractions]);

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("attractions")
        .delete()
        .eq("attraction_id", id)
        .eq("user_id", user!.id); // extra safety: own rows only

      if (error) throw error;
      setAttractions(prev => prev.filter(a => a.attraction_id !== id));
      toast.success("Attraction deleted");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete");
    }
  };

  // ── Toggle social share ──────────────────────────────────────────────────
  const handleToggleSocial = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from("attractions")
        .update({ social_share: !current })
        .eq("attraction_id", id)
        .eq("user_id", user!.id);

      if (error) throw error;
      setAttractions(prev =>
        prev.map(a => a.attraction_id === id ? { ...a, social_share: !current } : a)
      );
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update");
    }
  };

  // ── Navigate to edit ─────────────────────────────────────────────────────
  const handleEdit = (id: string) => {
    router.push(`/dashboard/my-attractions/edit/${id}`);
  };

  // ── Filtered list ────────────────────────────────────────────────────────
  const filtered = statusFilter === "all"
    ? attractions
    : attractions.filter(a => a.status === statusFilter);

  // ── Summary counts ───────────────────────────────────────────────────────
  const counts = {
    total: attractions.length,
    approved: attractions.filter(a => a.status === "approved").length,
    pending: attractions.filter(a => a.status === "pending").length,
    draft: attractions.filter(a => a.status === "draft").length,
    rejected: attractions.filter(a => a.status === "rejected").length,
  };

  if (!mounted) return null;

  return (
    <DashboardLayout
      title={t("sidebar.myAttractions", "My Attractions")}
      subtitle="Manage your submitted attractions"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4 sm:space-y-5 max-w-4xl mx-auto pb-10"
      >

        {/* ── Summary stats ──────────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="grid grid-cols-4 gap-2 sm:gap-3">
          <StatCard label="Total" count={counts.total} color="bg-teal-500" icon={Building2} />
          <StatCard label="Approved" count={counts.approved} color="bg-emerald-500" icon={CheckCircle2} />
          <StatCard label="Pending" count={counts.pending} color="bg-amber-500" icon={Timer} />
          <StatCard label="Draft" count={counts.draft} color="bg-slate-400" icon={FileEdit} />
        </motion.div>

        {/* ── List card ──────────────────────────────────────────────────── */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-teal-500" />
                  My Attractions
                  {!loading && (
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      ({filtered.length})
                    </span>
                  )}
                </CardTitle>

                <div className="flex items-center gap-2">
                  {/* Refresh */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={fetchAttractions}
                    disabled={loading}
                    title="Refresh"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  </Button>

                  {/* Create new */}
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white shadow-sm shrink-0"
                    onClick={() => router.push("/dashboard/create-attraction")}
                  >
                    <Plus className="w-4 h-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">Create New</span>
                  </Button>
                </div>
              </div>

              {/* Status filter tabs */}
              {attractions.length > 0 && (
                <div className="flex gap-1.5 flex-wrap mt-3">
                  {(["all", "approved", "pending", "draft", "rejected"] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        statusFilter === s
                          ? "bg-teal-500 text-white shadow-sm"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {s === "all" ? `All (${counts.total})` : `${STATUS_CONFIG[s].label} (${counts[s]})`}
                    </button>
                  ))}
                </div>
              )}
            </CardHeader>

            <CardContent className="pt-4">
              {/* Loading */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <RefreshCw className="w-8 h-8 text-teal-500 animate-spin" />
                  <p className="text-sm text-muted-foreground">Loading your attractions...</p>
                </div>
              )}

              {/* Error */}
              {!loading && error && (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                  <AlertCircle className="w-10 h-10 text-red-400" />
                  <p className="text-sm text-muted-foreground">{error}</p>
                  <Button size="sm" variant="outline" onClick={fetchAttractions}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Retry
                  </Button>
                </div>
              )}

              {/* Empty */}
              {!loading && !error && attractions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-teal-500/60" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">No attractions yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submit your first attraction to get started
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
                    onClick={() => router.push("/dashboard/attractions/create")}
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> Create Attraction
                  </Button>
                </div>
              )}

              {/* No results for filter */}
              {!loading && !error && attractions.length > 0 && filtered.length === 0 && (
                <div className="py-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    No {statusFilter} attractions found.
                  </p>
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="text-xs text-teal-500 mt-1 hover:underline"
                  >
                    Show all
                  </button>
                </div>
              )}

              {/* List */}
              {!loading && !error && filtered.length > 0 && (
                <AnimatePresence mode="popLayout">
                  <div className="space-y-3">
                    {filtered.map(a => (
                      <AttractionCard
                        key={a.attraction_id}
                        attraction={a}
                        onDelete={handleDelete}
                        onToggleSocial={handleToggleSocial}
                        onEdit={handleEdit}
                      />
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}