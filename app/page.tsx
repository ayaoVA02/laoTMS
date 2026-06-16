"use client";

import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";
import {
  MapPin, Star, ArrowRight, Sparkles, TrendingUp,
  Tag, ChevronDown, ChevronUp, ChevronRight, Calendar, Search
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
import provincesData from "@/laos_provinces_districts.json";

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

export default function Home() {
  const { t } = useTranslation();
  const { attractions = [], types = [] } = useAttractionStore();
  const promotions: any[] = [];

  const featuredAttractions = useMemo(
    () => attractions.filter((a) => a.featured).slice(0, 6),
    [attractions]
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const slide = SLIDES[currentSlide];

  const popularDestinations = useMemo(() => {
    const provinces = provincesData[0].provinces;
    const counts: Record<string, number> = {};
    attractions.forEach((attr) => {
      const p = provinces.find(
        (prov) =>
          attr.location?.toLowerCase().includes(prov.province_en.toLowerCase()) ||
          attr.location?.toLowerCase().includes(
            prov.province_en.toLowerCase().replace(" province", "").replace(" prefecture", "")
          )
      );
      if (p) counts[p.province_en] = (counts[p.province_en] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([fullName, count]) => ({
        name: fullName.replace(" Province", "").replace(" Prefecture", ""),
        fullName,
        count,
        image: "https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=800",
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [attractions]);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ===== HERO SLIDESHOW ===== */}
      <section className="relative flex min-h-[95vh] items-center justify-center overflow-hidden">

        {/* Advanced cinematic background transition with Cross-zoom effect */}
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

        {/* Layered overlays */}
        {/* <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/10 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 z-10" /> */}

        {/* Ambient glow blobs */}
        <div className="absolute left-1/3 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-teal-400/8 blur-3xl z-10" />
        <div className="absolute right-1/4 top-1/2 h-96 w-96 rounded-full bg-emerald-400/6 blur-3xl z-10" />

        {/* Content */}
        <div className="relative z-20 mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">

          {/* Badge */}
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

          {/* Title */}
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

          {/* Subtitle */}
          <motion.p
            key={`sub-${currentSlide}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto text-white mb-10 max-w-2xl text-lg leading-relaxed text-white/85 drop-shadow sm:text-xl"
          >
            {slide.subtitle}
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
            className="mx-auto max-w-4xl"
          >
            <HeroSearchBar />
          </motion.div>

          {/* Stats pills */}
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
              // className="flex items-center gap-2 rounded-full border border-amber-400 bg-white/10 px-4 py-2 text-sm text-black backdrop-blur-sm"
              >
                {stat.icon}
                {stat.label}
              </div>
            ))}
          </motion.div>

          {/* Slide dots */}
          <div className="mt-10 flex items-center justify-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${i === currentSlide
                    ? "w-8 h-2 bg-white"
                    : "w-2 h-2 bg-white/40 hover:bg-white/60"
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 h-0.5 bg-white/10">
          <div
            key={currentSlide}
            className="h-full bg-gradient-to-r from-teal-400 to-emerald-400"
            style={{
              animation: "progress 10s linear forwards",
            }}
          />
        </div>

        {/* White fade into next section — INSIDE section */}
        {/* <div className="absolute bottom-0 left-0 right-0 z-20 h-48 bg-gradient-to-t from-gray-50 via-gray-50/40 to-transparent" /> */}

        <style>{`
          @keyframes progress { from { width: 0% } to { width: 100% } }
        `}</style>
      </section>

      {/* ===== CATEGORIES — overlaps hero with negative margin ===== */}
      <section className="relative -mt-16 z-30 py-20 pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            {/* Section label */}
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
      {featuredAttractions.length >= 0 && (
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
                  Handpicked for you
                </span>
                <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                  {t("home.featured.title", "Featured Attractions")}
                </h2>
                <p className="mt-2 text-gray-500">
                  {t("home.featured.subtitle", "Handpicked experiences you won't want to miss")}
                </p>
              </div>
              <Link
                href="/attractions"
                className="group hidden items-center gap-1 rounded-full border border-teal-200 px-5 py-2.5 text-sm font-semibold text-teal-600 transition-all hover:bg-teal-600 hover:text-white sm:flex"
              >
                {t("home.featured.viewAll", "View All")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredAttractions.map((attraction, index) => (
                <AttractionCard key={attraction.id} attraction={attraction} index={index} />
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link href="/attractions" className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600">
                {t("home.featured.viewAll", "View All")} <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== POPULAR DESTINATIONS ===== */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <span className="mb-3 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-600">
              Top regions
            </span>
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {t("home.destinations.title", "Popular Destinations")}
            </h2>
            <p className="mt-3 text-gray-500">
              {t("home.destinations.subtitle", "Explore the most visited regions in Laos")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                  className="group relative block overflow-hidden rounded-2xl shadow-sm transition-shadow duration-300 hover:shadow-xl"
                >
                  <div className="aspect-[3/4] overflow-hidden">
                    <Image
                      src={dest.image}
                      alt={dest.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="text-xl font-bold text-white">{dest.name}</h3>
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-teal-200">
                      <MapPin className="h-4 w-4" />
                      <span>{dest.count} {t("home.destinations.attractions", "attractions")}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-xs font-medium text-white/60 transition-colors group-hover:text-teal-300">
                      <span>{t("home.destinations.explore", "Explore")}</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}