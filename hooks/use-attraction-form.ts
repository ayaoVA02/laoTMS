"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";
import { uploadToR2 } from "@/lib/upload";
import toast from "react-hot-toast";
import type { ImageItem, VideoItem, AttractionType } from "../data/attractions";

export function useAttractionForm() {
  const { user } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [mapOpen, setMapOpen] = useState(false);
  const [pickOnMap, setPickOnMap] = useState(false);

  // ── Social sharing state ────────────────────────────────────────────────
  const [socialCaption, setSocialCaption] = useState("");
  const [socialWebsiteLink, setSocialWebsiteLink] = useState("");
  const [socialImageIds, setSocialImageIds] = useState<Set<string>>(new Set());
  const [postFacebook, setPostFacebook] = useState(true);
  const [postTiktok, setPostTiktok] = useState(false);
  const [postInstagram, setPostInstagram] = useState(false);
  const [generatingSocial, setGeneratingSocial] = useState(false);

  // ── Refs ────────────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // ── Basic info ──────────────────────────────────────────────────────────
  const [nameEn, setNameEn] = useState("");
  const [nameLa, setNameLa] = useState("");
  const [description, setDescription] = useState("");
  const [activity, setActivity] = useState("");
  const [license, setLicense] = useState("");
  const [typeId, setTypeId] = useState("");
  const [types, setTypes] = useState<AttractionType[]>([]);

  // ── Location ────────────────────────────────────────────────────────────
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [village, setVillage] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // ── Hours & fees ────────────────────────────────────────────────────────
  const [openTime, setOpenTime] = useState("08:00");
  const [closeTime, setCloseTime] = useState("17:00");
  const [entryFeeForeigner, setEntryFeeForeigner] = useState("");
  const [isFreeEntry, setIsFreeEntry] = useState(false);
  const [bestTimeVisit, setBestTimeVisit] = useState("");

  // ── Facilities ──────────────────────────────────────────────────────────
  const [guidePhone, setGuidePhone] = useState("");
  const [hasParking, setHasParking] = useState(false);
  const [isFreeParking, setIsFreeParking] = useState(false);
  const [parkingPrice, setParkingPrice] = useState("");
  const [hasRestaurant, setHasRestaurant] = useState(false);
  const [hasAccommodation, setHasAccommodation] = useState(false);
  const [accPrice, setAccPrice] = useState("");
  const [hasInternet, setHasInternet] = useState(false);
  const [isFreeWifi, setIsFreeWifi] = useState(false);
  const [socialShare, setSocialShare] = useState(false);

  // ── Media ───────────────────────────────────────────────────────────────
  const [images, setImages] = useState<ImageItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);

  // ── Init ────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase
      .from("types")
      .select("type_id, name_en")
      .eq("is_active", true)
      .order("name_en")
      .then(({ data }) => {
        if (data) setTypes(data);
      });
  }, []);

  // Clear province/district/village when switching to map mode
  useEffect(() => {
    if (!pickOnMap) return;
    setProvince("");
    setDistrict("");
    setVillage("");
  }, [pickOnMap]);

  // Keep social selected images in sync with current image list
  useEffect(() => {
    if (!socialShare || socialImageIds.size === 0) return;
    const existing = new Set(images.map((i) => i.id));
    const next = new Set(Array.from(socialImageIds).filter((id) => existing.has(id)));
    if (next.size !== socialImageIds.size) setSocialImageIds(next);
  }, [images, socialShare, socialImageIds]);

  // Default social image selection = cover image (or first image)
  useEffect(() => {
    if (!socialShare) return;
    if (socialImageIds.size > 0) return;
    const cover = images.find((i) => i.isThumbnail) ?? images[0];
    if (cover) setSocialImageIds(new Set([cover.id]));
  }, [socialShare, images, socialImageIds.size]);

  // ── Helpers ─────────────────────────────────────────────────────────────
  const clearError = (key: string) =>
    setErrors((prev) => {
      const n = new Set(prev);
      n.delete(key);
      return n;
    });

  const inputCls = (key: string) =>
    errors.has(key) ? "border-red-500 focus:ring-red-500" : "";

  // ── Full reset ───────────────────────────────────────────────────────────
  const resetForm = () => {
    setNameEn("");
    setNameLa("");
    setDescription("");
    setActivity("");
    setLicense("");
    setTypeId("");
    setProvince("");
    setDistrict("");
    setVillage("");
    setLocation("");
    setLatitude("");
    setLongitude("");
    setPickOnMap(false);
    setOpenTime("08:00");
    setCloseTime("17:00");
    setEntryFeeForeigner("");
    setIsFreeEntry(false);
    setBestTimeVisit("");
    setGuidePhone("");
    setHasParking(false);
    setIsFreeParking(false);
    setParkingPrice("");
    setHasRestaurant(false);
    setHasAccommodation(false);
    setAccPrice("");
    setHasInternet(false);
    setIsFreeWifi(false);
    setSocialShare(false);
    setSocialCaption("");
    setSocialWebsiteLink("");
    setSocialImageIds(new Set());
    setPostFacebook(true);
    setPostTiktok(false);
    setPostInstagram(false);
    setGeneratingSocial(false);
    setImages([]);
    setVideos([]);
    setErrors(new Set());
  };

  // ── Image upload ─────────────────────────────────────────────────────────
  const uploadImage = async (item: ImageItem) => {
    setImages((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, uploading: true } : i))
    );
    try {
      const url = await uploadToR2(item.file, "attractions/images");
      const fileName = url.split("/").pop()!;
      setImages((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, uploading: false, uploadedUrl: fileName } : i
        )
      );
    } catch {
      setImages((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, uploading: false, error: true } : i
        )
      );
      toast.error(`Failed to upload ${item.file.name}`);
    }
  };

  const handleImages = useCallback((files: FileList | null) => {
    if (!files) return;
    clearError("images");
    const newItems: ImageItem[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((file, idx) => ({
        id: `img-${Date.now()}-${idx}`,
        file,
        previewUrl: URL.createObjectURL(file),
        uploadedUrl: null,
        uploading: false,
        error: false,
        isThumbnail: false,
      }));
    setImages((prev) => {
      const combined = [...prev, ...newItems];
      if (!combined.some((i) => i.isThumbnail) && combined.length > 0)
        combined[0].isThumbnail = true;
      return combined;
    });
    newItems.forEach((item) => uploadImage(item));
  }, []);

  const removeImage = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((i) => i.id !== id);
      if (filtered.length > 0 && !filtered.some((i) => i.isThumbnail))
        filtered[0].isThumbnail = true;
      return filtered;
    });
  };

  const setThumbnail = (id: string) =>
    setImages((prev) => prev.map((i) => ({ ...i, isThumbnail: i.id === id })));

  // ── Video upload ──────────────────────────────────────────────────────────
  const uploadVideo = async (item: VideoItem) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === item.id ? { ...v, uploading: true } : v))
    );
    try {
      const url = await uploadToR2(item.file, "attractions/videos");
      const fileName = url.split("/").pop()!;
      setVideos((prev) =>
        prev.map((v) =>
          v.id === item.id ? { ...v, uploading: false, uploadedUrl: fileName } : v
        )
      );
    } catch {
      setVideos((prev) =>
        prev.map((v) =>
          v.id === item.id ? { ...v, uploading: false, error: true } : v
        )
      );
      toast.error(`Failed to upload ${item.file.name}`);
    }
  };

  const handleVideos = useCallback((files: FileList | null) => {
    if (!files) return;
    const newItems: VideoItem[] = Array.from(files)
      .filter((f) => f.type.startsWith("video/"))
      .map((file, idx) => ({
        id: `vid-${Date.now()}-${idx}`,
        file,
        previewUrl: URL.createObjectURL(file),
        uploadedUrl: null,
        uploading: false,
        error: false,
      }));
    setVideos((prev) => [...prev, ...newItems]);
    newItems.forEach((item) => uploadVideo(item));
  }, []);

  // ── Social image helpers ──────────────────────────────────────────────────
  const toggleSocialImage = (id: string) =>
    setSocialImageIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const selectAllSocialImages = () =>
    setSocialImageIds(new Set(images.map((i) => i.id)));

  const clearSocialImages = () => setSocialImageIds(new Set());

  const selectCoverSocialImage = () => {
    const cover = images.find((i) => i.isThumbnail) ?? images[0];
    if (cover) setSocialImageIds(new Set([cover.id]));
  };

  // ── Validate ──────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs = new Set<string>();
    if (!nameEn.trim()) errs.add("nameEn");
    if (!description.trim()) errs.add("description");
    if (!typeId) errs.add("typeId");
    if (images.length === 0) errs.add("images");
    setErrors(errs);
    if (errs.size > 0) {
      toast.error("Please fill all required fields");
      return false;
    }
    return true;
  };

  // ── Generate social caption ───────────────────────────────────────────────
  const handleGenerateSocialCaption = async () => {
    if (generatingSocial) return;
    setGeneratingSocial(true);
    try {
      const categoryName = types.find((tp) => tp.type_id === typeId)?.name_en;
      const entryFeeText = isFreeEntry
        ? "Free"
        : entryFeeForeigner
        ? `${entryFeeForeigner} LAK`
        : "";
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
      setSocialCaption((data?.caption as string) || "");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Failed to generate caption");
    } finally {
      setGeneratingSocial(false);
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (status: "draft" | "pending") => {
    if (!validate()) return;
    if (!user) { toast.error("Please login first"); return; }
    if ([...images, ...videos].some((m: any) => m.uploading)) {
      toast.error("Please wait for uploads to finish");
      return;
    }
    setSaving(true);
    try {
      const thumbnailImg = images.find((i) => i.isThumbnail);
      const insertBase: any = {
        user_id: user.id,
        type_id: typeId || null,
        name_en: nameEn,
        name_la: nameLa || "",
        description,
        activity: activity || "",
        license: license || "",
        province: !pickOnMap && province ? province : "",
        district: !pickOnMap && district ? district : "",
        village: !pickOnMap && village ? village : "",
        location: location || "",
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        guide_phone: !hasInternet ? (guidePhone.trim() || null) : null,
        open_time: openTime ? `${openTime}:00` : "08:00:00",
        close_time: closeTime ? `${closeTime}:00` : "17:00:00",
        entry_fee_foreigner: isFreeEntry ? 0 : parseFloat(entryFeeForeigner || "0"),
        is_free_entry: isFreeEntry,
        best_time_visit: bestTimeVisit || "",
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

      const { data: attraction, error: attrError } = await supabase
        .from("attractions")
        .insert(insertBase)
        .select("attraction_id")
        .single();

      if (attrError) throw attrError;
      const attractionId = attraction.attraction_id;

      // Save social sharing draft
      if (socialShare) {
        const cover = images.find((i) => i.isThumbnail) ?? images[0];
        const selected =
          socialImageIds.size > 0
            ? socialImageIds
            : cover
            ? new Set([cover.id])
            : new Set<string>();

        const socialImages = images
          .filter((i) => selected.has(i.id))
          .map((i) => i.uploadedUrl)
          .filter(Boolean);

        const socialText = socialCaption.trim()
          ? socialCaption.trim()
          : (description || "").trim().slice(0, 240);

        try {
          await supabase.from("social").insert({
            attraction_id: attractionId,
            user_id: user.id,
            social_images: JSON.parse(JSON.stringify(socialImages)),
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
      const extraImages = images.filter((i) => !i.isThumbnail && i.uploadedUrl);
      if (extraImages.length > 0) {
        await supabase.from("attraction_images").insert(
          extraImages.map((img, idx) => ({
            attraction_id: attractionId,
            image_url: img.uploadedUrl!,
            display_order: idx + 1,
          }))
        );
      }

      // All videos → attraction_videos
      const uploadedVideos = videos.filter((v) => v.uploadedUrl);
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

      toast.success(
        status === "draft" ? "Saved as draft!" : "Submitted for review! 🎉"
      );
      if (status === "pending") resetForm();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Failed to save attraction");
    } finally {
      setSaving(false);
    }
  };

  const allUploaded = [...images, ...videos].every((m: any) => !m.uploading);

  return {
    // Meta
    saving,
    errors,
    allUploaded,
    types,
    // Map
    mapOpen,
    setMapOpen,
    pickOnMap,
    setPickOnMap,
    // Refs
    fileInputRef,
    videoInputRef,
    // Basic info
    nameEn, setNameEn,
    nameLa, setNameLa,
    description, setDescription,
    activity, setActivity,
    license, setLicense,
    typeId, setTypeId,
    // Location
    province, setProvince,
    district, setDistrict,
    village, setVillage,
    location, setLocation,
    latitude, setLatitude,
    longitude, setLongitude,
    // Hours & fees
    openTime, setOpenTime,
    closeTime, setCloseTime,
    entryFeeForeigner, setEntryFeeForeigner,
    isFreeEntry, setIsFreeEntry,
    bestTimeVisit, setBestTimeVisit,
    // Facilities
    guidePhone, setGuidePhone,
    hasParking, setHasParking,
    isFreeParking, setIsFreeParking,
    parkingPrice, setParkingPrice,
    hasRestaurant, setHasRestaurant,
    hasAccommodation, setHasAccommodation,
    accPrice, setAccPrice,
    hasInternet, setHasInternet,
    isFreeWifi, setIsFreeWifi,
    socialShare, setSocialShare,
    // Media
    images, setImages,
    videos, setVideos,
    // Social
    socialCaption, setSocialCaption,
    socialWebsiteLink, setSocialWebsiteLink,
    socialImageIds,
    postFacebook, setPostFacebook,
    postTiktok, setPostTiktok,
    postInstagram, setPostInstagram,
    generatingSocial,
    // Handlers
    clearError,
    inputCls,
    handleImages,
    removeImage,
    setThumbnail,
    handleVideos,
    toggleSocialImage,
    selectAllSocialImages,
    clearSocialImages,
    selectCoverSocialImage,
    handleGenerateSocialCaption,
    handleSubmit,
  };
}