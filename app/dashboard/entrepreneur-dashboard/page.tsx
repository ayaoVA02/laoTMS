"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  CheckCircle,
  Clock,
  Star,
  Edit,
  Trash2,
  Share2,
  Plus,
  BarChart3,
  Calendar,
  Tag,
  RefreshCw,
  AlertCircle,

  DollarSign,
  Percent,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth-store";
import type { Attraction } from "@/data/attractions";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

import Image from "next/image";
import { useRouter } from 'next/navigation';
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL_IMAGE || "";

function resolveImage(f?: string | null) {
  if (!f) return "";
  if (f.startsWith("http")) return f;
  return `${IMAGE_BASE_URL}${f.startsWith("/") ? f.substring(1) : f}`;
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function statusOf(p: { is_active: boolean; d_start: string | null; d_end: string | null }) {
  if (!p.is_active) return "inactive";
  const now = Date.now();
  if (p.d_start && new Date(p.d_start).getTime() >= now) return "upcoming";
  if (p.d_end) {
    const daysLeft = (new Date(p.d_end).getTime() - now) / 86_400_000;
    if (daysLeft < 0) return "expired";
    if (daysLeft < 2) return "expiring";
  }
  return "active";
}

const statusColors: Record<string, string> = {
  active:   "bg-emerald-500/15 text-emerald-600 border-emerald-500/25",
  expiring: "bg-amber-500/15 text-amber-600 border-amber-500/25",
  expired:  "bg-slate-500/15 text-slate-500 border-slate-500/25",
  inactive: "bg-slate-500/15 text-slate-400 border-slate-500/25",
};

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

const statusBadgeMap: Record<string, { label: string; className: string }> = {
  approved: { label: "Approved", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/25" },
  pending:  { label: "Pending",  className: "bg-amber-500/15 text-amber-600 border-amber-500/25" },
  rejected: { label: "Rejected", className: "bg-red-500/15 text-red-600 border-red-500/25" },
  draft:    { label: "Draft",    className: "bg-slate-500/15 text-slate-600 border-slate-500/25" },
};

interface EntrepreneurDashboardProps {
  myAttractions: Attraction[];
  socialShareStates: Record<string, boolean>;
  onToggleSocialShare: (id: string) => void;
  onDeleteAttraction: (id: string) => void;
  onEditAttraction: (updated: Attraction) => void;
}

export default function EntrepreneurDashboard({
  myAttractions,
  socialShareStates,
  onToggleSocialShare,
  onDeleteAttraction,

}: EntrepreneurDashboardProps) {
  const { t } = useTranslation();
  const { user } = useAuthStore();


  const [recentPromotions, setRecentPromotions] = useState<any[]>([]);
  const [loadingPromos, setLoadingPromos] = useState(true);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Get Top 5 High Rating Attractions
  const topAttractions = useMemo(() => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    return [...myAttractions]
      .filter((a) => {
        const lastUpdate = new Date(a.updated_at || a.created_at);
        return a.status === "approved" && lastUpdate >= oneYearAgo;
      })
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5);
  }, [myAttractions]);


  useEffect(() => {
    const fetchPromotions = async () => {
      if (!user?.id) return;
      setLoadingPromos(true);
      setPromoError(null);
      const { data, error } = await supabase
        .from("promotions")
        .select("*, attractions(name_en, thumbnail_image)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        setPromoError(error.message);
      } else if (data) {
        setRecentPromotions(data.map(p => ({
          ...p,
          attraction_name: (p.attractions as any)?.name_en,
          attraction_thumbnail: (p.attractions as any)?.thumbnail_image,
        })));
      }
      setLoadingPromos(false);
    };
    fetchPromotions();
  }, [user?.id]);




  const router = useRouter();

  const thumbnailFor = (a: Attraction) => resolveImage(a.thumbnail_image);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { title: "My Attractions", value: myAttractions.length, icon: Building2, accent: "from-teal-500 to-emerald-600" },
          { title: "Approved", value: myAttractions.filter((a) => a.status === "approved").length, icon: CheckCircle, accent: "from-emerald-500 to-green-600" },
          { title: "Pending",  value: myAttractions.filter((a) => a.status === "pending").length,  icon: Clock, accent: "from-amber-500 to-orange-600" },
        ].map((stat) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className="border-0 shadow-md relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${stat.accent}`} />
              <CardContent className="p-3 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <p className="text-[10px] sm:text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-xl sm:text-2xl font-bold tracking-tight mt-0.5 sm:mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-2 sm:p-2.5 rounded-xl bg-gradient-to-br ${stat.accent} shadow-sm self-end sm:self-start`}>
                    <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* 6-Month-Old Attractions Alert */}
      {(() => {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const oldAttractions = myAttractions.filter(
          (a) => new Date(a.created_at) <= sixMonthsAgo,
        );
        if (oldAttractions.length === 0) return null;
        return (
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-md border-l-4 border-l-amber-500">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Attractions Older Than 6 Months
                  <Badge variant="outline" className="bg-amber-500/15 text-amber-600 border-amber-500/25 text-[10px] ml-auto">
                    {oldAttractions.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">
                  These attractions may need updates or fresh promotions to stay relevant.
                </p>
                <div className="space-y-2">
                  {oldAttractions.map((a) => {
                    const thumb = thumbnailFor(a);
                    return (
                      <div key={a.attraction_id} className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center shrink-0 overflow-hidden relative">
                          {thumb ? (
                            <Image src={thumb} alt={a.name_en} fill sizes="36px" className="object-cover" />
                          ) : (
                            <Building2 className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium truncate">{a.name_en}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">
                              Created {new Date(a.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                            </span>
                            <Badge variant="outline" className={`${statusBadgeMap[a.status]?.className || ""} text-[9px]`}>
                              {statusBadgeMap[a.status]?.label || a.status}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-teal-600"
                          onClick={() => router.push(`/dashboard/my-attractions/edit/${a.attraction_id}`) /* Navigate to edit page */}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })()}

      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2 sm:pb-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-500" />
              <CardTitle className="text-base sm:text-lg font-semibold">
                Top Rated Attractions
              </CardTitle>
            </div>
            <Button onClick={() => router.push('/dashboard/create-attraction')} size="sm" className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
              <Plus className="w-4 h-4" />
              Add Attraction
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topAttractions.map((attraction) => {
                const thumb = thumbnailFor(attraction);
                return (
                  <div key={attraction.attraction_id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/20 flex items-center justify-center shrink-0 overflow-hidden">
                        {thumb ? (
                          <Image src={thumb} alt={attraction.name_en} fill sizes="56px" className="object-cover" />
                        ) : (
                          <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-teal-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <h4 className="font-semibold text-sm truncate">{attraction.name_en}</h4>
                          <Badge variant="outline" className={`${statusBadgeMap[attraction.status]?.className || ""} text-[10px]`}>
                            {statusBadgeMap[attraction.status]?.label || attraction.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {attraction.province}{attraction.district ? `, ${attraction.district}` : ""}
                          {attraction.type_name ? ` - ${attraction.type_name}` : ""}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-xs font-medium">{attraction.rating.toFixed(1)}</span>
                          <span className="text-[10px] text-muted-foreground">({attraction.review_count})</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 border-t sm:border-t-0 pt-3 sm:pt-0">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
                        <Switch
                          checked={socialShareStates[attraction.attraction_id] ?? attraction.social_share}
                          onCheckedChange={() => onToggleSocialShare(attraction.attraction_id)}
                          className="scale-90 sm:scale-100"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-teal-600"
                          onClick={() => router.push(`/dashboard/my-attractions/edit/${attraction.attraction_id}`) /* Navigate to edit page */}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-600"
                          onClick={() => onDeleteAttraction(attraction.attraction_id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-500" />
                Recent Promotions
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {loadingPromos ? (
              <div className="flex items-center gap-2 py-10 justify-center text-sm text-muted-foreground">
                <RefreshCw className="w-5 h-5 animate-spin text-teal-500" /> Loading...
              </div>
            ) : promoError ? (
              <div className="flex flex-col items-center py-10 gap-3 text-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
                <p className="text-sm text-muted-foreground">{promoError}</p>
              </div>
            ) : recentPromotions.length === 0 ? (
              <div className="flex flex-col items-center py-14 gap-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center">
                  <BarChart3 className="w-7 h-7 text-teal-500/60" />
                </div>
                <p className="text-sm text-muted-foreground">No promotions found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {recentPromotions.map((promo) => {
                  const status = statusOf(promo);
                  const imgUrl = resolveImage(promo.attraction_thumbnail);
                  return (
                    <div
                      key={promo.promotion_id}
                      className="p-3 sm:p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white border-0 text-[10px] sm:text-xs flex items-center gap-1">
                          {promo.type === "percentage"
                            ? <Percent className="w-3 h-3" />
                            : <DollarSign className="w-3 h-3" />}
                          {promo.type === "percentage"
                            ? `${promo.price}% OFF`
                            : `$${promo.price} OFF`}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`${statusColors[status]} text-[10px]`}
                        >
                          {status}
                        </Badge>
                      </div>

                      <p className="text-xs sm:text-sm font-medium mb-1 truncate">{promo.title}</p>

                      {promo.attraction_name && (
                        <div className="flex items-center gap-1.5 mb-1">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt=""
                              className="w-4 h-4 rounded object-cover"
                            />
                          ) : (
                            <Building2 className="w-3 h-3 text-teal-500" />
                          )}
                          <span className="text-[10px] sm:text-xs text-teal-600 truncate">
                            {promo.attraction_name}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground mt-2 pt-2 border-t">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(promo.d_end)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {promo.uses_count || 0} uses
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>


    </motion.div>
  );
}