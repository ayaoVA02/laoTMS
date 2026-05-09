"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, Star, MapPin, Edit, Trash2, Share2, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth-store";
import { useAttractionStore } from "@/stores/attraction-store";
import DashboardLayout from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const statusBadge: Record<string, string> = {
  approved: "bg-emerald-500/15 text-emerald-600 border-emerald-500/25",
  pending: "bg-amber-500/15 text-amber-600 border-amber-500/25",
  rejected: "bg-red-500/15 text-red-600 border-red-500/25",
};

export default function MyAttractionsPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { attractions: storeAttractions = [] } = useAttractionStore();
  const [mounted, setMounted] = useState(false);
  const [localAttractions, setLocalAttractions] = useState(storeAttractions);
  const [socialShareStates, setSocialShareStates] = useState<Record<string, boolean>>({});
  useEffect(() => { setMounted(true); }, []);

  const myAttractions = localAttractions.filter((a) => a.entrepreneurId === "3");
  const toggleSocialShare = (id: string) => setSocialShareStates((prev) => ({ ...prev, [id]: !prev[id] }));
  const handleDelete = (id: string) => setLocalAttractions((prev) => prev.filter((a) => a.id !== id));

  if (!mounted) return null;

  return (
    <DashboardLayout title={t("sidebar.myAttractions")} subtitle="Manage your submitted attractions">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total", count: myAttractions.length, color: "text-teal-500" },
            { label: "Approved", count: myAttractions.filter((a) => a.status === "approved").length, color: "text-emerald-500" },
            { label: "Pending", count: myAttractions.filter((a) => a.status === "pending").length, color: "text-amber-500" },
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

        {/* List */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-teal-500" />
                  My Attractions
                </CardTitle>
                <Button size="sm" className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white shrink-0">
                  <Plus className="w-4 h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Create New</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myAttractions.map((a) => (
                  <div key={a.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border bg-card">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/20 flex items-center justify-center shrink-0 overflow-hidden">
                        {a.images[0] ? <img src={a.images[0]} alt={a.name} className="w-full h-full object-cover" /> : <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-teal-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium truncate">{a.name}</p>
                          <Badge variant="outline" className={`${statusBadge[a.status] || ""} text-[10px]`}>{a.status}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground truncate">{a.location}</span>
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                          <span className="text-xs font-medium">{a.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 border-t sm:border-t-0 pt-3 sm:pt-0">
                      <div className="flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
                        <Switch checked={socialShareStates[a.id] ?? a.socialShare} onCheckedChange={() => toggleSocialShare(a.id)} className="scale-90 sm:scale-100" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDelete(a.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
