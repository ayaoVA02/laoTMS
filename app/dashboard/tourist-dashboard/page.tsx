"use client";

import { motion } from "framer-motion";
import { Star, FileText, Eye, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

interface Review {
  id: string;
  attractionName: string;
  rating: number;
  content: string;
  createdAt: string;
}

interface TouristDashboardProps {
  plansCount: number;
  favoritesCount: number;
  myReviews: Review[];
  reviewsLoading: boolean;
}

export default function TouristDashboard({
  plansCount,
  favoritesCount,
  myReviews,
  reviewsLoading,
}: TouristDashboardProps) {
  const { t } = useTranslation();

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {[
          { title: t("travelPlans.myPlans"), value: plansCount, icon: FileText, accent: "from-teal-500 to-emerald-600" },
          { title: t("sidebar.favorites", "Favorites"), value: favoritesCount, icon: Star, accent: "from-amber-500 to-orange-600" },
        ].map((stat) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card className="border-0 shadow-md relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${stat.accent}`} />
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${stat.accent} shadow-sm`}>
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
            <CardTitle className="text-base sm:text-lg font-semibold">Quick Actions</CardTitle>
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
                    <span className="text-[10px] sm:text-sm font-medium">{action.label}</span>
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
              {reviewsLoading ? (
                <p className="text-sm text-muted-foreground text-center py-6">Loading your reviews...</p>
              ) : myReviews.length > 0 ? (
                myReviews.map((review) => (
                  <div key={review.id} className="p-3 sm:p-4 rounded-xl border bg-card">
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <span className="text-xs sm:text-sm font-medium text-teal-600 truncate">
                        {review.attractionName}
                      </span>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                              i < review.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {review.content}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : ""}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">
                  You have not written any reviews yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}