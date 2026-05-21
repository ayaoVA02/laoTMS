"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Map,
  Building2,
  CheckSquare,
  FileText,
  BarChart3,
  Users,
  Settings,
  X,
  ChevronRight,
  Plus,
  Bell,
  Tag,
} from "lucide-react";
import { useAuthStore, type UserRole } from "@/stores/auth-store";
import { useAppStore } from "@/stores/app-store";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

interface MenuItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
}

const roleMenuItems: Record<UserRole, MenuItem[]> = {
  ADMIN: [
    { href: "/dashboard", labelKey: "sidebar.overview", icon: LayoutDashboard },
    {
      href: "/dashboard/analytics",
      labelKey: "sidebar.analytics",
      icon: BarChart3,
    },
    { href: "/dashboard/users", labelKey: "sidebar.users", icon: Users },
    {
      href: "/dashboard/attractions",
      labelKey: "sidebar.attractions",
      icon: Building2,
    },
    {
      href: "/dashboard/settings",
      labelKey: "sidebar.settings",
      icon: Settings,
    },
  ],
  STAFF: [
    { href: "/dashboard", labelKey: "sidebar.overview", icon: LayoutDashboard },
    {
      href: "/dashboard/approve-attractions",
      labelKey: "sidebar.approveAttractions",
      icon: CheckSquare,
    },
    {
      href: "/dashboard/categories",
      labelKey: "sidebar.categories",
      icon: Tag,
    },
    {
      href: "/dashboard/manage-content",
      labelKey: "sidebar.manageContent",
      icon: FileText,
    },
    {
      href: "/dashboard/notifications",
      labelKey: "sidebar.notifications",
      icon: Bell,
    },
  ],
  ENTREPRENEUR: [
    { href: "/dashboard", labelKey: "sidebar.overview", icon: LayoutDashboard },
    {
      href: "/dashboard/my-attractions",
      labelKey: "sidebar.myAttractions",
      icon: Building2,
    },
    {
      href: "/dashboard/create-attraction",
      labelKey: "sidebar.createAttraction",
      icon: Plus,
    },
    {
      href: "/dashboard/promotions",
      labelKey: "sidebar.promotions",
      icon: BarChart3,
    },
    {
      href: "/dashboard/notifications",
      labelKey: "sidebar.notifications",
      icon: Bell,
    },
  ],
  TOURIST: [
    { href: "/dashboard", labelKey: "sidebar.overview", icon: LayoutDashboard },
    { href: "/dashboard/my-plans", labelKey: "sidebar.myPlans", icon: Map },
    {
      href: "/dashboard/favorites",
      labelKey: "sidebar.favorites",
      icon: Building2,
    },
    { href: "/dashboard/reviews", labelKey: "sidebar.reviews", icon: FileText },
  ],
};

const roleBadgeColors: Record<UserRole, string> = {
  ADMIN: "bg-red-500/20 text-red-400 border-red-500/30",
  STAFF: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  ENTREPRENEUR: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  TOURIST: "bg-sky-500/20 text-sky-400 border-sky-500/30",
};

const sidebarVariants = {
  expanded: { width: 264 },
  collapsed: { width: 72 },
};

const labelVariants = {
  expanded: { opacity: 1, x: 0, display: "block" },
  collapsed: { opacity: 0, x: -8, transitionEnd: { display: "none" } },
};

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = useMemo(() => {
    if (!user) return roleMenuItems.TOURIST;
    return roleMenuItems[user.role];
  }, [user]);

  const isCollapsed = !sidebarOpen;

  if (!mounted) return null;

  return (
    <>
      {/* Mobile overlay - only when sidebar is open */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop sidebar - always visible on lg+, hidden on mobile unless opened */}
      <motion.aside
        initial={false}
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed top-0 left-0 z-50 h-screen flex flex-col bg-slate-900/95 dark:bg-slate-950/95 border-r border-slate-700/50 backdrop-blur-xl
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          transition-transform lg:transition-none duration-300`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700/50">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                key="full-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shrink-0">
                  <Map className="w-4.5 h-4.5 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                  LaoTMS
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="icon-only"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center w-full"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                  <Map className="w-4.5 h-4.5 text-white" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Close button - visible ONLY on mobile when sidebar is open */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-1">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04, duration: 0.2 }}
              >
                <Link
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-teal-500/15 text-teal-400 shadow-sm shadow-teal-500/10"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-gradient-to-b from-teal-400 to-emerald-500"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}

                  <motion.span
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`shrink-0 ${isActive ? "text-teal-400" : "text-slate-500 group-hover:text-teal-400/70"}`}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.span>

                  <motion.span
                    variants={labelVariants}
                    animate={isCollapsed ? "collapsed" : "expanded"}
                    transition={{ duration: 0.15 }}
                    className="whitespace-nowrap truncate"
                  >
                    {t(item.labelKey)}
                  </motion.span>

                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 text-xs font-medium text-white bg-slate-800 rounded-lg shadow-lg shadow-black/30 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-slate-700/50">
                      {t(item.labelKey)}
                    </div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Collapse/expand toggle - desktop only */}
        <div className="hidden lg:flex justify-center px-3 py-2 border-t border-slate-700/50">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 0 : 180 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.div>
            <motion.span
              variants={labelVariants}
              animate={isCollapsed ? "collapsed" : "expanded"}
              transition={{ duration: 0.15 }}
              className="text-xs font-medium whitespace-nowrap"
            >
              {t("sidebar.collapse")}
            </motion.span>
          </motion.button>
        </div>

        {/* User info section */}
        <div className="border-t border-slate-700/50 p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2.5 bg-slate-800/40">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-teal-500/20">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>

            <motion.div
              variants={labelVariants}
              animate={isCollapsed ? "collapsed" : "expanded"}
              transition={{ duration: 0.15 }}
              className="min-w-0 flex-1"
            >
              <p className="text-sm font-medium text-slate-200 truncate">
                {user?.name || "Guest"}
              </p>
              <span
                className={`inline-flex items-center mt-0.5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md border ${
                  roleBadgeColors[user?.role || "TOURIST"]
                }`}
              >
                {user?.role || "TOURIST"}
              </span>
            </motion.div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
