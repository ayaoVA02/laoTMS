"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Building2, Search, Star, MapPin, Clock, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const baseURLImage = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL_IMAGE;

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const statusBadge: Record<string, string> = {
  approved: "bg-emerald-500/15 text-emerald-600 border-emerald-500/25",
  pending: "bg-amber-500/15 text-amber-600 border-amber-500/25",
  rejected: "bg-red-500/15 text-red-600 border-red-500/25",
};

type AttractionRow = {
  attraction_id: string;
  name_en: string | null;
  name_la: string | null;
  location: string | null;
  province: string | null;
  thumbnail_image: string | null;
  rating: number | null;
  status: "pending" | "approved" | "rejected" | string;
};

export default function DashboardAttractionsPage() {
  const { t } = useTranslation();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [rows, setRows] = useState<AttractionRow[]>([]);

  // Ref attached to the status filter container
  const filterAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    loadAttractions();
  }, [mounted]);

  // Outside click logic to refresh and reset filters
  useEffect(() => {
    if (!mounted) return;

    function handleOutsideClick(event: MouseEvent) {
      // If the click is outside the status summary filter cards wrapper
      if (filterAreaRef.current && !filterAreaRef.current.contains(event.target as Node)) {
        setFilterStatus("all");
        loadAttractions();
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [mounted]);

  const loadAttractions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("attractions")
        .select("attraction_id, name_en, name_la, location, province, thumbnail_image, rating, status")
        .neq("status", "draft")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRows((data || []) as AttractionRow[]);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Failed to load attractions");
    } finally {
      setLoading(false);
    }
  };

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
    return rows.filter((a) => {
      const name = (a.name_en || a.name_la || "").toLowerCase();
      const location = (a.location || "").toLowerCase();
      const province = (a.province || "").toLowerCase();
      const matchSearch = !q || name.includes(q) || location.includes(q) || province.includes(q);
      const matchStatus = filterStatus === "all" || a.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [rows, search, filterStatus]);

  if (!mounted) return null;

  return (
    <DashboardLayout title={t("sidebar.attractions")} subtitle="Manage all attractions in the system">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
        
        {/* Clickable Status Summary Metrics container wrapped with a Ref */}
        <div ref={filterAreaRef} className="grid grid-cols-3 gap-3">
          {[
            { label: "Pending", count: counts.pending, icon: Clock, color: "text-amber-500", statusValue: "pending" as const },
            { label: "Approved", count: counts.approved, icon: CheckCircle, color: "text-emerald-500", statusValue: "approved" as const },
            { label: "Rejected", count: counts.rejected, icon: AlertTriangle, color: "text-red-500", statusValue: "rejected" as const },
          ].map((s) => {
            const Icon = s.icon;
            const isActive = filterStatus === s.statusValue;
            
            return (
              <motion.div key={s.label} variants={itemVariants}>
                <Card 
                  className={`border-0 shadow-md text-center cursor-pointer transition-all hover:shadow-lg active:scale-[0.99] select-none ${
                    isActive ? "ring-2 ring-teal-500 shadow-lg bg-teal-50/10 dark:bg-teal-950/10" : ""
                  }`}
                  onClick={(e) => {
                    // Stop event from instantly triggering window outside click logic
                    e.stopPropagation();
                    setFilterStatus(isActive ? "all" : s.statusValue);
                  }}
                >
                  <CardContent className="p-3 sm:p-4">
                    <Icon className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 ${s.color}`} />
                    <p className={`text-2xl sm:text-3xl font-bold ${s.color}`}>{s.count}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">{s.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Search & List Display Card Output */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-teal-500" />
                  <span className="capitalize">{filterStatus === "all" ? "All" : filterStatus}</span> Attractions ({filtered.length})
                </CardTitle>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search attractions..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 h-9 text-sm"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="w-5 h-5 animate-spin text-teal-500" />
                  <span>Loading attractions...</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No {filterStatus !== "all" ? `${filterStatus} ` : ""}attractions found.
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((a) => (
                    <div
                      key={a.attraction_id}
                      className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:shadow-sm transition-shadow"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/20 flex items-center justify-center shrink-0 overflow-hidden">
                        {a.thumbnail_image ? (
                          <img
                            src={baseURLImage + a.thumbnail_image}
                            alt={a.name_en || a.name_la || ""}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2 className="w-5 h-5 text-teal-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium truncate">{a.name_en || a.name_la || "Untitled"}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground truncate">{a.location || a.province || "-"}</span>
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                          <span className="text-xs font-medium">{Number(a.rating || 0).toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Badge variant="outline" className={`${statusBadge[String(a.status)] || ""} text-[10px] capitalize`}>
                          {a.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}