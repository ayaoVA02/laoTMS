"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  MapPin,
  Clock,
  DollarSign,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Check,
  Wifi,
  Car,
  Coffee,
  Utensils,
  ShowerHead,
  Accessibility,
  Camera,
  Navigation,
  Phone,
  Globe,
  ThumbsUp,
  Send,
  Play,
} from "lucide-react";

import { useTranslation } from "react-i18next";
import { useAttractionStore } from "@/stores/attraction-store";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import Footer from "@/components/layout/footer";
import { useAuthStore } from "@/stores/auth-store";
import Image from "next/image";
import { useTravelPlanStore } from "@/stores/travel-plan-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const facilityIcons: Record<string, React.ElementType> = {
  Parking: Car,
  Restrooms: ShowerHead,
  "Gift Shop": Camera,
  "Guide Service": Globe,
  "Food Stalls": Utensils,
  "Swimming Area": ShowerHead,
  "Picnic Area": Coffee,
  "Equipment Rental": Navigation,
  "First Aid": Accessibility,
  Museum: Globe,
  ATM: DollarSign,
  WiFi: Wifi,
  "Indoor Kitchen": Utensils,
  "All Ingredients": Coffee,
  "Recipe Book": Camera,
  Guesthouses: Coffee,
  Restaurants: Utensils,
  "Bicycle Rental": Car,
  "Kayak Rental": Navigation,
  "Coffee Tasting": Coffee,
  Bars: Coffee,
  "Live Music": Globe,
  Homestay: Coffee,
  "Viewing Platform": MapPin,
};

function formatLAK(price: number): string {
  if (price === 0) return "Free";

  return (
    new Intl.NumberFormat("lo-LA", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(price) + " LAK"
  );
}

export default function AttractionDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const { plans, fetchPlans, addAttractionToPlan } = useTravelPlanStore();

  const [addToPlanOpen, setAddToPlanOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("");

  const { attractions, favorites, toggleFavorite } = useAttractionStore();

  const { user, isAuthenticated } = useAuthStore();

  const attractionId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [reviews, setReviews] = useState<
    {
      id: string;
      attractionId: string;
      userName: string;
      rating: number;
      comment: string;
      date: string;
    }[]
  >([]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [reviewRating, setReviewRating] = useState(0);

  const [hoverRating, setHoverRating] = useState(0);

  const [reviewName, setReviewName] = useState("");

  const [reviewComment, setReviewComment] = useState("");

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPlans(user.id);
    }
  }, [isAuthenticated, user, fetchPlans]);
const handleAddToPlan = async () => {
  if (!selectedPlanId || !attraction) return;

  const targetPlan = plans.find((p) => p.id === selectedPlanId);

  // Adding ': string' fixes the "implicitly has an any type" error
  const isAlreadyPlanned = targetPlan?.attractionIds?.some(
    (id: string) => id === attraction.id
  );

  if (isAlreadyPlanned) {
    alert(t("attraction.alreadyInPlan", "This attraction is already in your plan!"));
    return; 
  }

  try {
    await addAttractionToPlan(selectedPlanId, attraction.id);
    setAddToPlanOpen(false);
    setSelectedPlanId("");
  } catch (error) {
    console.error("Failed to add attraction:", error);
  }
};
  const handleGetDirections = () => {
    if (!attraction?.location) return;

    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      attraction.location,
    )}`;

    window.open(url, "_blank");
  };

  const attraction = useMemo(
    () => (attractions || []).find((a) => a.id === attractionId) ?? null,
    [attractions, attractionId],
  );

  const attractionReviews = useMemo(
    () => reviews.filter((r) => r.attractionId === attractionId),
    [reviews, attractionId],
  );

  const averageReviewRating = useMemo(() => {
    if (attractionReviews.length === 0) return 0;

    const sum = attractionReviews.reduce((acc, r) => acc + r.rating, 0);

    return sum / attractionReviews.length;
  }, [attractionReviews]);

  if (!attraction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-teal-50 mx-auto">
            <MapPin className="h-12 w-12 text-teal-300" />
          </div>

          <h2 className="text-xl font-semibold text-gray-800">
            {t("attraction.notFound", "Attraction not found")}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {t(
              "attraction.notFoundDesc",
              "The attraction you are looking for does not exist.",
            )}
          </p>

          <Button
            onClick={() => router.push("/attractions")}
            className="mt-6 bg-teal-600 hover:bg-teal-700 text-white"
          >
            {t("attraction.backToList", "Back to Attractions")}
          </Button>
        </div>
      </div>
    );
  }

  const isFavorite = favorites.includes(attraction.id);

  const images = attraction.images || [];

  const openHours = `${attraction.openTime} - ${attraction.closeTime}`;

  const handlePrevImage = () => {
    if (!images.length) return;

    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!images.length) return;

    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Share Social

  const shareUrl =
  typeof window !== "undefined"
    ? window.location.origin + `/attractions/${attraction.id}`
    : "";

  const shareToFacebook = () => {
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    shareUrl,
  )}`;
  window.open(url, "_blank", "width=600,height=400");
};

const shareToTwitter = () => {
  const text = `Check out ${attraction.name} in Laos 🇱🇦`;

  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text,
  )}&url=${encodeURIComponent(shareUrl)}`;

  window.open(url, "_blank", "width=600,height=400");
};


const shareToWhatsApp = () => {
  const text = `Check this out: ${attraction.name} - ${shareUrl}`;

  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;

  window.open(url, "_blank");
};

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl);
    alert("Link copied to clipboard!");
  } catch (err) {
    console.error("Failed to copy:", err);
  }
};

const handleShare = async () => {
  const url = window.location.href;
  const title = attraction?.name || "Check this attraction";

  // Native share (mobile / modern browsers)
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text: title,
        url,
      });
      return;
    } catch (err) {
      console.log("Share cancelled");
    }
  }

  // Fallback: open share menu (simple version)
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const twitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title,
  )}&url=${encodeURIComponent(url)}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(
    title + " " + url,
  )}`;

  // Open multiple options (or choose one UI later)
  window.open(facebook, "_blank");
  window.open(twitter, "_blank");
  window.open(whatsapp, "_blank");
};


//Handler submit Reivew
  const handleSubmitReview = () => {
    if (!reviewComment.trim() || reviewRating === 0) return;

    const finalName = isAuthenticated
      ? user?.name || "Anonymous"
      : reviewName.trim();

    if (!finalName) return;

    const newReview = {
      id: crypto.randomUUID(),
      attractionId: attraction.id,
      userName: finalName,
      rating: reviewRating,
      comment: reviewComment.trim(),
      date: new Date().toISOString(),
    };

    setReviews((prev) => [newReview, ...prev]);

    setReviewRating(0);
    setHoverRating(0);
    setReviewComment("");

    if (!isAuthenticated) {
      setReviewName("");
    }
  };

  const renderStars = (
    rating: number,
    size = "h-4 w-4",
    interactive = false,
  ) => {
    const displayRating = interactive ? hoverRating || reviewRating : rating;

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setReviewRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${
              interactive ? "cursor-pointer" : "cursor-default"
            } transition-colors`}
          >
            <Star
              className={`${size} ${
                star <= displayRating
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

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
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-teal-700 -ml-2"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm font-medium">
                {t("attraction.back", "Back")}
              </span>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Image Gallery */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4"
      >
        {/* Main Image */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-gray-200">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={images[currentImageIndex]}
              alt={`${attraction.name} - image ${currentImageIndex + 1}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full w-full object-cover"
            />
          </AnimatePresence>

          {/* Image Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
                aria-label={t("attraction.prevImage", "Previous image")}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
                aria-label={t("attraction.nextImage", "Next image")}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar snap-x">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                // Added 'relative' so the Image component knows where its boundaries are
                className={`relative shrink-0 h-16 w-24 rounded-lg overflow-hidden border-2 transition-all duration-200 snap-start ${
                  index === currentImageIndex
                    ? "border-teal-500 ring-2 ring-teal-500/30"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  sizes="96px" // Optimization hint: tells the browser this image is small
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </motion.section>

      {/* Attraction Info Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6"
      >
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            {/* Left: Name, Badge, Location */}
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {attraction.name}
                </h1>
                <Badge className="bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 capitalize">
                  {attraction.category}
                </Badge>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                <MapPin className="h-4 w-4 text-teal-500" />
                <span>{attraction.location}</span>
              </div>
            </div>

            {/* Right: Rating + Price Quick View */}
            <div className="flex items-center gap-6 sm:flex-col sm:items-end sm:gap-3">
              <div className="flex items-center gap-2">
                {renderStars(attraction.rating)}
                <span className="text-lg font-bold text-gray-900">
                  {attraction.rating}
                </span>
                <span className="text-sm text-gray-500">
                  ({attraction.reviewCount})
                </span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                <span className="text-lg font-bold text-emerald-700">
                  {formatLAK(attraction.price)}
                </span>
                {attraction.price > 0 && (
                  <span className="text-xs text-gray-500">
                    {t("attraction.perPerson", "/ person")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Open Hours */}
          <div className="mt-4 flex items-center gap-1.5 text-sm text-gray-600">
            <Clock className="h-4 w-4 text-teal-500" />
            <span>
              {t("attraction.openHours", "Open Hours")}: {openHours}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => toggleFavorite(attraction.id)}
              variant={isFavorite ? "default" : "outline"}
              className={`${
                isFavorite
                  ? "bg-rose-500 hover:bg-rose-600 text-white border-rose-500"
                  : "border-gray-200 text-gray-600 hover:text-rose-500 hover:border-rose-300"
              }`}
            >
              <Heart
                className={`mr-2 h-4 w-4 ${isFavorite ? "fill-white" : ""}`}
              />
              {isFavorite
                ? t("attraction.saved", "Saved")
                : t("attraction.save", "Add to Favorites")}
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              className="border-gray-200 text-gray-600 hover:text-teal-700 hover:border-teal-300"
            >
              <Share2 className="mr-2 h-4 w-4" />
              {t("attraction.share", "Share")}
            </Button>
            <Button
              onClick={() => setAddToPlanOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Navigation className="mr-2 h-4 w-4" />
              {t("attraction.addToPlan", "Add to Plan")}
            </Button>
            <Button
              onClick={handleGetDirections}
              variant="outline"
              className="border-gray-200 text-gray-600 hover:text-emerald-700 hover:border-emerald-300"
            >
              <MapPin className="mr-2 h-4 w-4" />
              {t("attraction.getDirections", "Get Directions")}
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Description */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            {t("attraction.description", "Description")}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {attraction.description}
          </p>
        </div>
      </motion.section>

      {/* Facilities Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6"
      >
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t("attraction.facilities", "Facilities")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {attraction.facilities.map((facility) => {
              const IconComponent = facilityIcons[facility] || Check;
              return (
                <motion.div
                  key={facility}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-2.5 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50">
                    <IconComponent className="h-4 w-4 text-teal-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {facility}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Reviews Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6"
      >
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t("attraction.reviews", "Reviews")}
          </h2>

          {/* Average Rating Display */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">
                {averageReviewRating > 0
                  ? averageReviewRating.toFixed(1)
                  : attraction.rating}
              </div>
              <div className="mt-1">
                {renderStars(
                  averageReviewRating > 0
                    ? averageReviewRating
                    : attraction.rating,
                  "h-5 w-5",
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {attractionReviews.length}{" "}
                {t("attraction.reviewCount", "reviews")}
              </p>
            </div>
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((starLevel) => {
                const count = attractionReviews.filter(
                  (r) => r.rating === starLevel,
                ).length;
                const percentage =
                  attractionReviews.length > 0
                    ? (count / attractionReviews.length) * 100
                    : 0;
                return (
                  <div key={starLevel} className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500 w-6 text-right">
                      {starLevel}
                    </span>
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="h-full rounded-full bg-amber-400"
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List */}
          <AnimatePresence>
            {attractionReviews.length > 0 ? (
              <div className="space-y-4">
                {attractionReviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex gap-3 py-4 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-semibold text-sm">
                      {review.userName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {review.userName}
                        </span>
                        <span className="text-xs text-gray-400 shrink-0">
                          {new Date(review.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="mt-0.5">
                        {renderStars(review.rating, "h-3 w-3")}
                      </div>
                      <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4">
                {t(
                  "attraction.noReviews",
                  "No reviews yet. Be the first to review!",
                )}
              </p>
            )}
          </AnimatePresence>

          {/* Write Review Form */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              {t("attraction.writeReview", "Write a Review")}
            </h3>
            <div className="space-y-4">
              {/* Star Rating Selector */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  {t("attraction.yourRating", "Your Rating")}
                </label>
                <div className="flex items-center gap-1">
                  {renderStars(reviewRating, "h-6 w-6", true)}
                  {reviewRating > 0 && (
                    <span className="ml-2 text-sm text-teal-600 font-medium">
                      {reviewRating}/5
                    </span>
                  )}
                </div>
              </div>

              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 block">
                  {t("attraction.yourName", "Your Name")}
                </label>

                {isAuthenticated ? (
                  // DISPLAY MODE: Show only the name as text if logged in
                  <div className="flex items-center gap-2 h-10 px-1">
                    <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                    <span className="font-semibold text-gray-900">
                      {user?.name}
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-teal-50 text-teal-600 border-teal-100 text-[10px]"
                    >
                      {t("attraction.verified", "Verified")}
                    </Badge>
                  </div>
                ) : (
                  // INPUT MODE: Show the input field for guests
                  <div className="relative">
                    <Input
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder={t(
                        "attraction.namePlaceholder",
                        "Enter your name",
                      )}
                      className="bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Comment Textarea */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  {t("attraction.yourReview", "Your Review")}
                </label>
                <Textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={t(
                    "attraction.reviewPlaceholder",
                    "Share your experience...",
                  )}
                  rows={4}
                />
              </div>

              <Button
                onClick={handleSubmitReview}
                disabled={reviewRating === 0 || !reviewComment.trim()}
                className="bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="mr-2 h-4 w-4" />
                {t("attraction.submitReview", "Submit Review")}
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Video Reviews Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6"
      >
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t("attraction.videoReviews", "Video Reviews")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="relative aspect-video rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex items-center justify-center group cursor-pointer"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-600/90 text-white group-hover:bg-teal-600 transition-colors shadow-lg">
                  <Play className="h-6 w-6 fill-white ml-1" />
                </div>
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500 bg-white/80 backdrop-blur-sm rounded px-2 py-0.5">
                    {t("attraction.videoReview", "Video Review")} {i}
                  </span>
                  <span className="text-xs text-gray-500 bg-white/80 backdrop-blur-sm rounded px-2 py-0.5">
                    0:{30 + i * 15}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Map Placeholder */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6"
      >
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t("attraction.location", "Location")}
          </h2>
          <div className="relative aspect-[16/9] rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-dashed border-teal-200 flex flex-col items-center justify-center">
            <MapPin className="h-12 w-12 text-teal-400 mb-3" />
            <p className="text-sm font-medium text-teal-700">
              {t("attraction.mapboxIntegration", "Mapbox Integration")}
            </p>
            <p className="text-xs text-teal-500 mt-1">
              {attraction.coordinates[0]}, {attraction.coordinates[1]}
            </p>
            <p className="text-xs text-gray-400 mt-3">
              {t(
                "attraction.mapPlaceholder",
                "Interactive map will be displayed here",
              )}
            </p>
          </div>
        </div>
      </motion.section>

      {/* Social Share Buttons */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6"
      >
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t("attraction.shareWithFriends", "Share with Friends")}
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={shareToFacebook}
              className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              Facebook
            </Button>
            <Button
              variant="outline"
              onClick={shareToTwitter}
              className="border-sky-200 text-sky-600 hover:bg-sky-50 hover:border-sky-300"
            >
              <Globe className="mr-2 h-4 w-4" />
              Twitter
            </Button>
            <Button
              variant="outline"
              onClick={shareToWhatsApp}
              className="border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
            >
              <Phone className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              onClick={copyLink}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
            >
              <Share2 className="mr-2 h-4 w-4" />
              {t("attraction.copyLink", "Copy Link")}
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <div className="mt-8">
        <Dialog open={addToPlanOpen} onOpenChange={setAddToPlanOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add to Travel Plan</DialogTitle>
              <DialogDescription>
                Choose a plan to add this attraction.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 max-h-60 overflow-y-auto">
              {plans.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No plans found. Create one first.
                </p>
              ) : (
                plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      selectedPlanId === plan.id
                        ? "border-teal-500 bg-teal-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="font-medium">{plan.name}</div>
                    <div className="text-xs text-gray-500">
                      {plan.attractionIds.length} places
                    </div>
                  </button>
                ))
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setAddToPlanOpen(false);
                  setSelectedPlanId("");
                }}
              >
                Cancel
              </Button>

              <Button
                onClick={handleAddToPlan}
                disabled={!selectedPlanId}
                className="bg-teal-600 text-white"
              >
                Add
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Footer />
      </div>
    </div>
  );
}
