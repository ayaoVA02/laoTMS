"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Upload, Share2, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function CreateAttractionPage() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", category: "", price: "", location: "", openTime: "09:00", closeTime: "17:00", socialShare: false });
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <DashboardLayout title={t("sidebar.createAttraction")} subtitle="Submit a new attraction for review">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm">Attraction Name</Label>
                  <Input id="name" placeholder="Enter attraction name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc" className="text-sm">Description</Label>
                  <Textarea id="desc" placeholder="Describe your attraction in detail" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="min-h-[100px]" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Category</Label>
                    <Select value={form.category} onValueChange={(val) => setForm((p) => ({ ...p, category: val }))}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="temple">Temples</SelectItem><SelectItem value="nature">Nature</SelectItem>
                        <SelectItem value="adventure">Adventure</SelectItem><SelectItem value="culture">Culture</SelectItem>
                        <SelectItem value="food">Food & Dining</SelectItem><SelectItem value="beach">Beaches</SelectItem>
                        <SelectItem value="historical">Historical</SelectItem><SelectItem value="nightlife">Nightlife</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm">Price (LAK)</Label>
                    <Input id="price" type="number" placeholder="0" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm">Location</Label>
                    <Input id="location" placeholder="City or region" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="open" className="text-sm">Open</Label>
                      <Input id="open" type="time" value={form.openTime} onChange={(e) => setForm((p) => ({ ...p, openTime: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="close" className="text-sm">Close</Label>
                      <Input id="close" type="time" value={form.closeTime} onChange={(e) => setForm((p) => ({ ...p, closeTime: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">{t("dashboard.uploadImages")}</Label>
                  <div className="flex items-center justify-center w-full h-24 sm:h-32 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-teal-500/50 transition-colors cursor-pointer">
                    <div className="text-center">
                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs sm:text-sm text-muted-foreground">Click or drag to upload images</p>
                      <p className="text-[10px] text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Share2 className="w-4 h-4 text-teal-500 shrink-0" />
                    <div><p className="text-sm font-medium">{t("dashboard.socialShare")}</p><p className="text-xs text-muted-foreground">{t("dashboard.enableSocialShare")}</p></div>
                  </div>
                  <Switch checked={form.socialShare} onCheckedChange={(c) => setForm((p) => ({ ...p, socialShare: c }))} />
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" className="w-full sm:w-auto">Save as Draft</Button>
                  <Button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
                    <Plus className="w-4 h-4 mr-1.5" />
                    Submit for Review
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
