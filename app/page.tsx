"use client";

import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";
import {
  MapPin, Star, ArrowRight, Sparkles, TrendingUp,
  Tag, ChevronDown, ChevronUp, ChevronRight, Calendar, Search, Ticket, Clock, Users, Percent
} from "lucide-react";
import { useTranslation } from "react-i18next";
import AttractionCard from "@/components/shared/attraction-card";
import { useAttractionStore } from "@/stores/attraction-store";
import Link from "next/link";
import HeroSearchBar from "@/components/shared/hero-search-bar";
import Image from "next/image";
import Footer from "@/components/layout/footer";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";

const SLIDES = [
  {
    image: "https://www.tourismlaos.org/wp-content/uploads/2022/03/76.%E0%BA%9B%E0%BA%B0%E0%BA%95%E0%BA%B9%E0%BB%84%E0%BA%8A%E0%BA%99%E0%BA%B0%E0%BA%84%E0%BA%AD%E0%BA%99%E0%BA%AB%E0%BA%A5%E0%BA%A7%E0%BA%87-copy-1030x773.jpg",
    badge: "Welcome Home",
    title: "Explore Laos",
    subtitle: "Your homeland holds more than you know — from golden monuments to misty mountains, rediscover Laos one journey at a time.",
    accent: "from-red-300 via-rose-300 to-orange-400",
  },
  {
    image: "https://www.journeyera.com/wp-content/uploads/2016/12/luang-prabang-photos-08807.jpg",
    badge: "UNESCO World Heritage",
    title: "Luang Prabang",
    subtitle: "Where saffron-robed monks glide through misty streets at dawn and gilded temples glow against jungle-draped mountains.",
    accent: "from-amber-300 via-yellow-300 to-orange-400",
  },
  {
    image: "https://worldmatetravel.com/uploads/articles/best-places-to-visit-in-laos-countries-of-explorers-2802164807.jpg",
    badge: "Adventure Capital",
    title: "Vang Vieng",
    subtitle: "Towering karst peaks mirror in jade-green waters where kayaks drift lazily past caves, rope swings, and riverside bungalows.",
    accent: "from-teal-300 via-cyan-300 to-emerald-400",
  },
  {
    image: "https://www.asiakingtravel.com/cuploads/files/Xaisomboun-province-4.jpg",
    badge: "Hidden Highland",
    title: "Xaisomboun",
    subtitle: "Lost in the clouds above sea level — remote highland villages, ancient forests, and mountain passes where the world feels untouched.",
    accent: "from-green-300 via-emerald-300 to-teal-400",
  },
];

const R2_IMAGE_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL_IMAGE;

// Format the discount label for a promotion card
function formatDiscount(promo: { type: string; price: number; adult: number; children: number }) {
  if (promo.type === 'percentage' && promo.price > 0) {
    return `${promo.price}% OFF`;
  }
  if (promo.type === 'fixed' && promo.price > 0) {
    return `฿${promo.price.toLocaleString()} OFF`;
  }
  if (promo.adult > 0) {
    return `Adult ฿${promo.adult.toLocaleString()}`;
  }
  return 'Special Deal';
}

// Returns days remaining until d_end; null if no end date
function daysRemaining(dEnd: string | null): number | null {
  if (!dEnd) return null;
  const diff = Math.ceil((new Date(dEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

export default function Home() {
  const { t } = useTranslation();
  const {
    attractions = [],
    types = [],
    promotions,
    promotionsLoading,
    fetchPromotions,
  } = useAttractionStore();

  const featuredAttractions = useMemo(
    () =>
      [...attractions]
        .filter((a) => a.status === 'approved' && !a.expired)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 6),
    [attractions]
  );

  const [isExpanded, setIsExpanded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slideshow timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Fetch promotions once on mount
  useEffect(() => {
    fetchPromotions();
  }, []);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const slide = SLIDES[currentSlide];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ===== HERO SLIDESHOW ===== */}
      <section className="relative flex min-h-[95vh] items-center justify-center overflow-hidden">

        <AnimatePresence initial={false}>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.15 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-0"
          >
            <Image
              src={slide.image}
              alt=""
              fill
              className="object-cover brightness-[0.75]"
              priority
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute left-1/3 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-teal-400/8 blur-3xl z-10" />
        <div className="absolute right-1/4 top-1/2 h-96 w-96 rounded-full bg-emerald-400/6 blur-3xl z-10" />

        <div className="relative z-20 mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">

          <motion.div
            key={`badge-${currentSlide}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 shadow-lg backdrop-blur-md"
          >
            <Sparkles className="h-4 w-4 text-teal-300" />
            <span className="text-sm font-medium text-white/90">{slide.badge}</span>
          </motion.div>

          <motion.h1
            key={`title-${currentSlide}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-5 text-5xl font-extrabold tracking-tight drop-shadow-lg sm:text-6xl md:text-7xl lg:text-8xl"
          >
            <span className={`bg-gradient-to-r ${slide.accent} bg-clip-text text-transparent`}>
              {slide.title}
            </span>
          </motion.h1>

          <motion.p
            key={`sub-${currentSlide}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto text-white mb-10 max-w-2xl text-lg leading-relaxed text-white/85 drop-shadow sm:text-xl"
          >
            {slide.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
            className="mx-auto max-w-4xl"
          >
            <HeroSearchBar />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            {[
              { icon: <TrendingUp className="h-4 w-4 text-teal-400" />, label: `${attractions.length}+ Attractions` },
              { icon: <Star className="h-4 w-4 text-amber-400" />, label: "4.7 Avg Rating" },
              { icon: <MapPin className="h-4 w-4 text-emerald-400" />, label: "8 Destinations" },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-full border border-teal-400/40 bg-teal-900/20 px-4 py-2 text-sm text-white/90 backdrop-blur-sm"
              >
                {stat.icon}
                {stat.label}
              </div>
            ))}
          </motion.div>

          <div className="mt-10 flex items-center justify-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === currentSlide ? "w-8 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>

        {/* <div className="absolute bottom-0 left-0 right-0 z-20 h-0.5 bg-white/10">
          <div
            key={currentSlide}
            className="h-full bg-gradient-to-r from-teal-400 to-emerald-400"
            style={{ animation: "progress 10s linear forwards" }}
          />
        </div> */}

        <style>{`
          @keyframes progress { from { width: 0% } to { width: 100% } }
        `}</style>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="relative -mt-16 z-30 py-20 pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <span className="mb-3 inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-teal-600">
              What to explore
            </span>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {t("home.categories.title", "Browse by Category")}
            </h2>
            <p className="mt-3 text-gray-500">
              {t("home.categories.subtitle", "Explore attractions tailored to your interests")}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
            {types.filter((c) => c.is_active).map((category, index) => {
              const IconComponent =
                category.icon &&
                (LucideIcons as unknown as Record<string, React.ElementType>)[category.icon]
                  ? (LucideIcons as unknown as Record<string, React.ElementType>)[category.icon]
                  : Tag;
              const isHiddenMobile = index >= 6;
              const isHiddenDesktop = index >= 8;
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.07, duration: 0.5 }}
                  className={`
                    ${!isExpanded && isHiddenMobile ? "max-md:hidden" : ""}
                    ${!isExpanded && isHiddenDesktop ? "md:hidden" : ""}
                  `}
                >
                  <Link
                    href={`/attractions?category=${category.id}`}
                    className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-500/10"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 text-teal-600 transition-all duration-300 group-hover:from-teal-500 group-hover:to-emerald-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-teal-500/30">
                      <IconComponent className="h-7 w-7" />
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{category.name_en}</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {types.length > 6 && (
            <div className="mt-12 flex justify-center">
              <Button
                variant="outline"
                onClick={() => setIsExpanded(!isExpanded)}
                className="rounded-full border-teal-200 px-8 py-6 text-teal-600 hover:bg-teal-50 hover:text-teal-700"
              >
                {isExpanded ? (
                  <>{t("common.show_less", "Show Less")} <ChevronUp className="ml-2 h-4 w-4" /></>
                ) : (
                  <>{t("common.show_more", "Show More Categories")} <ChevronDown className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ===== FEATURED ATTRACTIONS ===== */}
      {featuredAttractions.length > 0 && (
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
                <span className="mb-2 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-600">
                  Most Popular
                </span>
                <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                  {t("home.featured.title", "Top Rated Attractions")}
                </h2>
                <p className="mt-2 text-gray-500">
                  {t("home.featured.subtitle", "Highest rated experiences loved by visitors")}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => {
                      const el = document.getElementById('featured-scroll');
                      if (el) el.scrollBy({ left: -340, behavior: 'smooth' });
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:border-teal-400 hover:text-teal-600 hover:shadow-md"
                  >
                    <LucideIcons.ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      const el = document.getElementById('featured-scroll');
                      if (el) el.scrollBy({ left: 340, behavior: 'smooth' });
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:border-teal-400 hover:text-teal-600 hover:shadow-md"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
                <Link
                  href="/attractions"
                  className="group hidden items-center gap-1 rounded-full border border-teal-200 px-5 py-2.5 text-sm font-semibold text-teal-600 transition-all hover:bg-teal-600 hover:text-white sm:flex"
                >
                  {t("home.featured.viewAll", "View All")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </motion.div>

            <div className="relative">
              <div
                id="featured-scroll"
                className="flex gap-5 overflow-x-auto scroll-smooth pb-4 scrollbar-hide"
                style={{ scrollSnapType: 'x mandatory' }}
              >
                {featuredAttractions.map((attraction, index) => (
                  <div
                    key={attraction.id}
                    className="w-[300px] shrink-0 sm:w-[320px]"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <AttractionCard attraction={attraction} index={index} />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between sm:hidden">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const el = document.getElementById('featured-scroll');
                    if (el) el.scrollBy({ left: -300, behavior: 'smooth' });
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm"
                >
                  <LucideIcons.ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('featured-scroll');
                    if (el) el.scrollBy({ left: 300, behavior: 'smooth' });
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <Link href="/attractions" className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600">
                {t("home.featured.viewAll", "View All")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== PROMOTIONS ===== */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 flex items-end justify-between"
          >
            <div>
              <span className="mb-3 inline-block rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-rose-500">
                Limited Time
              </span>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                {t("home.promotions.title", "Deals & Promotions")}
              </h2>
              <p className="mt-3 text-gray-500">
                {t("home.promotions.subtitle", "Exclusive offers on top attractions across Laos")}
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => {
                  const el = document.getElementById('promos-scroll');
                  if (el) el.scrollBy({ left: -360, behavior: 'smooth' });
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:border-rose-400 hover:text-rose-500 hover:shadow-md"
              >
                <LucideIcons.ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('promos-scroll');
                  if (el) el.scrollBy({ left: 360, behavior: 'smooth' });
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:border-rose-400 hover:text-rose-500 hover:shadow-md"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </motion.div>

          {promotionsLoading ? (
            /* Skeleton */
            <div className="flex gap-5 overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-[300px] shrink-0 sm:w-[320px]">
                  <div className="animate-pulse rounded-2xl bg-gray-200 h-[380px]" />
                </div>
              ))}
            </div>
          ) : promotions.length > 0 ? (
            <div
              id="promos-scroll"
              className="flex gap-5 overflow-x-auto scroll-smooth pb-4 scrollbar-hide"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {promotions.map((promo, index) => {
                const days = daysRemaining(promo.dEnd);
                const coverImage = promo.image
                  ? R2_IMAGE_URL + promo.image
                  : promo.thumbnailImage
                  ? R2_IMAGE_URL + promo.thumbnailImage
                  : 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=800';

                return (
                  <motion.div
                    key={promo.promotionId}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.07, duration: 0.5 }}
                    className="w-[300px] shrink-0 sm:w-[320px]"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <Link
                      href={`/attractions/${promo.attractionId}`}
                      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-500/10 border border-gray-100"
                    >
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={coverImage}
                          alt={promo.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Discount badge — top-left */}
                        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                          {promo.type === 'percentage'
                            ? <Percent className="h-3 w-3" />
                            : <Ticket className="h-3 w-3" />
                          }
                          {formatDiscount(promo)}
                        </div>

                        {/* Urgency badge — top-right */}
                        {days !== null && days <= 7 && (
                          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white shadow-md">
                            <Clock className="h-3 w-3" />
                            {days === 0 ? 'Last day!' : `${days}d left`}
                          </div>
                        )}

                        {/* Dark gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      </div>

                      {/* Content */}
                      <div className="flex flex-1 flex-col p-4">
                        {/* Attraction name */}
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-teal-600">
                          {promo.attractionName}
                        </p>

                        {/* Promotion title */}
                        <h3 className="mb-3 text-base font-bold text-gray-900 leading-snug line-clamp-2">
                          {promo.title}
                        </h3>

                        {/* Price row */}
                        <div className="mb-3 flex items-center gap-3">
                          {promo.adult > 0 && (
                            <div className="flex items-center gap-1 text-sm text-gray-700">
                              <Users className="h-3.5 w-3.5 text-gray-400" />
                              <span className="font-semibold text-gray-900">
                                ฿{promo.adult.toLocaleString()}
                              </span>
                              <span className="text-gray-400 text-xs">/adult</span>
                            </div>
                          )}
                          {promo.children > 0 && (
                            <div className="flex items-center gap-1 text-sm text-gray-700">
                              <span className="text-gray-400 text-xs">Child</span>
                              <span className="font-semibold text-gray-900">
                                ฿{promo.children.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Footer row: location + date range */}
                        <div className="mt-auto flex items-center justify-between text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate max-w-[120px]">
                              {promo.attractionProvince || promo.attractionLocation}
                            </span>
                          </span>
                          {promo.dEnd && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 flex-shrink-0" />
                              Until {new Date(promo.dEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Hover CTA bar */}
                      <div className="flex items-center justify-center gap-1.5 bg-rose-500 py-2.5 text-sm font-semibold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        View Deal <ArrowRight className="h-4 w-4" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
                <Ticket className="h-7 w-7 text-rose-400" />
              </div>
              <p className="text-base font-semibold text-gray-700">No active promotions right now</p>
              <p className="mt-1 text-sm text-gray-400">Check back soon for deals and discounts.</p>
            </div>
          )}

          {/* Mobile scroll controls */}
          {promotions.length > 0 && (
            <div className="mt-6 flex items-center justify-between sm:hidden">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const el = document.getElementById('promos-scroll');
                    if (el) el.scrollBy({ left: -300, behavior: 'smooth' });
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm"
                >
                  <LucideIcons.ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('promos-scroll');
                    if (el) el.scrollBy({ left: 300, behavior: 'smooth' });
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}