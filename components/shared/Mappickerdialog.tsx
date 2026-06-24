"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Check, Layers } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
// @ts-ignore
import "leaflet/dist/leaflet.css";

interface MapPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (coords: { lat: number; lng: number }, address?: string) => void;
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
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [satellite, setSatellite] = useState(false);

  // Sync state with initial props when dialog opens
  useEffect(() => {
    if (open) {
      if (initialLat && initialLng) {
        setPosition({ lat: initialLat, lng: initialLng });
      } else {
        setPosition(null);
      }
    }
  }, [open, initialLat, initialLng]);

  // Fix Leaflet marker icon issue in Next.js/React
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
      onConfirm({ lat: position.lat, lng: position.lng });
      onClose();
    }
  };

  // Default center (Vientiane) if no position is set
  const mapCenter: [number, number] = position 
    ? [position.lat, position.lng] 
    : [17.9757, 102.6331];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[800px] h-[95vh] sm:h-[80vh] md:h-[600px] flex flex-col p-0 overflow-hidden gap-0 border-none sm:border">
        <DialogHeader className="p-4 border-b shrink-0 bg-background">
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-500" />
            Pick Location
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 relative bg-slate-100 min-h-0">
          {/* Toggle Map Mode Control - Moved to top right */}
          <div className="absolute top-4 right-12 z-[1000]">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="bg-white/95 backdrop-blur shadow-md hover:shadow-lg transition-all gap-2"
              onClick={() => setSatellite(!satellite)}
            >
              <Layers className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-semibold">{satellite ? "Street Map" : "Satellite View"}</span>
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
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!position}
            className="bg-teal-600 hover:bg-teal-700 text-white flex-1 sm:flex-none px-8"
          >
            <Check className="w-4 h-4 mr-2" />
            Confirm Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}