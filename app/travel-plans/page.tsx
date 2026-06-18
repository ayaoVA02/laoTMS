"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Calendar,
  MapPin,
  Clock,
  Route,
  Trash2,
  Eye,
  ChevronRight,
  Lock,
  User,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth-store";
import { useTravelPlanStore } from "@/stores/travel-plan-store";
import { useAttractionStore, type Attraction } from "@/stores/attraction-store";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Footer from "@/components/layout/footer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Image from "next/image";
import LoginRequired from "@/components/shared/login-required";

export default function TravelPlansPage() {
  const { t } = useTranslation();
  const {
    plans = [],
    createPlan,
    fetchPlans,
    deletePlan,
  } = useTravelPlanStore();
  const { attractions: allAttractions = [] } = useAttractionStore();
  const { user, isAuthenticated } = useAuthStore();

  const getAttractionById = (id: string) =>
    allAttractions.find((a) => a.id === id);
  const [mounted, setMounted] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanDescription, setNewPlanDescription] = useState("");
  const [newPlanStartDate, setNewPlanStartDate] = useState("");
  const [newPlanEndDate, setNewPlanEndDate] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const baseURLImage = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL_IMAGE;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPlans(user.id);
    }
  }, [isAuthenticated, user, fetchPlans]);

  if (!mounted) return null;

  
  if (!isAuthenticated) {
    return (
      <LoginRequired
              title={t("loginRequired.title", "Sign in to start your trip plan")}
              description={t("travelPlans.loginRequired", "Sign in to create and manage your travel plans. Track your itineraries and save your favorite routes across Laos.")}
              redirectTo="/travel-plans"
            />
    );
  }

  const handleCreatePlan = async () => {
    if (!newPlanName.trim() || !user) return;

    setIsCreating(true);
    const today = new Date().toISOString().split("T")[0];

    let startDate = newPlanStartDate || today;
    let endDate = newPlanEndDate || startDate;

    if (new Date(endDate) < new Date(startDate)) {
      endDate = startDate;
    }

    const createdPlan = await createPlan(
      user.id,
      newPlanName.trim(),
      newPlanDescription.trim(),
      startDate,
      endDate,
    );

    setIsCreating(false);

    if (!createdPlan) {
      toast.error(
        t(
          "travelPlans.createError",
          "Unable to create travel plan. Please try again.",
        ),
      );
      return;
    }

    setNewPlanName("");
    setNewPlanDescription("");
    setNewPlanStartDate("");
    setNewPlanEndDate("");
    setCreateDialogOpen(false);
  };

  const handleDeletePlan = async (planId: string) => {
    const ok = window.confirm(
      t("travelPlans.confirmDelete", `Delete this travel plan?`),
    );

    if (!ok) return;

    try {
      await deletePlan(planId);
      toast.success(
        t("travelPlans.deleteSuccess", "Travel plan deleted successfully."),
      );
    } catch (error) {
      toast.error(
        t(
          "travelPlans.deleteError",
          "Unable to delete the travel plan. Please try again.",
        ),
      );
      console.error("handleDeletePlan error:", error);
    }
  };

  const getPlanAttractions = (attractionIds: string[]) =>
    attractionIds
      .map((id) => getAttractionById(id))
      .filter(Boolean) as Attraction[];

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const opts: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    return `${startDate.toLocaleDateString("en-US", opts)} - ${endDate.toLocaleDateString("en-US", opts)}`;
  };

  const getDaysBetween = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const diff =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

    return Math.max(Math.floor(diff) + 1, 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-teal-600 to-emerald-700 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {t("travelPlans.title", "Travel Plans")}
              </h1>
              <p className="mt-2 text-teal-100 text-sm sm:text-base">
                {plans.length}{" "}
                {plans.length === 1
                  ? t("travelPlans.plan", "plan")
                  : t("travelPlans.plans", "plans")}{" "}
                {t("travelPlans.created", "created")}
              </p>
            </div>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-white text-teal-700 hover:bg-teal-50 shadow-lg shadow-teal-800/20 self-start sm:self-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("travelPlans.createPlan", "Create Plan")}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Plans List */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {plans.length > 0 ? (
            <motion.div
              key="plans-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {plans.map((plan, index) => {
                const planAttractions = getPlanAttractions(plan.attractionIds);
                const previewAttractions = planAttractions.slice(0, 3);
                const days = getDaysBetween(plan.startDate, plan.endDate);

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    whileHover={{ y: -4 }}
                    className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-teal-200 transition-all duration-300"
                  >
                    {/* Card Top: Gradient accent strip */}
                    <div className="h-2 bg-gradient-to-r from-teal-500 to-emerald-500" />

                    <div className="p-6">
                      {/* Plan Name & Description */}
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-teal-700 transition-colors">
                        {plan.name}
                      </h3>
                      {plan.description && (
                        <p className="mt-1.5 text-sm text-gray-500 line-clamp-2">
                          {plan.description}
                        </p>
                      )}

                      {/* Date Range */}
                      <div className="mt-4 flex items-center gap-1.5 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-teal-500 shrink-0" />
                        <span>
                          {formatDateRange(plan.startDate, plan.endDate)}
                        </span>
                      </div>

                      {/* Duration */}
                      <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
                        <Clock className="h-4 w-4 text-teal-500 shrink-0" />
                        <span>
                          {days}{" "}
                          {days === 1
                            ? t("travelPlans.day", "day")
                            : t("travelPlans.days", "days")}
                        </span>
                      </div>

                      {/* Attractions Count & Preview Thumbnails */}
                      <div className="mt-4">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                          <MapPin className="h-4 w-4 text-teal-500 shrink-0" />
                          <span>
                            {planAttractions.length}{" "}
                            {planAttractions.length === 1
                              ? t("travelPlans.attraction", "attraction")
                              : t("travelPlans.attractions", "attractions")}
                          </span>
                        </div>

                        {/* Thumbnail Preview Row */}
                        {previewAttractions.length > 0 && (
                          <div className="mt-3 flex items-center -space-x-2">
                            {previewAttractions.map((attraction) => (
                              <div
                                key={attraction.id}
                                className="relative h-10 w-10 rounded-full border-2 border-white overflow-hidden shadow-sm"
                              >
                                <Image
                                  src={baseURLImage+attraction.images[0]}
                                  alt={attraction.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ))}
                            {planAttractions.length > 3 && (
                              <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-teal-50 text-xs font-semibold text-teal-700 shadow-sm">
                                +{planAttractions.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2">
                        <Link
                          href={`/travel-plans/${plan.id}`}
                          className="flex-1"
                        >
                          <Button
                            variant="ghost"
                            className="w-full justify-center text-teal-700 hover:bg-teal-50 hover:text-teal-800"
                          >
                            <Route className="mr-2 h-4 w-4" />
                            {t("travelPlans.viewRoute", "View Route")}
                          </Button>
                        </Link>
                        <Link
                          href={`/travel-plans/${plan.id}`}
                          className="flex-1"
                        >
                          <Button
                            variant="ghost"
                            className="w-full justify-center text-gray-600 hover:bg-gray-50"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            {t("travelPlans.edit", "Edit")}
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePlan(plan.id)}
                          className="shrink-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-teal-50">
                <Route className="h-14 w-14 text-teal-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                {t("travelPlans.noPlans", "No travel plans yet")}
              </h3>
              <p className="mt-2 max-w-md text-sm text-gray-500">
                {t(
                  "travelPlans.noPlansDescription",
                  "Create your first travel plan to start organizing your trip across Laos.",
                )}
              </p>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="mt-6 bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/25"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("travelPlans.createFirst", "Create Your First Plan")}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Plan Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("travelPlans.createPlanTitle", "Create Travel Plan")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "travelPlans.createPlanDescription",
                "Fill in the details below to create a new travel plan.",
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                {t("travelPlans.planName", "Plan Name")}
              </label>
              <Input
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                placeholder={t(
                  "travelPlans.planNamePlaceholder",
                  "e.g., Luang Prabang Heritage Tour",
                )}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                {t("travelPlans.description", "Description")}
              </label>
              <Textarea
                value={newPlanDescription}
                onChange={(e) => setNewPlanDescription(e.target.value)}
                placeholder={t(
                  "travelPlans.descriptionPlaceholder",
                  "Describe your travel plan...",
                )}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  {t("travelPlans.startDate", "Start Date")}
                </label>
                <Input
                  type="date"
                  value={newPlanStartDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    const value = e.target.value;

                    setNewPlanStartDate(value);

                    if (
                      newPlanEndDate &&
                      new Date(newPlanEndDate) < new Date(value)
                    ) {
                      setNewPlanEndDate(value);
                    }
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  {t("travelPlans.endDate", "End Date")}
                </label>
                <Input
                  type="date"
                  value={newPlanEndDate}
                  min={
                    newPlanStartDate || new Date().toISOString().split("T")[0]
                  }
                  onChange={(e) => setNewPlanEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              className="border-gray-200"
            >
              {t("travelPlans.cancel", "Cancel")}
            </Button>
            <Button
              onClick={handleCreatePlan}
              disabled={!newPlanName.trim() || isCreating}
              className="bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50"
            >
              <Plus className="mr-2 h-4 w-4" />
              {isCreating
                ? t("travelPlans.creating", "Creating...")
                : t("travelPlans.create", "Create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <Footer />
    </div>
  );
}
