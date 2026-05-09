"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, TrendingUp, Users, Building2, Star, Eye, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth-store";
import DashboardLayout from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const monthlyVisitors = [
  { month: "Jan", visitors: 1200, bookings: 85 }, { month: "Feb", visitors: 1450, bookings: 102 },
  { month: "Mar", visitors: 980, bookings: 67 }, { month: "Apr", visitors: 1680, bookings: 134 },
  { month: "May", visitors: 1320, bookings: 98 }, { month: "Jun", visitors: 1890, bookings: 156 },
  { month: "Jul", visitors: 1540, bookings: 121 }, { month: "Aug", visitors: 2100, bookings: 189 },
  { month: "Sep", visitors: 1760, bookings: 143 }, { month: "Oct", visitors: 1950, bookings: 167 },
  { month: "Nov", visitors: 2200, bookings: 198 }, { month: "Dec", visitors: 2500, bookings: 221 },
];

const topAttractions = [
  { name: "Pha That Luang", visitors: 4500, change: "+15%" }, { name: "Kuang Si Falls", visitors: 3800, change: "+22%" },
  { name: "Buddha Park", visitors: 2900, change: "+8%" }, { name: "Night Market", visitors: 3200, change: "+12%" },
  { name: "Patuxai", visitors: 2600, change: "-3%" },
];

const categoryBreakdown = [
  { category: "Temples", count: 12, pct: 28, color: "bg-amber-500" },
  { category: "Nature", count: 10, pct: 23, color: "bg-emerald-500" },
  { category: "Adventure", count: 8, pct: 19, color: "bg-sky-500" },
  { category: "Culture", count: 6, pct: 14, color: "bg-rose-500" },
  { category: "Food", count: 4, pct: 9, color: "bg-orange-500" },
  { category: "Other", count: 3, pct: 7, color: "bg-slate-400" },
];

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const maxVisitors = Math.max(...monthlyVisitors.map((m) => m.visitors));

  return (
    <DashboardLayout title={t("sidebar.analytics")} subtitle="Track performance metrics and trends">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { title: "Total Visitors", value: "20.6K", change: "+18%", up: true, icon: Eye, accent: "from-teal-500 to-emerald-600" },
            { title: "Total Bookings", value: "1,581", change: "+23%", up: true, icon: Building2, accent: "from-sky-500 to-blue-600" },
            { title: "Avg Rating", value: "4.6", change: "+0.2", up: true, icon: Star, accent: "from-amber-500 to-orange-600" },
            { title: "Bounce Rate", value: "32%", change: "-5%", up: true, icon: TrendingUp, accent: "from-rose-500 to-pink-600" },
          ].map((stat) => (
            <motion.div key={stat.title} variants={itemVariants}>
              <Card className="relative overflow-hidden border-0 shadow-md">
                <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${stat.accent}`} />
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{stat.title}</p>
                      <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`p-2 sm:p-2.5 rounded-xl bg-gradient-to-br ${stat.accent} shadow-sm shrink-0`}>
                      <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.up ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" /> : <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />}
                    <span className={`text-xs sm:text-sm font-medium ${stat.up ? "text-emerald-500" : "text-red-500"}`}>{stat.change}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Visitors Chart */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-500" />
                Monthly Visitors & Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-1 sm:gap-1.5 h-40 sm:h-52">
                {monthlyVisitors.map((d, i) => {
                  const hPct = (d.visitors / maxVisitors) * 100;
                  const bPct = (d.bookings / maxVisitors) * 100;
                  return (
                    <div key={d.month} className="flex-1 flex flex-col items-center gap-0.5">
                      <div className="w-full flex flex-col items-center gap-0.5" style={{ height: `${hPct}%` }}>
                        <motion.div className="w-full rounded-t-sm bg-gradient-to-t from-teal-500 to-emerald-400 flex-1" initial={{ height: 0 }} animate={{ height: "100%" }} transition={{ delay: i * 0.04, duration: 0.5 }} />
                        <motion.div className="w-full rounded-t-sm bg-gradient-to-t from-sky-400 to-blue-300" style={{ height: `${bPct}%` }} initial={{ height: 0 }} animate={{ height: `${bPct}%` }} transition={{ delay: 0.2 + i * 0.04, duration: 0.5 }} />
                      </div>
                      <span className="text-[9px] sm:text-[10px] text-muted-foreground">{d.month}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-teal-500" /><span className="text-xs text-muted-foreground">Visitors</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-sky-400" /><span className="text-xs text-muted-foreground">Bookings</span></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Top Attractions */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-md h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-teal-500" />
                  Top Attractions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topAttractions.map((a, i) => (
                    <div key={a.name} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{a.name}</p>
                        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary mt-1">
                          <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500" style={{ width: `${(a.visitors / topAttractions[0].visitors) * 100}%` }} />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold">{a.visitors.toLocaleString()}</p>
                        <p className={`text-[10px] font-medium ${a.change.startsWith("+") ? "text-emerald-500" : "text-red-500"}`}>{a.change}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Breakdown */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-md h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-500" />
                  Category Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryBreakdown.map((c) => (
                    <div key={c.category} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${c.color}`} />
                          <span className="text-sm font-medium">{c.category}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{c.count} ({c.pct}%)</span>
                      </div>
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div className={`h-full ${c.color} transition-all`} style={{ width: `${c.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
