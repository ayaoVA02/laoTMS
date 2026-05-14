"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Navigation, CheckCircle, Clock, MapPin } from "lucide-react";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

type Attraction = {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number]; // [lat,lng]
};

type Props = {
  attractions: Attraction[];
};

function getDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371000;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function LiveRouteMap({ attractions }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);

  const map = useRef<mapboxgl.Map | null>(null);

  const userMarker = useRef<mapboxgl.Marker | null>(null);

  const currentStopRef = useRef(0);

  const [currentStop, setCurrentStop] = useState(0);

  useEffect(() => {
    currentStopRef.current = currentStop;
  }, [currentStop]);

  // Initialize map once
  useEffect(() => {
    if (!mapContainer.current || !attractions.length) return;

    const first = attractions[0];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [first.coordinates[1], first.coordinates[0]],
      zoom: 11,
    });

    map.current.on("load", () => {
      const routeCoords = attractions.map((a) => [
        a.coordinates[1],
        a.coordinates[0],
      ]);

      map.current?.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: routeCoords,
          },
          properties: {},
        },
      });

      map.current?.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        paint: {
          "line-color": "#0d9488",
          "line-width": 5,
        },
      });

      attractions.forEach((a, i) => {
        new mapboxgl.Marker({
          color: "#0d9488",
        })
          .setLngLat([a.coordinates[1], a.coordinates[0]])
          .setPopup(
            new mapboxgl.Popup().setHTML(
              `
<div style="padding:8px">
<strong>Stop ${i + 1}</strong><br/>
${a.name}<br/>
${a.location}
</div>
`,
            ),
          )
          .addTo(map.current!);
      });
    });

    return () => map.current?.remove();
  }, [attractions]);

  // GPS tracking
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;

        const lng = pos.coords.longitude;

        if (!userMarker.current && map.current) {
          userMarker.current = new mapboxgl.Marker({
            color: "#2563eb",
          })
            .setLngLat([lng, lat])
            .addTo(map.current);
        } else {
          userMarker.current?.setLngLat([lng, lat]);
        }

        map.current?.flyTo({
          center: [lng, lat],
          zoom: 14,
        });

        const target = attractions[currentStopRef.current];

        if (!target) return;

        const distance = getDistanceMeters(
          lat,
          lng,
          target.coordinates[0],
          target.coordinates[1],
        );

        if (distance < 100) {
          setCurrentStop((prev) =>
            prev < attractions.length - 1 ? prev + 1 : prev,
          );
        }
      },
      console.error,
      {
        enableHighAccuracy: true,
      },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [attractions]);

  return (
    <div className="space-y-6">
      {/* Map */}
      <div
        ref={mapContainer}
        className="aspect-[16/9] rounded-xl overflow-hidden border"
      />

      {/* Progress */}
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold text-gray-900 mb-4">
          Route Progress ({currentStop + 1}/{attractions.length})
        </h3>

        <div className="space-y-3">
          {attractions.map((attraction, index) => {
            const done = index < currentStop;

            const active = index === currentStop;

            return (
              <div
                key={attraction.id}
                className={`flex items-center justify-between rounded-lg p-3 border transition-all
${
  done
    ? "bg-green-50 border-green-200"
    : active
      ? "bg-blue-50 border-blue-200"
      : "bg-gray-50 border-gray-100"
}`}
              >
                <div className="flex items-center gap-3">
                  <div>
                    {done ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : active ? (
                      <Navigation className="h-5 w-5 text-blue-600 animate-pulse" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-400" />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      Stop {index + 1}: {attraction.name}
                    </p>

                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      {attraction.location}
                    </div>
                  </div>
                </div>

                <div className="text-xs font-medium">
                  {done ? "Arrived" : active ? "Navigating" : "Pending"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
