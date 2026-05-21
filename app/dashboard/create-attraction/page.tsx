"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, X, Plus, Share2, MapPin, Clock, DollarSign,
  Wifi, Car, Utensils, BedDouble, Globe,
  Image as ImageIcon, ChevronDown, ChevronUp, Loader2,
  Check, Eye, Save, Info, Video, Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/shared/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";
import { uploadToR2 } from "@/lib/upload";
import toast from "react-hot-toast";
import MapPickerDialog from "@/components/shared/Mappickerdialog";

// ── Dynamic import — no SSR (Leaflet needs window) ───────────────────────────
// const MapPickerDialog = dynamic(
//   () => import("@/components/shared/MapPickerDialo"),
//   { ssr: false }
// );

// ─── Constants ────────────────────────────────────────────────────────────────
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

// ─── Types ────────────────────────────────────────────────────────────────────
interface ImageItem {
  id: string; file: File; previewUrl: string;
  uploadedUrl: string | null; uploading: boolean; error: boolean; isThumbnail: boolean;
}
interface VideoItem {
  id: string; file: File; previewUrl: string;
  uploadedUrl: string | null; uploading: boolean; error: boolean;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Section({ title, icon, children, defaultOpen = true }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="border-0 shadow-md overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-2.5 text-sm font-semibold">
          <span className="text-teal-500">{icon}</span>{title}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
            <CardContent className="pt-0 px-4 sm:px-5 pb-5">{children}</CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// Gemini is called via server route handler `/api/gemini/social-caption` to keep API keys private.

function FacilityToggle({ icon, label, checked, onChange, subContent }: {
  icon: React.ReactNode; label: string; checked: boolean;
  onChange: (v: boolean) => void; subContent?: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border-2 transition-all p-3 ${checked ? "border-teal-500 bg-teal-500/5" : "border-border hover:border-teal-300"}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className={checked ? "text-teal-500" : "text-muted-foreground"}>{icon}</span>{label}
        </div>
        <Switch checked={checked} onCheckedChange={onChange} />
      </div>
      <AnimatePresence>
        {checked && subContent && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="mt-3 overflow-hidden">
            {subContent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, required, hasError, children }: {
  label: string; required?: boolean; hasError?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        {hasError && <span className="text-red-500 ml-2 text-xs font-normal">Required</span>}
      </Label>
      {children}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CreateAttractionPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [mapOpen, setMapOpen] = useState(false);
  const [pickOnMap, setPickOnMap] = useState(false);

  const [socialCaption, setSocialCaption] = useState("");
  const [socialWebsiteLink, setSocialWebsiteLink] = useState("");
  const [socialImageIds, setSocialImageIds] = useState<Set<string>>(new Set());
  const [postFacebook, setPostFacebook] = useState(true);
  const [postTiktok, setPostTiktok] = useState(false);
  const [postInstagram, setPostInstagram] = useState(false);
  const [generatingSocial, setGeneratingSocial] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // ── State ──────────────────────────────────────────────────────────────────
  const [nameEn, setNameEn] = useState("");
  const [nameLa, setNameLa] = useState("");
  const [description, setDescription] = useState("");
  const [activity, setActivity] = useState("");
  const [license, setLicense] = useState("");
  const [typeId, setTypeId] = useState("");
  const [types, setTypes] = useState<{ type_id: string; name_en: string }[]>([]);

  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [village, setVillage] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [openTime, setOpenTime] = useState("08:00");
  const [closeTime, setCloseTime] = useState("17:00");
  const [entryFeeForeigner, setEntryFeeForeigner] = useState("");
  const [isFreeEntry, setIsFreeEntry] = useState(false);
  const [bestTimeVisit, setBestTimeVisit] = useState("");

  const [hasParking, setHasParking] = useState(false);
  const [isFreeParking, setIsFreeParking] = useState(false);
  const [parkingPrice, setParkingPrice] = useState("");
  const [hasRestaurant, setHasRestaurant] = useState(false);
  const [hasAccommodation, setHasAccommodation] = useState(false);
  const [accPrice, setAccPrice] = useState("");
  const [hasInternet, setHasInternet] = useState(false);
  const [isFreeWifi, setIsFreeWifi] = useState(false);
  const [socialShare, setSocialShare] = useState(false);

  const [images, setImages] = useState<ImageItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    setMounted(true);
    supabase.from("types").select("type_id, name_en").eq("is_active", true).order("name_en")
      .then(({ data }) => { if (data) setTypes(data); });
  }, []);

  // ── Full reset ─────────────────────────────────────────────────────────────
  const resetForm = () => {
    setNameEn(""); setNameLa(""); setDescription(""); setActivity("");
    setLicense(""); setTypeId("");
    setProvince(""); setDistrict(""); setVillage("");
    setLocation(""); setLatitude(""); setLongitude("");
    setPickOnMap(false);
    setOpenTime("08:00"); setCloseTime("17:00");
    setEntryFeeForeigner(""); setIsFreeEntry(false); setBestTimeVisit("");
    // ✅ toggles reset too
    setHasParking(false); setIsFreeParking(false); setParkingPrice("");
    setHasRestaurant(false);
    setHasAccommodation(false); setAccPrice("");
    setHasInternet(false); setIsFreeWifi(false);
    setSocialShare(false);
    setSocialCaption("");
    setSocialWebsiteLink("");
    setSocialImageIds(new Set());
    setPostFacebook(true);
    setPostTiktok(false);
    setPostInstagram(false);
    setGeneratingSocial(false);
    setImages([]); setVideos([]);
    setErrors(new Set());
  };

  useEffect(() => {
    if (!pickOnMap) return;
    setProvince("");
    setDistrict("");
    setVillage("");
  }, [pickOnMap]);

  useEffect(() => {
    // Keep social selected images in sync with current image list
    if (!socialShare || socialImageIds.size === 0) return;
    const existing = new Set(images.map(i => i.id));
    const next = new Set(Array.from(socialImageIds).filter(id => existing.has(id)));
    if (next.size !== socialImageIds.size) setSocialImageIds(next);
  }, [images, socialShare, socialImageIds]);

  useEffect(() => {
    if (!socialShare) return;
    // Default social image selection = cover image (or first image)
    if (socialImageIds.size > 0) return;
    const cover = images.find(i => i.isThumbnail) ?? images[0];
    if (cover) setSocialImageIds(new Set([cover.id]));
  }, [socialShare, images, socialImageIds.size]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const clearError = (key: string) =>
    setErrors(prev => { const n = new Set(prev); n.delete(key); return n; });

  const inputCls = (key: string) =>
    errors.has(key) ? "border-red-500 focus:ring-red-500" : "";

  // ── Image upload ───────────────────────────────────────────────────────────
  const uploadImage = async (item: ImageItem) => {
    setImages(prev => prev.map(i => i.id === item.id ? { ...i, uploading: true } : i));
    try {
      const url = await uploadToR2(item.file, "attractions/images");
      setImages(prev => prev.map(i => i.id === item.id ? { ...i, uploading: false, uploadedUrl: url } : i));
    } catch {
      setImages(prev => prev.map(i => i.id === item.id ? { ...i, uploading: false, error: true } : i));
      toast.error(`Failed to upload ${item.file.name}`);
    }
  };

  const handleImages = useCallback((files: FileList | null) => {
    if (!files) return;
    clearError("images");
    const newItems: ImageItem[] = Array.from(files).filter(f => f.type.startsWith("image/"))
      .map((file, idx) => ({
        id: `img-${Date.now()}-${idx}`, file,
        previewUrl: URL.createObjectURL(file),
        uploadedUrl: null, uploading: false, error: false, isThumbnail: false,
      }));
    setImages(prev => {
      const combined = [...prev, ...newItems];
      if (!combined.some(i => i.isThumbnail) && combined.length > 0) combined[0].isThumbnail = true;
      return combined;
    });
    newItems.forEach(item => uploadImage(item));
  }, []);

  const removeImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(i => i.id !== id);
      if (filtered.length > 0 && !filtered.some(i => i.isThumbnail)) filtered[0].isThumbnail = true;
      return filtered;
    });
  };

  const setThumbnail = (id: string) =>
    setImages(prev => prev.map(i => ({ ...i, isThumbnail: i.id === id })));

  const toggleSocialImage = (id: string) =>
    setSocialImageIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const selectAllSocialImages = () =>
    setSocialImageIds(new Set(images.map(i => i.id)));

  const clearSocialImages = () => setSocialImageIds(new Set());

  const selectCoverSocialImage = () => {
    const cover = images.find(i => i.isThumbnail) ?? images[0];
    if (cover) setSocialImageIds(new Set([cover.id]));
  };

  // ── Video upload ───────────────────────────────────────────────────────────
  const uploadVideo = async (item: VideoItem) => {
    setVideos(prev => prev.map(v => v.id === item.id ? { ...v, uploading: true } : v));
    try {
      const url = await uploadToR2(item.file, "attractions/videos");
      setVideos(prev => prev.map(v => v.id === item.id ? { ...v, uploading: false, uploadedUrl: url } : v));
    } catch {
      setVideos(prev => prev.map(v => v.id === item.id ? { ...v, uploading: false, error: true } : v));
      toast.error(`Failed to upload ${item.file.name}`);
    }
  };

  const handleVideos = useCallback((files: FileList | null) => {
    if (!files) return;
    const newItems: VideoItem[] = Array.from(files).filter(f => f.type.startsWith("video/"))
      .map((file, idx) => ({
        id: `vid-${Date.now()}-${idx}`, file,
        previewUrl: URL.createObjectURL(file),
        uploadedUrl: null, uploading: false, error: false,
      }));
    setVideos(prev => [...prev, ...newItems]);
    newItems.forEach(item => uploadVideo(item));
  }, []);

  // ── Validate ───────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs = new Set<string>();
    if (!nameEn.trim()) errs.add("nameEn");
    if (!description.trim()) errs.add("description");
    if (!typeId) errs.add("typeId");
    if (images.length === 0) errs.add("images");
    setErrors(errs);
    if (errs.size > 0) { toast.error("Please fill all required fields"); return false; }
    return true;
  };

  const handleGenerateSocialCaption = async () => {
    if (generatingSocial) return;
    setGeneratingSocial(true);
    try {
      const categoryName = types.find(tp => tp.type_id === typeId)?.name_en;
      const entryFeeText = isFreeEntry ? "Free" : (entryFeeForeigner ? `${entryFeeForeigner} LAK` : "");
      const payload = {
        nameEn,
        description,
        categoryName,
        activities: activity,
        location,
        province,
        bestTimeVisit,
        entryFee: entryFeeText,
      };

      const res = await fetch("/api/gemini/social-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to generate caption");

      const text = (data?.caption as string) || "";

      console.log("Generated social caption:", text);
      setSocialCaption(text);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Failed to generate caption");
    } finally {
      setGeneratingSocial(false);
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (status: "draft" | "pending") => {
    if (!validate()) return;
    if (!user) { toast.error("Please login first"); return; }
    if ([...images, ...videos].some((m: any) => m.uploading)) {
      toast.error("Please wait for uploads to finish"); return;
    }
    setSaving(true);
    try {
      const thumbnailImg = images.find(i => i.isThumbnail);

      const insertBase: any = {
        user_id: user.id,
        type_id: typeId || null,
        name_en: nameEn,
        name_la: nameLa,
        description,
        activity,
        license,
        province: pickOnMap ? undefined : province,
        district: pickOnMap ? undefined : district,
        village: pickOnMap ? undefined : village,
        location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        open_time: openTime,
        close_time: closeTime,
        entry_fee_foreigner: isFreeEntry ? 0 : parseFloat(entryFeeForeigner || "0"),
        is_free_entry: isFreeEntry,
        best_time_visit: bestTimeVisit,
        has_parking: hasParking,
        is_free_parking: isFreeParking,
        parking_price: hasParking && !isFreeParking ? parseFloat(parkingPrice || "0") : 0,
        has_restaurant: hasRestaurant,
        has_accommodation: hasAccommodation,
        acc_price: hasAccommodation ? parseFloat(accPrice || "0") : 0,
        has_internet: hasInternet,
        is_free_wifi: isFreeWifi,
        social_share: socialShare,
        thumbnail_image: thumbnailImg?.uploadedUrl ?? "",
        vdo_reviews: videos[0]?.uploadedUrl ?? "",
        status,
      };

      console.log("Inserting attraction with payload:", insertBase);

      const tryInsert = (payload: any) =>
        supabase.from("attractions").insert(payload).select("attraction_id").single();

      // Send address/directions via `location` (backend field)
      const attractionRes = await tryInsert(insertBase);

      const { data: attraction, error: attrError } = attractionRes;

      if (attrError) throw attrError;
      const attractionId = attraction.attraction_id;

      // Save social sharing draft (reuse already-selected photos; no extra uploads)
      if (socialShare) {
        const cover = images.find(i => i.isThumbnail) ?? images[0];
        const selected = socialImageIds.size > 0
          ? socialImageIds
          : (cover ? new Set([cover.id]) : new Set<string>());

        const socialImages = images
          .filter(i => selected.has(i.id))
          .map(i => i.uploadedUrl)
          .filter(Boolean);

        const socialText = socialCaption.trim()
          ? socialCaption.trim()
          : (description || "").trim().slice(0, 240);

        try {
          await supabase.from("social").insert({
            attraction_id: attractionId,
            user_id: user.id,
            // social_images: {
            //   images: socialImages,
            //   platforms: {
            //     facebook: postFacebook,
            //     tiktok: postTiktok,
            //     instagram: postInstagram,
            //   },
            // },
            social_images: socialImages,
            facebook: postFacebook,
            description: socialText,
            website_link: socialWebsiteLink.trim() || null,
          });
        } catch (e) {
          console.error(e);
          toast.error("Social draft save failed (check social table)");
        }
      }

      // Extra images → attraction_images
      const extraImages = images.filter(i => !i.isThumbnail && i.uploadedUrl);
      if (extraImages.length > 0) {
        await supabase.from("attraction_images").insert(
          extraImages.map((img, idx) => ({
            attraction_id: attractionId, image_url: img.uploadedUrl!, display_order: idx + 1,
          }))
        );
      }

      // All videos → attraction_videos
      const uploadedVideos = videos.filter(v => v.uploadedUrl);
      if (uploadedVideos.length > 0) {
        await supabase.from("attraction_videos").insert(
          uploadedVideos.map((vid, idx) => ({
            attraction_id: attractionId,
            video_url: vid.uploadedUrl!,
            title: vid.file.name.replace(/\.[^.]+$/, ""),
            display_order: idx,
          }))
        );
      }

      toast.success(status === "draft" ? "Saved as draft!" : "Submitted for review! 🎉");
      // ✅ Full reset including toggles
      if (status === "pending") resetForm();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Failed to save attraction");
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  const allUploaded = [...images, ...videos].every((m: any) => !m.uploading);

  return (
    <DashboardLayout
      title={t("sidebar.createAttraction", "Create Attraction")}
      subtitle="Submit a new attraction for review"
    >
      <div className="space-y-4 sm:space-y-5 max-w-3xl mx-auto pb-10">

        {/* ── BASIC INFO ─────────────────────────────────────────────────── */}
        <Section title="Basic Information" icon={<Info className="w-4 h-4" />}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Name (English)" required hasError={errors.has("nameEn")}>
                <Input placeholder="e.g. Kuang Si Waterfall" value={nameEn}
                  onChange={e => { setNameEn(e.target.value); clearError("nameEn"); }}
                  className={inputCls("nameEn")} />
              </Field>
              <Field label="Name (Lao)">
                <Input placeholder="ຊື່ພາສາລາວ" value={nameLa} onChange={e => setNameLa(e.target.value)} />
              </Field>
            </div>
            <Field label="Category" required hasError={errors.has("typeId")}>
              <Select value={typeId} onValueChange={v => { setTypeId(v); clearError("typeId"); }}>
                <SelectTrigger className={inputCls("typeId")}><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {types.map(tp => <SelectItem key={tp.type_id} value={tp.type_id}>{tp.name_en}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Description" required hasError={errors.has("description")}>
              <Textarea placeholder="Describe your attraction in detail..." value={description}
                onChange={e => { setDescription(e.target.value); clearError("description"); }}
                className={`min-h-[110px] resize-none ${inputCls("description")}`} />
            </Field>
            <Field label="Activities">
              <Input placeholder="e.g. Swimming, hiking, photography" value={activity}
                onChange={e => setActivity(e.target.value)} />
            </Field>
            <Field label="License / Permit Number">
              <Input placeholder="Official license number (if any)" value={license}
                onChange={e => setLicense(e.target.value)} />
            </Field>
          </div>
        </Section>

        {/* ── MEDIA ──────────────────────────────────────────────────────── */}
        <Section title="Photos & Videos" icon={<ImageIcon className="w-4 h-4" />}>
          <div className="space-y-5">
            {/* Images */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold">Photos <span className="text-red-500">*</span></p>
                {errors.has("images") && <span className="text-xs text-red-500">At least 1 photo required</span>}
              </div>
              <div onDrop={e => { e.preventDefault(); handleImages(e.dataTransfer.files); }}
                onDragOver={e => e.preventDefault()} onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all ${errors.has("images") ? "border-red-500 bg-red-500/5" : "border-muted-foreground/25 hover:border-teal-500/60 hover:bg-teal-500/5"
                  }`}>
                <Upload className="w-7 h-7 text-muted-foreground mb-1.5" />
                <p className="text-sm text-muted-foreground font-medium">Drop photos here or click to browse</p>
                <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG, WEBP · Select multiple</p>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                  onChange={e => handleImages(e.target.files)} />
              </div>
              {images.length > 0 && (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3">
                    <AnimatePresence>
                      {images.map(img => (
                        <motion.div key={img.id} initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                          className="relative group aspect-square rounded-xl overflow-hidden border-2"
                          style={{ borderColor: img.isThumbnail ? "rgb(20 184 166)" : "transparent" }}>
                          <img src={img.previewUrl} alt="" className="w-full h-full object-cover" />
                          {img.uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="w-5 h-5 text-white animate-spin" /></div>}
                          {img.error && <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center"><X className="w-5 h-5 text-white" /></div>}
                          {img.isThumbnail && <div className="absolute top-1 left-1 bg-teal-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">COVER</div>}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                            {!img.isThumbnail && (
                              <button type="button" onClick={e => { e.stopPropagation(); setThumbnail(img.id); }}
                                className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center">
                                <Eye className="w-3.5 h-3.5 text-white" />
                              </button>
                            )}
                            <button type="button" onClick={e => { e.stopPropagation(); removeImage(img.id); }}
                              className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center">
                              <X className="w-3.5 h-3.5 text-white" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {images.length} photo{images.length !== 1 ? "s" : ""} · Hover → 👁 set cover · ✕ remove
                  </p>
                </>
              )}
            </div>

            {/* Videos */}
            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-2">Videos <span className="text-muted-foreground text-xs font-normal">(optional)</span></p>
              <div onDrop={e => { e.preventDefault(); handleVideos(e.dataTransfer.files); }}
                onDragOver={e => e.preventDefault()} onClick={() => videoInputRef.current?.click()}
                className="flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-teal-500/60 hover:bg-teal-500/5 cursor-pointer transition-all">
                <Video className="w-7 h-7 text-muted-foreground mb-1.5" />
                <p className="text-sm text-muted-foreground font-medium">Drop videos or click to browse</p>
                <p className="text-xs text-muted-foreground/60 mt-1">MP4, WebM · Select multiple</p>
                <input ref={videoInputRef} type="file" accept="video/*" multiple className="hidden"
                  onChange={e => handleVideos(e.target.files)} />
              </div>
              {videos.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <AnimatePresence>
                    {videos.map(vid => (
                      <motion.div key={vid.id} initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        className="relative group rounded-xl overflow-hidden border border-border bg-black">
                        <video src={vid.previewUrl} className="w-full h-36 object-cover"
                          onMouseEnter={e => { if (!vid.uploading) (e.target as HTMLVideoElement).play(); }}
                          onMouseLeave={e => { (e.target as HTMLVideoElement).pause(); (e.target as HTMLVideoElement).currentTime = 0; }} />
                        {vid.uploading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Loader2 className="w-6 h-6 text-white animate-spin" /></div>}
                        {vid.uploadedUrl && <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center"><Check className="w-3.5 h-3.5 text-white" /></div>}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button type="button" onClick={e => { e.stopPropagation(); setVideos(prev => prev.filter(v => v.id !== vid.id)); }}
                            className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 px-2 py-1.5">
                          <p className="text-xs text-white truncate">{vid.file.name}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* ── LOCATION ───────────────────────────────────────────────────── */}
        <Section title="Location" icon={<MapPin className="w-4 h-4" />}>
          <div className="space-y-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Province">
                  <Select value={province} onValueChange={setProvince}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent className="max-h-60">
                      {PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="District">
                  <Input placeholder="District" value={district} onChange={e => setDistrict(e.target.value)} />
                </Field>
                <Field label="Village">
                  <Input placeholder="Village" value={village} onChange={e => setVillage(e.target.value)} />
                </Field>
              </div>
            )}

            <Field label="Address / Directions">
              <Input placeholder="Detailed address or landmark" value={location}
                onChange={e => setLocation(e.target.value)} />
            </Field>

            {/* Coordinates + map picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Coordinates</Label>
                <button type="button" onClick={() => { setPickOnMap(true); setMapOpen(true); }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-500 transition-colors px-3 py-1.5 rounded-lg border border-teal-500/30 hover:bg-teal-500/5">
                  <MapPin className="w-3.5 h-3.5" />
                  Pick on Map
                </button>
              </div>

              {/* Selected coords preview */}
              <AnimatePresence>
                {latitude && longitude && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-500/8 border border-teal-500/20 text-xs overflow-hidden">
                    <MapPin className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                    <span className="font-mono text-teal-700 dark:text-teal-300 flex-1">
                      {parseFloat(latitude).toFixed(6)}, {parseFloat(longitude).toFixed(6)}
                    </span>
                    <button type="button" onClick={() => { setLatitude(""); setLongitude(""); }}
                      className="text-muted-foreground hover:text-red-500 transition-colors shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Latitude">
                  <Input type="number" step="any" placeholder="e.g. 17.9667"
                    value={latitude} onChange={e => setLatitude(e.target.value)} />
                </Field>
                <Field label="Longitude">
                  <Input type="number" step="any" placeholder="e.g. 102.6133"
                    value={longitude} onChange={e => setLongitude(e.target.value)} />
                </Field>
              </div>

              {!latitude && !longitude && (
                <p className="text-xs text-muted-foreground">
                  Enter manually or click <span className="text-teal-500 font-medium">Pick on Map</span> to select visually.
                  Internet required for the map.
                </p>
              )}
            </div>
          </div>
        </Section>

        {/* ── HOURS & FEES ───────────────────────────────────────────────── */}
        <Section title="Hours & Entry Fees" icon={<Clock className="w-4 h-4" />}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Opening Time">
                <Input type="time" value={openTime} onChange={e => setOpenTime(e.target.value)} />
              </Field>
              <Field label="Closing Time">
                <Input type="time" value={closeTime} onChange={e => setCloseTime(e.target.value)} />
              </Field>
            </div>
            <FacilityToggle icon={<DollarSign className="w-4 h-4" />} label="Free Entry"
              checked={isFreeEntry} onChange={setIsFreeEntry} />
            {!isFreeEntry && (
              <Field label="Entry Fee for Foreigners (LAK)">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="number" placeholder="0" value={entryFeeForeigner}
                    onChange={e => setEntryFeeForeigner(e.target.value)} className="pl-9" />
                </div>
              </Field>
            )}
            <Field label="Best Time to Visit">
              <Select value={bestTimeVisit} onValueChange={setBestTimeVisit}>
                <SelectTrigger><SelectValue placeholder="Select best season" /></SelectTrigger>
                <SelectContent>
                  {BEST_TIMES.map(bt => <SelectItem key={bt} value={bt}>{bt}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </Section>

        {/* ── FACILITIES ─────────────────────────────────────────────────── */}
        <Section title="Facilities & Amenities" icon={<Check className="w-4 h-4" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FacilityToggle icon={<Car className="w-4 h-4" />} label="Parking Available"
              checked={hasParking} onChange={setHasParking}
              subContent={
                <div className="space-y-2">
                  <FacilityToggle icon={<Car className="w-3.5 h-3.5" />} label="Free Parking"
                    checked={isFreeParking} onChange={setIsFreeParking} />
                  {!isFreeParking && (
                    <div className="relative mt-2">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="number" placeholder="Parking price (LAK)" value={parkingPrice}
                        onChange={e => setParkingPrice(e.target.value)} className="pl-9 h-9 text-sm" />
                    </div>
                  )}
                </div>
              }
            />
            <FacilityToggle icon={<Wifi className="w-4 h-4" />} label="Internet / WiFi"
              checked={hasInternet} onChange={setHasInternet}
              subContent={
                <FacilityToggle icon={<Wifi className="w-3.5 h-3.5" />} label="Free WiFi"
                  checked={isFreeWifi} onChange={setIsFreeWifi} />
              }
            />
            <FacilityToggle icon={<Utensils className="w-4 h-4" />} label="Restaurant / Food"
              checked={hasRestaurant} onChange={setHasRestaurant} />
            <FacilityToggle icon={<BedDouble className="w-4 h-4" />} label="Accommodation"
              checked={hasAccommodation} onChange={setHasAccommodation}
              subContent={
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="number" placeholder="Price per night (LAK)" value={accPrice}
                    onChange={e => setAccPrice(e.target.value)} className="pl-9 h-9 text-sm" />
                </div>
              }
            />
          </div>
        </Section>

        {/* ── SETTINGS ───────────────────────────────────────────────────── */}
        <Section title="Settings" icon={<Globe className="w-4 h-4" />} defaultOpen={false}>
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3">
              <Share2 className="w-4 h-4 text-teal-500 shrink-0" />
              <div>
                <p className="text-sm font-medium">Social Sharing</p>
                <p className="text-xs text-muted-foreground">Allow visitors to share this attraction</p>
              </div>
            </div>
            <Switch checked={socialShare} onCheckedChange={setSocialShare} />
          </div>

          {socialShare && (
            <div className="mt-4 space-y-4">
              <div className="p-3 rounded-xl border bg-card">
                <p className="text-sm font-semibold mb-2">Post to</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 border cursor-pointer">
                    <Checkbox checked={postFacebook} onCheckedChange={(v) => setPostFacebook(Boolean(v))} />
                    <span className="text-sm">Facebook</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border cursor-pointer">
                    <Checkbox checked={postTiktok} disabled onCheckedChange={(v) => setPostTiktok(Boolean(v))} />
                    <span className="text-sm">TikTok</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border cursor-pointer">
                    <Checkbox checked={postInstagram} disabled onCheckedChange={(v) => setPostInstagram(Boolean(v))} />
                    <span className="text-sm">Instagram</span>
                  </label>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  This only saves a social draft. Actual posting will be added later.
                </p>
              </div>

              <div className="p-3 rounded-xl border bg-card space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">Social caption</p>
                    <p className="text-[11px] text-muted-foreground">Write your own, or generate with AI.</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9"
                    disabled={generatingSocial}
                    onClick={handleGenerateSocialCaption}
                  >
                    {generatingSocial ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Generate AI
                  </Button>
                </div>
                <Textarea
                  placeholder="Short, interesting caption for social media..."
                  value={socialCaption}
                  onChange={(e) => setSocialCaption(e.target.value)}
                  className="min-h-[110px] resize-none"
                />
              </div>

              {/* <div className="p-3 rounded-xl border bg-card space-y-2">
                <p className="text-sm font-semibold">Website link</p>
                <Input
                  placeholder="https://... (optional)"
                  value={socialWebsiteLink}
                  onChange={(e) => setSocialWebsiteLink(e.target.value)}
                />
              </div> */}

              <div className="p-3 rounded-xl border bg-card">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div>
                    <p className="text-sm font-semibold">Social images</p>
                    <p className="text-[11px] text-muted-foreground">Pick from the photos you already selected (no re-upload).</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="button" size="sm" variant="outline" className="h-8 px-2" onClick={selectCoverSocialImage}>
                      Use cover
                    </Button>
                    <Button type="button" size="sm" variant="outline" className="h-8 px-2" onClick={selectAllSocialImages}>
                      Select all
                    </Button>
                    <Button type="button" size="sm" variant="outline" className="h-8 px-2" onClick={clearSocialImages}>
                      Clear
                    </Button>
                  </div>
                </div>

                {images.length === 0 ? (
                  <div className="p-4 rounded-xl bg-muted/40 border border-dashed text-center text-xs text-muted-foreground">
                    Add photos in the “Photos & Videos” section first.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {images.map((img) => {
                      const checked = socialImageIds.has(img.id);
                      return (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => toggleSocialImage(img.id)}
                          className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-colors ${checked ? "border-teal-500" : "border-transparent hover:border-teal-500/40"}`}
                          title="Click to select"
                        >
                          <img src={img.previewUrl} alt="" className="w-full h-full object-cover" />
                          {img.isThumbnail && (
                            <div className="absolute top-1 left-1 bg-teal-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                              COVER
                            </div>
                          )}
                          {checked && (
                            <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                              <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                <p className="text-[11px] text-muted-foreground mt-2">
                  Selected: {socialImageIds.size}
                </p>
              </div>
            </div>
          )}
        </Section>

        {/* ── ACTIONS ────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
          <Button type="button" variant="outline" className="w-full sm:w-auto"
            disabled={saving} onClick={() => handleSubmit("draft")}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save as Draft
          </Button>
          <Button type="button" disabled={saving || !allUploaded}
            onClick={() => handleSubmit("pending")}
            className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white shadow-lg shadow-teal-500/20">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            Submit for Review
          </Button>
        </div>

        {!allUploaded && (
          <p className="text-center text-xs text-amber-500 flex items-center justify-center gap-1.5">
            <Loader2 className="w-3 h-3 animate-spin" /> Still uploading, please wait...
          </p>
        )}
      </div>

      {/* ── MAP PICKER ─────────────────────────────────────────────────────── */}
      <MapPickerDialog
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        initialLat={latitude ? parseFloat(latitude) : undefined}
        initialLng={longitude ? parseFloat(longitude) : undefined}
        onConfirm={(coords, address) => {
          setPickOnMap(true);
          setLatitude(String(coords.lat));
          setLongitude(String(coords.lng));
          if (address) setLocation(address);
        }}
      />
    </DashboardLayout>
  );
}
