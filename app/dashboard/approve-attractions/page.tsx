"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, CheckCircle, XCircle, Clock, Building2, MapPin, Star, Eye, X, Calendar, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { attractions } from "@/data/attractions";
import DashboardLayout from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function ApproveAttractionsPage() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [localAttractions, setLocalAttractions] = useState(attractions || []);
  const [selectedAttraction, setSelectedAttraction] = useState<typeof attractions[0] | null>(null);
  useEffect(() => { setMounted(true); }, []);

  const pending = localAttractions.filter((a) => a.status === "pending");
  const handleApprove = (id: string) => {
    setLocalAttractions((prev) => prev.map((a) => a.id === id ? { ...a, status: "approved" as const } : a));
    if (selectedAttraction?.id === id) setSelectedAttraction(null);
  };
  const handleReject = (id: string) => {
    setLocalAttractions((prev) => prev.map((a) => a.id === id ? { ...a, status: "rejected" as const } : a));
    if (selectedAttraction?.id === id) setSelectedAttraction(null);
  };

  if (!mounted) return null;

  return (
    <DashboardLayout title={t("sidebar.approveAttractions")} subtitle="Review and approve submitted attractions">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Pending", count: pending.length, icon: Clock, color: "text-amber-500" },
            { label: "Approved", count: localAttractions.filter((a) => a.status === "approved").length, icon: CheckCircle, color: "text-emerald-500" },
            { label: "Rejected", count: localAttractions.filter((a) => a.status === "rejected").length, icon: XCircle, color: "text-red-500" },
          ].map((s) => (
            <motion.div key={s.label} variants={itemVariants}>
              <Card className="border-0 shadow-md text-center">
                <CardContent className="p-3 sm:p-4">
                  <s.icon className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 ${s.color}`} />
                  <p className="text-lg sm:text-2xl font-bold">{s.count}</p>
                  <p className="text-[10px] sm:text-sm text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Pending List */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="border-0 shadow-md h-full">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-teal-500" />
                  Pending Review ({pending.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pending.length === 0 ? (
                  <div className="text-center py-10">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">All attractions have been reviewed</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence>
                      {pending.map((a) => (
                        <motion.div
                          key={a.id}
                          layout
                          exit={{ opacity: 0, x: -20 }}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedAttraction?.id === a.id ? "border-teal-500 bg-teal-500/5" : "bg-card hover:border-teal-500/30"}`}
                          onClick={() => setSelectedAttraction(a)}
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/20 flex items-center justify-center shrink-0 overflow-hidden">
                            {a.images[0] ? <img src={a.images[0]} alt={a.name} className="w-full h-full object-cover" /> : <Building2 className="w-4 h-4 text-teal-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium truncate">{a.name}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{a.location} - {a.category}</p>
                          </div>
                          <Eye className="w-4 h-4 text-muted-foreground shrink-0" />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Detail Panel */}
          <motion.div variants={itemVariants} className="lg:col-span-3">
            <Card className="border-0 shadow-md h-full">
              {selectedAttraction ? (
                <>
                  {/* Image Gallery */}
                  <div className="relative aspect-video overflow-hidden rounded-t-xl">
                    {selectedAttraction.images[0] ? (
                      <img src={selectedAttraction.images[0]} alt={selectedAttraction.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-teal-500/50" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4">
                      <h2 className="text-lg sm:text-xl font-bold text-white">{selectedAttraction.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-teal-300" />
                        <span className="text-xs text-teal-200">{selectedAttraction.location}</span>
                      </div>
                    </div>
                    <button onClick={() => setSelectedAttraction(null)} className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Thumbnail row */}
                  {selectedAttraction.images.length > 1 && (
                    <div className="flex gap-1.5 p-3 overflow-x-auto">
                      {selectedAttraction.images.map((img, i) => (
                        <div key={i} className="w-14 h-10 rounded-md overflow-hidden shrink-0 border border-border">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  <CardContent className="p-4 sm:p-5 space-y-4">
                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="bg-amber-500/15 text-amber-600 border-amber-500/25 text-[10px]">{selectedAttraction.category}</Badge>
                      <Badge variant="outline" className="bg-amber-500/15 text-amber-600 border-amber-500/25 text-[10px]">Pending</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-medium">{selectedAttraction.rating}</span>
                        <span className="text-[10px] text-muted-foreground">({selectedAttraction.reviewCount})</span>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Description</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{selectedAttraction.description}</p>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-muted/50">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Price</p>
                        <p className="text-sm font-semibold mt-0.5">{selectedAttraction.price.toLocaleString()} LAK</p>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/50">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Hours</p>
                        <p className="text-sm font-semibold mt-0.5">{selectedAttraction.openTime} - {selectedAttraction.closeTime}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/50">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Calendar className="w-3 h-3" />Submitted</p>
                        <p className="text-sm font-semibold mt-0.5">{selectedAttraction.createdAt}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/50">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Tag className="w-3 h-3" />Entrepreneur</p>
                        <p className="text-sm font-semibold mt-0.5 truncate">{selectedAttraction.entrepreneurName}</p>
                      </div>
                    </div>

                    {/* Facilities */}
                    {selectedAttraction.facilities.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Facilities</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedAttraction.facilities.map((f) => (
                            <Badge key={f} variant="outline" className="text-[10px]">{f}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleApprove(selectedAttraction.id)}>
                        <CheckCircle className="w-4 h-4 mr-1.5" />
                        Approve
                      </Button>
                      <Button variant="destructive" className="flex-1" onClick={() => handleReject(selectedAttraction.id)}>
                        <XCircle className="w-4 h-4 mr-1.5" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
                  <Eye className="w-12 h-12 text-muted-foreground/20 mb-3" />
                  <p className="text-sm text-muted-foreground">Select an attraction to preview</p>
                  <p className="text-xs text-muted-foreground mt-1">Click on any pending item from the list</p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
