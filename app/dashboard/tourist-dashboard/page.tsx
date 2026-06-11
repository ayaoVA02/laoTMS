"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, FileText, Eye, MapPin, Map, Building2, Heart, Lock } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useAttractionStore } from "@/stores/attraction-store";
import Link from "next/link";
import type { TouristTab } from "@/stores/app-store";

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
  activeTab?: TouristTab;
  onTabChange?: (tab: TouristTab) => void;
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  plansCount,
  favoritesCount,
  myReviews,
  reviewsLoading,
}: {
  plansCount: number;
  favoritesCount: number;
  myReviews: Review[];
  reviewsLoading: boolean;
}) {
  const { t } = useTranslation();
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {[
          { title: t("travelPlans.myPlans"), value: plansCount,      icon: FileText, accent: "from-teal-500 to-emerald-600"  },
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
                { label: "Browse", icon: Eye,     href: "/attractions"  },
                { label: "Plan",   icon: FileText, href: "/travel-plans" },
                { label: "Map",    icon: MapPin,   href: "/map"          },
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

      <ReviewsList myReviews={myReviews} reviewsLoading={reviewsLoading} />
    </motion.div>
  );
}

// ─── My Plans Tab ─────────────────────────────────────────────────────────────

function MyPlansTab() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Map className="w-5 h-5 text-teal-500" />
              My Travel Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Map className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">Manage your travel plans here.</p>
              <Button asChild className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
                <a href="/travel-plans">Go to Travel Plans</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ─── Favorites Tab ────────────────────────────────────────────────────────────

function FavoritesTab() {
  const { user, isAuthenticated } = useAuthStore();
  const { favorites = [], attractions = [], toggleFavorite, fetchFavorites } = useAttractionStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchFavorites(user.id);
    }
  }, [isAuthenticated, user, fetchFavorites]);

  const favoriteAttractions = attractions.filter((a) => favorites.includes(a.id));

  if (!isAuthenticated) {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md">
            <CardContent className="py-12 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-base font-semibold mb-1">Sign in to view favorites</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Save attractions and access them from your dashboard.
              </p>
              <Button asChild className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
                <a href="/auth/login">Sign In</a>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
      {/* Header count card */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 to-orange-600" />
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Saved Attractions</p>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
                  {favoriteAttractions.length}
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-sm">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Favorites list */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              My Favorites
            </CardTitle>
          </CardHeader>
          <CardContent>
            {favoriteAttractions.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">No favorites saved yet.</p>
                <Button asChild className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
                  <Link href="/attractions">Browse Attractions</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {favoriteAttractions.map((attraction) => (
                  <motion.div key={attraction.id} variants={itemVariants}>
                    <Card className="border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        {attraction.images?.[0] ? (
                          <Image
                            src={attraction.images[0]}
                            alt={attraction.name}
                            fill
                            sizes="(max-width: 640px) 100vw, 50vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center">
                            <Building2 className="w-10 h-10 text-teal-500/50" />
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
                        <h3 className="absolute bottom-2 left-3 right-10 text-sm font-semibold text-white truncate">
                          {attraction.name}
                        </h3>
                        {/* Remove from favorites */}
                        <button
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                          onClick={() => toggleFavorite(attraction.id)}
                          aria-label="Remove from favorites"
                        >
                          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                        </button>
                      </div>

                      {/* Info */}
                      <CardContent className="p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <MapPin className="w-3 h-3 text-teal-500 shrink-0" />
                          <span className="text-xs text-muted-foreground truncate">{attraction.location}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-xs font-medium">{attraction.rating}</span>
                          <span className="text-[10px] text-muted-foreground">({attraction.reviewCount})</span>
                        </div>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="w-full text-xs border-teal-500/30 text-teal-600 hover:bg-teal-500/10"
                        >
                          <Link href={`/attractions/${attraction.id}`}>View Details</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ─── Reviews List (shared) ────────────────────────────────────────────────────

function ReviewsList({ myReviews, reviewsLoading }: { myReviews: Review[]; reviewsLoading: boolean }) {
  return (
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
                          year: "numeric", month: "short", day: "numeric",
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
  );
}

// ─── Reviews Tab ──────────────────────────────────────────────────────────────

function ReviewsTab({ myReviews, reviewsLoading }: { myReviews: Review[]; reviewsLoading: boolean }) {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
      <ReviewsList myReviews={myReviews} reviewsLoading={reviewsLoading} />
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TouristDashboard({
  plansCount,
  favoritesCount,
  myReviews,
  reviewsLoading,
  activeTab = "overview",
  onTabChange,
}: TouristDashboardProps) {
  const renderTab = () => {
    switch (activeTab) {
      case "my-plans":
        return <MyPlansTab />;
      case "favorites":
        return <FavoritesTab />;
      case "reviews":
        return <ReviewsTab myReviews={myReviews} reviewsLoading={reviewsLoading} />;
      default:
        return (
          <OverviewTab
            plansCount={plansCount}
            favoritesCount={favoritesCount}
            myReviews={myReviews}
            reviewsLoading={reviewsLoading}
          />
        );
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        {renderTab()}
      </motion.div>
    </AnimatePresence>
  );
}