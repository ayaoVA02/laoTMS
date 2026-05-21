"use client";

import { motion } from "framer-motion";
import { Home, Compass, Route, Map, LayoutDashboard, Heart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth-store";

const tabs = [
  { href: "/", icon: Home, labelKey: "nav.home" },
  { href: "/attractions", icon: Compass, labelKey: "nav.attractions" },
  { href: "/travel-plans", icon: Route, labelKey: "nav.travelPlans" },
  { href: "/favorites", icon: Heart, labelKey: "nav.favorites" },
  { href: "/map", icon: Map, labelKey: "nav.map" },
  { href: "/dashboard", icon: LayoutDashboard, labelKey: "nav.dashboard" },
];

export default function MobileTabBar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-background/90 backdrop-blur-xl border-t border-border/50 px-2 pb-[env(safe-area-inset-bottom)]">
        <nav className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/"
                ? pathname === "/"
                : pathname.startsWith(tab.href);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative flex flex-col items-center justify-center gap-0.5 w-16 h-full"
              >
                <div className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="mobileTabIndicator"
                      className="absolute -inset-2 rounded-xl bg-teal-500/10"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}
                  <motion.div
                    whileTap={{ scale: 0.85 }}
                    className="relative z-10"
                  >
                    <Icon
                      className={`w-5 h-5 transition-colors duration-200 ${
                        isActive
                          ? "text-teal-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  </motion.div>
                </div>
                <span
                  className={`text-[10px] font-medium leading-tight transition-colors duration-200 ${
                    isActive ? "text-teal-500" : "text-muted-foreground"
                  }`}
                >
                  {t(tab.labelKey)}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="mobileTabDot"
                    className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-teal-500"
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 30,
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
