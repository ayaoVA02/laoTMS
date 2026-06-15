"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Globe,
  Bell,
  User,
  ChevronDown,
  LogOut,
  Sun,
  Moon,
  LayoutDashboard,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useAppStore } from "@/stores/app-store";
import { useNotificationStore } from "@/stores/notification-store";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { logoLaoTMS } from "@/assets";


export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { language, setLanguage } = useAppStore();
  const { unreadCount } = useNotificationStore();
  const router = useRouter();

  const navLinks = [
    { href: "/", labelKey: "nav.home" },
    { href: "/attractions", labelKey: "nav.attractions" },
    { href: "/travel-plans", labelKey: "nav.travelPlans" },
    { href: "/favorites", labelKey: "nav.favorites" },
    { href: "/map", labelKey: "nav.map" },
    ...(isAuthenticated ? [{ href: "/dashboard", labelKey: "nav.dashboard" }] : []),
  ];
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(event.target as Node)
      ) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLanguageToggle = (lang: "en" | "la") => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    setLangDropdownOpen(false);
  };

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    logout();
    router.push("/");
    setUserDropdownOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="relative w-20 h-20 ">
              <Image
                src={logoLaoTMS}
                alt="LaoTMS Logo"
                fill
                className="object-cover p-1  "
                priority
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
              Laos
            </span>
          </Link>

          {/* Desktop Nav Links - hidden on mobile (tab bar replaces) */}
          <div className="hidden md:flex items-center gap-1 ml-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-3 py-2 text-sm font-medium transition-colors hover:text-teal-500"
                >
                  <span
                    className={
                      isActive ? "text-teal-500" : "text-muted-foreground"
                    }
                  >
                    {t(link.labelKey)}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Language Switcher - hidden on very small screens */}
            <div className="relative hidden sm:block" ref={langDropdownRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="gap-1 text-muted-foreground hover:text-teal-500"
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase">
                  {language}
                </span>
              </Button>
              <AnimatePresence>
                {langDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-1 w-28 rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-lg shadow-black/10 overflow-hidden"
                  >
                    <button
                      onClick={() => handleLanguageToggle("en")}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-teal-500/10 ${language === "en"
                        ? "text-teal-500 font-medium"
                        : "text-muted-foreground"
                        }`}
                    >
                      <span className="text-base">GB</span>
                      English
                    </button>
                    <button
                      onClick={() => handleLanguageToggle("la")}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-teal-500/10 ${language === "la"
                        ? "text-teal-500 font-medium"
                        : "text-muted-foreground"
                        }`}
                    >
                      <span className="text-base">LA</span>
                      Lao
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notification Bell */}
            <Link href="/notifications">
              <Button
                variant="ghost"
                size="sm"
                className="relative text-muted-foreground hover:text-teal-500"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </motion.span>
                )}
              </Button>
            </Link>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleThemeToggle}
              className="text-muted-foreground hover:text-teal-500"
            >
              <AnimatePresence mode="wait">
                {theme === "dark" ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>

            {/* User Menu / Auth Buttons */}
            {isAuthenticated ? (
              <div className="relative" ref={userDropdownRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="gap-1.5 text-muted-foreground hover:text-teal-500"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform hidden sm:block ${userDropdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </Button>
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-1 w-56 rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-lg shadow-black/10 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-border/50">
                        <p className="text-sm font-medium truncate">
                          {user?.name || user?.email}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user?.email}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-teal-500/10 hover:text-teal-500"
                        >
                          <User className="w-4 h-4" />
                          {t("nav.profile")}
                        </Link>

                        {isAuthenticated && (

                          <Link
                            href="/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-teal-500/10 hover:text-teal-500"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            {t("nav.dashboard")}
                          </Link>

                        )}
                      </div>
                      <div className="border-t border-border/50 py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 transition-colors hover:bg-red-500/10"
                        >
                          <LogOut className="w-4 h-4" />
                          {t("nav.logout")}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/auth/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 shadow-md shadow-teal-500/20"
                  >
                    {/* {t("nav.login")} */} Account
                  </Button>
                </Link>
                {/* <Link href="/auth/register">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 shadow-md shadow-teal-500/20"
                  >
                    {t("nav.register")}
                  </Button>
                </Link> */}
              </div>
            )}

            {/* Mobile Menu Toggle - only for non-authenticated users on mobile */}
            {!isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                className="sm:hidden text-muted-foreground hover:text-teal-500"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu - only for non-authenticated users */}
      <AnimatePresence>
        {mobileMenuOpen && !isAuthenticated && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="sm:hidden overflow-hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link, index) => {
                const isActive = pathname === link.href;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                        ? "bg-teal-500/10 text-teal-500"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        }`}
                    >
                      {t(link.labelKey)}
                    </Link>
                  </motion.div>
                );
              })}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.05 }}
                className="pt-2 space-y-2 border-t border-border/50 mt-2"
              >
                <Link href="/auth/login" className="block">
                  <Button
                    variant="outline"
                    className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 shadow-md shadow-teal-500/20"
                  >
                    {/* {t("nav.login")} */} Account
                  </Button>
                </Link>
                {/* <Link href="/auth/register" className="block">
                  <Button className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 shadow-md shadow-teal-500/20">
                    {t("nav.register")}
                  </Button>
                </Link> */}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
