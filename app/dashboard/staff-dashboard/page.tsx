"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Activity,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

type AttractionStatus = "pending" | "approved" | "rejected" | "draft" | string;

type AttractionListItem = {
  attraction_id: string;
  user_id: string;
  type_id: string | null;
  name_en: string | null;
  province: string | null;
  district: string | null;
  status: AttractionStatus;
  created_at: string | null;
  type_name?: string;
};

// ─── Variants ────────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

// ─── Badge map ───────────────────────────────────────────────────────────────

const statusBadgeMap: Record<string, { label: string; className: string }> = {
  approved: { label: "Approved", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/25" },
  pending:  { label: "Pending",  className: "bg-amber-500/15 text-amber-600 border-amber-500/25" },
  rejected: { label: "Rejected", className: "bg-red-500/15 text-red-600 border-red-500/25" },
  draft:    { label: "Draft",    className: "bg-slate-500/15 text-slate-600 border-slate-500/25" },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function StaffDashboard() {
  const { t } = useTranslation();

  const [rows, setRows]             = useState<AttractionListItem[]>([]);
  const [loading, setLoading]       = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ── Derived counts ──────────────────────────────────────────────────────

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0 };
    rows.forEach((r) => {
      if (r.status === "pending")       c.pending  += 1;
      else if (r.status === "approved") c.approved += 1;
      else if (r.status === "rejected") c.rejected += 1;
    });
    return c;
  }, [rows]);

  const pendingAttractions = useMemo(
    () => rows.filter((r) => r.status === "pending"),
    [rows]
  );

  const recentAttractions = useMemo(
    () =>
      rows
        .slice()
        .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
        .slice(0, 5),
    [rows]
  );

  // ── Data loading ────────────────────────────────────────────────────────

  const loadList = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("attractions")
        .select("attraction_id, user_id, type_id, name_en, province, district, status, created_at")
        .neq("status", "draft")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const list = (data ?? []) as AttractionListItem[];

      // Resolve type names
      const typeIds = Array.from(
        new Set(list.map((x) => x.type_id).filter(Boolean))
      ) as string[];

      let typeNameMap: Record<string, string> = {};
      if (typeIds.length > 0) {
        const { data: types } = await supabase
          .from("types")
          .select("type_id, name_en")
          .in("type_id", typeIds);
        (types ?? []).forEach((tt: any) => {
          typeNameMap[tt.type_id] = tt.name_en;
        });
      }

      setRows(
        list.map((item) => ({
          ...item,
          type_name: item.type_id ? typeNameMap[item.type_id] ?? undefined : undefined,
        }))
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Failed to load attractions");
    } finally {
      setLoading(false);
    }
  };

  // ── Status updates ──────────────────────────────────────────────────────

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("attractions")
        .update({ status })
        .eq("attraction_id", id);

      if (error) throw error;

      setRows((prev) =>
        prev.map((r) => (r.attraction_id === id ? { ...r, status } : r))
      );

      toast.success(status === "approved" ? "Approved" : "Rejected");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Failed to update status");
    }
  };

  const handleApprove = (id: string) => updateStatus(id, "approved");
  const handleReject  = (id: string) => updateStatus(id, "rejected");

  // ── Refresh ─────────────────────────────────────────────────────────────

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadList();
    setRefreshing(false);
  };

  // ── Effects ─────────────────────────────────────────────────────────────

  useEffect(() => {
    loadList();
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">

      {/* Pending Approvals counter + refresh */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-teal-500 to-emerald-600" />
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">{t("dashboard.pendingApprovals")}</p>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
                  {loading ? "—" : pendingAttractions.length}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9"
                  onClick={handleRefresh}
                  disabled={refreshing || loading}
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                </Button>
                <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-sm">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Approve / Reject queue */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-500" />
              {t("dashboard.approveAttractions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 sm:py-10 text-sm text-muted-foreground">
                Loading…
              </div>
            ) : pendingAttractions.length === 0 ? (
              <div className="text-center py-8 sm:py-10">
                <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">All attractions have been reviewed</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {pendingAttractions.map((attraction) => (
                  <motion.div
                    key={attraction.attraction_id}
                    layout
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow gap-3 sm:gap-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-semibold text-sm truncate">{attraction.name_en}</h4>
                        <Badge variant="outline" className={statusBadgeMap.pending.className}>
                          {t("attractions.pending")}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {attraction.province}
                        {attraction.district ? `, ${attraction.district}` : ""}
                        {attraction.type_name ? ` — ${attraction.type_name}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm"
                        onClick={() => handleApprove(attraction.attraction_id)}
                      >
                        <CheckCircle className="w-3.5 h-3.5 sm:mr-1" />
                        <span className="hidden sm:inline">Approve</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="text-xs sm:text-sm"
                        onClick={() => handleReject(attraction.attraction_id)}
                      >
                        <XCircle className="w-3.5 h-3.5 sm:mr-1" />
                        <span className="hidden sm:inline">Reject</span>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Status summary cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { title: "Approved", count: counts.approved, icon: CheckCircle, color: "text-emerald-500" },
          { title: "Pending",  count: counts.pending,  icon: Clock,        color: "text-amber-500"  },
          { title: "Rejected", count: counts.rejected, icon: XCircle,      color: "text-red-500"    },
        ].map((item) => (
          <motion.div key={item.title} variants={itemVariants}>
            <Card className="border-0 shadow-md text-center">
              <CardContent className="p-3 sm:p-5">
                <item.icon className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 ${item.color}`} />
                <p className="text-lg sm:text-2xl font-bold">
                  {loading ? "—" : item.count}
                </p>
                <p className="text-[10px] sm:text-sm text-muted-foreground">{item.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent submissions */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-500" />
              Recent Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-6 text-sm text-muted-foreground">Loading…</div>
            ) : recentAttractions.length === 0 ? (
              <div className="text-center py-6">
                <AlertTriangle className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No submissions yet</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {recentAttractions.map((a) => (
                  <div
                    key={a.attraction_id}
                    className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">
                        {a.name_en ?? "Untitled"}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        {a.province} —{" "}
                        {a.created_at
                          ? new Date(a.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : ""}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${statusBadgeMap[a.status]?.className ?? ""} text-[10px] sm:text-xs shrink-0`}
                    >
                      {statusBadgeMap[a.status]?.label ?? a.status}
                    </Badge>
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