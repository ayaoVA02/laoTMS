"use client";

import React from "react";
import { X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Coords {
  lat: number;
  lng: number;
}

interface MapPickerDialogProps {
  open: boolean;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
  onConfirm: (coords: Coords, address?: string) => void;
}

export const MapPickerDialog: React.FC<MapPickerDialogProps> = ({
  open, onClose, initialLat, initialLng, onConfirm,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl border bg-card p-6 shadow-2xl flex flex-col h-[500px]">
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-500" />
            <h3 className="text-base font-semibold">Select Location on Map</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 bg-muted/40 rounded-xl my-4 border border-dashed flex flex-col items-center justify-center p-4 text-center">
          <MapPin className="w-6 h-6 text-teal-500 animate-bounce mb-2" />
          <p className="text-sm font-medium">Map Canvas Frame</p>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">
            Embed your map package (Leaflet / Google / Mapbox) right here.
          </p>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" className="bg-teal-500 hover:bg-teal-600 text-white" onClick={() => {
            onConfirm({ lat: initialLat ?? 17.9667, lng: initialLng ?? 102.6133 }, "Vientiane, Laos");
            onClose();
          }}>Confirm Location</Button>
        </div>
      </div>
    </div>
  );
};