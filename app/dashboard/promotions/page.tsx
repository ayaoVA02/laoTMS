"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, Plus, Calendar, Tag, Building2,
  Star, MapPin, RefreshCw, AlertCircle, Trash2,
  ToggleLeft, ToggleRight, DollarSign, Percent,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { usePromotions, NewPromotion } from "@/hooks/use-promotions";
import { useAttractions } from "@/hooks/use-attractions";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

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

  // Not started yet
  if (p.d_start && new Date(p.d_start).getTime() >= now) return "upcoming";

  if (p.d_end) {
    const daysLeft = (new Date(p.d_end).getTime() - now) / 86_400_000;
    if (daysLeft < 0) return "expired";
    if (daysLeft < 2) return "expiring";  // only warn in final 2 days
  }

  return "active";
}

const statusColors: Record<string, string> = {
  active:   "bg-emerald-500/15 text-emerald-600 border-emerald-500/25",
  expiring: "bg-amber-500/15 text-amber-600 border-amber-500/25",
  expired:  "bg-slate-500/15 text-slate-500 border-slate-500/25",
  inactive: "bg-slate-500/15 text-slate-400 border-slate-500/25",
};

const emptyForm: NewPromotion = {
  attraction_id: "",
  title: "",
  type: "percentage",
  price: 0,
  adult: 0,
  children: 0,
  d_start: "",
  d_end: "",
};



export default function PromotionsPage() {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<NewPromotion>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Only approved attractions can have promotions
  const { attractions, loading: aLoading } = useAttractions({ statusFilter: "approved" });
  const { promotions, loading, error, counts, refetch, create, toggle, remove } = usePromotions();

  const handleCreate = async () => {
    if (!form.title || !form.attraction_id) return;
    setSaving(true);
    const ok = await create(form);
    setSaving(false);
    if (ok) {
      setForm(emptyForm);
      setDialogOpen(false);
    }
  };

  const field = <K extends keyof NewPromotion>(k: K) => ({
    value: form[k] as any,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value })),
  });

  return (
    <DashboardLayout
      title={t("sidebar.promotions", "Promotions")}
      subtitle="Create and manage promotional offers for your attractions"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4 sm:space-y-6"
      >
        {/* ── Summary ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Active",   count: counts.active,   color: "text-emerald-500" },
            { label: "Inactive", count: counts.inactive, color: "text-slate-400" },
            { label: "Total",    count: counts.total,    color: "text-teal-500" },
          ].map((s) => (
            <motion.div key={s.label} variants={itemVariants}>
              <Card className="border-0 shadow-md text-center">
                <CardContent className="p-3 sm:p-4">
                  <p className={`text-2xl sm:text-3xl font-bold ${s.color}`}>{s.count}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ── My Approved Attractions ── */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-teal-500" />
                  My Attractions
                </CardTitle>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white shrink-0"
                  onClick={() => setDialogOpen(true)}
                  disabled={attractions.length === 0}
                >
                  <Plus className="w-4 h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">New Promotion</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {aLoading ? (
                <div className="flex items-center gap-2 py-6 justify-center text-sm text-muted-foreground">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Loading…
                </div>
              ) : attractions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No approved attractions yet. Submit one to get started.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {attractions.map((a:any) => {
                    const promoCount = promotions.filter(
                      (p) => p.attraction_id === a.attraction_id
                    ).length;

                    return (
                      <div
                        key={a.attraction_id}
                        className="p-3 sm:p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-teal-500/10">
                            {a.thumbnail_image ? (
                              <img
                                src={resolveImage(a.thumbnail_image)}
                                alt={a.name_en}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Building2 className="w-5 h-5 text-teal-500 m-auto mt-2.5" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium truncate">{a.name_en}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground truncate">
                                {a.province || a.location}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          {a.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              <span className="text-[10px] font-medium">{a.rating.toFixed(1)}</span>
                            </div>
                          )}
                          <Badge variant="outline" className="text-[10px] ml-auto">
                            {promoCount} promo{promoCount !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Promotions List ── */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-teal-500" />
                  My Promotions
                  {!loading && (
                    <span className="text-xs font-normal text-muted-foreground">
                      ({promotions.length})
                    </span>
                  )}
                </CardTitle>
                <Button
                  variant="ghost" size="icon" className="h-8 w-8"
                  onClick={refetch} disabled={loading} title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="flex items-center gap-2 py-10 justify-center text-sm text-muted-foreground">
                  <RefreshCw className="w-5 h-5 animate-spin text-teal-500" /> Loading promotions…
                </div>
              )}

              {!loading && error && (
                <div className="flex flex-col items-center py-10 gap-3 text-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                  <p className="text-sm text-muted-foreground">{error}</p>
                  <Button size="sm" variant="outline" onClick={refetch}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Retry
                  </Button>
                </div>
              )}

              {!loading && !error && promotions.length === 0 && (
                <div className="flex flex-col items-center py-14 gap-4 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center">
                    <BarChart3 className="w-7 h-7 text-teal-500/60" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">No promotions yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Create your first promotion to attract more visitors.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
                    onClick={() => setDialogOpen(true)}
                    disabled={attractions.length === 0}
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> New Promotion
                  </Button>
                </div>
              )}

              {!loading && !error && promotions.length > 0 && (
                <AnimatePresence mode="popLayout">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {promotions.map((promo) => {
                      const status = statusOf(promo);
                      const imgUrl = resolveImage(promo.attraction_thumbnail);
                      return (
                        <motion.div
                          key={promo.promotion_id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -16 }}
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

                          <p className="text-xs sm:text-sm font-medium mb-1">{promo.title}</p>

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

                          {(promo.adult > 0 || promo.children > 0) && (
                            <div className="flex gap-2 mb-1">
                              {promo.adult > 0 && (
                                <span className="text-[10px] text-muted-foreground">
                                  Adult: ${promo.adult}
                                </span>
                              )}
                              {promo.children > 0 && (
                                <span className="text-[10px] text-muted-foreground">
                                  Child: ${promo.children}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {promo.d_start ? `${formatDate(promo.d_start)} →` : ""}
                              {formatDate(promo.d_end)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {promo.uses_count} uses
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-1.5">
                              {promo.is_active
                                ? <ToggleRight className="w-3.5 h-3.5 text-emerald-500" />
                                : <ToggleLeft className="w-3.5 h-3.5 text-slate-400" />}
                              <Switch
                                checked={promo.is_active}
                                onCheckedChange={() => toggle(promo.promotion_id, promo.is_active)}
                                className="scale-75"
                              />
                            </div>
                            <Button
                              variant="ghost" size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-red-500"
                              onClick={() => remove(promo.promotion_id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </AnimatePresence>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── Create Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-teal-500" />
              Create New Promotion
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm">Attraction *</Label>
              <Select
                value={form.attraction_id}
                onValueChange={(v) => setForm((p) => ({ ...p, attraction_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an attraction" />
                </SelectTrigger>
                <SelectContent>
                  {attractions.map((a) => (
                    <SelectItem key={a.attraction_id} value={a.attraction_id}>
                      {a.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Title *</Label>
              <Input placeholder="e.g. Summer Special" {...field("title")} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, type: v as "percentage" | "fixed" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed price ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">
                  {form.type === "percentage" ? "Discount %" : "Discount amount"}
                </Label>
                <Input type="number" min={0} placeholder="e.g. 25" {...field("price")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">Adult price ($)</Label>
                <Input type="number" min={0} placeholder="0" {...field("adult")} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Child price ($)</Label>
                <Input type="number" min={0} placeholder="0" {...field("children")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">Start date</Label>
                <Input type="date" {...field("d_start")} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">End date</Label>
                <Input type="date" {...field("d_end")} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
              onClick={handleCreate}
              disabled={saving || !form.title || !form.attraction_id}
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-1.5" />
              )}
              Create Promotion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}