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
  User,
} from "lucide-react";
import { useAuthStore, type UserRole } from "@/stores/auth-store";
import { useAppStore, type TouristTab } from "@/stores/app-store";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { logoLaoTMS } from "@/assets";

interface MenuItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  tabKey: TouristTab;
}

interface SidebarProps {
  viewMode?: "ROLE" | "TOURIST";
}

const roleMenuItems: Record<UserRole, MenuItem[]> = {
  ADMIN: [
    {
      href: "/dashboard",
      labelKey: "sidebar.overview",
      icon: LayoutDashboard,
      tabKey: "overview",
    },
    {
      href: "/dashboard/users",
      labelKey: "sidebar.users",
      icon: Users,
      tabKey: "overview",
    },
    {
      href: "/dashboard/attractions",
      labelKey: "sidebar.attractions",
      icon: Building2,
      tabKey: "overview",
    },
    {
      href: "/dashboard/settings",
      labelKey: "sidebar.settings",
      icon: Settings,
      tabKey: "overview",
    },
  ],
  STAFF: [
    {
      href: "/dashboard",
      labelKey: "sidebar.overview",
      icon: LayoutDashboard,
      tabKey: "overview",
    },
    {
      href: "/dashboard/approve-attractions",
      labelKey: "sidebar.approveAttractions",
      icon: CheckSquare,
      tabKey: "overview",
    },
    {
      href: "/dashboard/categories",
      labelKey: "sidebar.categories",
      icon: Tag,
      tabKey: "overview",
    },
    {
      href: "/dashboard/notifications",
      labelKey: "sidebar.notifications",
      icon: Bell,
      tabKey: "overview",
    },
  ],
  ENTREPRENEUR: [
    {
      href: "/dashboard",
      labelKey: "sidebar.overview",
      icon: LayoutDashboard,
      tabKey: "overview",
    },
    {
      href: "/dashboard/my-attractions",
      labelKey: "sidebar.myAttractions",
      icon: Building2,
      tabKey: "overview",
    },
    {
      href: "/dashboard/create-attraction",
      labelKey: "sidebar.createAttraction",
      icon: Plus,
      tabKey: "overview",
    },
    {
      href: "/dashboard/promotions",
      labelKey: "sidebar.promotions",
      icon: BarChart3,
      tabKey: "overview",
    },
    {
      href: "/dashboard/notifications",
      labelKey: "sidebar.notifications",
      icon: Bell,
      tabKey: "overview",
    },
  ],
  TOURIST: [
    {
      href: "/dashboard",
      labelKey: "sidebar.overview",
      icon: LayoutDashboard,
      tabKey: "overview",
    },
    {
      href: "/dashboard/my-plans",
      labelKey: "sidebar.myPlans",
      icon: Map,
      tabKey: "my-plans",
    },
    {
      href: "/dashboard/favorites",
      labelKey: "sidebar.favorites",
      icon: Building2,
      tabKey: "favorites",
    },
    {
      href: "/dashboard/reviews",
      labelKey: "sidebar.reviews",
      icon: FileText,
      tabKey: "reviews",
    },
  ],
};

const roleBadgeColors: Record<UserRole | "TOURIST_VIEW", string> = {
  ADMIN: "bg-red-500/20 text-red-400 border-red-500/30",
  STAFF: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  ENTREPRENEUR: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  TOURIST: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  TOURIST_VIEW: "bg-sky-500/20 text-sky-400 border-sky-500/30 border-dashed",
};

const sidebarVariants = {
  expanded: { width: 264 },
  collapsed: { width: 72 },
};

const labelVariants = {
  expanded: { opacity: 1, x: 0, display: "block" },
  collapsed: { opacity: 0, x: -8, transitionEnd: { display: "none" } },
};

export default function Sidebar({ viewMode = "ROLE" }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const {
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    touristTab,
    setTouristTab,
  } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Set initial sidebar state based on screen width
    // Assuming 'lg' breakpoint is 1024px, consistent with Tailwind's default
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true); // Always show on desktop
    } else {
      setSidebarOpen(false); // Close on mobile
    }
  }, [setSidebarOpen]);

  const menuItems = useMemo(() => {
    if (!user || viewMode === "TOURIST") return roleMenuItems.TOURIST;
    return roleMenuItems[user.role ?? "TOURIST"];
  }, [user, viewMode]);

  const isCollapsed = !sidebarOpen;

  if (!mounted) return null;

  return (
    <>
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
                className="flex items-center gap-2"
              >
                <div className="flex items-center justify-center shrink-0">
                  <Image
                    src={logoLaoTMS}
                    alt="LaoTMS"
                    width={40} // Increased from 32
                    height={40} // Increased from 32
                    className="object-contain"
                    priority
                  />
                </div>
                <span className="text-base font-semibold tracking-wide bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
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
                <div className="flex items-center justify-center shrink-0">
                  <Image
                    src={logoLaoTMS}
                    alt="LaoTMS"
                    width={40} // Keeps the collapsed state matching and big
                    height={40}
                    className="object-contain"
                    priority
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-1">
          {menuItems.map((item: any, index: any) => {
            const Icon = item.icon;
            const isTouristView = viewMode === "TOURIST";

            // Active state: tourist view uses tab key, role view uses pathname
            const isActive = isTouristView
              ? touristTab === item.tabKey
              : pathname === item.href;

            const sharedClassName = `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-teal-500/15 text-teal-400 shadow-sm shadow-teal-500/10"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            }`;

            const innerContent = (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-gradient-to-b from-teal-400 to-emerald-500"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
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
              </>
            );

            return (
              <motion.div
                key={`${item.href}-${item.tabKey}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04, duration: 0.2 }}
              >
                {isTouristView ? (
                  // Tourist view: tab switching, no URL navigation
                  <button
                    onClick={() => {
                      setTouristTab(item.tabKey);
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    className={`w-full ${sharedClassName}`}
                  >
                    {innerContent}
                  </button>
                ) : (
                  // Role view: normal routing
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    className={sharedClassName}
                  >
                    {innerContent}
                  </Link>
                )}
              </motion.div>
            );
          })}
        </nav>

        {/* Collapse toggle — desktop only */}
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

        {/* User info */}
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
                  viewMode === "TOURIST" && user?.role !== "TOURIST"
                    ? roleBadgeColors.TOURIST_VIEW
                    : roleBadgeColors[user?.role || "TOURIST"]
                }`}
              >
                {viewMode === "TOURIST" && user?.role !== "TOURIST"
                  ? "Previewing Traveler"
                  : user?.role || "TOURIST"}
              </span>
            </motion.div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
