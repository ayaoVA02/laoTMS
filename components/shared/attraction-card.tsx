"use client";

import { motion } from "framer-motion";
import { Star, MapPin, Heart, Clock } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useAttractionStore } from "@/stores/attraction-store";
import type { Attraction } from "@/stores/attraction-store";
import Image from "next/image";

interface AttractionCardProps {
  attraction: Attraction;
  index?: number;
}

export default function AttractionCard({
  attraction,
  index = 0,
}: AttractionCardProps) {
  const { t } = useTranslation();
  const { favorites, toggleFavorite } = useAttractionStore();
  const isFavorite = favorites?.includes(attraction.id) ?? false;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("lo-LA", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(price) + " " + t("currency.lak", "LAK");
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const stars = [];

    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < fullStars
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut",
      }}
    >
      <Link href={`/attractions/${attraction.id}`} className="group block">
        <div className="overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl">
          {/* Image Section */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={attraction.images[0]}
              alt={attraction.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Category Badge (Top-Left) */}
            <span className="absolute left-3 top-3 rounded-full bg-teal-500 px-3 py-1 text-xs font-semibold text-white">
              {attraction.category}
            </span>

            {/* Favorite Heart Button (Top-Right) */}
            <motion.button
              whileTap={{ scale: 0.7 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(attraction.id);
              }}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-colors hover:bg-white"
              aria-label={
                isFavorite
                  ? t("attractions.removeFavorite", "Remove from favorites")
                  : t("attractions.addFavorite", "Add to favorites")
              }
            >
              <motion.div
                animate={{ scale: isFavorite ? [1, 1.3, 1] : 1 }}
                transition={{ duration: 0.3 }}
              >
                <Heart
                  className={`h-5 w-5 transition-colors ${
                    isFavorite
                      ? "fill-rose-500 text-rose-500"
                      : "text-gray-600"
                  }`}
                />
              </motion.div>
            </motion.button>

            {/* Name on Gradient */}
            <h3 className="absolute bottom-3 left-3 right-3 text-lg font-bold text-white drop-shadow-md line-clamp-2">
              {attraction.name}
            </h3>
          </div>

          {/* Details Section */}
          <div className="space-y-2.5 p-4">
            {/* Location */}
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <MapPin className="h-4 w-4 shrink-0 text-teal-500" />
              <span className="truncate">{attraction.location}</span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {renderStars(attraction.rating)}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {attraction.rating.toFixed(1)}
              </span>
              {attraction.reviewCount && (
                <span className="text-xs text-gray-400">
                  ({attraction.reviewCount})
                </span>
              )}
            </div>

            {/* Price */}
            <div className="text-lg font-bold text-teal-600">
              {formatPrice(attraction.price)}
            </div>

            {/* Open Time */}
            {attraction.openTime && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Clock className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>{attraction.openTime}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
