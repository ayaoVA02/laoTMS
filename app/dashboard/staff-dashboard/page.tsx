"use client";

import { motion } from "framer-motion";
import {
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Activity,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Attraction } from "@/data/attractions";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

const statusBadgeMap: Record<string, { label: string; className: string }> = {
  approved: { label: "Approved", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/25" },
  pending:  { label: "Pending",  className: "bg-amber-500/15 text-amber-600 border-amber-500/25" },
  rejected: { label: "Rejected", className: "bg-red-500/15 text-red-600 border-red-500/25" },
  draft:    { label: "Draft",    className: "bg-slate-500/15 text-slate-600 border-slate-500/25" },
};

interface StaffDashboardProps {
  localAttractions: Attraction[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export default function StaffDashboard({ localAttractions, onApprove, onReject }: StaffDashboardProps) {
  const { t } = useTranslation();

  const pendingAttractions = localAttractions.filter((a) => a.status === "pending");

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-teal-500 to-emerald-600" />
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">{t("dashboard.pendingApprovals")}</p>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">{pendingAttractions.length}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-sm">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-500" />
              {t("dashboard.approveAttractions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingAttractions.length === 0 ? (
              <div className="text-center py-8 sm:py-10">
                <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">All attractions have been reviewed</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {pendingAttractions.map((attraction) => (
                  <motion.div
                    key={attraction.attraction_id}
                    layout
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow gap-3 sm:gap-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-semibold text-sm truncate">{attraction.name_en}</h4>
                        <Badge variant="outline" className={statusBadgeMap.pending.className}>
                          {t("attractions.pending")}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {attraction.province}{attraction.district ? `, ${attraction.district}` : ""} {attraction.type_name ? `- ${attraction.type_name}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm"
                        onClick={() => onApprove(attraction.attraction_id)}
                      >
                        <CheckCircle className="w-3.5 h-3.5 sm:mr-1" />
                        <span className="hidden sm:inline">Approve</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="text-xs sm:text-sm"
                        onClick={() => onReject(attraction.attraction_id)}
                      >
                        <XCircle className="w-3.5 h-3.5 sm:mr-1" />
                        <span className="hidden sm:inline">Reject</span>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { title: "Approved", count: localAttractions.filter((a) => a.status === "approved").length, icon: CheckCircle, color: "text-emerald-500" },
          { title: "Pending",  count: pendingAttractions.length, icon: Clock, color: "text-amber-500" },
          { title: "Rejected", count: localAttractions.filter((a) => a.status === "rejected").length, icon: XCircle, color: "text-red-500" },
        ].map((item) => (
          <motion.div key={item.title} variants={itemVariants}>
            <Card className="border-0 shadow-md text-center">
              <CardContent className="p-3 sm:p-5">
                <item.icon className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 ${item.color}`} />
                <p className="text-lg sm:text-2xl font-bold">{item.count}</p>
                <p className="text-[10px] sm:text-sm text-muted-foreground">{item.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-500" />
              Recent Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              {localAttractions
                .slice()
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 5)
                .map((a) => (
                  <div key={a.attraction_id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{a.name_en}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        {a.province} - {new Date(a.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${statusBadgeMap[a.status]?.className || ""} text-[10px] sm:text-xs shrink-0`}
                    >
                      {statusBadgeMap[a.status]?.label || a.status}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}