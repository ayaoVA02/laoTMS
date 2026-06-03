"use client";

import { useState } from "react";
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
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth-store";
import type { Attraction } from "@/data/attractions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

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
  onEditAttraction,
}: EntrepreneurDashboardProps) {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAttraction, setEditingAttraction] = useState<Attraction | null>(null);

  const handleEditSave = () => {
    if (!editingAttraction) return;
    onEditAttraction(editingAttraction);
    setEditDialogOpen(false);
    setEditingAttraction(null);
  };

  const thumbnailFor = (a: Attraction) => a.thumbnailUrl || a.thumbnail_image || null;

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
                          onClick={() => { setEditingAttraction({ ...a }); setEditDialogOpen(true); }}
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
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-500" />
              {t("dashboard.myAttractions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myAttractions.map((attraction) => {
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
                          onClick={() => { setEditingAttraction({ ...attraction }); setEditDialogOpen(true); }}
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
                {t("dashboard.createPromotion")}
              </CardTitle>
              <Button variant="outline" size="sm" className="border-teal-500/30 text-teal-600 hover:bg-teal-500/10 shrink-0">
                <Plus className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">New Promotion</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[
                { id: "p1", title: "Early Bird Special - Kuang Si Falls", discount: "30%", validUntil: "Jun 30, 2026" },
                { id: "p2", title: "Cooking Class Bundle", discount: "20%", validUntil: "Jul 15, 2026" },
                { id: "p3", title: "Adventure Package - Vang Vieng", discount: "40%", validUntil: "May 31, 2026" },
              ].map((promo) => (
                <div key={promo.id} className="p-3 sm:p-4 rounded-xl border bg-gradient-to-br from-teal-500/5 to-emerald-500/5 hover:from-teal-500/10 hover:to-emerald-500/10 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white border-0 text-[10px] sm:text-xs">
                      {promo.discount} OFF
                    </Badge>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">until {promo.validUntil}</span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium">{promo.title}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Attraction Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Edit className="w-5 h-5 text-teal-500" />
              {t("dashboard.editAttraction")}
            </DialogTitle>
          </DialogHeader>
          {editingAttraction && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name-en" className="text-sm">Name (English)</Label>
                <Input
                  id="edit-name-en"
                  value={editingAttraction.name_en}
                  onChange={(e) => setEditingAttraction((prev) => prev ? { ...prev, name_en: e.target.value } : prev)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name-la" className="text-sm">Name (Lao)</Label>
                <Input
                  id="edit-name-la"
                  value={editingAttraction.name_la}
                  onChange={(e) => setEditingAttraction((prev) => prev ? { ...prev, name_la: e.target.value } : prev)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-desc" className="text-sm">Description</Label>
                <Textarea
                  id="edit-desc"
                  value={editingAttraction.description}
                  onChange={(e) => setEditingAttraction((prev) => prev ? { ...prev, description: e.target.value } : prev)}
                  className="min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Type</Label>
                  <Select
                    value={editingAttraction.type_name ?? ""}
                    onValueChange={(val) => setEditingAttraction((prev) => prev ? { ...prev, type_name: val } : prev)}
                  >
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="temple">Temples</SelectItem>
                      <SelectItem value="nature">Nature</SelectItem>
                      <SelectItem value="adventure">Adventure</SelectItem>
                      <SelectItem value="culture">Culture</SelectItem>
                      <SelectItem value="food">Food & Dining</SelectItem>
                      <SelectItem value="beach">Beaches</SelectItem>
                      <SelectItem value="historical">Historical</SelectItem>
                      <SelectItem value="nightlife">Nightlife</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-fee" className="text-sm">Entry Fee Foreigner (LAK)</Label>
                  <Input
                    id="edit-fee"
                    type="number"
                    value={editingAttraction.entry_fee_foreigner}
                    onChange={(e) => setEditingAttraction((prev) => prev ? { ...prev, entry_fee_foreigner: Number(e.target.value) } : prev)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-province" className="text-sm">Province</Label>
                  <Input
                    id="edit-province"
                    value={editingAttraction.province}
                    onChange={(e) => setEditingAttraction((prev) => prev ? { ...prev, province: e.target.value } : prev)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-district" className="text-sm">District</Label>
                  <Input
                    id="edit-district"
                    value={editingAttraction.district}
                    onChange={(e) => setEditingAttraction((prev) => prev ? { ...prev, district: e.target.value } : prev)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-open" className="text-sm">Open Time</Label>
                  <Input
                    id="edit-open"
                    type="time"
                    value={editingAttraction.open_time}
                    onChange={(e) => setEditingAttraction((prev) => prev ? { ...prev, open_time: e.target.value } : prev)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-close" className="text-sm">Close Time</Label>
                  <Input
                    id="edit-close"
                    type="time"
                    value={editingAttraction.close_time}
                    onChange={(e) => setEditingAttraction((prev) => prev ? { ...prev, close_time: e.target.value } : prev)}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="w-full sm:w-auto">
              {t("common.cancel")}
            </Button>
            <Button
              className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
              onClick={handleEditSave}
            >
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}