"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Star, MapPin, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAttractionStore } from "@/stores/attraction-store";
import DashboardLayout from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function FavoritesPage() {
  const { t } = useTranslation();
  const { favorites = [], toggleFavorite, attractions = [] } = useAttractionStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const allAttractions = attractions;
  const favoriteAttractions = allAttractions.filter((a) => favorites.includes(a.id));

  if (!mounted) return null;

  return (
    <DashboardLayout title={t("sidebar.favorites")} subtitle={`${favoriteAttractions.length} saved attractions`}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
        {favoriteAttractions.length === 0 ? (
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-md">
              <CardContent className="py-12 text-center">
                <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">No favorites yet</p>
                <Button asChild className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
                  <Link href="/attractions">Browse Attractions</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {favoriteAttractions.map((a) => (
              <motion.div key={a.id} variants={itemVariants}>
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {a.images[0] ? (
                      <img src={a.images[0]} alt={a.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center">
                        <Building2 className="w-10 h-10 text-teal-500/50" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
                    <h3 className="absolute bottom-3 left-3 right-3 text-sm sm:text-base font-bold text-white truncate">{a.name}</h3>
                    <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors" onClick={() => toggleFavorite(a.id)}>
                      <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                    </button>
                  </div>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span className="text-xs text-muted-foreground truncate">{a.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-medium">{a.rating}</span>
                      <span className="text-[10px] text-muted-foreground">({a.reviewCount})</span>
                    </div>
                    <Button asChild variant="outline" size="sm" className="w-full mt-3 text-xs border-teal-500/30 text-teal-600 hover:bg-teal-500/10">
                      <Link href={`/attractions/${a.id}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
