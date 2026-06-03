"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  Building2,
  Star,
  Clock,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { reviews as sampleReviews } from "@/data/attractions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

const chartData = [
  { month: "Jan", value: 65 },
  { month: "Feb", value: 78 },
  { month: "Mar", value: 55 },
  { month: "Apr", value: 88 },
  { month: "May", value: 72 },
  { month: "Jun", value: 95 },
  { month: "Jul", value: 82 },
  { month: "Aug", value: 110 },
];

const recentActivityItems = [
  { id: "a1", text: "New attraction submitted: Bolaven Plateau Coffee Tour", time: "2 hours ago", icon: Building2, color: "text-amber-500" },
  { id: "a2", text: "User Sarah M. left a 5-star review on Pha That Luang", time: "4 hours ago", icon: Star, color: "text-yellow-500" },
  { id: "a3", text: "Attraction 'Night Market' approved by staff", time: "6 hours ago", icon: Building2, color: "text-emerald-500" },
  { id: "a4", text: "New user registration: Mike T.", time: "8 hours ago", icon: Users, color: "text-teal-500" },
  { id: "a5", text: "Promotion created: Early Bird Special", time: "1 day ago", icon: BarChart3, color: "text-rose-500" },
];

const roleDistribution = [
  { role: "Admin", count: 3, color: "bg-red-500" },
  { role: "Staff", count: 8, color: "bg-teal-500" },
  { role: "Entrepreneur", count: 24, color: "bg-amber-500" },
  { role: "Tourist", count: 156, color: "bg-sky-500" },
];

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  up: boolean;
  icon: React.ElementType;
  accent: string;
}

const StatCard = ({ title, value, change, up, icon: Icon, accent }: StatCardProps) => (
  <motion.div variants={itemVariants}>
    <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
      <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${accent}`} />
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0">
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{title}</p>
            <p className="text-xl sm:text-2xl font-bold tracking-tight">{value}</p>
          </div>
          <div className={`p-2 sm:p-2.5 rounded-xl bg-gradient-to-br ${accent} shadow-sm shrink-0`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
        </div>
        <div className="flex items-center gap-1 mt-2 sm:mt-3">
          {up ? (
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
          )}
          <span className={`text-xs sm:text-sm font-medium ${up ? "text-emerald-500" : "text-red-500"}`}>
            {change}
          </span>
          <span className="text-[10px] sm:text-xs text-muted-foreground ml-1">vs last month</span>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

interface AdminDashboardProps {
  attractionsCount: number;
}

export default function AdminDashboard({ attractionsCount }: AdminDashboardProps) {
  const { t } = useTranslation();
  const totalRoleUsers = roleDistribution.reduce((sum, r) => sum + r.count, 0);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title={t("dashboard.totalAttractions")} value={attractionsCount} change="+12%" up icon={Building2} accent="from-teal-500 to-emerald-600" />
        <StatCard title={t("dashboard.totalUsers")} value={191} change="+8%" up icon={Users} accent="from-sky-500 to-blue-600" />
        <StatCard title={t("dashboard.totalReviews")} value={sampleReviews.length} change="+23%" up icon={Star} accent="from-amber-500 to-orange-600" />
        <StatCard title={t("dashboard.totalRevenue")} value="$24.5K" change="-3%" up={false} icon={BarChart3} accent="from-rose-500 to-pink-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-500" />
                {t("dashboard.analytics")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-1.5 sm:gap-2 h-36 sm:h-48">
                {chartData.map((d, i) => {
                  const maxVal = Math.max(...chartData.map((c) => c.value));
                  const heightPercent = (d.value / maxVal) * 100;
                  return (
                    <motion.div
                      key={d.month}
                      className="flex-1 flex flex-col items-center gap-1"
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      transition={{ delay: i * 0.06, duration: 0.5 }}
                    >
                      <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">{d.value}</span>
                      <motion.div
                        className="w-full rounded-t-md bg-gradient-to-t from-teal-500 to-emerald-400"
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercent}%` }}
                        transition={{ delay: 0.2 + i * 0.06, duration: 0.6, ease: "easeOut" }}
                        style={{ minHeight: 4 }}
                      />
                      <span className="text-[10px] sm:text-xs text-muted-foreground">{d.month}</span>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-500" />
                {t("dashboard.recentActivity")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {recentActivityItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-2 sm:gap-3">
                    <div className={`mt-0.5 p-1 sm:p-1.5 rounded-lg bg-muted ${item.color} shrink-0`}>
                      <item.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm leading-snug line-clamp-2">{item.text}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-500" />
              User Distribution by Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {roleDistribution.map((r) => (
                <div key={r.role} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${r.color}`} />
                      <span className="text-xs sm:text-sm font-medium">{r.role}</span>
                    </div>
                    <span className="text-xs sm:text-sm text-muted-foreground">{r.count}</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all"
                      style={{ width: `${(r.count / totalRoleUsers) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}