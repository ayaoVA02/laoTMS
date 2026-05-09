"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Navigation,
  Route,
  Star,
  Clock,
  DollarSign,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAttractionStore } from "@/stores/attraction-store";
import { useTravelPlanStore } from "@/stores/travel-plan-store";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);

const CATEGORY_COLORS: Record<string, string> = {
  temple: "#14b8a6",
  nature: "#22c55e",
  adventure: "#f59e0b",
  culture: "#ec4899",
  food: "#f97316",
  beach: "#06b6d4",
  historical: "#a78bfa",
  nightlife: "#e11d48",
};

const LAOS_CENTER: [number, number] = [19.0, 103.0];

export default function MapPage() {
  const { t } = useTranslation();
  const {
    filteredAttractions = [],
    searchQuery = "",
    selectedCategory = "all",
    setSearchQuery,
    setSelectedCategory,
    fetchAttractions,
    types,
  } = useAttractionStore();
  const { plans = [], selectedPlan, setSelectedPlan, fetchPlans } = useTravelPlanStore();
  const { user, isAuthenticated } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [routePanelOpen, setRoutePanelOpen] = useState(false);
  const [selectedAttractionId, setSelectedAttractionId] = useState<string | null>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchAttractions();
    if (isAuthenticated && user) fetchPlans(user.id);
  }, []);

  useEffect(() => {
    if (mounted) {
      import("leaflet").then((L) => {
        delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });
        setLeafletLoaded(true);
      });
    }
  }, [mounted]);

  const selectedAttraction = useMemo(
    () => filteredAttractions.find((a) => a.id === selectedAttractionId) ?? null,
    [selectedAttractionId, filteredAttractions]
  );

  const routePositions = useMemo(() => {
    if (!selectedPlan) return [];
    return selectedPlan.attractionIds
      .map((aid) => {
        const a = filteredAttractions.find((at) => at.id === aid);
        if (a && a.coordinates[0] !== 0) return a.coordinates as [number, number];
        return null;
      })
      .filter(Boolean) as [number, number][];
  }, [selectedPlan, filteredAttractions]);

  const handleSidebarCardClick = useCallback((attractionId: string) => {
    setSelectedAttractionId(attractionId);
  }, []);

  if (!mounted) {
    return (
      <div className="relative h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] md:h-screen w-full overflow-hidden bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] md:h-screen w-full overflow-hidden">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-[1000] flex items-center justify-between px-4 py-2 bg-white/90 dark:bg-gray-950/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3">
          <Navigation className="h-5 w-5 text-teal-500" />
          <h1 className="text-lg font-bold tracking-tight">{t("map.title", "LaoTMS Map")}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={routePanelOpen ? "default" : "ghost"} size="sm" className={routePanelOpen ? "bg-teal-600 text-white hover:bg-teal-700" : ""} onClick={() => setRoutePanelOpen((v) => !v)}>
            <Route className="h-4 w-4 mr-1.5" />
            <span className="text-xs">{t("map.route", "Routes")}</span>
          </Button>
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen((v) => !v)}>
            <MapPin className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Left Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="absolute top-12 left-0 bottom-0 z-[999] w-72 sm:w-80 bg-white dark:bg-gray-950 border-r border-border overflow-y-auto shadow-xl">
            <div className="p-4 space-y-4">
              <div className="relative">
                <Input placeholder="Search attractions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9 text-sm" />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant={selectedCategory === "all" ? "default" : "outline"} className="cursor-pointer text-[10px]" onClick={() => setSelectedCategory("all")}>All</Badge>
                {types.map((cat) => (
                  <Badge key={cat.id} variant={selectedCategory === cat.id ? "default" : "outline"} className="cursor-pointer text-[10px]" style={selectedCategory === cat.id ? { backgroundColor: CATEGORY_COLORS[cat.name_en.toLowerCase()] || "#14b8a6" } : {}} onClick={() => setSelectedCategory(cat.id)}>
                    {cat.name_en}
                  </Badge>
                ))}
              </div>
              <div className="space-y-2">
                {filteredAttractions.map((a) => (
                  <motion.div key={a.id} whileHover={{ scale: 1.01 }} className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedAttractionId === a.id ? "border-teal-500 bg-teal-500/5" : "border-border hover:border-teal-500/30"}`} onClick={() => handleSidebarCardClick(a.id)}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                        {a.images[0] ? <img src={a.images[0]} alt={a.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center"><MapPin className="w-4 h-4 text-teal-500" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{a.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{a.location}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /><span className="text-[10px] font-medium">{a.rating}</span></div>
                          {a.price > 0 && <span className="text-[10px] text-muted-foreground">{a.price.toLocaleString()} LAK</span>}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Route Panel */}
      <AnimatePresence>
        {routePanelOpen && (
          <motion.div initial={{ x: 320 }} animate={{ x: 0 }} exit={{ x: 320 }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="absolute top-12 right-0 bottom-0 z-[999] w-72 sm:w-80 bg-white dark:bg-gray-950 border-l border-border overflow-y-auto shadow-xl">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2"><Route className="w-4 h-4 text-teal-500" />Travel Plans</h3>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setRoutePanelOpen(false)}><X className="w-4 h-4" /></Button>
              </div>
              {plans.length === 0 ? (
                <div className="text-center py-8"><Route className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" /><p className="text-xs text-muted-foreground">No travel plans yet</p></div>
              ) : (
                <div className="space-y-2">
                  {plans.map((plan) => (
                    <div key={plan.id} className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedPlan?.id === plan.id ? "border-teal-500 bg-teal-500/5" : "border-border hover:border-teal-500/30"}`} onClick={() => setSelectedPlan(selectedPlan?.id === plan.id ? null : plan)}>
                      <p className="text-sm font-medium">{plan.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{plan.attractionIds.length} attractions</p>
                    </div>
                  ))}
                </div>
              )}
              {selectedPlan && (
                <div className="border-t pt-3 space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase">Route Stops</h4>
                  {selectedPlan.attractionIds.map((aid, i) => {
                    const a = filteredAttractions.find((at) => at.id === aid);
                    if (!a) return null;
                    return (
                      <div key={aid} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                        <div className="w-6 h-6 rounded-full bg-teal-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                        <div className="min-w-0"><p className="text-xs font-medium truncate">{a.name}</p><p className="text-[10px] text-muted-foreground">{a.location}</p></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Attraction Detail */}
      <AnimatePresence>
        {selectedAttraction && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-border overflow-hidden">
            <div className="relative h-32 overflow-hidden">
              {selectedAttraction.images[0] ? <img src={selectedAttraction.images[0]} alt={selectedAttraction.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-teal-500/20 to-emerald-500/20" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button onClick={() => setSelectedAttractionId(null)} className="absolute top-2 right-2 p-1 rounded-full bg-black/40 text-white hover:bg-black/60"><X className="w-4 h-4" /></button>
              <div className="absolute bottom-2 left-3"><h3 className="text-sm font-bold text-white">{selectedAttraction.name}</h3><p className="text-[10px] text-teal-200">{selectedAttraction.location}</p></div>
            </div>
            <div className="p-3 flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /><span className="font-medium">{selectedAttraction.rating}</span><span className="text-muted-foreground">({selectedAttraction.reviewCount})</span></div>
              <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-teal-500" /><span>{selectedAttraction.openTime}-{selectedAttraction.closeTime}</span></div>
              {selectedAttraction.price > 0 ? <div className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-emerald-500" /><span>{selectedAttraction.price.toLocaleString()} LAK</span></div> : <Badge className="bg-emerald-500 text-white text-[10px]">Free</Badge>}
              <a href={`/attractions/${selectedAttraction.id}`} className="ml-auto"><Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-7">View</Button></a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map */}
      <div className="absolute inset-0 z-0" style={{ top: "48px" }}>
        {leafletLoaded && (
          <MapContainer center={LAOS_CENTER} zoom={7} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {filteredAttractions.map((a) => {
              if (!a.coordinates[0] || !a.coordinates[1]) return null;
              return (
                <Marker key={a.id} position={[a.coordinates[0], a.coordinates[1]]}>
                  <Popup>
                    <div className="min-w-[180px]">
                      <h3 className="font-semibold text-sm">{a.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{a.location}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{a.rating}</span>
                        {a.price > 0 && <span className="text-xs text-gray-500">{a.price.toLocaleString()} LAK</span>}
                      </div>
                      <a href={`/attractions/${a.id}`} className="text-xs text-teal-600 hover:underline mt-1 inline-block">View Details</a>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
            {routePositions.length >= 2 && <Polyline positions={routePositions} pathOptions={{ color: "#14b8a6", weight: 3, opacity: 0.8, dashArray: "8 4" }} />}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
