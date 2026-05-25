
"use client";

import { useMemo, useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  MapPin,
  Calendar,
  Clock,
  Route,
  Trash2,
  Plus,
  Heart,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTravelPlanStore } from "@/stores/travel-plan-store";
import { useAttractionStore, type Attraction } from "@/stores/attraction-store";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/layout/footer";
import Image from "next/image";
import { useAuthStore } from "@/stores/auth-store";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";


const DynamicMap = dynamic(
  () =>
    Promise.resolve(function MapComponent({
      routePoints,
      userLocation,
      planAttractions,
    }: {
      routePoints: [number, number][];
      userLocation: [number, number] | null;
      planAttractions: Attraction[];
    }) {
      const L = require("leaflet");
      require("leaflet-routing-machine");

      const {
        MapContainer,
        TileLayer,
        Marker,
        Popup,
        useMap,
      } = require("react-leaflet");

      const [satellite, setSatellite] =
        useState(false);

      const attractionIcon = new L.Icon({
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
      });


      const userIcon = new L.DivIcon({
        html: `
          <div style="
            width:18px;
            height:18px;
            background:#2563eb;
            border-radius:50%;
            border:4px solid white;
            box-shadow:0 0 12px rgba(37,99,235,.5);
          "></div>
        `,
        className: "",
      });

      function RoutingMachine({
        points,
      }: {
        points: [number, number][];
      }) {
        const map = useMap();
        const routingControlRef =
          useRef<any>(null);

        useEffect(() => {
          if (!map || points.length < 2)
            return;

          if (routingControlRef.current) {
            map.removeControl(
              routingControlRef.current
            );
            routingControlRef.current =
              null;
          }

          routingControlRef.current =
            L.Routing.control({
              waypoints: points.map((p) =>
                L.latLng(p[0], p[1])
              ),

              routeWhileDragging: false,
              addWaypoints: false,
              draggableWaypoints: false,
              fitSelectedRoutes: true,

              show: false,
              collapsible: true,

              createMarker: () => null,

              lineOptions: {
                styles: [
                  {
                    color: "#0d9488",
                    weight: 6,
                    opacity: 0.9,
                  },
                ],
              },
            });

          routingControlRef.current.addTo(
            map
          );

          const container =
            routingControlRef.current.getContainer();

          if (container) {
            container.style.display =
              "none";
          }

          return () => {
            if (
              routingControlRef.current
            ) {
              map.removeControl(
                routingControlRef.current
              );
              routingControlRef.current =
                null;
            }
          };
        }, [map, points]);

        return null;
      }

      return (
        <div className="relative h-full w-full">
          {/* Toggle Button */}
          <div className="absolute bottom-4 left-4 z-[999]">
            <Button
              size="sm"
              variant="outline"
              className="bg-white shadow-md hover:shadow-lg transition-shadow"
              onClick={() =>
                setSatellite(
                  !satellite
                )
              }
            >
              {satellite
                ? "Map"
                : "Satellite"}
            </Button>
          </div>

          <MapContainer
            center={routePoints[0]}
            zoom={12}
            className="h-full w-full"
          >
            <TileLayer
              key={
                satellite
                  ? "satellite"
                  : "street"
              }
              url={
                satellite
                  ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              }
              attribution={
                satellite
                  ? "© Esri, Maxar"
                  : "© OpenStreetMap"
              }
              maxZoom={19}
            />

            {routePoints.length >
              1 && (
              <RoutingMachine
                points={
                  routePoints
                }
              />
            )}

            {userLocation && (
              <Marker
                position={
                  userLocation
                }
                icon={userIcon}
              >
                <Popup>
                  <strong>
                    Your current
                    location
                  </strong>
                </Popup>
              </Marker>
            )}

            {planAttractions.map(
              (
                attraction,
                index
              ) => (
                <Marker
                  key={
                    attraction.id
                  }
                  position={[
                    attraction
                      .coordinates[0],
                    attraction
                      .coordinates[1],
                  ]}
                  icon={
                    attractionIcon
                  }
                >
                  <Popup>
                    <div>
                      <h3 className="font-semibold">
                        {index +
                          1}
                        .{" "}
                        {
                          attraction.name
                        }
                      </h3>
                      <p className="text-xs text-gray-500">
                        {
                          attraction.location
                        }
                      </p>
                      <p className="text-xs text-teal-600">
                        {
                          attraction.openTime
                        }{" "}
                        -{" "}
                        {
                          attraction.closeTime
                        }
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )
            )}
          </MapContainer>
        </div>
      );
    }),
  { ssr: false }
);

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
  const { user } = useAuthStore();
  const {
    plans = [],
    removeAttractionFromPlan,
    addAttractionToPlan,
  } = useTravelPlanStore();
  const { attractions: allAttractions = [], favorites = [] } =
    useAttractionStore();

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [expandedStops, setExpandedStops] = useState<Set<string>>(new Set());
  const [showRouting, setShowRouting] = useState(true);
  const [transportMode, setTransportMode] = useState<"car" | "motorbike" | "bus">("car");

const TRANSPORT_SPEEDS = {
  car: 60,
  motorbike: 70,
  bus: 45,
};

const getTransportSpeed = () => TRANSPORT_SPEEDS[transportMode];

  const toggleStopExpand = (attractionId: string) => {
    setExpandedStops((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(attractionId)) {
        newSet.delete(attractionId);
      } else {
        newSet.add(attractionId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      },
      console.error,
      { enableHighAccuracy: true }
    );
  }, []);

  const plan = useMemo(
    () => plans.find((p) => p.id === params.id) ?? null,
    [plans, params.id]
  );

  const planAttractions = useMemo(() => {
    if (!plan) return [];
    return plan.attractionIds
      .map((id) => allAttractions.find((a) => a.id === id))
      .filter((a): a is Attraction => !!a);
  }, [plan, allAttractions]);

  const routePoints = useMemo(() => {
    const attractionPoints = planAttractions.map(
      (a) => [a.coordinates[0], a.coordinates[1]] as [number, number]
    );

    return userLocation
      ? [userLocation, ...attractionPoints]
      : attractionPoints;
  }, [planAttractions, userLocation]);

  const availableAttractions = useMemo(() => {
    if (!plan) return [];
    return allAttractions
      .filter(
        (a) => !plan.attractionIds.includes(a.id) && a.status === "approved"
      )
      .sort((a, b) => {
        const aFav = favorites.includes(a.id) ? 1 : 0;
        const bFav = favorites.includes(b.id) ? 1 : 0;
        return bFav - aFav;
      });
  }, [plan, allAttractions, favorites]);

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
    const speeds = { car: 60, motorbike: 70, bus: 45 };
    const speed = speeds[transportMode];
    const travelMinutes = Math.round((totalDistance / speed) * 60);
    const visitMinutes = planAttractions.length * 2 * 60;
    return Math.round((travelMinutes + visitMinutes) / 60); // Convert back to hours
  }, [planAttractions.length, totalDistance, transportMode]);

  const routeDetails = useMemo(() => {
    const details = [];
    let cumulativeDistance = 0;
    const speed = getTransportSpeed();
  

    if (userLocation && planAttractions.length > 0) {
      // Distance from user to first attraction
      const distToFirst = haversineDistance(
        userLocation[0],
        userLocation[1],
        planAttractions[0].coordinates[0],
        planAttractions[0].coordinates[1]
      );
      cumulativeDistance = distToFirst;
      const timeToFirst = Math.round((distToFirst / speed) * 60); // Convert to minutes
      details.push({
        type: "start",
        from: "Your Location",
        to: planAttractions[0].name,
        segmentDistance: Math.round(distToFirst * 10) / 10,
        cumulativeDistance: Math.round(cumulativeDistance * 10) / 10,
        estimatedTime: timeToFirst,
      });

      // Distance between attractions
      for (let i = 1; i < planAttractions.length; i++) {
        const prev = planAttractions[i - 1];
        const curr = planAttractions[i];
        const segmentDist = haversineDistance(
          prev.coordinates[0],
          prev.coordinates[1],
          curr.coordinates[0],
          curr.coordinates[1]
        );
        cumulativeDistance += segmentDist;
        const segmentTime = Math.round((segmentDist / speed) * 60); // Convert to minutes
        details.push({
          type: "segment",
          from: prev.name,
          to: curr.name,
          segmentDistance: Math.round(segmentDist * 10) / 10,
          cumulativeDistance: Math.round(cumulativeDistance * 10) / 10,
          estimatedTime: segmentTime,
        });
      }
    } else if (planAttractions.length > 0) {
      // Without user location, just calculate between attractions
      for (let i = 1; i < planAttractions.length; i++) {
        const prev = planAttractions[i - 1];
        const curr = planAttractions[i];
        const segmentDist = haversineDistance(
          prev.coordinates[0],
          prev.coordinates[1],
          curr.coordinates[0],
          curr.coordinates[1]
        );
        cumulativeDistance += segmentDist;
        const segmentTime = Math.round((segmentDist / speed) * 60); // Convert to minutes
        details.push({
          type: i === 1 ? "start" : "segment",
          from: prev.name,
          to: curr.name,
          segmentDistance: Math.round(segmentDist * 10) / 10,
          cumulativeDistance: Math.round(cumulativeDistance * 10) / 10,
          estimatedTime: segmentTime,
        });
      }
    }

    return details;
  }, [userLocation, planAttractions, transportMode,]);

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const opts: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    return `${startDate.toLocaleDateString(
      "en-US",
      opts
    )} - ${endDate.toLocaleDateString("en-US", opts)}`;
  };

  const getDaysBetween = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(diff, 1);
  };

const formatTimeEstimate = (totalMinutes: number) => {
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const mins = totalMinutes % 60;

  const parts = [];

  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);

  return parts.length ? parts.join(" ") : "0m";
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

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Route Map + Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header with Toggle Button and Transport Mode Selector */}
                <div className="px-6 sm:px-8 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
                        <Route className="h-5 w-5 text-teal-600" />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {t("travelPlans.routeMap", "Route Map")}
                      </h2>
                    </div>
                    <motion.button
                      onClick={() => setShowRouting(!showRouting)}
                      className="flex items-center gap-2 text-gray-400 hover:text-teal-600 transition-colors"
                    >
                      <motion.div
                        animate={{ rotate: showRouting ? 0 : -90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-5 w-5" />
                      </motion.div>
                    </motion.button>
                  </div>
                  
                  {/* Transport Mode Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600">
                      {t("travelPlans.transport", "Transport:")}
                    </span>
                    <div className="flex gap-1.5">
                      {(["car", "motorbike", "bus"] as const).map((mode) => (
                        <motion.button
                          key={mode}
                          onClick={() => setTransportMode(mode)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            transportMode === mode
                              ? "bg-teal-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {mode.charAt(0).toUpperCase() + mode.slice(1)}
                          {mode === "car" && " (60 km/h)"}
                          {mode === "motorbike" && " (70 km/h)"}
                          {mode === "bus" && " (45 km/h)"}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Map Content */}
                <motion.div
                  initial={false}
                  animate={{
                    height: showRouting ? "auto" : 0,
                    opacity: showRouting ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden border-t border-gray-100"
                >
                  <div className="p-6 sm:p-8">
                    {planAttractions.length > 0 ? (
                      <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-teal-100">
                        <DynamicMap
                          routePoints={routePoints}
                          userLocation={userLocation}
                          planAttractions={planAttractions}
                        />

                        <div className="absolute top-4 right-4 z-[999] bg-white/95 rounded-lg px-3 py-2 shadow-md text-xs font-medium text-teal-700 border border-teal-100">
                          {planAttractions.length} {planAttractions.length === 1 ? 'Stop' : 'Stops'}
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

                {/* Routing Details Section */}
                {planAttractions.length > 0 && routeDetails.length > 0 && (
                  <motion.div
                    initial={false}
                    animate={{
                      height: showRouting ? "auto" : 0,
                      opacity: showRouting ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden border-t border-gray-100"
                  >
                    <div className="p-6 sm:p-8 bg-gradient-to-b from-gray-50 to-white">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">
                        {t("travelPlans.routeDetails", "Route Details")}
                      </h3>

                      {/* Summary Stats */}
                      {routeDetails.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                          className="mb-6 p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl border border-teal-200"
                        >
                          <div className="flex flex-wrap items-center gap-6">
                            <div>
                              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                {t("travelPlans.totalDistance", "Total Distance")}
                              </p>
                              <p className="text-2xl font-bold text-teal-700 mt-1">
                                {routeDetails[routeDetails.length - 1].cumulativeDistance} km
                              </p>
                            </div>
                            <div className="h-12 w-px bg-teal-200" />
                            <div>
                              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                {t("travelPlans.travelTime", "Travel Time")}
                              </p>
                              <p className="text-2xl font-bold text-emerald-700 mt-1">
                                {formatTimeEstimate(routeDetails.reduce((sum, detail) => sum + detail.estimatedTime, 0))}
                              </p>
                            </div>
                            <div className="h-12 w-px bg-teal-200" />
                            <div>
                              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                {t("travelPlans.visitTime", "Visit Time")}
                              </p>
                              <p className="text-2xl font-bold text-blue-700 mt-1">
                                {formatTimeEstimate(planAttractions.length * 2 * 60)}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <div className="space-y-2">
                        {routeDetails.map((detail, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.3,
                              delay: 0.1 + index * 0.05,
                            }}
                            className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-100 hover:border-teal-200 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {index + 1}
                                </span>
                                <span className="text-sm text-gray-600 truncate">
                                  {detail.from}
                                </span>
                                <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                                <span className="text-sm font-medium text-gray-900 truncate">
                                  {detail.to}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 mt-2 ml-6 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Route className="h-3 w-3 text-teal-600" />
                                  <span>{detail.segmentDistance} km</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-emerald-600" />
                                  <span>{formatTimeEstimate(detail.estimatedTime)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="shrink-0 text-right ml-4">
                              <p className="text-sm font-semibold text-teal-700">
                                {detail.cumulativeDistance} km
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {t("travelPlans.totalFromStart", "from start")}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Attractions Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header Section */}
                <div className="px-6 sm:px-8 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                        <MapPin className="h-5 w-5 text-emerald-600" />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {t("travelPlans.itinerary", "Itinerary")}
                      </h2>
                      <Badge className="bg-teal-50 text-teal-700 border-teal-200">
                        {planAttractions.length}{" "}
                        {planAttractions.length === 1
                          ? t("travelPlans.stop", "stop")
                          : t("travelPlans.stops", "stops")}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 sm:p-8">
                  {planAttractions.length > 0 ? (
                    <div className="relative">
                    <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-gradient-to-b from-teal-400 via-emerald-400 to-teal-400" />

                    <div className="space-y-3">
                      {planAttractions.map((attraction, index) => {
                        const isExpanded = expandedStops.has(attraction.id);

                        return (
                          <motion.div
                            key={attraction.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.4,
                              delay: 0.3 + index * 0.08,
                            }}
                            className="relative flex items-start gap-4"
                          >
                            {/* Order indicator */}
                            <div className="relative shrink-0 flex items-center justify-center pt-1">
                              <div className="h-10 w-10 rounded-full bg-white border-2 border-teal-500 flex items-center justify-center z-10 shadow-sm">
                                <span className="text-sm font-bold text-teal-600">
                                  {index + 1}
                                </span>
                              </div>
                            </div>

                            {/* Stop Card */}
                            <div className="flex-1 min-w-0">
                              {/* Collapsed View */}
                              <motion.button
                                onClick={() => toggleStopExpand(attraction.id)}
                                className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-teal-300 hover:bg-teal-50/30 group transition-all text-left"
                                whileHover={{ scale: 1.01 }}
                              >
                                {/* Thumbnail */}
                                <div className="relative shrink-0 h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden">
                                  <Image
                                    src={attraction.images[0]}
                                    alt={attraction.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>

                                {/* Title and Location */}
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
                                </div>

                                {/* Expand Icon */}
                                <motion.div
                                  animate={{ rotate: isExpanded ? 180 : 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="shrink-0 text-gray-400 group-hover:text-teal-600"
                                >
                                  <ChevronDown className="h-5 w-5" />
                                </motion.div>
                              </motion.button>

                              {/* Expanded Details */}
                              <motion.div
                                initial={false}
                                animate={{
                                  height: isExpanded ? "auto" : 0,
                                  opacity: isExpanded ? 1 : 0,
                                  marginTop: isExpanded ? 12 : 0,
                                }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="bg-white rounded-xl border border-teal-100 p-4 sm:p-6 space-y-4">
                                  {/* Opening Hours */}
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 shrink-0">
                                      <Clock className="h-4 w-4 text-teal-600" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-medium text-gray-500 uppercase">
                                        {t("travelPlans.hours", "Operating Hours")}
                                      </p>
                                      <p className="text-sm font-semibold text-gray-900 mt-1">
                                        {attraction.openTime} - {attraction.closeTime}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Description */}
                                  {attraction.description && (
                                    <div className="flex items-start gap-3 pt-2 border-t border-gray-100">
                                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 shrink-0">
                                        <MapPin className="h-4 w-4 text-emerald-600" />
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500 uppercase">
                                          {t("travelPlans.description", "About")}
                                        </p>
                                        <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                                          {attraction.description}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Price */}
                                  {attraction.price !== undefined && (
                                    <div className="flex items-start gap-3 pt-2 border-t border-gray-100">
                                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 shrink-0">
                                        <Clock className="h-4 w-4 text-amber-600" />
                                      </div>
                                      <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase">
                                          {t("travelPlans.entryFee", "Entry Fee")}
                                        </p>
                                        <p className="text-sm font-semibold text-gray-900 mt-1">
                                          {attraction.isFreeEntry
                                            ? "Free"
                                            : `${attraction.price.toLocaleString()} LAK`}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Facilities */}
                                  {attraction.facilities &&
                                    attraction.facilities.length > 0 && (
                                      <div className="flex items-start gap-3 pt-2 border-t border-gray-100">
                                       
                                        <div className="flex-1">
                                          <p className="text-xs font-medium text-gray-500 uppercase">
                                            {t("travelPlans.facilities", "Facilities")}
                                          </p>
                                          <div className="flex flex-wrap gap-1.5 mt-2">
                                            {attraction.facilities
                                              .slice(0, 5)
                                              .map((facility: string) => (
                                                <Badge
                                                  key={facility}
                                                  className="bg-blue-50 text-blue-700 border-blue-100 text-xs"
                                                >
                                                  {facility}
                                                </Badge>
                                              ))}
                                            {attraction.facilities.length >
                                              5 && (
                                              <Badge className="bg-gray-100 text-gray-700 text-xs">
                                                +
                                                {attraction.facilities.length -
                                                  5}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                  {/* Action Buttons */}
                                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => toggleStopExpand(attraction.id)}
                                      className="flex-1"
                                    >
                                      {t("travelPlans.collapse", "Collapse")}
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => {
                                        const ok = window.confirm(
                                          `Remove "${attraction.name}" from this travel plan?`
                                        );
                                        if (ok) {
                                          removeAttractionFromPlan(
                                            plan.id,
                                            attraction.id
                                          );
                                        }
                                      }}
                                      className="flex-1 gap-2"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      {t("travelPlans.remove", "Remove")}
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>

                              {/* Vertical line connector - only show if not last item */}
                              {index < planAttractions.length - 1 && (
                                <div className="absolute left-5 top-16 h-8 w-0.5 bg-gradient-to-b from-teal-200 to-transparent" />
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
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
              </div>
            </motion.div>
          </div>

          {/* Right Column: Add Spots */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 sticky top-16">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  {t("travelPlans.addSpots", "Add Spots")}
                </h2>
                <p className="text-xs text-gray-500">
                  {t(
                    "travelPlans.favFirst",
                    "Favorites are prioritized for you"
                  )}
                </p>
              </div>

              {availableAttractions.length > 0 ? (
                <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1 custom-scrollbar">
                  {availableAttractions.map((attraction) => {
                    const isFav = favorites.includes(attraction.id);

                    return (
                      <motion.div
                        layout
                        key={attraction.id}
                        whileHover={{ scale: 1.01 }}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group ${
                          isFav
                            ? "bg-amber-50/50 border-amber-100 hover:border-amber-200"
                            : "bg-gray-50 border-gray-100 hover:border-teal-200 hover:bg-teal-50/30"
                        }`}
                      >
                        <div className="relative shrink-0 h-12 w-12 rounded-lg overflow-hidden">
                          <Image
                            src={attraction.images[0]}
                            alt={attraction.name}
                            fill
                            className="object-cover"
                          />
                          {isFav && (
                            <div className="absolute top-0 right-0 p-0.5 bg-red-400 rounded-bl-md">
                              <Heart className="h-2 w-2 text-white fill-current" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-800 truncate">
                            {attraction.name}
                          </h4>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[10px] text-gray-500 uppercase tracking-tight">
                              {attraction.province || attraction.location}
                            </span>
                          </div>
                        </div>

                        <Button
                          size="icon"
                          onClick={() => {
                            const ok = window.confirm(
                              `Add "${attraction.name}" to this travel plan?`
                            );
                            if (ok) {
                              addAttractionToPlan(plan.id, attraction.id);
                            }
                          }}
                          className={`shrink-0 h-8 w-8 rounded-full shadow-sm transition-colors ${
                            isFav
                              ? "bg-amber-500 hover:bg-amber-600 text-white"
                              : "bg-teal-600 hover:bg-teal-700 text-white"
                          }`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    );
                  })}
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