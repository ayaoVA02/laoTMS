"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Globe, Bell, Mail, Shield, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/stores/app-store";
import { useTheme } from "next-themes";
import DashboardLayout from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [siteName, setSiteName] = useState("LaoTMS");
  const [siteDesc, setSiteDesc] = useState("Laos Tourism Management System");
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const handleLanguageChange = (lang: "en" | "la") => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <DashboardLayout title={t("sidebar.settings")} subtitle="Configure system settings and preferences">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">
        {/* General Settings */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5 text-teal-500" />
                General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Site Name</Label>
                  <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Site Description</Label>
                  <Input value={siteDesc} onChange={(e) => setSiteDesc(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-teal-500 shrink-0" />
                  <div><p className="text-sm font-medium">Language</p><p className="text-xs text-muted-foreground">System default language</p></div>
                </div>
                <Select value={language} onValueChange={(val) => handleLanguageChange(val as "en" | "la")}>
                  <SelectTrigger className="w-28 sm:w-36"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="la">Lao</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 text-teal-500 shrink-0 flex items-center justify-center">
                    {theme === "dark" ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>}
                  </div>
                  <div><p className="text-sm font-medium">Theme</p><p className="text-xs text-muted-foreground">System appearance</p></div>
                </div>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-28 sm:w-36"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem><SelectItem value="system">System</SelectItem></SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-teal-500" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3"><Bell className="w-4 h-4 text-teal-500 shrink-0" /><div><p className="text-sm font-medium">Push Notifications</p><p className="text-xs text-muted-foreground">Receive real-time alerts</p></div></div>
                <Switch checked={pushNotif} onCheckedChange={setPushNotif} />
              </div>
              <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-teal-500 shrink-0" /><div><p className="text-sm font-medium">Email Notifications</p><p className="text-xs text-muted-foreground">Get updates via email</p></div></div>
                <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-500" />
                Security & Moderation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-muted/50">
                <div><p className="text-sm font-medium">Auto-approve Attractions</p><p className="text-xs text-muted-foreground">Automatically approve new submissions</p></div>
                <Switch checked={autoApprove} onCheckedChange={setAutoApprove} />
              </div>
              <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                <div><p className="text-sm font-medium text-red-600">Maintenance Mode</p><p className="text-xs text-muted-foreground">Take the site offline for maintenance</p></div>
                <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Save */}
        <motion.div variants={itemVariants} className="flex justify-end">
          <Button className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
            <Save className="w-4 h-4 mr-1.5" />
            Save Settings
          </Button>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
