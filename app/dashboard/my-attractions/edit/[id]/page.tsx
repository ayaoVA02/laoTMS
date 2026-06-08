"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  Save, ArrowLeft, RefreshCw, Building2, MapPin, X, Phone,
  Clock, DollarSign, Wifi, Car, Utensils, BedDouble,
  Share2, AlertCircle, CheckCircle2, Image as ImageIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";
import DashboardLayout from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const MapPickerDialog = dynamic(
  () => import("@/components/shared/Mappickerdialog"),
  { ssr: false }
);

const PROVINCES = [
  "Vientiane Capital", "Phongsali", "Luang Namtha", "Oudomxay", "Bokeo",
  "Luang Prabang", "Huaphanh", "Xayabury", "Xieng Khouang", "Vientiane",
  "Borikhamxay", "Khammouane", "Savannakhet", "Saravane", "Sekong",
  "Champasack", "Attapeu", "Xaysomboun",
];

const BEST_TIMES = [
  "All year round", "November to April (dry season)", "May to October (green season)",
  "December to February (cool season)", "March to May (hot season)",
];

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL_IMAGE || "";

export default function EditAttractionPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const attractionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [pickOnMap, setPickOnMap] = useState(false);

  // Sync with insert logic: clear manual address fields when pickOnMap is true
  useEffect(() => {
    if (pickOnMap) {
      setFormData((prev: any) => prev ? {
        ...prev,
        province: "",
        district: "",
        village: ""
      } : prev);
    }
  }, [pickOnMap]);

  const fetchData = useCallback(async () => {
    if (!attractionId || !user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("attractions")
        .select("*")
        .eq("attraction_id", attractionId)
        .single();

      if (error) throw error;
      
      // Security: ensure the user owns this attraction
      if (data.user_id !== user.id) {
        toast.error("Unauthorized access");
        router.push("/dashboard/my-attractions");
        return;
      }
      
      setFormData(data);

      // Auto-enable pickOnMap if coordinates exist but address details are empty
      if (data.latitude && data.longitude && !data.province) {
        setPickOnMap(true);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load attraction details");
    } finally {
      setLoading(false);
    }
  }, [attractionId, user?.id, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setSaving(true);
    try {
      // Exclude fields that shouldn't be updated or are read-only
      const { 
        social_share, // Explicitly ignored as per request
        created_at, 
        updated_at, 
        attraction_id, 
        user_id, 
        ...updates 
      } = formData;
      
      if (updates.types) delete updates.types; // Remove joined relation

      const { error } = await supabase
        .from("attractions")
        .update(updates)
        .eq("attraction_id", attractionId);

      if (error) throw error;
      
      toast.success("Attraction updated successfully");
      router.push("/dashboard/my-attractions");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <DashboardLayout title="Edit Attraction">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="w-8 h-8 text-teal-500 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading attraction details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!formData) return null;

  return (
    <DashboardLayout
      title={t("dashboard.editAttraction", "Edit Attraction")}
      subtitle={`Editing ${formData.name_en}`}
    >
      <div className="max-w-4xl mx-auto pb-10 space-y-6">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
        </Button>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Info */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-500" />
                General Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name (English)</Label>
                  <Input 
                    value={formData.name_en || ""} 
                    onChange={(e) => handleChange("name_en", e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Name (Lao)</Label>
                  <Input 
                    value={formData.name_la || ""} 
                    onChange={(e) => handleChange("name_la", e.target.value)} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={formData.description || ""} 
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Activities</Label>
                  <Input 
                    placeholder="e.g. Swimming, hiking" 
                    value={formData.activity || ""} 
                    onChange={(e) => handleChange("activity", e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>License / Permit Number</Label>
                  <Input 
                    value={formData.license || ""} 
                    onChange={(e) => handleChange("license", e.target.value)} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-500" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-teal-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Pick address on map</p>
                    <p className="text-xs text-muted-foreground">Hide province/district/village and use map selection</p>
                  </div>
                </div>
                <Switch checked={pickOnMap} onCheckedChange={setPickOnMap} />
              </div>

              {!pickOnMap && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Province</Label>
                    <Select value={formData.province || ""} onValueChange={(v) => handleChange("province", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent className="max-h-60">
                        {PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>District</Label>
                    <Input value={formData.district || ""} onChange={(e) => handleChange("district", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Village</Label>
                    <Input value={formData.village || ""} onChange={(e) => handleChange("village", e.target.value)} />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Address / Directions</Label>
                <Input placeholder="Detailed address or landmark" value={formData.location || ""} onChange={(e) => handleChange("location", e.target.value)} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Coordinates</Label>
                  <button type="button" onClick={() => { setPickOnMap(true); setMapOpen(true); }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-500 transition-colors px-3 py-1.5 rounded-lg border border-teal-500/30 hover:bg-teal-500/5">
                    <MapPin className="w-3.5 h-3.5" />
                    Pick on Map
                  </button>
                </div>

                {formData.latitude && formData.longitude && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                    <span className="font-mono text-teal-700 dark:text-teal-300 flex-1">
                      {Number(formData.latitude).toFixed(6)}, {Number(formData.longitude).toFixed(6)}
                    </span>
                    <button type="button" onClick={() => { handleChange("latitude", null); handleChange("longitude", null); }}
                      className="text-muted-foreground hover:text-red-500 transition-colors shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Latitude</Label>
                    <Input type="number" step="any" placeholder="e.g. 17.9667"
                      value={formData.latitude || ""} onChange={e => handleChange("latitude", parseFloat(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Longitude</Label>
                    <Input type="number" step="any" placeholder="e.g. 102.6133"
                      value={formData.longitude || ""} onChange={e => handleChange("longitude", parseFloat(e.target.value))} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logistics */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-500" />
                Operation & Fees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Opening Time</Label>
                  <Input type="time" value={formData.open_time?.slice(0, 5) || ""} onChange={(e) => handleChange("open_time", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Closing Time</Label>
                  <Input type="time" value={formData.close_time?.slice(0, 5) || ""} onChange={(e) => handleChange("close_time", e.target.value)} />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl border bg-slate-50/50">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <DollarSign className="w-4 h-4 text-teal-500" /> Free Entry
                </div>
                <Switch checked={formData.is_free_entry} onCheckedChange={(v) => handleChange("is_free_entry", v)} />
              </div>

              {!formData.is_free_entry && (
                <div className="space-y-2">
                  <Label>Entry Fee for Foreigners (LAK)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      type="number" 
                      value={formData.entry_fee_foreigner || ""} 
                      onChange={(e) => handleChange("entry_fee_foreigner", parseFloat(e.target.value))} 
                      className="pl-9" 
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Best Time to Visit</Label>
                <Select 
                  value={formData.best_time_visit || ""} 
                  onValueChange={(v) => handleChange("best_time_visit", v)}
                >
                  <SelectTrigger><SelectValue placeholder="Select best season" /></SelectTrigger>
                  <SelectContent>
                    {BEST_TIMES.map(bt => <SelectItem key={bt} value={bt}>{bt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Facilities */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Facilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium"><Car className="w-4 h-4" /> Parking</div>
                    <Switch checked={formData.has_parking} onCheckedChange={(v) => handleChange("has_parking", v)} />
                  </div>
                  {formData.has_parking && (
                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-center justify-between text-xs">
                        <span>Free Parking</span>
                        <Switch checked={formData.is_free_parking} onCheckedChange={(v) => handleChange("is_free_parking", v)} className="scale-75" />
                      </div>
                      {!formData.is_free_parking && (
                        <Input 
                          type="number" 
                          placeholder="Price (LAK)" 
                          value={formData.parking_price || ""} 
                          onChange={(e) => handleChange("parking_price", parseFloat(e.target.value))} 
                          className="h-8 text-xs" 
                        />
                      )}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium"><Wifi className="w-4 h-4" /> Internet / WiFi</div>
                    <Switch checked={formData.has_internet} onCheckedChange={(v) => handleChange("has_internet", v)} />
                  </div>
                  {formData.has_internet && (
                    <div className="flex items-center justify-between text-xs pt-2 border-t">
                      <span>Free WiFi</span>
                      <Switch checked={formData.is_free_wifi} onCheckedChange={(v) => handleChange("is_free_wifi", v)} className="scale-75" />
                    </div>
                  )}
                </div>

                <div className="rounded-xl border p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium"><BedDouble className="w-4 h-4" /> Accommodation</div>
                    <Switch checked={formData.has_accommodation} onCheckedChange={(v) => handleChange("has_accommodation", v)} />
                  </div>
                  {formData.has_accommodation && (
                    <div className="pt-2 border-t">
                      <Input 
                        type="number" 
                        placeholder="Price per night (LAK)" 
                        value={formData.acc_price || ""} 
                        onChange={(e) => handleChange("acc_price", parseFloat(e.target.value))} 
                        className="h-8 text-xs" 
                      />
                    </div>
                  )}
                </div>

                <div className="rounded-xl border p-3 flex items-center justify-between h-fit">
                  <div className="flex items-center gap-2 text-sm font-medium"><Utensils className="w-4 h-4" /> Restaurant</div>
                  <Switch checked={formData.has_restaurant} onCheckedChange={(v) => handleChange("has_restaurant", v)} />
                </div>
              </div>

              {!formData.has_internet && (
                <div className="space-y-2">
                  <Label>Tour Guide Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="+856 20 xx xxx xxx" 
                      value={formData.guide_phone || ""} 
                      onChange={(e) => handleChange("guide_phone", e.target.value)} 
                      className="pl-9" 
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hidden">
            {/* Kept for UI spacing if needed, similar to create page */}
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50/50">
                <div className="flex items-center gap-2 text-sm"><Utensils className="w-4 h-4" /> Restaurant</div>
                <Switch checked={formData.has_restaurant} onCheckedChange={(v) => handleChange("has_restaurant", v)} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50/50">
                <div className="flex items-center gap-2 text-sm"><DollarSign className="w-4 h-4" /> Free Entry</div>
                <Switch checked={formData.is_free_entry} onCheckedChange={(v) => handleChange("is_free_entry", v)} />
              </div>
            </CardContent>
          </Card>

          {/* Social Sharing - Non-Editable */}
          <Card className="border-0 shadow-md bg-slate-50 dark:bg-slate-900/50 opacity-90">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Share2 className="w-5 h-5 text-teal-500" />
                Social Sharing
                <Badge variant="secondary" className="ml-auto font-normal">Read Only</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Automatic Social Media Sharing</p>
                <p className="text-xs text-muted-foreground">This setting cannot be modified on this page.</p>
              </div>
              <Switch checked={formData.social_share} disabled />
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => router.back()} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white min-w-[140px]">
              {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Map Picker Dialog */}
      <MapPickerDialog
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        initialLat={formData.latitude || undefined}
        initialLng={formData.longitude || undefined}
        onConfirm={(coords, address) => {
          setPickOnMap(true);
          handleChange("latitude", coords.lat);
          handleChange("longitude", coords.lng);
          if (address) handleChange("location", address);
        }}
      />
    </DashboardLayout>
  );
}