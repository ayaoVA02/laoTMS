"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  CheckCheck,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Users,
  Info,
  BellRing,
  BellOff,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNotificationStore } from "@/stores/notification-store";
import { useAuthStore } from "@/stores/auth-store";
import {
  requestNotificationPermission,
  getFCMToken,
  setupForegroundNotifications,
} from "@/lib/notifications";
import DashboardLayout from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  approved: { icon: CheckCircle, color: "text-emerald-500" },
  rejected: { icon: XCircle, color: "text-red-500" },
  update_reminder: { icon: Clock, color: "text-amber-500" },
  auto_hidden: { icon: AlertTriangle, color: "text-orange-500" },
  social_post: { icon: Users, color: "text-sky-500" },
  info: { icon: Info, color: "text-teal-500" },
};

export default function DashboardNotificationsPage() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();
  const {
    notifications = [],
    unreadCount,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotificationStore();
  const [mounted, setMounted] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated && user) {
      fetchNotifications(user.id);
    }
  }, [isAuthenticated, user, fetchNotifications]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPushSupported(true);
      setPushEnabled(Notification.permission === "granted");
    }
  }, []);

  useEffect(() => {
    if (pushEnabled) {
      setupForegroundNotifications();
    }
  }, [pushEnabled]);

  const handleTogglePush = async () => {
    if (!pushEnabled) {
      const permission = await requestNotificationPermission();
      if (permission === "granted") {
        const token = await getFCMToken();
        setFcmToken(token);
        setPushEnabled(true);
      }
    } else {
      setPushEnabled(false);
      setFcmToken(null);
    }
  };

  if (!mounted) return null;

  return (
    <DashboardLayout
      title={t("sidebar.notifications")}
      subtitle={`${unreadCount} unread notifications`}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4 sm:space-y-6"
      >
        {/* Push Notification Settings */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center">
                    {pushEnabled ? (
                      <BellRing className="w-5 h-5 text-teal-500" />
                    ) : (
                      <BellOff className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Push Notifications</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      {pushEnabled
                        ? "You will receive push notifications for new alerts"
                        : "Enable push notifications to get real-time alerts"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {pushEnabled && fcmToken && (
                    <Badge
                      variant="outline"
                      className="text-[9px] border-emerald-500/30 text-emerald-600"
                    >
                      Connected
                    </Badge>
                  )}
                  {pushSupported ? (
                    <Switch
                      checked={pushEnabled}
                      onCheckedChange={handleTogglePush}
                    />
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-[9px] border-slate-500/30 text-slate-500"
                    >
                      Not Supported
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mark All Read */}
        <motion.div variants={itemVariants} className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            // FIXED: Passing user.id here to let Supabase filter the right data rows
            onClick={() => user && markAllAsRead(user.id)}
            disabled={!user || unreadCount === 0}
            className="gap-1.5"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All Read
          </Button>
        </motion.div>

        {/* Notifications List */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md">
            <CardContent className="p-0">
              {notifications.length === 0 ? (
                <div className="text-center py-10">
                  <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No notifications
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {notifications.map((n) => {
                    const config = typeConfig[n.type] || typeConfig.info;
                    const Icon = config.icon;
                    const color = config.color;
                    return (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 p-3 sm:p-4 hover:bg-muted/30 transition-colors cursor-pointer ${
                          !n.read ? "bg-teal-500/5" : ""
                        }`}
                        // FIXED: Added an optimization check so clicking already-read cards doesn't repeat API calls
                        onClick={() => !n.read && markAsRead(n.id)}
                      >
                        <div
                          className={`mt-0.5 p-1.5 sm:p-2 rounded-lg bg-muted shrink-0 ${color}`}
                        >
                          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium">
                            {n.title}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-snug">
                            {n.message}
                          </p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!n.read && (
                          <div className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-2" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}