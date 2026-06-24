"use client";

import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import {
  BarChart3,
  Users,
  Building2,
  Star,
  Clock,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

// Framer Motion layout configurations
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
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
  reviewsCount?: number;
}

export default function AdminDashboard({ attractionsCount, reviewsCount = 0 }: AdminDashboardProps) {
  const { t } = useTranslation();

  // --- Authorization Gating States ---
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [staffCount, setStaffCount] = useState<number>(0);
  const [activities, setActivities] = useState([
    { id: "a1", text: "New attraction submitted: Bolaven Plateau Coffee Tour", time: "2 hours ago", icon: Building2, color: "text-amber-500" },
    { id: "a2", text: "User Sarah M. left a 5-star review on Pha That Luang", time: "4 hours ago", icon: Star, color: "text-yellow-500" },
    { id: "a3", text: "Attraction 'Night Market' approved by staff", time: "6 hours ago", icon: Building2, color: "text-emerald-500" },
    { id: "a4", text: "New user registration: Mike T.", time: "8 hours ago", icon: Users, color: "text-teal-500" },
    { id: "a5", text: "Promotion created: Early Bird Special", time: "1 day ago", icon: BarChart3, color: "text-rose-500" },
  ]);

  // Verify authorization permissions securely 
  useEffect(() => {
    async function checkAdminAuthorization() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        let user = session?.user;

        if (!user) {
          const { data: { user: fetchedUser } } = await supabase.auth.getUser();
          user = fetchedUser || undefined;
        }
        
        if (!user) {
          setIsAdmin(false);
          return;
        }

        const userRole = user.user_metadata?.role;

        if (userRole === "ADMIN") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Authorization verification error:", err);
        setIsAdmin(false);
      }
    }

    checkAdminAuthorization();
  }, []);

  // Isolate operational metrics calls away from standard users
  useEffect(() => {
    if (!isAdmin) return;

    async function getStaffCount() {
      const { count, error } = await supabase
        .from("staffs")
        .select("*", { count: "exact", head: true });
      if (!error && count !== null) {
        setStaffCount(count);
      }
    }
    getStaffCount();
  }, [isAdmin]);

  // --- Auth Render Routing Guards ---
  if (isAdmin === null) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-2">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">Verifying credentials...</p>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="flex h-[70vh] w-full flex-col items-center justify-center text-center p-6">
        <div className="p-4 bg-red-50 text-red-600 rounded-full mb-4 shadow-sm animate-pulse">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Access Denied</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          You do not have administrative clearance to access this platform module. Direct URL bypass requests are blocked.
        </p>
      </div>
    );
  }

  const roleDistribution = [
    { role: "Admin",        count: 3,   color: "bg-red-500"   },
    { role: "Staff",        count: staffCount, color: "bg-teal-500"  },
    { role: "Entrepreneur", count: 24,  color: "bg-amber-500" },
    { role: "Tourist",      count: 156, color: "bg-sky-500"   },
  ];

  const totalRoleUsers = roleDistribution.reduce((sum, r) => sum + r.count, 0);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">System Management</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Monitor statistics and map system access levels.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title={t("dashboard.totalAttractions")} value={attractionsCount} change="+12%" up icon={Building2} accent="from-teal-500 to-emerald-600" />
        <StatCard title={t("dashboard.totalUsers")} value={totalRoleUsers} change="+8%" up icon={Users} accent="from-sky-500 to-blue-600" />
        <StatCard title={t("dashboard.totalReviews")} value={reviewsCount} change="+23%" up icon={Star} accent="from-amber-500 to-orange-600" />
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
                    <motion.div key={d.month} className="flex-1 flex flex-col items-center gap-1" style={{ height: "100%" }}>
                      <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">{d.value}</span>
                      <motion.div 
                        className="w-full rounded-t-md bg-gradient-to-t from-teal-500 to-emerald-400" 
                        initial={{ height: 0 }} 
                        animate={{ height: `${heightPercent}%` }} 
                        transition={{ delay: 0.1 + i * 0.03, duration: 0.5, ease: "easeOut" }} 
                        style={{ minHeight: 4 }} 
                      />
                      <span className="text-[10px] sm:text-xs text-muted-foreground mt-auto">{d.month}</span>
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
              <div className="space-y-3 sm:space-y-4 max-h-[220px] overflow-y-auto pr-1">
                {activities.map((item) => (
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
                    <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all" style={{ width: `${totalRoleUsers > 0 ? (r.count / totalRoleUsers) * 100 : 0}%` }} />
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