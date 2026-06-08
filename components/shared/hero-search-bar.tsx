"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { MapPin, Search, Navigation, SlidersHorizontal, X } from "lucide-react";
import { useAttractionStore } from "@/stores/attraction-store";
import provincesData from "@/laos_provinces_districts.json";

export default function HeroSearchBar() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { types } = useAttractionStore();

  const provinces = provincesData[0].provinces;
  const isLao = i18n.language === "la";

  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [typeId, setTypeId] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (showLocationSearch) {
      if (province) params.set("location", province);
      if (district) params.set("district", district);
    } else {
      if (searchQuery) params.set("q", searchQuery);
    }
    if (typeId) params.set("category", typeId);
    
    // Navigates to the attractions page with search parameters
    router.push(`/attractions?${params.toString()}`);
  };

  // Handle province change to reset district
  const handleProvinceChange = (val: string) => {
    setProvince(val);
    setDistrict(""); // Reset district when province changes
  };

  // Find current districts for the selected province
  const availableDistricts = provinces.find((p) => p.province_en === province)?.districts || [];

  return (
    <div className="flex flex-col items-stretch gap-3 rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-xl md:flex-row md:items-center md:gap-3">
      {/* Toggle Button */}
      <button
        onClick={() => setShowLocationSearch(!showLocationSearch)}
        className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold shadow-lg transition-all border shrink-0 ${
          showLocationSearch 
            ? "bg-white text-teal-600 border-white" 
            : "bg-teal-500 text-white border-teal-400"
        }`}
      >
        <SlidersHorizontal className="h-5 w-5" />
      </button>

      {!showLocationSearch ? (
        /* Text Search Input */
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/90 px-4 py-3">
          <Search className="h-5 w-5 shrink-0 text-teal-500" />
          <input
            type="text"
            placeholder={t("home.search.placeholder", "Search attractions...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Province Select */}
          <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/90 px-4 py-3">
            <MapPin className="h-5 w-5 shrink-0 text-teal-500" />
            <select
              value={province}
              onChange={(e) => handleProvinceChange(e.target.value)}
              className="w-full bg-transparent text-sm text-gray-800 outline-none"
            >
              <option value="">{t("home.search.province", "Select Province")}</option>
              {provinces.map((p) => (
                <option key={p.province_id} value={p.province_en}>
                  {isLao ? p.province_la : p.province_en}
                </option>
              ))}
            </select>
          </div>

          {/* District Select */}
          <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/90 px-4 py-3">
            <Navigation className="h-5 w-5 shrink-0 text-teal-500" />
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              disabled={!province}
              className="w-full bg-transparent text-sm text-gray-800 outline-none disabled:opacity-50"
            >
              <option value="">{t("home.search.district", "Select District")}</option>
              {availableDistricts.map((d: any) => (
                <option key={d.district_en} value={d.district_en}>
                  {isLao ? d.district_la : d.district_en}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* Type Dropdown */}
      <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/90 px-4 py-3">
        <Search className="h-5 w-5 shrink-0 text-teal-500" />
        <select
          value={typeId}
          onChange={(e) => setTypeId(e.target.value)}
          className="w-full bg-transparent text-sm text-gray-800 outline-none"
        >
          <option value="">{t("home.search.type", "Type of attraction")}</option>
          {types.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name_en}
            </option>
          ))}
        </select>
      </div>

      {/* Search Button */}
      <button 
        onClick={handleSearch}
        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-8 py-3 font-semibold text-white shadow-lg shadow-teal-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/30 hover:brightness-110"
      >
        <Search className="h-5 w-5" />
        <span>{t("home.search.button", "Search")}</span>
      </button>
    </div>
  );
}
