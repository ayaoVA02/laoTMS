"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Menu, Bell } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useAppStore } from "@/stores/app-store";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const { user } = useAuthStore();
  const { setSidebarOpen } = useAppStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/20">
      <Sidebar />
      <div className="lg:pl-[264px] transition-all duration-300">
        <main className="p-3 sm:p-4 lg:p-8 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-4 sm:mb-6 lg:mb-8">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight truncate">{title}</h1>
                {subtitle && <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate">{subtitle}</p>}
              </div>
              <Button variant="outline" size="icon" className="lg:hidden relative" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
          {children}
        </main>
      </div>
    </div>
  );
}
