"use client";

import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import {
  Search,
  MapPin,
  Calendar,
  ChevronRight,
  Star,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Tag,
  ChevronDown, ChevronUp
} from "lucide-react";
import { useTranslation } from "react-i18next";
import AttractionCard from "@/components/shared/attraction-card";
import { useAttractionStore } from "@/stores/attraction-store";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/layout/footer";
import {  useState } from "react";
import { Button } from '@/components/ui/button';

const popularDestinations = [
  {
    name: "Vientiane",
    count: 4,
    image:
      "https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    name: "Luang Prabang",
    count: 3,
    image:
      "https://images.pexels.com/photos/5726825/pexels-photo-5726825.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    name: "Vang Vieng",
    count: 1,
    image:
      "https://images.pexels.com/photos/2406979/pexels-photo-2406979.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    name: "Champasak",
    count: 1,
    image:
      "https://images.pexels.com/photos/2406981/pexels-photo-2406981.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
];

export default function Home() {
  const { t } = useTranslation();
  const { attractions = [], types = [] } = useAttractionStore();
  const promotions: { id: string; title: string; description: string; image: string; discount: number; validUntil: string; attractionId: string }[] = [];
  const featuredAttractions = attractions.filter((a) => a.featured);
  const [isExpanded, setIsExpanded] = useState(false);



  return (
    <div className="min-h-screen bg-gray-50">
    
      {/* ===== HERO SECTION ===== */}
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Laos scenery"
            fill
            className="object-cover"
            priority
          />
          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Sparkles badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/10 px-4 py-2 backdrop-blur-sm"
            >
              <Sparkles className="h-4 w-4 text-teal-300" />
              <span className="text-sm font-medium text-teal-200">
                {t(
                  "home.hero.badge",
                  "Discover the Hidden Gem of Southeast Asia"
                )}
              </span>
            </motion.div>

            {/* Main Title */}
            <h1 className="mb-4 text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              <span className="bg-gradient-to-r from-teal-300 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
                {t("home.hero.title", "Explore Laos")}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-200 sm:text-xl">
              {t(
                "home.hero.subtitle",
                "From ancient temples to turquoise waterfalls, uncover the magic of Laos with curated experiences and local insights."
              )}
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
            className="mx-auto max-w-4xl"
          >
            <div className="flex flex-col items-stretch gap-3 rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-xl sm:flex-row sm:items-center sm:gap-3">
              {/* Location Field */}
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/90 px-4 py-3">
                <MapPin className="h-5 w-5 shrink-0 text-teal-500" />
                <input
                  type="text"
                  placeholder={t("home.search.location", "Location...")}
                  className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
                />
              </div>

              {/* Type Dropdown */}
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/90 px-4 py-3">
                <Search className="h-5 w-5 shrink-0 text-teal-500" />
                <select
                  className="w-full bg-transparent text-sm text-gray-800 outline-none"
                  defaultValue=""
                >
                  <option value="" disabled>
                    {t("home.search.type", "Type of attraction")}
                  </option>
                  {types.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Field */}
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/90 px-4 py-3">
                <Calendar className="h-5 w-5 shrink-0 text-teal-500" />
                <input
                  type="date"
                  className="w-full bg-transparent text-sm text-gray-800 outline-none"
                />
              </div>

              {/* Search Button */}
              <button className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-8 py-3 font-semibold text-white shadow-lg shadow-teal-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/30 hover:brightness-110">
                <Search className="h-5 w-5" />
                <span>{t("home.search.button", "Search")}</span>
              </button>
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-8 text-white/70"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teal-400" />
              <span className="text-sm">
                {attractions.length}+ {t("home.stats.attractions", "Attractions")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-400" />
              <span className="text-sm">
                4.7 {t("home.stats.rating", "Avg Rating")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-400" />
              <span className="text-sm">
                8 {t("home.stats.destinations", "Destinations")}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CATEGORIES SECTION ===== */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {t("home.categories.title", "Browse by Category")}
            </h2>
            <p className="mt-3 text-gray-500">
              {t(
                "home.categories.subtitle",
                "Explore attractions tailored to your interests"
              )}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
            {types.filter(category=> category.is_active).map((category, index) => {
              const IconComponent = category.icon && (LucideIcons as unknown as Record<string, React.ElementType>)[category.icon]
                ? (LucideIcons as unknown as Record<string, React.ElementType>)[category.icon]
                : Tag;

              // Visibility Logic:
              // Mobile: Index < 6 (3 lines)
              // Desktop: Index < 8 (2 lines)
              // If isExpanded is true, show everything.
              const isHiddenMobile = index >= 6;
              const isHiddenDesktop = index >= 8;
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.5 }}
                  className={`
                  ${!isExpanded && isHiddenMobile ? 'max-md:hidden' : ''}
                  ${!isExpanded && isHiddenDesktop ? 'md:hidden' : ''}
                `}
                >
                  <Link
                    href={`/attractions?category=${category.id}`}
                    className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:scale-105 hover:border-teal-300 hover:shadow-lg hover:shadow-teal-500/10"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 text-teal-600 transition-colors duration-300 group-hover:from-teal-500 group-hover:to-emerald-600 group-hover:text-white">
                      <IconComponent className="h-7 w-7" />
                    </div>
                    <span className="text-sm font-semibold text-gray-800">
                      {category.name_en}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
          {/* Show More / Show Less Button */}
          {types.length > 6 && (
            <div className="mt-12 flex justify-center">
              <Button
                variant="outline"
                onClick={() => setIsExpanded(!isExpanded)}
                className="rounded-full border-teal-200 px-8 py-6 text-teal-600 hover:bg-teal-50 hover:text-teal-700"
              >
                {isExpanded ? (
                  <>
                    {t("common.show_less", "Show Less")}
                    <ChevronUp className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    {t("common.show_more", "Show More Categories")}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ===== FEATURED ATTRACTIONS ===== */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 flex items-end justify-between"
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                {t(
                  "home.featured.title",
                  "Featured Attractions"
                )}
              </h2>
              <p className="mt-3 text-gray-500">
                {t(
                  "home.featured.subtitle",
                  "Handpicked experiences you won't want to miss"
                )}
              </p>
            </div>
            <Link
              href="/attractions"
              className="group hidden items-center gap-1 text-sm font-semibold text-teal-600 transition-colors hover:text-teal-700 sm:flex"
            >
              {t("home.featured.viewAll", "View All")}
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredAttractions.map((attraction, index) => (
              <AttractionCard
                key={attraction.id}
                attraction={attraction}
                index={index}
              />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/attractions"
              className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600"
            >
              {t("home.featured.viewAll", "View All")}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== PROMOTIONS SECTION ===== */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {t(
                "home.promotions.title",
                "Special Promotions"
              )}
            </h2>
            <p className="mt-3 text-gray-500">
              {t(
                "home.promotions.subtitle",
                "Limited-time deals on top experiences"
              )}
            </p>
          </motion.div>

          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {promotions.map((promo, index) => (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="min-w-[320px] flex-shrink-0 sm:min-w-[360px]"
              >
                <div className="overflow-hidden rounded-2xl bg-white shadow-md transition-shadow duration-300 hover:shadow-xl">
                  {/* Image */}
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={promo.image}
                      alt={promo.title}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-110"
                    />
                    {/* Discount Badge */}
                    <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 px-3 py-1 text-sm font-bold text-white shadow-lg">
                      <span>-{promo.discount}%</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900">
                      {promo.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                      {promo.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {t("home.promotions.validUntil", "Valid until")}{" "}
                          {new Date(promo.validUntil).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <Link
                        href={`/attractions/${promo.attractionId}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:brightness-110"
                      >
                        {t("home.promotions.cta", "Book Now")}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== POPULAR DESTINATIONS ===== */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {t(
                "home.destinations.title",
                "Popular Destinations"
              )}
            </h2>
            <p className="mt-3 text-gray-500">
              {t(
                "home.destinations.subtitle",
                "Explore the most visited regions in Laos"
              )}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {popularDestinations.map((dest, index) => (
              <motion.div
                key={dest.name}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Link
                  href={`/attractions?location=${encodeURIComponent(dest.name)}`}
                  className="group relative block overflow-hidden rounded-2xl"
                >
                  <div className="aspect-[3/4] overflow-hidden">
                    <Image
                      src={dest.image}
                      alt={dest.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  {/* Content */}
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="text-xl font-bold text-white">
                      {dest.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-teal-200">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {dest.count}{" "}
                        {t("home.destinations.attractions", "attractions")}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-xs font-medium text-white/70 transition-colors group-hover:text-teal-300">
                      <span>
                        {t("home.destinations.explore", "Explore")}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <Footer />
    </div>
  );
}
