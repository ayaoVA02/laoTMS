"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Building2, MapPin, Star, Lock } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth-store";
import { useAttractionStore } from "@/stores/attraction-store";
import { useAppStore } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/layout/footer";
import Sidebar from "@/components/layout/sidebar";
import Link from "next/link";

export default function FavoritesPage() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();
  const { favorites = [], attractions = [], toggleFavorite, fetchFavorites } = useAttractionStore();

  // ── KEY FIX: set touristTab to "favorites" so the sidebar highlights it ──
  const { setTouristTab } = useAppStore();
  useEffect(() => {
    setTouristTab("favorites");
  }, [setTouristTab]);
  // ─────────────────────────────────────────────────────────────────────────

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchFavorites(user.id);
    }
  }, [isAuthenticated, user, fetchFavorites]);

  if (!mounted) return null;

  if (!isAuthenticated) {
    return (
      // No sidebar needed on the locked-out state — keep it simple
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Login Required</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Sign in to view and manage your saved favorites across Laos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
              <a href="/auth/login">Sign In</a>
            </Button>
            <Button asChild variant="outline" className="border-teal-500/30 text-teal-600 hover:bg-teal-500/10">
              <a href="/auth/register">Create Account</a>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const favoriteAttractions = attractions.filter((a) => favorites.includes(a.id));

  return (
    // ── KEY FIX: render Sidebar in TOURIST viewMode so it shows the tourist
    // menu and correctly highlights the Favorites tab via touristTab store ──
    <div className="min-h-screen bg-gray-50">
      <Sidebar viewMode="TOURIST" />

      <div className="lg:pl-[264px] transition-all duration-300">
        <div className="bg-gradient-to-br from-teal-600 to-emerald-700 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                    {t("sidebar.favorites", "Favorites")}
                  </h1>
                  <p className="mt-2 text-teal-100 text-sm sm:text-base">
                    {favoriteAttractions.length} saved attraction{favoriteAttractions.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {favoriteAttractions.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="py-12 text-center">
                <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">No favorites yet</p>
                <Button asChild className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
                  <Link href="/attractions">Browse Attractions</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteAttractions.map((attraction) => (
                <Card
                  key={attraction.id}
                  className="border-0 shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {attraction.images[0] ? (
                      <Image
                        src={attraction.images[0]}
                        alt={attraction.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center">
                        <Building2 className="w-10 h-10 text-teal-500/50" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
                    <h3 className="absolute bottom-3 left-3 right-3 text-sm sm:text-base font-semibold text-white truncate">
                      {attraction.name}
                    </h3>
                    <button
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                      onClick={() => toggleFavorite(attraction.id)}
                    >
                      <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                    </button>
                  </div>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span className="text-xs text-muted-foreground truncate">{attraction.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-medium">{attraction.rating}</span>
                      <span className="text-[10px] text-muted-foreground">({attraction.reviewCount})</span>
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 text-xs border-teal-500/30 text-teal-600 hover:bg-teal-500/10"
                    >
                      <Link href={`/attractions/${attraction.id}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}