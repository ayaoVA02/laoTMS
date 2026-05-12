"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Search, Shield, MoreHorizontal, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddUserDialog from "@/components/screenpage/AddUserDialog"; // ← adjust path

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const roleBadgeColors: Record<string, string> = {
  ADMIN:        "bg-red-500/15 text-red-600 border-red-500/25",
  STAFF:        "bg-teal-500/15 text-teal-600 border-teal-500/25",
  ENTREPRENEUR: "bg-amber-500/15 text-amber-600 border-amber-500/25",
  TOURIST:      "bg-sky-500/15 text-sky-600 border-sky-500/25",
};

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  joined: string;
  status: string;
}

export default function UsersPage() {
  const { t } = useTranslation();
  const [mounted, setMounted]           = useState(false);
  const [search, setSearch]             = useState("");
  const [filterRole, setFilterRole]     = useState("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const [demoUsers, setDemoUsers] = useState<UserItem[]>([
    { id: "1",  name: "Admin User",     email: "admin@laotms.la",    role: "ADMIN",        joined: "Jan 2025", status: "active"   },
    { id: "2",  name: "Somsak Vong",    email: "somsak@laotms.la",   role: "STAFF",        joined: "Feb 2025", status: "active"   },
    { id: "3",  name: "Khampheng Lao",  email: "khampheng@biz.la",   role: "ENTREPRENEUR", joined: "Mar 2025", status: "active"   },
    { id: "4",  name: "John Traveler",  email: "john@travel.com",    role: "TOURIST",      joined: "Mar 2025", status: "active"   },
    { id: "5",  name: "Sarah M.",       email: "sarah@email.com",    role: "TOURIST",      joined: "Apr 2025", status: "active"   },
    { id: "6",  name: "Mike T.",        email: "mike@email.com",     role: "TOURIST",      joined: "Apr 2025", status: "active"   },
    { id: "7",  name: "Bounmy X.",      email: "bounmy@biz.la",      role: "ENTREPRENEUR", joined: "May 2025", status: "active"   },
    { id: "8",  name: "Phet S.",        email: "phet@laotms.la",     role: "STAFF",        joined: "May 2025", status: "inactive" },
    { id: "9",  name: "Lisa K.",        email: "lisa@email.com",     role: "TOURIST",      joined: "Jun 2025", status: "active"   },
    { id: "10", name: "Noy R.",         email: "noy@biz.la",         role: "ENTREPRENEUR", joined: "Jun 2025", status: "active"   },
  ]);

  useEffect(() => { setMounted(true); }, []);

  const filtered = demoUsers.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const roleCounts = demoUsers.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Called when AddUserDialog successfully creates a user
  const handleUserCreated = () => {
    // In real app: refetch from Supabase
    // For demo: just show a count bump
  };

  if (!mounted) return null;

  return (
    <DashboardLayout title={t("sidebar.users")} subtitle="Manage user accounts and roles">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 sm:space-y-6">

        {/* Role Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(roleCounts).map(([role, count]) => (
            <motion.div key={role} variants={itemVariants}>
              <Card
                className="border-0 shadow-md text-center cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setFilterRole(filterRole === role ? "all" : role)}
              >
                <CardContent className="p-3 sm:p-4">
                  <Shield className={`w-5 h-5 mx-auto mb-1 ${role === filterRole ? "text-teal-500" : "text-muted-foreground"}`} />
                  <p className="text-xl sm:text-2xl font-bold">{count}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{t(`roles.${role.toLowerCase()}`)}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Search & Filter */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-500" />
                  All Users ({filtered.length})
                </CardTitle>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 h-9 text-sm"
                    />
                  </div>
                  {/* Role filter */}
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="h-9 text-sm w-32 shrink-0">
                      <SelectValue placeholder="All roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All roles</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="STAFF">Staff</SelectItem>
                      <SelectItem value="ENTREPRENEUR">Entrepreneur</SelectItem>
                      <SelectItem value="TOURIST">Tourist</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white shrink-0"
                    onClick={() => setAddDialogOpen(true)}
                  >
                    <UserPlus className="w-4 h-4 mr-1.5" />
                    Add User
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">User</th>
                      <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">Role</th>
                      <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">Joined</th>
                      <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">Status</th>
                      <th className="text-right text-xs font-medium text-muted-foreground pb-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => (
                      <tr key={u.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                              {u.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{u.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant="outline" className={roleBadgeColors[u.role]}>
                            {t(`roles.${u.role.toLowerCase()}`)}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-sm text-muted-foreground">{u.joined}</td>
                        <td className="py-3 pr-4">
                          <Badge variant="outline" className={
                            u.status === "active"
                              ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/25"
                              : "bg-slate-500/15 text-slate-500 border-slate-500/25"
                          }>
                            {u.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-2">
                {filtered.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl border bg-card">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{u.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`${roleBadgeColors[u.role]} text-[10px]`}>
                          {t(`roles.${u.role.toLowerCase()}`)}
                        </Badge>
                        <Badge variant="outline" className={`${
                          u.status === "active"
                            ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/25"
                            : "bg-slate-500/15 text-slate-500 border-slate-500/25"
                        } text-[10px]`}>
                          {u.status}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No users found matching your search.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Add User Dialog */}
      <AddUserDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleUserCreated}
      />
    </DashboardLayout>
  );
}