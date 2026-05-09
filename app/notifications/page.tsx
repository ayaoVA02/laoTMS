"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Trash2,
  Clock,
  Share2,
  Info,
  CheckCheck,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/layout/footer";

const typeConfig: Record<
  string,
  { icon: React.ElementType; accent: string; bg: string; border: string; iconColor: string }
> = {
  approved: {
    icon: CheckCircle,
    accent: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950/40",
    border: "border-l-teal-500",
    iconColor: "text-teal-500",
  },
  rejected: {
    icon: XCircle,
    accent: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/40",
    border: "border-l-red-500",
    iconColor: "text-red-500",
  },
  update_reminder: {
    icon: AlertTriangle,
    accent: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-l-amber-500",
    iconColor: "text-amber-500",
  },
  auto_hidden: {
    icon: Eye,
    accent: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-50 dark:bg-slate-900/40",
    border: "border-l-slate-400",
    iconColor: "text-slate-400",
  },
  social_post: {
    icon: Share2,
    accent: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-l-blue-500",
    iconColor: "text-blue-500",
  },
  info: {
    icon: Info,
    accent: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950/40",
    border: "border-l-teal-500",
    iconColor: "text-teal-500",
  },
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

const itemVariants = {
  initial: { opacity: 0, y: 16, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, x: -30, scale: 0.95 },
};

export default function NotificationsPage() {
  const { t } = useTranslation();
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } =
    useNotificationStore();
  const { user, isAuthenticated } = useAuthStore();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications(user.id);
    }
  }, [isAuthenticated, user]);

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

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleClickNotification = (id: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Page header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {t("notifications.title", "Notifications")}
                  {unreadCount > 0 && (
                    <Badge className="bg-teal-500 hover:bg-teal-600 text-white text-xs px-2 py-0.5 min-w-[20px] flex items-center justify-center">
                      {unreadCount}
                    </Badge>
                  )}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t(
                    "notifications.subtitle",
                    "Stay updated with your latest activities"
                  )}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                className="border-slate-200 dark:border-slate-700 text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:text-teal-400 dark:hover:text-teal-300 dark:hover:bg-teal-950/40 transition-colors"
              >
                <CheckCheck className="w-4 h-4 mr-1.5" />
                {t("notifications.markAllRead", "Mark All Read")}
              </Button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Push Notification Toggle */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center">
                  {pushEnabled ? (
                    <BellRing className="w-4 h-4 text-teal-500" />
                  ) : (
                    <BellOff className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">Push Notifications</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {pushEnabled
                      ? "Receiving real-time push alerts"
                      : "Enable to get real-time push alerts"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {pushEnabled && fcmToken && (
                  <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-600">
                    Connected
                  </Badge>
                )}
                {pushSupported ? (
                  <Switch checked={pushEnabled} onCheckedChange={handleTogglePush} />
                ) : (
                  <Badge variant="outline" className="text-[9px] border-slate-500/30 text-slate-500">
                    Not Supported
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification list */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6">
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
              {t("notifications.empty", "No notifications")}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              {t(
                "notifications.emptyDescription",
                "You're all caught up. New notifications will appear here."
              )}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {notifications.map((notification, index) => {
                const config = typeConfig[notification.type] || typeConfig.info;
                const Icon = config.icon;

                return (
                  <motion.div
                    key={notification.id}
                    variants={itemVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    layout
                    onClick={() =>
                      handleClickNotification(notification.id, notification.read)
                    }
                    className={`group relative flex items-start gap-4 p-4 rounded-xl border-l-4 cursor-pointer transition-all duration-200 ${config.border} ${
                      notification.read
                        ? "bg-white dark:bg-slate-900 border-r border-t border-b border-slate-200 dark:border-slate-800"
                        : `${config.bg} border-r border-t border-b border-slate-100 dark:border-slate-800`
                    } hover:shadow-md`}
                  >
                    {/* Icon */}
                    <div
                      className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                        notification.read
                          ? "bg-slate-100 dark:bg-slate-800"
                          : config.bg
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          notification.read
                            ? "text-slate-400 dark:text-slate-500"
                            : config.iconColor
                        }`}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3
                            className={`text-sm font-semibold leading-tight ${
                              notification.read
                                ? "text-slate-500 dark:text-slate-400"
                                : "text-slate-900 dark:text-white"
                            }`}
                          >
                            {notification.title}
                          </h3>
                          <p
                            className={`mt-1 text-sm leading-relaxed ${
                              notification.read
                                ? "text-slate-400 dark:text-slate-500"
                                : "text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            {notification.message}
                          </p>
                        </div>

                        {/* Unread indicator */}
                        {!notification.read && (
                          <div className="shrink-0 w-2.5 h-2.5 rounded-full bg-teal-500 mt-1.5" />
                        )}
                      </div>

                      {/* Timestamp */}
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(notification.createdAt)}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
