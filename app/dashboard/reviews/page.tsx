"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Star, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth-store";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

type UserReview = {
  id: string;
  attractionId: string;
  attractionName: string;
  rating: number;
  comment: string;
  date: string;
};

export default function ReviewsPage() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isAuthenticated || !user?.id) {
      setReviews([]);
      return;
    }

    const fetchUserReviews = async () => {
      setLoading(true);

      try {
        const { data: reviewRows, error: reviewError } = await supabase
          .from("reviews")
          .select("review_id, attraction_id, rating, content, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (reviewError) throw reviewError;

        const attractionIds = Array.from(
          new Set((reviewRows || []).map((review) => review.attraction_id)),
        );
        const attractionNames: Record<string, string> = {};

        if (attractionIds.length > 0) {
          const { data: attractionRows, error: attractionError } = await supabase
            .from("attractions")
            .select("attraction_id, name_en")
            .in("attraction_id", attractionIds);

          if (attractionError) throw attractionError;

          (attractionRows || []).forEach((attraction) => {
            attractionNames[attraction.attraction_id] = attraction.name_en;
          });
        }

        setReviews(
          (reviewRows || []).map((review) => ({
            id: review.review_id,
            attractionId: review.attraction_id,
            attractionName:
              attractionNames[review.attraction_id] || "Unknown Attraction",
            rating: Number(review.rating) || 0,
            comment: review.content || "No comment provided.",
            date: review.created_at
              ? new Date(review.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "",
          })),
        );
      } catch (error) {
        console.error("Failed to fetch user reviews:", error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserReviews();
  }, [mounted, isAuthenticated, user?.id]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  }, [reviews]);

  const roundedAverage = Math.round(averageRating);

  if (!mounted) return null;

  if (!isAuthenticated) {
    return (
      <DashboardLayout title={t("sidebar.reviews")} subtitle="Sign in required">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 text-sm text-muted-foreground">
            Please sign in to view your reviews.
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={t("sidebar.reviews")}
      subtitle={`${reviews.length} reviews written`}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4 sm:space-y-6"
      >
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-4xl sm:text-5xl font-bold">
                    {averageRating.toFixed(1)}
                  </p>
                  <div className="flex items-center gap-0.5 mt-1 justify-center">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i <= roundedAverage
                            ? "text-amber-400 fill-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {reviews.length} reviews
                  </p>
                </div>

                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = reviews.filter(
                      (review) => review.rating === rating,
                    ).length;
                    const pct =
                      reviews.length > 0 ? (count / reviews.length) * 100 : 0;

                    return (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-xs w-3 text-right">{rating}</span>
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground w-6">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
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
                {loading ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Loading your reviews...
                  </p>
                ) : reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div
                      key={review.id}
                      className="p-3 sm:p-4 rounded-xl border bg-card"
                    >
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-teal-500" />
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-teal-600 truncate">
                            {review.attractionName}
                          </span>
                        </div>

                        <div className="flex items-center gap-0.5 shrink-0">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                                i < review.rating
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {review.comment}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">
                        {review.date}
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
    </DashboardLayout>
  );
}