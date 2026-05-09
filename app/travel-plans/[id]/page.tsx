"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  MapPin,
  Calendar,
  Clock,
  Route,
  Trash2,
  Plus,
  Navigation,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTravelPlanStore } from "@/stores/travel-plan-store";
import { useAttractionStore, type Attraction } from "@/stores/attraction-store";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/layout/footer";

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function TravelPlanDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const {
    plans = [],
    removeAttractionFromPlan,
    addAttractionToPlan,
  } = useTravelPlanStore();
  const { attractions: allAttractions = [] } = useAttractionStore();

  const getAttractionById = (id: string) =>
    allAttractions.find((a) => a.id === id);

  const plan = useMemo(
    () => plans.find((p) => p.id === params.id) ?? null,
    [plans, params.id]
  );

  const planAttractions = useMemo(
    () =>
      plan
        ? plan.attractionIds
            .map((id) => getAttractionById(id))
            .filter(Boolean) as Attraction[]
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plan]
  );

  const availableAttractions = useMemo(
    () =>
      plan
        ? allAttractions.filter(
            (a) => !plan.attractionIds.includes(a.id) && a.status === "approved"
          )
        : [],
    [plan, allAttractions]
  );

  const totalDistance = useMemo(() => {
    if (planAttractions.length < 2) return 0;
    let dist = 0;
    for (let i = 1; i < planAttractions.length; i++) {
      const prev = planAttractions[i - 1];
      const curr = planAttractions[i];
      dist += haversineDistance(
        prev.coordinates[0],
        prev.coordinates[1],
        curr.coordinates[0],
        curr.coordinates[1]
      );
    }
    return Math.round(dist);
  }, [planAttractions]);

  const estimatedHours = useMemo(() => {
    if (planAttractions.length === 0) return 0;
    const travelHours = totalDistance / 60;
    const visitHours = planAttractions.length * 2;
    return Math.round(travelHours + visitHours);
  }, [planAttractions.length, totalDistance]);

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const opts: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    return `${startDate.toLocaleDateString("en-US", opts)} - ${endDate.toLocaleDateString("en-US", opts)}`;
  };

  const getDaysBetween = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(diff, 1);
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-teal-50 mx-auto">
            <Route className="h-12 w-12 text-teal-300" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            {t("travelPlans.notFound", "Travel plan not found")}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {t(
              "travelPlans.notFoundDesc",
              "The travel plan you are looking for does not exist."
            )}
          </p>
          <Button
            onClick={() => router.push("/travel-plans")}
            className="mt-6 bg-teal-600 hover:bg-teal-700 text-white"
          >
            {t("travelPlans.backToList", "Back to Travel Plans")}
          </Button>
        </div>
      </div>
    );
  }

  const days = getDaysBetween(plan.startDate, plan.endDate);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center py-3"
          >
            <Button
              variant="ghost"
              onClick={() => router.push("/travel-plans")}
              className="flex items-center gap-2 text-gray-600 hover:text-teal-700 -ml-2"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm font-medium">
                {t("travelPlans.back", "Back")}
              </span>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Plan Header */}
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-teal-600 to-emerald-700 text-white"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {plan.name}
          </h1>
          {plan.description && (
            <p className="mt-2 text-teal-100 text-sm sm:text-base max-w-2xl">
              {plan.description}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-teal-100">
              <Calendar className="h-4 w-4" />
              <span>{formatDateRange(plan.startDate, plan.endDate)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-teal-100">
              <Clock className="h-4 w-4" />
              <span>
                {days}{" "}
                {days === 1
                  ? t("travelPlans.day", "day")
                  : t("travelPlans.days", "days")}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-teal-100">
              <MapPin className="h-4 w-4" />
              <span>
                {planAttractions.length}{" "}
                {planAttractions.length === 1
                  ? t("travelPlans.attraction", "attraction")
                  : t("travelPlans.attractions", "attractions")}
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Stats Bar */}
      {planAttractions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white border-b border-gray-100 shadow-sm"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap items-center gap-6 sm:gap-8">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50">
                  <Route className="h-4 w-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">
                    {t("travelPlans.totalDistance", "Total Distance")}
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {totalDistance} km
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                  <Clock className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">
                    {t("travelPlans.estimatedTime", "Est. Time")}
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {estimatedHours}{" "}
                    {estimatedHours === 1
                      ? t("travelPlans.hour", "hour")
                      : t("travelPlans.hours", "hours")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50">
                  <MapPin className="h-4 w-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">
                    {t("travelPlans.stops", "Stops")}
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {planAttractions.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Route Map Placeholder + Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route Map Placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {t("travelPlans.routeMap", "Route Map")}
                </h2>

                {planAttractions.length > 0 ? (
                  <div className="relative aspect-[16/9] rounded-xl bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-50 border-2 border-dashed border-teal-200 overflow-hidden">
                    {/* SVG Route Visualization */}
                    <svg
                      className="absolute inset-0 w-full h-full"
                      viewBox="0 0 800 450"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      {/* Connection Lines */}
                      {planAttractions.length > 1 && (() => {
                        const points = planAttractions.map((a, i) => {
                          const x = 100 + (i / Math.max(planAttractions.length - 1, 1)) * 600;
                          const y = 200 + Math.sin(i * 1.2) * 80;
                          return { x, y, attraction: a };
                        });
                        const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

                        return (
                          <>
                            {/* Dashed route line */}
                            <polyline
                              points={polylinePoints}
                              fill="none"
                              stroke="#14b8a6"
                              strokeWidth="3"
                              strokeDasharray="8,4"
                              opacity="0.6"
                            />
                            {/* Solid route line on top */}
                            <polyline
                              points={polylinePoints}
                              fill="none"
                              stroke="#0d9488"
                              strokeWidth="2.5"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                            />
                            {/* Markers */}
                            {points.map((p, i) => (
                              <g key={i}>
                                {/* Outer glow */}
                                <circle
                                  cx={p.x}
                                  cy={p.y}
                                  r="16"
                                  fill="#14b8a6"
                                  opacity="0.2"
                                />
                                {/* Inner circle */}
                                <circle
                                  cx={p.x}
                                  cy={p.y}
                                  r="10"
                                  fill="white"
                                  stroke="#0d9488"
                                  strokeWidth="2.5"
                                />
                                {/* Number label */}
                                <text
                                  x={p.x}
                                  y={p.y + 1}
                                  textAnchor="middle"
                                  dominantBaseline="central"
                                  fontSize="11"
                                  fontWeight="bold"
                                  fill="#0d9488"
                                >
                                  {i + 1}
                                </text>
                                {/* Attraction name */}
                                <text
                                  x={p.x}
                                  y={p.y + 26}
                                  textAnchor="middle"
                                  fontSize="10"
                                  fill="#115e59"
                                  fontWeight="500"
                                >
                                  {p.attraction.name.length > 14
                                    ? p.attraction.name.slice(0, 14) + "..."
                                    : p.attraction.name}
                                </text>
                              </g>
                            ))}
                          </>
                        );
                      })()}
                      {planAttractions.length === 1 && (() => {
                        const a = planAttractions[0];
                        return (
                          <g>
                            <circle cx="400" cy="200" r="20" fill="#14b8a6" opacity="0.2" />
                            <circle cx="400" cy="200" r="14" fill="white" stroke="#0d9488" strokeWidth="2.5" />
                            <text x="400" y="201" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="bold" fill="#0d9488">1</text>
                            <text x="400" y="234" textAnchor="middle" fontSize="11" fill="#115e59" fontWeight="500">{a.name}</text>
                          </g>
                        );
                      })()}
                    </svg>

                    {/* Decorative compass icon */}
                    <div className="absolute bottom-3 right-3">
                      <Navigation className="h-6 w-6 text-teal-400/50" />
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-[16/9] rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-dashed border-teal-200 flex flex-col items-center justify-center">
                    <Route className="h-12 w-12 text-teal-300 mb-3" />
                    <p className="text-sm font-medium text-teal-700">
                      {t("travelPlans.noRouteYet", "No route yet")}
                    </p>
                    <p className="text-xs text-teal-500 mt-1">
                      {t(
                        "travelPlans.addAttractionsToRoute",
                        "Add attractions to see your route"
                      )}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Attractions Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  {t("travelPlans.itinerary", "Itinerary")}
                </h2>

                {planAttractions.length > 0 ? (
                  <div className="relative">
                    {/* Vertical connecting line */}
                    <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-gradient-to-b from-teal-400 via-emerald-400 to-teal-400" />

                    <div className="space-y-0">
                      {planAttractions.map((attraction, index) => (
                        <motion.div
                          key={attraction.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: 0.3 + index * 0.08,
                          }}
                          className="relative flex items-start gap-4 pb-8 last:pb-0"
                        >
                          {/* Order indicator */}
                          <div className="relative shrink-0 flex items-center justify-center">
                            <div className="h-10 w-10 rounded-full bg-white border-2 border-teal-500 flex items-center justify-center z-10 shadow-sm">
                              <span className="text-sm font-bold text-teal-600">
                                {index + 1}
                              </span>
                            </div>
                          </div>

                          {/* Attraction Card */}
                          <div className="flex-1 flex items-center gap-4 bg-gray-50 rounded-xl border border-gray-100 p-3 group hover:border-teal-200 hover:shadow-sm transition-all">
                            {/* Thumbnail */}
                            <div className="shrink-0 h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden">
                              <img
                                src={attraction.images[0]}
                                alt={attraction.name}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-gray-900 truncate">
                                {attraction.name}
                              </h4>
                              <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                <MapPin className="h-3 w-3 text-teal-500 shrink-0" />
                                <span className="truncate">
                                  {attraction.location}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3 text-teal-500 shrink-0" />
                                <span>
                                  {attraction.openTime} - {attraction.closeTime}
                                </span>
                              </div>
                            </div>

                            {/* Remove Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                removeAttractionFromPlan(plan.id, attraction.id)
                              }
                              className="shrink-0 text-gray-400 hover:text-red-500 hover:bg-red-50 h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <MapPin className="h-10 w-10 text-teal-300 mb-3" />
                    <p className="text-sm text-gray-600 font-medium">
                      {t(
                        "travelPlans.noAttractionsInPlan",
                        "No attractions in this plan yet"
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {t(
                        "travelPlans.addAttractionsBelow",
                        "Add attractions from the list below"
                      )}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Add Attractions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 sticky top-16">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                {t("travelPlans.addAttractions", "Add Attractions")}
              </h2>
              <p className="text-xs text-gray-500 mb-5">
                {t(
                  "travelPlans.availableAttractions",
                  "Available attractions to add to your plan"
                )}
              </p>

              {availableAttractions.length > 0 ? (
                <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                  {availableAttractions.map((attraction) => (
                    <motion.div
                      key={attraction.id}
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-all cursor-pointer group"
                    >
                      {/* Thumbnail */}
                      <div className="shrink-0 h-12 w-12 rounded-lg overflow-hidden">
                        <img
                          src={attraction.images[0]}
                          alt={attraction.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-800 truncate">
                          {attraction.name}
                        </h4>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-teal-500 shrink-0" />
                          <span className="text-xs text-gray-500 truncate">
                            {attraction.location}
                          </span>
                        </div>
                      </div>

                      {/* Add Button */}
                      <Button
                        size="icon"
                        onClick={() =>
                          addAttractionToPlan(plan.id, attraction.id)
                        }
                        className="shrink-0 h-8 w-8 bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Badge className="bg-teal-50 text-teal-700 border-teal-200 mb-3">
                    {t("travelPlans.allAdded", "All added")}
                  </Badge>
                  <p className="text-sm text-gray-500">
                    {t(
                      "travelPlans.allAttractionsAdded",
                      "All available attractions have been added to this plan."
                    )}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8">
        <Footer />
      </div>
    </div>
  );
}
