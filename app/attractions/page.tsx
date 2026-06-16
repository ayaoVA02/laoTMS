"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  MapPin,
  Navigation,
  Star,
  Check,
  X,
  ChevronDown,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import AttractionCard from "@/components/shared/attraction-card";
import { CardSkeleton } from "@/components/shared/skeleton-card";
import provincesData from "@/laos_provinces_districts.json";
import { useAttractionStore } from "@/stores/attraction-store";
import Footer from "@/components/layout/footer";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useMemo, useEffect, useCallback } from "react";

type SortOption = "rating" | "price-asc" | "price-desc" | "name";
type ViewMode = "grid" | "list";

const sortOptions: { value: SortOption; labelKey: string; defaultLabel: string }[] = [
  { value: "rating", labelKey: "attractions.sort.rating", defaultLabel: "Rating" },
  { value: "price-asc", labelKey: "attractions.sort.priceLow", defaultLabel: "Price Low-High" },
  { value: "price-desc", labelKey: "attractions.sort.priceHigh", defaultLabel: "Price High-Low" },
  { value: "name", labelKey: "attractions.sort.name", defaultLabel: "Name" },
];

function AttractionsContent() {
  const { t, i18n } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();

  const {
    filteredAttractions = [],
    searchQuery = '',
    selectedCategory = 'all',
    setSearchQuery,
    setSelectedCategory,
    types = [],
  } = useAttractionStore();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const [showLocationSearch, setShowLocationSearch] = useState(false);
  // Location States
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const provinces = provincesData[0].provinces;
  const isLao = i18n.language === "la";

  // Read initial category from URL search params
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const locationParam = searchParams.get("location");
    const districtParam = searchParams.get("district");
    const qParam = searchParams.get("q");

    if (categoryParam && categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam);
    }
    if (qParam) setSearchQuery(qParam);
    if (locationParam) { setProvince(locationParam); setShowLocationSearch(true); }
    if (districtParam) setDistrict(districtParam);
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedAttractions = useMemo(() => {
    let sorted = [...filteredAttractions];

    // Apply Province/District filters locally if present
    if (province) sorted = sorted.filter(a => a.location?.includes(province));
    if (district) sorted = sorted.filter(a => a.location?.includes(district));

    switch (sortBy) {
      case "rating":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "price-asc":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-desc":
        return sorted.sort((a, b) => b.price - a.price);
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  }, [filteredAttractions, sortBy, province, district]);

  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      setSelectedCategory(categoryId);
      // Update URL search params
      const params = new URLSearchParams(searchParams.toString());
      if (categoryId === "all") {
        params.delete("category");
      } else {
        params.set("category", categoryId);
      }
      router.replace(`/attractions?${params.toString()}`, { scroll: false });
    },
    [setSelectedCategory, searchParams, router]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      // Clear dropdowns when typing
      if (e.target.value.trim() !== "") {
        setProvince("");
        setDistrict("");
      }
    },
    [setSearchQuery, setProvince, setDistrict]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, [setSearchQuery]);

  const handleProvinceChange = (val: string) => {
    setProvince(val);
    setDistrict("");
    setSearchQuery(""); // Clear text search when selecting
  };

  const handleDistrictChange = (val: string) => {
    setDistrict(val);
    setSearchQuery(""); // Clear text search when selecting
  };

  const handleApplySearch = () => {
    const params = new URLSearchParams();
    // Preserve category if present
    const currentCategory = searchParams.get("category");
    if (currentCategory) params.set("category", currentCategory);

    if (!showLocationSearch) {
      if (searchQuery) params.set("q", searchQuery);
      setProvince("");
      setDistrict("");
    } else {
      if (province) params.set("location", province);
      if (district) params.set("district", district);
      setSearchQuery("");
    }
    router.replace(`/attractions?${params.toString()}`, { scroll: false });
  };

  const currentSortLabel = sortOptions.find((o) => o.value === sortBy)?.defaultLabel ?? "Rating";

  const allCategories = useMemo(
    () => [{ id: "all", name: "All" }, ...types.map((t) => ({ id: t.id, name: t.name_en }))],
    [types]
  );

  const availableDistricts = provinces.find((p) => p.province_en === province)?.districts || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-teal-600 to-emerald-700 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {t("attractions.title", "Explore Attractions")}
            </h1>
            <p className="mt-2 text-teal-100 text-sm sm:text-base">
              {sortedAttractions.length}{" "}
              {sortedAttractions.length === 1
                ? t("attractions.result", "result")
                : t("attractions.results", "results")}{" "}
              {t("attractions.found", "found")}
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-8 flex flex-col sm:flex-row gap-3 max-w-4xl"
          >
            {/* Toggle Button */}
            <button
              onClick={() => {
                setShowLocationSearch(!showLocationSearch);
                if (!showLocationSearch) setSearchQuery(""); else { setProvince(""); setDistrict(""); }
              }}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-semibold shadow-lg transition-all border shrink-0 ${showLocationSearch
                  ? "bg-white text-teal-600 border-white"
                  : "bg-teal-500 text-white border-teal-400"
                }`}
              title={showLocationSearch ? t("attractions.switchToText", "Switch to text search") : t("attractions.switchToLocation", "Switch to location search")}
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>

            <div className="flex-1">
              {!showLocationSearch ? (
                /* Search by Text */
                <div className="relative h-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder={t(
                      "attractions.searchPlaceholder",
                      "Search by name, tags, or description..."
                    )}
                    className="w-full h-full rounded-xl border-0 bg-white/95 backdrop-blur-sm py-3.5 pl-12 pr-10 text-gray-900 placeholder:text-gray-400 shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm sm:text-base"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ) : (
                /* Search by Selection (Location) */
                <div className="flex flex-col sm:flex-row gap-3 h-full">
                  <div className="flex-1 flex items-center gap-2 rounded-xl bg-white/95 backdrop-blur-sm px-4 py-2.5 shadow-md">
                    <MapPin className="h-4 w-4 text-teal-500 shrink-0" />
                    <select
                      value={province}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                      className="w-full bg-transparent text-sm text-gray-800 outline-none "
                    >
                      <option value="">{t("home.search.province", "All Provinces")}</option>
                      {provinces.map((p) => (
                        <option key={p.province_id} value={p.province_en}>
                          {isLao ? p.province_la : p.province_en}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1 flex items-center gap-2 rounded-xl bg-white/95 backdrop-blur-sm px-4 py-2.5 shadow-md">
                    <Navigation className="h-4 w-4 text-teal-500 shrink-0" />
                    <select
                      value={district}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      disabled={!province}
                      className="w-full bg-transparent text-sm text-gray-800 outline-none disabled:opacity-50"
                    >
                      <option value="">{t("home.search.district", "All Districts")}</option>
                      {availableDistricts.map((d: any) => (
                        <option key={d.district_en} value={d.district_en}>
                          {isLao ? d.district_la : d.district_en}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleApplySearch}
              disabled={(!showLocationSearch && !searchQuery) || (showLocationSearch && !province && !district)}
              className="flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-6 py-2.5 font-semibold text-white shadow-lg transition-all hover:brightness-110 disabled:grayscale disabled:opacity-50 shrink-0"
            >
              <Search className="h-4 w-4" />
              <span>{t("home.search.button", "Apply Filter")}</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-2 sm:py-3.5">
            {/* Sliders icon */}
            <SlidersHorizontal className="h-5 w-5 shrink-0 text-teal-600" />

            {/* Sort Dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => setSortDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-teal-400 hover:text-teal-600 transition-all shadow-sm"
              >
                <span>{t(`attractions.sort.${sortBy}`, currentSortLabel)}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 ${sortDropdownOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              <AnimatePresence>
                {sortDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute left-0 top-full mt-2 w-56 rounded-2xl border border-gray-100 bg-white/95 backdrop-blur-md p-1.5 shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {t("attractions.sort.title", "Sort By")}
                    </div>
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setSortDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all ${sortBy === option.value
                            ? "bg-teal-50 text-teal-700 font-bold"
                            : "text-gray-600 hover:bg-gray-50"
                          }`}
                      >
                        <span>
                          {t(option.labelKey, option.defaultLabel)}
                        </span>
                        {sortBy === option.value && (
                          <Check className="h-4 w-4 text-teal-600 stroke-[3]" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Category Pills - Scrollable Area */}
            <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-none no-scrollbar py-1">
              {allCategories.map((cat) => {
                const isActive =
                  (cat.id === "all" && selectedCategory === "all") ||
                  cat.id === selectedCategory;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${isActive
                        ? "bg-teal-600 text-white shadow-md shadow-teal-600/25"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* View Toggle */}
            <div className="flex shrink-0 items-center rounded-lg border border-gray-200 bg-white p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-md p-1.5 transition-colors ${viewMode === "grid"
                    ? "bg-teal-600 text-white"
                    : "text-gray-400 hover:text-gray-600"
                  }`}
                aria-label={t("attractions.gridView", "Grid view")}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-md p-1.5 transition-colors ${viewMode === "list"
                    ? "bg-teal-600 text-white"
                    : "text-gray-400 hover:text-gray-600"
                  }`}
                aria-label={t("attractions.listView", "List view")}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Attractions Grid / List */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {sortedAttractions.length > 0 ? (
            <motion.div
              key={`${selectedCategory}-${sortBy}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  : "flex flex-col gap-4"
              }
            >
              {sortedAttractions.map((attraction, index) => (
                <AttractionCard
                  key={attraction.id}
                  attraction={attraction}
                  index={index}

                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              {/* Empty State Illustration */}
              <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-teal-50">
                <MapPin className="h-14 w-14 text-teal-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                {t("attractions.noResults", "No attractions found")}
              </h3>
              <p className="mt-2 max-w-md text-sm text-gray-500">
                {t(
                  "attractions.noResultsDescription",
                  "Try adjusting your search or filter to find what you are looking for."
                )}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setProvince("");
                  setDistrict("");
                  handleCategoryChange("all");
                }}
                className="mt-6 rounded-full bg-teal-600 px-6 py-2.5 text-sm font-medium text-white shadow-md shadow-teal-600/25 transition-all hover:bg-teal-700 hover:shadow-lg"
              >
                {t("attractions.clearFilters", "Clear all filters")}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function AttractionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <div className="bg-gradient-to-br from-teal-600 to-emerald-700 text-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
              <div className="h-10 w-48 rounded bg-white/20" />
              <div className="mt-2 h-5 w-32 rounded bg-white/10" />
              <div className="mt-6 h-12 max-w-2xl w-full rounded-xl bg-white/30" />
            </div>
          </div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <AttractionsContent />
    </Suspense>
  );
}
