"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  Building2,
  Star,
  TrendingUp,
  TrendingDown,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Edit,
  Trash2,
  Upload,
  Share2,
  Bell,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Menu,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth-store";
import { useTravelPlanStore } from "@/stores/travel-plan-store";
import { useAttractionStore } from "@/stores/attraction-store";
import { attractions, reviews } from "@/data/attractions";
import Sidebar from "@/components/layout/sidebar";
import { useAppStore } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Image from "next/image";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
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
  {
    id: "a1",
    text: "New attraction submitted: Bolaven Plateau Coffee Tour",
    time: "2 hours ago",
    icon: Building2,
    color: "text-amber-500",
  },
  {
    id: "a2",
    text: "User Sarah M. left a 5-star review on Pha That Luang",
    time: "4 hours ago",
    icon: Star,
    color: "text-yellow-500",
  },
  {
    id: "a3",
    text: "Attraction 'Night Market' approved by staff",
    time: "6 hours ago",
    icon: CheckCircle,
    color: "text-emerald-500",
  },
  {
    id: "a4",
    text: "New user registration: Mike T.",
    time: "8 hours ago",
    icon: Users,
    color: "text-teal-500",
  },
  {
    id: "a5",
    text: "Promotion created: Early Bird Special",
    time: "1 day ago",
    icon: Bell,
    color: "text-rose-500",
  },
];

const roleDistribution = [
  { role: "Admin", count: 3, color: "bg-red-500" },
  { role: "Staff", count: 8, color: "bg-teal-500" },
  { role: "Entrepreneur", count: 24, color: "bg-amber-500" },
  { role: "Tourist", count: 156, color: "bg-sky-500" },
];

const statusBadgeMap: Record<string, { label: string; className: string }> = {
  approved: {
    label: "Approved",
    className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/25",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-500/15 text-amber-600 border-amber-500/25",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-500/15 text-red-600 border-red-500/25",
  },
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const { favorites = [] } = useAttractionStore();
  const { plans = [] } = useTravelPlanStore();
  const role = user?.role || "TOURIST";

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAttraction, setEditingAttraction] = useState<
    (typeof attractions)[0] | null
  >(null);
  const [newAttraction, setNewAttraction] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    location: "",
    socialShare: false,
  });
  const [localAttractions, setLocalAttractions] = useState(attractions || []);
  const [socialShareStates, setSocialShareStates] = useState<
    Record<string, boolean>
  >(() =>
    attractions.reduce(
      (acc, a) => ({ ...acc, [a.id]: a.socialShare }),
      {} as Record<string, boolean>,
    ),
  );

  const pendingAttractions = localAttractions.filter(
    (a) => a.status === "pending",
  );
  const myAttractions = localAttractions.filter(
    (a) => a.entrepreneurId === "3",
  );
  const totalRoleUsers = roleDistribution.reduce((sum, r) => sum + r.count, 0);

  const handleApprove = (id: string) => {
    setLocalAttractions((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "approved" as const } : a,
      ),
    );
  };
  const handleReject = (id: string) => {
    setLocalAttractions((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "rejected" as const } : a,
      ),
    );
  };
  const handleCreateAttraction = () => {
    if (
      !newAttraction.name ||
      !newAttraction.category ||
      !newAttraction.location
    )
      return;
    const created = {
      id: String(localAttractions.length + 1),
      name: newAttraction.name,
      description: newAttraction.description,
      shortDescription: newAttraction.description.slice(0, 60),
      category: newAttraction.category,
      location: newAttraction.location,
      coordinates: [17.9757, 102.6331] as [number, number],
      images: [],
      rating: 0,
      reviewCount: 0,
      price: Number(newAttraction.price) || 0,
      openTime: "09:00",
      closeTime: "17:00",
      facilities: [],
      status: "pending" as const,
      featured: false,
      createdAt: new Date().toISOString().split("T")[0],
      entrepreneurId: "3",
      entrepreneurName: user?.name || "Entrepreneur",
      socialShare: newAttraction.socialShare,
    };
    setLocalAttractions((prev) => [...prev, created]);
    setSocialShareStates((prev) => ({
      ...prev,
      [created.id]: created.socialShare,
    }));
    setNewAttraction({
      name: "",
      description: "",
      category: "",
      price: "",
      location: "",
      socialShare: false,
    });
    setCreateDialogOpen(false);
  };
  const handleEditAttraction = () => {
    if (!editingAttraction) return;
    setLocalAttractions((prev) =>
      prev.map((a) => (a.id === editingAttraction.id ? editingAttraction : a)),
    );
    setEditDialogOpen(false);
    setEditingAttraction(null);
  };
  const handleDeleteAttraction = (id: string) => {
    setLocalAttractions((prev) => prev.filter((a) => a.id !== id));
  };
  const toggleSocialShare = (id: string) => {
    setSocialShareStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            Welcome to LaoTMS Dashboard
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Sign in to access your personalized dashboard with role-based
            features.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white"
            >
              <a href="/auth/login">Sign In</a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-teal-500/30 text-teal-600 hover:bg-teal-500/10"
            >
              <a href="/auth/register">Create Account</a>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── STAT CARD ──────────────────────────────────────────────────
  const StatCard = ({
    title,
    value,
    change,
    up,
    icon: Icon,
    accent,
  }: {
    title: string;
    value: string | number;
    change: string;
    up: boolean;
    icon: React.ElementType;
    accent: string;
  }) => (
    <motion.div variants={itemVariants}>
      <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
        <div
          className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${accent}`}
        />
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1 min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {title}
              </p>
              <p className="text-xl sm:text-2xl font-bold tracking-tight">
                {value}
              </p>
            </div>
            <div
              className={`p-2 sm:p-2.5 rounded-xl bg-gradient-to-br ${accent} shadow-sm shrink-0`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 sm:mt-3">
            {up ? (
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
            )}
            <span
              className={`text-xs sm:text-sm font-medium ${up ? "text-emerald-500" : "text-red-500"}`}
            >
              {change}
            </span>
            <span className="text-[10px] sm:text-xs text-muted-foreground ml-1">
              vs last month
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // ─── ADMIN DASHBOARD ─────────────────────────────────────────────
  const renderAdminDashboard = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 sm:space-y-6"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title={t("dashboard.totalAttractions")}
          value={localAttractions.length}
          change="+12%"
          up
          icon={Building2}
          accent="from-teal-500 to-emerald-600"
        />
        <StatCard
          title={t("dashboard.totalUsers")}
          value={191}
          change="+8%"
          up
          icon={Users}
          accent="from-sky-500 to-blue-600"
        />
        <StatCard
          title={t("dashboard.totalReviews")}
          value={reviews.length}
          change="+23%"
          up
          icon={Star}
          accent="from-amber-500 to-orange-600"
        />
        <StatCard
          title={t("dashboard.totalRevenue")}
          value="$24.5K"
          change="-3%"
          up={false}
          icon={BarChart3}
          accent="from-rose-500 to-pink-600"
        />
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
                      <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                        {d.value}
                      </span>
                      <motion.div
                        className="w-full rounded-t-md bg-gradient-to-t from-teal-500 to-emerald-400"
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercent}%` }}
                        transition={{
                          delay: 0.2 + i * 0.06,
                          duration: 0.6,
                          ease: "easeOut",
                        }}
                        style={{ minHeight: 4 }}
                      />
                      <span className="text-[10px] sm:text-xs text-muted-foreground">
                        {d.month}
                      </span>
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
                  <div
                    key={item.id}
                    className="flex items-start gap-2 sm:gap-3"
                  >
                    <div
                      className={`mt-0.5 p-1 sm:p-1.5 rounded-lg bg-muted ${item.color} shrink-0`}
                    >
                      <item.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm leading-snug line-clamp-2">
                        {item.text}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                        {item.time}
                      </p>
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
                      <div
                        className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${r.color}`}
                      />
                      <span className="text-xs sm:text-sm font-medium">
                        {r.role}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {r.count}
                    </span>
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

  // ─── STAFF DASHBOARD ─────────────────────────────────────────────
  const renderStaffDashboard = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 sm:space-y-6"
    >
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-teal-500 to-emerald-600" />
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t("dashboard.pendingApprovals")}
                </p>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
                  {pendingAttractions.length}
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-sm">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-500" />
              {t("dashboard.approveAttractions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingAttractions.length === 0 ? (
              <div className="text-center py-8 sm:py-10">
                <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  All attractions have been reviewed
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {pendingAttractions.map((attraction) => (
                  <motion.div
                    key={attraction.id}
                    layout
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow gap-3 sm:gap-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-semibold text-sm truncate">
                          {attraction.name}
                        </h4>
                        <Badge
                          variant="outline"
                          className={statusBadgeMap.pending.className}
                        >
                          {t("attractions.pending")}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {attraction.location} - {attraction.category}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Submitted by {attraction.entrepreneurName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm"
                        onClick={() => handleApprove(attraction.id)}
                      >
                        <CheckCircle className="w-3.5 h-3.5 sm:mr-1" />
                        <span className="hidden sm:inline">Approve</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="text-xs sm:text-sm"
                        onClick={() => handleReject(attraction.id)}
                      >
                        <XCircle className="w-3.5 h-3.5 sm:mr-1" />
                        <span className="hidden sm:inline">Reject</span>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          {
            title: "Approved",
            count: localAttractions.filter((a) => a.status === "approved")
              .length,
            icon: CheckCircle,
            color: "text-emerald-500",
          },
          {
            title: "Pending",
            count: pendingAttractions.length,
            icon: Clock,
            color: "text-amber-500",
          },
          {
            title: "Rejected",
            count: localAttractions.filter((a) => a.status === "rejected")
              .length,
            icon: XCircle,
            color: "text-red-500",
          },
        ].map((item) => (
          <motion.div key={item.title} variants={itemVariants}>
            <Card className="border-0 shadow-md text-center">
              <CardContent className="p-3 sm:p-5">
                <item.icon
                  className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 ${item.color}`}
                />
                <p className="text-lg sm:text-2xl font-bold">{item.count}</p>
                <p className="text-[10px] sm:text-sm text-muted-foreground">
                  {item.title}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-500" />
              Recent Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              {localAttractions
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
                )
                .slice(0, 5)
                .map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">
                        {a.name}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        {a.entrepreneurName} - {a.createdAt}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${statusBadgeMap[a.status]?.className || ""} text-[10px] sm:text-xs shrink-0`}
                    >
                      {statusBadgeMap[a.status]?.label || a.status}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  // ─── ENTREPRENEUR DASHBOARD ─────────────────────────────────────
  const renderEntrepreneurDashboard = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 sm:space-y-6"
    >
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          {
            title: "My Attractions",
            value: myAttractions.length,
            icon: Building2,
            accent: "from-teal-500 to-emerald-600",
          },
          {
            title: "Approved",
            value: myAttractions.filter((a) => a.status === "approved").length,
            icon: CheckCircle,
            accent: "from-emerald-500 to-green-600",
          },
          {
            title: "Pending",
            value: myAttractions.filter((a) => a.status === "pending").length,
            icon: Clock,
            accent: "from-amber-500 to-orange-600",
          },
        ].map((stat) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className="border-0 shadow-md relative overflow-hidden">
              <div
                className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${stat.accent}`}
              />
              <CardContent className="p-3 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <p className="text-[10px] sm:text-sm text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold tracking-tight mt-0.5 sm:mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`p-2 sm:p-2.5 rounded-xl bg-gradient-to-br ${stat.accent} shadow-sm self-end sm:self-start`}
                  >
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
          (a) => new Date(a.createdAt) <= sixMonthsAgo,
        );
        if (oldAttractions.length === 0) return null;
        return (
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-md border-l-4 border-l-amber-500">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Attractions Older Than 6 Months
                  <Badge
                    variant="outline"
                    className="bg-amber-500/15 text-amber-600 border-amber-500/25 text-[10px] ml-auto"
                  >
                    {oldAttractions.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">
                  These attractions may need updates or fresh promotions to stay
                  relevant.
                </p>
                <div className="space-y-2">
                  {oldAttractions.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-amber-500/5 border border-amber-500/10"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center shrink-0 overflow-hidden relative">
                        {a.images[0] ? (
                          <Image
                            src={a.images[0]}
                            alt={a.name}
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        ) : (
                          <Building2 className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium truncate">
                          {a.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">
                            Created {a.createdAt}
                          </span>
                          <Badge
                            variant="outline"
                            className={`${statusBadgeMap[a.status]?.className || ""} text-[9px]`}
                          >
                            {statusBadgeMap[a.status]?.label || a.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-teal-600"
                          onClick={() => {
                            setEditingAttraction({ ...a });
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })()}

      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-500" />
                {t("dashboard.myAttractions")}
              </CardTitle>
              <Button
                size="sm"
                className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-sm shrink-0"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">
                  {t("dashboard.createAttraction")}
                </span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myAttractions.map((attraction) => (
                <div
                  key={attraction.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/20 flex items-center justify-center shrink-0 overflow-hidden">
                      {attraction.images[0] ? (
                        <Image
                          src={attraction.images[0]}
                          alt={attraction.name}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      ) : (
                        <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-teal-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <h4 className="font-semibold text-sm truncate">
                          {attraction.name}
                        </h4>
                        <Badge
                          variant="outline"
                          className={`${statusBadgeMap[attraction.status]?.className || ""} text-[10px]`}
                        >
                          {statusBadgeMap[attraction.status]?.label ||
                            attraction.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {attraction.location} - {attraction.category}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-medium">
                          {attraction.rating}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          ({attraction.reviewCount})
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 pl-15 sm:pl-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
                      <Switch
                        checked={
                          socialShareStates[attraction.id] ??
                          attraction.socialShare
                        }
                        onCheckedChange={() => toggleSocialShare(attraction.id)}
                        className="scale-90 sm:scale-100"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-teal-600"
                        onClick={() => {
                          setEditingAttraction({ ...attraction });
                          setEditDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-600"
                        onClick={() => handleDeleteAttraction(attraction.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
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
              <Button
                variant="outline"
                size="sm"
                className="border-teal-500/30 text-teal-600 hover:bg-teal-500/10 shrink-0"
              >
                <Plus className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">New Promotion</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[
                {
                  id: "p1",
                  title: "Early Bird Special - Kuang Si Falls",
                  discount: "30%",
                  validUntil: "Jun 30, 2026",
                },
                {
                  id: "p2",
                  title: "Cooking Class Bundle",
                  discount: "20%",
                  validUntil: "Jul 15, 2026",
                },
                {
                  id: "p3",
                  title: "Adventure Package - Vang Vieng",
                  discount: "40%",
                  validUntil: "May 31, 2026",
                },
              ].map((promo) => (
                <div
                  key={promo.id}
                  className="p-3 sm:p-4 rounded-xl border bg-gradient-to-br from-teal-500/5 to-emerald-500/5 hover:from-teal-500/10 hover:to-emerald-500/10 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white border-0 text-[10px] sm:text-xs">
                      {promo.discount} OFF
                    </Badge>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">
                      until {promo.validUntil}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium">
                    {promo.title}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Attraction Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Plus className="w-5 h-5 text-teal-500" />
              {t("dashboard.createAttraction")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="new-name" className="text-sm">
                Name
              </Label>
              <Input
                id="new-name"
                placeholder="Attraction name"
                value={newAttraction.name}
                onChange={(e) =>
                  setNewAttraction((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-desc" className="text-sm">
                Description
              </Label>
              <Textarea
                id="new-desc"
                placeholder="Describe your attraction"
                value={newAttraction.description}
                onChange={(e) =>
                  setNewAttraction((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Category</Label>
                <Select
                  value={newAttraction.category}
                  onValueChange={(val) =>
                    setNewAttraction((prev) => ({ ...prev, category: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
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
                <Label htmlFor="new-price" className="text-sm">
                  Price (LAK)
                </Label>
                <Input
                  id="new-price"
                  type="number"
                  placeholder="0"
                  value={newAttraction.price}
                  onChange={(e) =>
                    setNewAttraction((prev) => ({
                      ...prev,
                      price: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-location" className="text-sm">
                Location
              </Label>
              <Input
                id="new-location"
                placeholder="City or region"
                value={newAttraction.location}
                onChange={(e) =>
                  setNewAttraction((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">{t("dashboard.uploadImages")}</Label>
              <div className="flex items-center justify-center w-full h-20 sm:h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-teal-500/50 transition-colors cursor-pointer">
                <div className="text-center">
                  <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground mx-auto mb-1" />
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Click to upload images
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 min-w-0">
                <Share2 className="w-4 h-4 text-teal-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium">
                    {t("dashboard.socialShare")}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    {t("dashboard.enableSocialShare")}
                  </p>
                </div>
              </div>
              <Switch
                checked={newAttraction.socialShare}
                onCheckedChange={(checked) =>
                  setNewAttraction((prev) => ({
                    ...prev,
                    socialShare: checked,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              {t("common.cancel")}
            </Button>
            <Button
              className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
              onClick={handleCreateAttraction}
            >
              {t("common.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                <Label htmlFor="edit-name" className="text-sm">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editingAttraction.name}
                  onChange={(e) =>
                    setEditingAttraction((prev) =>
                      prev ? { ...prev, name: e.target.value } : prev,
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-desc" className="text-sm">
                  Description
                </Label>
                <Textarea
                  id="edit-desc"
                  value={editingAttraction.description}
                  onChange={(e) =>
                    setEditingAttraction((prev) =>
                      prev ? { ...prev, description: e.target.value } : prev,
                    )
                  }
                  className="min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Category</Label>
                  <Select
                    value={editingAttraction.category}
                    onValueChange={(val) =>
                      setEditingAttraction((prev) =>
                        prev ? { ...prev, category: val } : prev,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
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
                  <Label htmlFor="edit-price" className="text-sm">
                    Price (LAK)
                  </Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editingAttraction.price}
                    onChange={(e) =>
                      setEditingAttraction((prev) =>
                        prev
                          ? { ...prev, price: Number(e.target.value) }
                          : prev,
                      )
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location" className="text-sm">
                  Location
                </Label>
                <Input
                  id="edit-location"
                  value={editingAttraction.location}
                  onChange={(e) =>
                    setEditingAttraction((prev) =>
                      prev ? { ...prev, location: e.target.value } : prev,
                    )
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              {t("common.cancel")}
            </Button>
            <Button
              className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
              onClick={handleEditAttraction}
            >
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );

  // ─── TOURIST DASHBOARD ───────────────────────────────────────────
  const renderTouristDashboard = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 sm:space-y-6"
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {[
          {
            title: t("travelPlans.myPlans"),
            value: plans.length,
            icon: FileText,
            accent: "from-teal-500 to-emerald-600",
          },
          {
            title: t("sidebar.favorites", "Favorites"),
            value: favorites.length,
            icon: Star,
            accent: "from-amber-500 to-orange-600",
          },
        ].map((stat) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className="border-0 shadow-md relative overflow-hidden">
              <div
                className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${stat.accent}`}
              />
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${stat.accent} shadow-sm`}
                  >
                    <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-semibold">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { label: "Browse", icon: Eye, href: "/attractions" },
                { label: "Plan", icon: FileText, href: "/travel-plans" },
                { label: "Map", icon: MapPin, href: "/map" },
              ].map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="h-auto py-3 sm:py-4 flex flex-col items-center gap-1.5 sm:gap-2 border-teal-500/20 hover:bg-teal-500/10 hover:border-teal-500/40 transition-all"
                  asChild
                >
                  <a href={action.href}>
                    <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-teal-500/15 to-emerald-500/15">
                      <action.icon className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                    </div>
                    <span className="text-[10px] sm:text-sm font-medium">
                      {action.label}
                    </span>
                  </a>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              My Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {(reviews || []).slice(0, 4).map((review) => {
                const attraction = (localAttractions || []).find(
                  (a) => a.id === review.attractionId,
                );
                return (
                  <div
                    key={review.id}
                    className="p-3 sm:p-4 rounded-xl border bg-card"
                  >
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <span className="text-xs sm:text-sm font-medium text-teal-600 truncate">
                        {attraction?.name || "Unknown"}
                      </span>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {review.comment}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">
                      {review.date}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderContent = () => {
    switch (role) {
      case "ADMIN":
        return renderAdminDashboard();
      case "STAFF":
        return renderStaffDashboard();
      case "ENTREPRENEUR":
        return renderEntrepreneurDashboard();
      case "TOURIST":
      default:
        return renderTouristDashboard();
    }
  };

  const roleGreeting: Record<string, string> = {
    ADMIN: "Admin Dashboard",
    STAFF: "Staff Dashboard",
    ENTREPRENEUR: "Entrepreneur Dashboard",
    TOURIST: "Traveler Dashboard",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20">
      <Sidebar />

      {/* Main content area - offset for sidebar on desktop only */}
      <div className="lg:pl-[264px] transition-all duration-300">
        <main className="p-3 sm:p-4 lg:p-8 max-w-7xl mx-auto">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-4 sm:mb-6 lg:mb-8"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">
                  {t("dashboard.title")}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate">
                  {roleGreeting[role] || "Dashboard"} - Welcome back,{" "}
                  {user?.name || "Guest"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* Mobile sidebar toggle */}
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden relative"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="relative hidden sm:flex"
                >
                  <Bell className="w-4 h-4" />
                  {pendingAttractions.length > 0 && role !== "TOURIST" && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                      {pendingAttractions.length}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Role-based Content */}
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
