"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Search, Building2, Star, MapPin, Edit, Eye, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAttractionStore } from "@/stores/attraction-store";
import DashboardLayout from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const statusBadge: Record<string, string> = {
  approved: "bg-emerald-500/15 text-emerald-600 border-emerald-500/25",
  pending: "bg-amber-500/15 text-amber-600 border-amber-500/25",
  rejected: "bg-red-500/15 text-red-600 border-red-500/25",
};

export default function ManageContentPage() {
  const { t } = useTranslation();
  const { attractions = [] } = useAttractionStore();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  useEffect(() => { setMounted(true); }, []);

  const allAttractions = attractions;
  const filtered = allAttractions.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.location.toLowerCase().includes(search.toLowerCase()));

  if (!mounted) return null;

  return (
    <DashboardLayout title={t("sidebar.manageContent")} subtitle="Edit and manage published content">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-500" />
                  Content Library ({filtered.length})
                </CardTitle>
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search content..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filtered.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:shadow-sm transition-shadow">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/20 flex items-center justify-center shrink-0 overflow-hidden">
                      {a.images[0] ? <img src={a.images[0]} alt={a.name} className="w-full h-full object-cover" /> : <Building2 className="w-5 h-5 text-teal-500" />}
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
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500"><Trash2 className="w-4 h-4" /></Button>
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
