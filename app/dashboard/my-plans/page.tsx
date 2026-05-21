"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Map, Calendar, MapPin, ChevronRight, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth-store";
import { useTravelPlanStore } from "@/stores/travel-plan-store";
import DashboardLayout from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function MyPlansPage() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();
  const { plans = [], fetchPlans } = useTravelPlanStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPlans(user.id);
    }
  }, [isAuthenticated, user, fetchPlans]);
  if (!mounted) return null;

  return (
    <DashboardLayout title={t("sidebar.myPlans")} subtitle="View and manage your travel plans">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
        <motion.div variants={itemVariants} className="flex justify-end">
          <Button asChild size="sm" className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
            <Link href="/travel-plans"><Plus className="w-4 h-4 mr-1.5" />Create New Plan</Link>
          </Button>
        </motion.div>

        {plans.length === 0 ? (
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-md">
              <CardContent className="py-12 text-center">
                <Map className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">No travel plans yet</p>
                <Button asChild className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
                  <Link href="/travel-plans">Create Your First Plan</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {plans.map((plan) => (
              <motion.div key={plan.id} variants={itemVariants}>
                <Link href={`/travel-plans/${plan.id}`}>
                  <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500/15 to-emerald-500/15">
                          <Map className="w-5 h-5 text-teal-600" />
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-teal-500 transition-colors" />
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold mb-1 truncate">{plan.name}</h3>
                      {plan.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{plan.description}</p>}
                      <div className="flex items-center gap-3 text-[10px] sm:text-xs text-muted-foreground">
                        <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{plan.startDate}</div>
                        <div className="flex items-center gap-1"><MapPin className="w-3 h-3" />{plan.attractionIds?.length || 0} stops</div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
