"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAttractionStore } from "@/stores/attraction-store";
import DashboardLayout from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function ReviewsPage() {
  const { t } = useTranslation();
  const { attractions = [] } = useAttractionStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const allReviews: { id: string; attractionId: string; userName: string; rating: number; comment: string; date: string }[] = [];
  const allAttractions = attractions;

  if (!mounted) return null;

  return (
    <DashboardLayout title={t("sidebar.reviews")} subtitle={`${allReviews.length} reviews written`}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
        {/* Rating Summary */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-4xl sm:text-5xl font-bold">4.5</p>
                  <div className="flex items-center gap-0.5 mt-1 justify-center">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className={`w-4 h-4 ${i <= 4 ? "text-amber-400 fill-amber-400" : i === 5 ? "text-amber-400 fill-amber-400/50" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{allReviews.length} reviews</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = allReviews.filter((r) => r.rating === rating).length;
                    const pct = allReviews.length > 0 ? (count / allReviews.length) * 100 : 0;
                    return (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-xs w-3 text-right">{rating}</span>
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground w-6">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reviews List */}
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
                {allReviews.map((review) => {
                  const attraction = allAttractions.find((a) => a.id === review.attractionId);
                  return (
                    <div key={review.id} className="p-3 sm:p-4 rounded-xl border bg-card">
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {attraction && (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center shrink-0">
                              <Building2 className="w-4 h-4 text-teal-500" />
                            </div>
                          )}
                          <span className="text-xs sm:text-sm font-medium text-teal-600 truncate">{attraction?.name || "Unknown"}</span>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">{review.date}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
