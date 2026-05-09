"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Shield,
  Camera,
  Edit3,
  Save,
  X,
  MapPin,
  Calendar,
  Star,
  Heart,
  FileText,
  Globe,
  Bell,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore, type UserRole } from "@/stores/auth-store";
import { useAttractionStore } from "@/stores/attraction-store";
import { useTravelPlanStore } from "@/stores/travel-plan-store";
import { useNotificationStore } from "@/stores/notification-store";
import { useAppStore } from "@/stores/app-store";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

const roleColors: Record<UserRole, string> = {
  ADMIN: "from-red-500 to-rose-600",
  STAFF: "from-teal-500 to-emerald-600",
  ENTREPRENEUR: "from-amber-500 to-orange-600",
  TOURIST: "from-sky-500 to-blue-600",
};

const roleBadgeColors: Record<UserRole, string> = {
  ADMIN: "bg-red-500/15 text-red-600 border-red-500/25",
  STAFF: "bg-teal-500/15 text-teal-600 border-teal-500/25",
  ENTREPRENEUR: "bg-amber-500/15 text-amber-600 border-amber-500/25",
  TOURIST: "bg-sky-500/15 text-sky-600 border-sky-500/25",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { favorites = [] } = useAttractionStore();
  const { plans = [] } = useTravelPlanStore();
  const { unreadCount } = useNotificationStore();
  const { language, setLanguage } = useAppStore();
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: "Passionate traveler exploring the beauty of Laos. Love temples, nature, and local cuisine.",
    phone: "+856 20 1234 5678",
    location: "Vientiane, Laos",
  });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        bio: "Passionate traveler exploring the beauty of Laos. Love temples, nature, and local cuisine.",
        phone: "+856 20 1234 5678",
        location: "Vientiane, Laos",
      });
    }
  }, [user]);

  if (!mounted) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold mb-2">Sign in to view your profile</h2>
          <p className="text-sm text-muted-foreground mb-6">Access your personalized profile, settings, and activity.</p>
          <Button asChild className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
            <a href="/auth/login">Sign In</a>
          </Button>
        </motion.div>
      </div>
    );
  }

  const role = user?.role || "TOURIST";

  const stats = [
    { label: "Travel Plans", value: plans.length, icon: FileText },
    { label: "Favorites", value: favorites.length, icon: Heart },
    { label: "Reviews", value: 4, icon: Star },
    { label: "Notifications", value: unreadCount, icon: Bell },
  ];

  const handleSave = () => {
    setEditing(false);
  };

  const handleLanguageChange = (lang: "en" | "la") => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20">
      <div className="max-w-4xl mx-auto p-3 sm:p-4 lg:p-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
          {/* Profile Header Card */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg overflow-hidden">
              {/* Cover gradient */}
              <div className={`h-28 sm:h-36 bg-gradient-to-r ${roleColors[role]} relative`}>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-50" />
              </div>

              <div className="px-4 sm:px-6 pb-5 sm:pb-6">
                {/* Avatar - overlapping the cover */}
                <div className="relative -mt-12 sm:-mt-14 mb-4 flex items-end gap-4">
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-xl shadow-teal-500/20 border-4 border-white dark:border-slate-900">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white dark:bg-slate-800 border border-border shadow-sm flex items-center justify-center hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors">
                      <Camera className="w-3.5 h-3.5 text-teal-600" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl sm:text-2xl font-bold truncate">{user?.name || "User"}</h1>
                      <Badge variant="outline" className={`${roleBadgeColors[role]} text-[10px] sm:text-xs`}>
                        <Shield className="w-3 h-3 mr-1" />
                        {t(`roles.${role.toLowerCase()}`)}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">{user?.email}</p>
                  </div>
                  <Button
                    variant={editing ? "destructive" : "outline"}
                    size="sm"
                    className="shrink-0"
                    onClick={() => editing ? setEditing(false) : setEditing(true)}
                  >
                    {editing ? <X className="w-4 h-4 mr-1.5" /> : <Edit3 className="w-4 h-4 mr-1.5" />}
                    <span className="hidden sm:inline">{editing ? "Cancel" : "Edit"}</span>
                  </Button>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-4 gap-2 sm:gap-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="text-center p-2 sm:p-3 rounded-xl bg-muted/50">
                      <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 mx-auto text-teal-500 mb-1" />
                      <p className="text-lg sm:text-2xl font-bold">{stat.value}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Edit Profile Form */}
          {editing && (
            <motion.div variants={itemVariants} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-teal-500" />
                    Edit Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="profile-name" className="text-sm">Full Name</Label>
                      <Input id="profile-name" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-email" className="text-sm">Email</Label>
                      <Input id="profile-email" type="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="profile-phone" className="text-sm">Phone</Label>
                      <Input id="profile-phone" value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-location" className="text-sm">Location</Label>
                      <Input id="profile-location" value={formData.location} onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-bio" className="text-sm">Bio</Label>
                    <Textarea id="profile-bio" value={formData.bio} onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))} className="min-h-[80px]" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setEditing(false)}>{t("common.cancel")}</Button>
                    <Button className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white" onClick={handleSave}>
                      <Save className="w-4 h-4 mr-1.5" />
                      {t("common.save")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Profile Info (when not editing) */}
          {!editing && (
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    <User className="w-5 h-5 text-teal-500" />
                    About
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                      <Mail className="w-4 h-4 text-teal-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Email</p>
                        <p className="text-sm font-medium truncate">{formData.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                      <MapPin className="w-4 h-4 text-teal-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Location</p>
                        <p className="text-sm font-medium truncate">{formData.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                      <Calendar className="w-4 h-4 text-teal-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Member Since</p>
                        <p className="text-sm font-medium">January 2025</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/50">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Bio</p>
                      <p className="text-sm leading-relaxed">{formData.bio}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Settings */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <Globe className="w-5 h-5 text-teal-500" />
                  Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Language */}
                <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <Globe className="w-4 h-4 text-teal-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Language</p>
                      <p className="text-xs text-muted-foreground">Choose your preferred language</p>
                    </div>
                  </div>
                  <Select value={language} onValueChange={(val) => handleLanguageChange(val as "en" | "la")}>
                    <SelectTrigger className="w-28 sm:w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="la">Lao</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Theme */}
                <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-4 h-4 text-teal-500 shrink-0 flex items-center justify-center">
                      {theme === "dark" ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Theme</p>
                      <p className="text-xs text-muted-foreground">Toggle between light and dark mode</p>
                    </div>
                  </div>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="w-28 sm:w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notification preferences */}
                <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <Bell className="w-4 h-4 text-teal-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Push Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive alerts for updates</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                {/* Email notifications */}
                <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <Mail className="w-4 h-4 text-teal-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Email Notifications</p>
                      <p className="text-xs text-muted-foreground">Get updates via email</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg font-semibold">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {[
                  { label: "My Dashboard", icon: Shield, href: "/dashboard" },
                  { label: "My Travel Plans", icon: FileText, href: "/travel-plans" },
                  { label: "Notifications", icon: Bell, href: "/notifications" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <link.icon className="w-4 h-4 text-teal-500" />
                      <span className="text-sm font-medium">{link.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-teal-500 transition-colors" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Danger Zone */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-md border-t-2 border-t-red-500/20">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg font-semibold text-red-600">Account</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                  <div>
                    <p className="text-sm font-medium">Sign Out</p>
                    <p className="text-xs text-muted-foreground">Sign out of your account on this device</p>
                  </div>
                  <Button variant="destructive" size="sm" className="shrink-0" onClick={logout}>
                    <LogOut className="w-4 h-4 mr-1.5" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
