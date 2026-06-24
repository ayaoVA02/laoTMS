"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Shield, MoreHorizontal, UserPlus,
  RefreshCw, AlertCircle, Mail, Clock,
  CheckCircle2, XCircle, Trash2, Ban,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddUserDialog from "@/components/screenpage/AddUserDialog";
import toast from "react-hot-toast";

type UserRole = "ADMIN" | "STAFF" | "ENTREPRENEUR" | "TOURIST";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
  phone?: string; // Made optional to mirror conditional checks in UI securely
  isActive: boolean;
  provider: string;
  createdAt: string;
  lastSignIn: string | null;
  hasProfile: boolean;
  staffCode?: string;
  staffStatus?: string | null;
  position?: string;
}

const ROLE_BADGE: Record<UserRole, string> = {
  ADMIN:        "bg-red-500/15 text-red-600 border-red-500/25",
  STAFF:        "bg-teal-500/15 text-teal-600 border-teal-500/25",
  ENTREPRENEUR: "bg-amber-500/15 text-amber-600 border-amber-500/25",
  TOURIST:      "bg-sky-500/15 text-sky-600 border-sky-500/25",
};
const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: "Admin", STAFF: "Staff", ENTREPRENEUR: "Entrepreneur", TOURIST: "Tourist",
};
const ROLE_GRADIENT: Record<UserRole, string> = {
  ADMIN:        "from-red-500 to-rose-600",
  STAFF:        "from-teal-500 to-emerald-600",
  ENTREPRENEUR: "from-amber-500 to-orange-500",
  TOURIST:      "from-sky-500 to-blue-600",
};
const ALL_ROLES: UserRole[] = ["ADMIN", "STAFF", "ENTREPRENEUR", "TOURIST"];

function initials(name: string) {
  return name.split(" ").filter(Boolean).map(p => p[0]).join("").slice(0, 2).toUpperCase() || "?";
}
function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function fmtRelative(iso: string | null) {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return fmtDate(iso);
}

function UserAvatar({ user, size = "sm" }: { user: AdminUser; size?: "sm" | "md" }) {
  const dim = size === "md" ? "w-11 h-11 text-sm" : "w-9 h-9 text-xs";
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br ${ROLE_GRADIENT[user.role]} flex items-center justify-center text-white font-bold shrink-0 overflow-hidden`}>
      {user.avatar
        ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
        : initials(user.name)
      }
    </div>
  );
}

function ProviderBadge({ provider }: { provider: string }) {
  const hasGoogle = provider.includes("google");
  const hasEmail  = provider.includes("email");
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {hasGoogle && (
        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 border border-blue-500/20">
          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </span>
      )}
      {hasEmail && (
        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
          <Mail className="w-2.5 h-2.5" /> Email
        </span>
      )}
    </div>
  );
}

export default function UsersPage() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterProvider, setFilterProvider] = useState("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const { users: data } = await res.json();
      setUsers(data ?? []);
    } catch (err: any) {
      setError(err.message ?? "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (mounted) loadUsers(); }, [mounted, loadUsers]);

  const handleToggle = async (id: string, current: boolean) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !current } : u));
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id, isActive: !current }),
    });
    if (!res.ok) {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: current } : u));
      toast.error("Failed to update user");
    } else {
      toast.success(`User ${!current ? "activated" : "deactivated"}`);
      loadUsers();
    }
  };

  const handleDelete = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!confirm(`Delete "${user?.name ?? id}"? This is permanent.`)) return;
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id }),
    });
    if (!res.ok) {
      toast.error("Failed to delete user");
    } else {
      setUsers(prev => prev.filter(u => u.id !== id));
      loadUsers();
      toast.success("User deleted");
    }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch   = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phone && u.phone.toLowerCase().includes(q));
    const matchRole     = filterRole === "all" || u.role === filterRole;
    const matchStatus   = filterStatus === "all" || (filterStatus === "active" ? u.isActive : !u.isActive);
    const matchProvider = filterProvider === "all" || u.provider.toLowerCase().includes(filterProvider.toLowerCase());
    return matchSearch && matchRole && matchStatus && matchProvider;
  });

  const roleCounts = ALL_ROLES.reduce((acc, r) => { acc[r] = users.filter(u => u.role === r).length; return acc; }, {} as Record<string, number>);

  if (!mounted) return null;

  return (
    <DashboardLayout title="Users" subtitle="Manage all registered accounts">
      <div className="space-y-4 sm:space-y-5 max-w-6xl mx-auto pb-10">

        {/* Role cards */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ALL_ROLES.map(role => (
            <button key={role}
              onClick={() => setFilterRole(prev => prev === role ? "all" : role)}
              className={`rounded-xl border shadow-sm text-center p-3 sm:p-4 transition-all hover:shadow-md ${filterRole === role ? "border-teal-500/40 bg-teal-500/5" : "border-border bg-card"}`}>
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${ROLE_GRADIENT[role]} flex items-center justify-center mx-auto mb-2`}>
                <Shield className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-bold">{loading ? "—" : roleCounts[role]}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{ROLE_LABEL[role]}</p>
            </button>
          ))}
        </motion.div>

        {/* Summary */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",      value: users.length,                         color: "text-foreground" },
            { label: "Active",     value: users.filter(u => u.isActive).length,  color: "text-emerald-600" },
            { label: "Inactive",   value: users.filter(u => !u.isActive).length, color: "text-slate-500" },
            { label: "No profile", value: users.filter(u => !u.hasProfile).length, color: users.filter(u => !u.hasProfile).length > 0 ? "text-orange-500" : "text-muted-foreground" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border bg-card p-3 text-center shadow-sm">
              <p className={`text-2xl font-bold ${s.color}`}>{loading ? "—" : s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-500" />
                  All Users
                  {!loading && <span className="text-xs font-normal text-muted-foreground">({filtered.length} of {users.length})</span>}
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative flex-1 sm:flex-initial sm:w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search name, email..." value={search}
                      onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
                  </div>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="h-9 text-sm w-32 shrink-0"><SelectValue placeholder="Role" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All roles</SelectItem>
                      {ALL_ROLES.map(r => <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="h-9 text-sm w-28 shrink-0"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterProvider} onValueChange={setFilterProvider}>
                    <SelectTrigger className="h-9 text-sm w-28 shrink-0"><SelectValue placeholder="Provider" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={loadUsers} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  </Button>
                  <Button size="sm"
                    className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white shadow-sm shrink-0"
                    onClick={() => setAddDialogOpen(true)}>
                    <UserPlus className="w-4 h-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">Add User</span>
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              {loading && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <RefreshCw className="w-7 h-7 text-teal-500 animate-spin" />
                  <p className="text-sm text-muted-foreground">Loading from Supabase Auth...</p>
                </div>
              )}
              {!loading && error && (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                  <AlertCircle className="w-10 h-10 text-red-400" />
                  <p className="text-sm font-medium">Failed to load users</p>
                  <p className="text-xs text-muted-foreground max-w-xs">{error}</p>
                  <Button size="sm" variant="outline" onClick={loadUsers}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Retry
                  </Button>
                </div>
              )}
              {!loading && !error && filtered.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {users.length === 0 ? "No users found." : "No users match your filters."}
                  </p>
                  {users.length > 0 && (
                    <button onClick={() => { setSearch(""); setFilterRole("all"); setFilterStatus("all"); setFilterProvider("all"); }}
                      className="text-xs text-teal-500 mt-1 hover:underline">Clear filters</button>
                  )}
                </div>
              )}

              {!loading && !error && filtered.length > 0 && (
                <>
                  {/* Desktop view */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/50">
                          {["User", "Role", "Provider", "Last sign in", "Status", ""].map((h, i) => (
                            <th key={i} className={`text-xs font-medium text-muted-foreground pb-3 ${i === 5 ? "text-right" : "text-left pr-4"}`}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence mode="popLayout">
                          {filtered.map(u => (
                            <motion.tr key={u.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                              <td className="py-3 pr-4">
                                <div className="flex items-center gap-3">
                                  <UserAvatar user={u} />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-sm font-medium truncate">{u.name}</p>
                                      {!u.hasProfile && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600 border border-orange-500/20 shrink-0">
                                          No profile
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                                    {(u.role === 'STAFF' || u.role === 'ADMIN') && u.staffCode && (
                                      <p className="text-[10px] text-teal-600 font-mono mt-0.5">ID: {u.staffCode}</p>
                                    )}
                                    {u.role === 'ENTREPRENEUR' && u.position && (
                                      <p className="text-[10px] text-amber-600 font-medium mt-0.5">{u.position}</p>
                                    )}
                                    {u.phone && <p className="text-xs text-muted-foreground truncate">{u.phone}</p>}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 pr-4">
                                <Badge variant="outline" className={ROLE_BADGE[u.role]}>{ROLE_LABEL[u.role]}</Badge>
                              </td>
                              <td className="py-3 pr-4"><ProviderBadge provider={u.provider} /></td>
                              <td className="py-3 pr-4">
                                <span className="text-xs text-muted-foreground">{fmtRelative(u.lastSignIn)}</span>
                                <span className="text-[10px] text-muted-foreground/60 block mt-0.5">joined {fmtDate(u.createdAt)}</span>
                              </td>
                              <td className="py-3 pr-4">
                                <Badge variant="outline" className={u.isActive
                                  ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/25 flex items-center gap-1 w-fit"
                                  : "bg-slate-500/15 text-slate-500 border-slate-500/25 flex items-center gap-1 w-fit"}>
                                  {u.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                  {u.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </td>
                              <td className="py-3 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => handleToggle(u.id, u.isActive)} className="gap-2 text-sm">
                                      <Ban className="w-3.5 h-3.5" />
                                      {u.isActive ? "Deactivate" : "Activate"}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleDelete(u.id)} className="gap-2 text-sm text-red-500 focus:text-red-500">
                                      <Trash2 className="w-3.5 h-3.5" />Delete permanently
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile view */}
                  <div className="sm:hidden space-y-2">
                    <AnimatePresence mode="popLayout">
                      {filtered.map(u => (
                        <motion.div key={u.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-3 p-3 rounded-xl border bg-card">
                          <UserAvatar user={u} size="md" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{u.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                            {(u.role === 'STAFF' || u.role === 'ADMIN') && u.staffCode && (
                              <p className="text-[10px] text-teal-600 font-mono">ID: {u.staffCode}</p>
                            )}
                            {u.role === 'ENTREPRENEUR' && u.position && (
                              <p className="text-[10px] text-amber-600 font-medium">{u.position}</p>
                            )}
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <Badge variant="outline" className={`${ROLE_BADGE[u.role]} text-[10px]`}>{ROLE_LABEL[u.role]}</Badge>
                              <ProviderBadge provider={u.provider} />
                              <span className="text-[10px] text-muted-foreground">{fmtRelative(u.lastSignIn)}</span>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><MoreHorizontal className="w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleToggle(u.id, u.isActive)} className="gap-2 text-sm">
                                <Ban className="w-3.5 h-3.5" />{u.isActive ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDelete(u.id)} className="gap-2 text-sm text-red-500 focus:text-red-500">
                                <Trash2 className="w-3.5 h-3.5" />Delete permanently
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <AddUserDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onSuccess={loadUsers} />
    </DashboardLayout>
  );
}