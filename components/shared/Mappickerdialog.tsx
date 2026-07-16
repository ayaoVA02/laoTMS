"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Check, Layers, Search } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
// @ts-ignore
import "leaflet/dist/leaflet.css";

export interface LocationAddressDetails {
  fullAddress?: string;
  village?: string;
  district?: string;
  province?: string;
  country?: string;
  displayName?: string;
}

interface MapPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (coords: { lat: number; lng: number }, address?: LocationAddressDetails) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function MapPickerDialog({
  open,
  onClose,
  onConfirm,
  initialLat,
  initialLng,
}: MapPickerDialogProps) {
  const { t, i18n } = useTranslation();
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [satellite, setSatellite] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ lat: string; lon: string; display_name: string; address?: Record<string, string> }>>([]);
  const [selectedAddress, setSelectedAddress] = useState<LocationAddressDetails | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const buildAddressDetails = (data: any): LocationAddressDetails => {
    const address = data?.address ?? {};
    const village = address.village || address.hamlet || address.suburb || address.town || address.city || "";
    const district = address.city_district || address.county || address.district || address.state_district || "";
    const province = address.state || address.region || address.province || "";
    const country = address.country || "";
    const fullAddress = data?.display_name || [village, district, province, country].filter(Boolean).join(", ");

    return {
      fullAddress,
      village,
      district,
      province,
      country,
      displayName: data?.display_name,
    };
  };

  const resolveAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      const language = i18n.language?.startsWith("la") ? "lo" : "en";
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            "Accept-Language": language,
          },
        }
      );
      const data = await response.json();
      setSelectedAddress(buildAddressDetails(data));
    } catch {
      setSelectedAddress(null);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const language = i18n.language?.startsWith("la") ? "lo" : "en";
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(searchQuery)}&addressdetails=1&countrycodes=la`,
        {
          headers: {
            "Accept-Language": language,
          },
        }
      );
      const data = await response.json();
      setSearchResults(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data[0]) {
        const first = data[0];
        const lat = parseFloat(first.lat);
        const lng = parseFloat(first.lon);
        setPosition({ lat, lng });
        setSelectedAddress(buildAddressDetails(first));
      }
    } catch {
      setSearchError(t("dashboard.locationSection.searchFailed", "Unable to search places right now."));
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (open) {
      if (typeof initialLat === "number" && typeof initialLng === "number") {
        setPosition({ lat: initialLat, lng: initialLng });
        setSearchQuery("");
        setSearchResults([]);
        setSearchError(null);
      } else {
        setPosition(null);
        setSelectedAddress(null);
        setSearchQuery("");
        setSearchResults([]);
        setSearchError(null);
      }
    }
  }, [open, initialLat, initialLng]);

  useEffect(() => {
    if (!position) return;
    resolveAddressFromCoordinates(position.lat, position.lng);
  }, [position]);

  useEffect(() => {
    const fixLeafletIcon = async () => {
      const L = await import("leaflet");
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
    };
    fixLeafletIcon();
  }, []);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
      },
    });

    return position === null ? null : (
      <Marker
        position={position}
        draggable={true}
        eventHandlers={{
          dragend: (e: any) => {
            setPosition(e.target.getLatLng());
          },
        }}
      />
    );
  }

  const handleConfirm = () => {
    if (position) {
      onConfirm({ lat: position.lat, lng: position.lng }, selectedAddress ?? undefined);
      onClose();
    }
  };

  const mapCenter: [number, number] = position
    ? [position.lat, position.lng]
    : [17.9757, 102.6331];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[900px] h-[95vh] sm:h-[80vh] md:h-[680px] flex flex-col p-0 overflow-hidden gap-0 border-none sm:border">
        <DialogHeader className="p-4 border-b shrink-0 bg-background">
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-500" />
            {t("dashboard.locationSection.pickLocation", "Pick Location")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 relative bg-slate-100 min-h-0">
          <div className="absolute left-4 right-4 top-4 z-[1000] flex flex-col gap-2 sm:left-auto sm:right-24 sm:w-[320px]">
            <div className="rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-teal-600" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  placeholder={t("dashboard.locationSection.searchPlaceholder", "Search place or address")}
                  className="h-9 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                />
                <Button type="button" size="sm" onClick={handleSearch} disabled={isSearching} className="h-8 px-3">
                  {isSearching ? t("dashboard.locationSection.searching", "Searching...") : t("dashboard.locationSection.search", "Search")}
                </Button>
              </div>
              {searchError && <p className="mt-2 text-xs text-red-500">{searchError}</p>}
              {searchResults.length > 0 && (
                <div className="mt-3 max-h-36 space-y-2 overflow-auto">
                  {searchResults.map((result, index) => (
                    <button
                      key={`${result.display_name}-${index}`}
                      type="button"
                      onClick={() => {
                        const lat = parseFloat(result.lat);
                        const lng = parseFloat(result.lon);
                        setPosition({ lat, lng });
                        setSearchQuery(result.display_name);
                        setSearchResults([]);
                        setSelectedAddress(buildAddressDetails(result));
                      }}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs text-slate-700 transition hover:border-teal-400 hover:bg-teal-50"
                    >
                      {result.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedAddress && (
              <div className="rounded-2xl border border-teal-200 bg-teal-50/90 p-3 text-xs text-slate-700 shadow-sm">
                <p className="mb-1 font-semibold text-teal-700">
                  {t("dashboard.locationSection.detectedAddress", "Detected address")}
                </p>
                <p>{selectedAddress.fullAddress || selectedAddress.displayName}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-600">
                  {selectedAddress.village && <span className="rounded-full bg-white px-2 py-1">{t("dashboard.locationSection.village", "Village")}: {selectedAddress.village}</span>}
                  {selectedAddress.district && <span className="rounded-full bg-white px-2 py-1">{t("dashboard.locationSection.district", "District")}: {selectedAddress.district}</span>}
                  {selectedAddress.province && <span className="rounded-full bg-white px-2 py-1">{t("dashboard.locationSection.province", "Province")}: {selectedAddress.province}</span>}
                  {selectedAddress.country && <span className="rounded-full bg-white px-2 py-1">{t("dashboard.locationSection.country", "Country")}: {selectedAddress.country}</span>}
                </div>
              </div>
            )}
          </div>

          <div className="absolute top-4 right-4 z-[1000]">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="bg-white/95 backdrop-blur shadow-md hover:shadow-lg transition-all gap-2"
              onClick={() => setSatellite(!satellite)}
            >
              <Layers className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-semibold">{satellite ? t("dashboard.locationSection.streetMap", "Street Map") : t("dashboard.locationSection.satelliteView", "Satellite View")}</span>
            </Button>
          </div>

          <MapContainer
            center={mapCenter}
            zoom={13}
            className="h-full w-full"
            style={{ zIndex: 1 }}
          >
            <TileLayer
              key={satellite ? "satellite" : "street"}
              url={satellite
                ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
              attribution={satellite ? "© Esri, Maxar" : "© OpenStreetMap contributors"}
            />
            <LocationMarker />
          </MapContainer>
        </div>

        <DialogFooter className="p-4 border-t bg-background shrink-0 flex flex-row items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1 sm:flex-none">
            {t("dashboard.locationSection.cancel", "Cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!position}
            className="bg-teal-600 hover:bg-teal-700 text-white flex-1 sm:flex-none px-8"
          >
            <Check className="w-4 h-4 mr-2" />
            {t("dashboard.locationSection.confirmLocation", "Confirm Location")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}