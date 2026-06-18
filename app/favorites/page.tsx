"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Building2, MapPin, Star, Lock } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth-store";
import { useAttractionStore } from "@/stores/attraction-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/layout/footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoginRequired from "@/components/shared/login-required";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function FavoritesPage() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();
  const { favorites = [], attractions = [], toggleFavorite, fetchFavorites } = useAttractionStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchFavorites(user.id);
    }
    // if(!isAuthenticated) router.push('/auth/login')
  }, [isAuthenticated, user, fetchFavorites]);

  if (!mounted) return null;

  if (!isAuthenticated) {
    return (
      <LoginRequired
        title={t("loginRequired.title", "Sign in to view favorites")}
        description={t("favorites.loginRequired", "Save and revisit your favorite attractions across Laos.")}
        redirectTo="/favorites"
      />
    );
  }

  const favoriteAttractions = attractions.filter((a) => favorites.includes(a.id));

  return (
    <div className="min-h-screen bg-gray-50">
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
              <p className="text-sm text-muted-foreground mb-4">{t("favorites.empty", "No favorites yet")}</p>
              <Button asChild className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
                <Link href="/attractions">{t("favorites.browseAttractions", "Browse Attractions")}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteAttractions.map((attraction) => (
              <Card key={attraction.id} className="border-0 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
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
                  <Button asChild variant="outline" size="sm" className="w-full mt-3 text-xs border-teal-500/30 text-teal-600 hover:bg-teal-500/10">
                    <Link href={`/attractions/${attraction.id}`}>{t("favorites.viewDetails", "View Details")}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
