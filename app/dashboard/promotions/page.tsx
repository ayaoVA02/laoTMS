"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Plus, Calendar, Tag, Building2, X, Star, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { attractions } from "@/data/attractions";
import DashboardLayout from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-600 border-emerald-500/25",
  expiring: "bg-amber-500/15 text-amber-600 border-amber-500/25",
  expired: "bg-slate-500/15 text-slate-500 border-slate-500/25",
};

interface Promotion {
  id: string;
  title: string;
  discount: string;
  validUntil: string;
  status: string;
  uses: number;
  attractionId: string;
}

export default function PromotionsPage() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newPromo, setNewPromo] = useState({ title: "", discount: "", validUntil: "", attractionId: "" });

  const myAttractions = (attractions || []).filter((a) => a.entrepreneurId === "3" && a.status === "approved");

  const [promotions, setPromotions] = useState<Promotion[]>([
    { id: "p1", title: "Early Bird Special - Kuang Si Falls", discount: "30%", validUntil: "Jun 30, 2026", status: "active", uses: 45, attractionId: "2" },
    { id: "p2", title: "Cooking Class Bundle", discount: "20%", validUntil: "Jul 15, 2026", status: "active", uses: 23, attractionId: "5" },
    { id: "p3", title: "Adventure Package - Vang Vieng", discount: "40%", validUntil: "May 31, 2026", status: "expiring", uses: 67, attractionId: "3" },
    { id: "p4", title: "Temple Tour Combo", discount: "15%", validUntil: "Aug 1, 2026", status: "active", uses: 12, attractionId: "1" },
    { id: "p5", title: "Weekend Getaway Special", discount: "25%", validUntil: "Apr 30, 2026", status: "expired", uses: 89, attractionId: "4" },
  ]);

  useEffect(() => { setMounted(true); }, []);

  const handleCreatePromotion = () => {
    if (!newPromo.title || !newPromo.discount || !newPromo.attractionId) return;
    const attraction = myAttractions.find((a) => a.id === newPromo.attractionId);
    const promo: Promotion = {
      id: `p${Date.now()}`,
      title: newPromo.title,
      discount: newPromo.discount,
      validUntil: newPromo.validUntil || "Dec 31, 2026",
      status: "active",
      uses: 0,
      attractionId: newPromo.attractionId,
    };
    setPromotions((prev) => [promo, ...prev]);
    setNewPromo({ title: "", discount: "", validUntil: "", attractionId: "" });
    setCreateDialogOpen(false);
  };

  const getAttraction = (id: string) => (attractions || []).find((a) => a.id === id);

  if (!mounted) return null;

  return (
    <DashboardLayout title={t("sidebar.promotions")} subtitle="Create and manage promotional offers for your attractions">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Active", count: promotions.filter((p) => p.status === "active").length, color: "text-emerald-500" },
            { label: "Expiring", count: promotions.filter((p) => p.status === "expiring").length, color: "text-amber-500" },
            { label: "Expired", count: promotions.filter((p) => p.status === "expired").length, color: "text-slate-400" },
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

        {/* My Attractions for Promotion */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-teal-500" />
                  My Attractions
                </CardTitle>
                <Button size="sm" className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white shrink-0" onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">New Promotion</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {myAttractions.map((a) => {
                  const attractionPromos = promotions.filter((p) => p.attractionId === a.id);
                  return (
                    <div key={a.id} className="p-3 sm:p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                          {a.images[0] ? <img src={a.images[0]} alt={a.name} className="w-full h-full object-cover" /> : <Building2 className="w-5 h-5 text-teal-500" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-medium truncate">{a.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground truncate">{a.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-[10px] font-medium">{a.rating}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {attractionPromos.length} promo{attractionPromos.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Promotions List */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-500" />
                My Promotions ({promotions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {promotions.map((promo) => {
                  const attraction = getAttraction(promo.attractionId);
                  return (
                    <div key={promo.id} className="p-3 sm:p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white border-0 text-[10px] sm:text-xs">{promo.discount} OFF</Badge>
                        <Badge variant="outline" className={`${statusColors[promo.status]} text-[10px]`}>{promo.status}</Badge>
                      </div>
                      <p className="text-xs sm:text-sm font-medium mb-1">{promo.title}</p>
                      {attraction && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <Building2 className="w-3 h-3 text-teal-500" />
                          <span className="text-[10px] sm:text-xs text-teal-600 truncate">{attraction.name}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
                        <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{promo.validUntil}</div>
                        <div className="flex items-center gap-1"><Tag className="w-3 h-3" />{promo.uses} uses</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Create Promotion Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-teal-500" />
              Create New Promotion
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm">Select Attraction</Label>
              <Select value={newPromo.attractionId} onValueChange={(val) => setNewPromo((p) => ({ ...p, attractionId: val }))}>
                <SelectTrigger><SelectValue placeholder="Choose an attraction" /></SelectTrigger>
                <SelectContent>
                  {myAttractions.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Promotion Title</Label>
              <Input placeholder="e.g., Summer Special" value={newPromo.title} onChange={(e) => setNewPromo((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Discount</Label>
                <Input placeholder="e.g., 25%" value={newPromo.discount} onChange={(e) => setNewPromo((p) => ({ ...p, discount: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Valid Until</Label>
                <Input type="date" value={newPromo.validUntil} onChange={(e) => setNewPromo((p) => ({ ...p, validUntil: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white" onClick={handleCreatePromotion} disabled={!newPromo.title || !newPromo.discount || !newPromo.attractionId}>
              <Plus className="w-4 h-4 mr-1.5" />
              Create Promotion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
