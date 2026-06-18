"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Section } from "@/components/ui/section";
import { Field } from "@/components/ui/field";
import { PROVINCES } from "../../data/attractions";

interface LocationSectionProps {
  pickOnMap: boolean;
  setPickOnMap: (v: boolean) => void;
  province: string;
  setProvince: (v: string) => void;
  district: string;
  setDistrict: (v: string) => void;
  village: string;
  setVillage: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  latitude: string;
  setLatitude: (v: string) => void;
  longitude: string;
  setLongitude: (v: string) => void;
  setMapOpen: (v: boolean) => void;
}

export function LocationSection({
  pickOnMap, setPickOnMap,
  province, setProvince,
  district, setDistrict,
  village, setVillage,
  location, setLocation,
  latitude, setLatitude,
  longitude, setLongitude,
  setMapOpen,
}: LocationSectionProps) {
  return (
    <Section title="Location" icon={<MapPin className="w-4 h-4" />}>
      <div className="space-y-4">
        {/* Map toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-teal-500 shrink-0" />
            <div>
              <p className="text-sm font-medium">Pick address on map</p>
              <p className="text-xs text-muted-foreground">
                Hide province/district/village and use map selection
              </p>
            </div>
          </div>
          <Switch checked={pickOnMap} onCheckedChange={setPickOnMap} />
        </div>

        {/* Province / District / Village */}
        {!pickOnMap && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Province">
              <Select value={province} onValueChange={setProvince}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {PROVINCES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="District">
              <Input
                placeholder="District"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
            </Field>
            <Field label="Village">
              <Input
                placeholder="Village"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
              />
            </Field>
          </div>
        )}

        {/* Address */}
        <Field label="Address / Directions">
          <Input
            placeholder="Detailed address or landmark"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </Field>

        {/* Coordinates */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Coordinates</Label>
            <button
              type="button"
              onClick={() => {
                setPickOnMap(true);
                setMapOpen(true);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-500 transition-colors px-3 py-1.5 rounded-lg border border-teal-500/30 hover:bg-teal-500/5"
            >
              <MapPin className="w-3.5 h-3.5" />
              Pick on Map
            </button>
          </div>

          <AnimatePresence>
            {latitude && longitude && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-500/8 border border-teal-500/20 text-xs overflow-hidden"
              >
                <MapPin className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                <span className="font-mono text-teal-700 dark:text-teal-300 flex-1">
                  {parseFloat(latitude).toFixed(6)},{" "}
                  {parseFloat(longitude).toFixed(6)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setLatitude("");
                    setLongitude("");
                  }}
                  className="text-muted-foreground hover:text-red-500 transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Latitude">
              <Input
                type="number"
                step="any"
                placeholder="e.g. 17.9667"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
            </Field>
            <Field label="Longitude">
              <Input
                type="number"
                step="any"
                placeholder="e.g. 102.6133"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </Field>
          </div>

          {!latitude && !longitude && (
            <p className="text-xs text-muted-foreground">
              Enter manually or click{" "}
              <span className="text-teal-500 font-medium">Pick on Map</span> to select
              visually. Internet required for the map.
            </p>
          )}
        </div>
      </div>
    </Section>
  );
}