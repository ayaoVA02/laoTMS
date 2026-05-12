"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  Languages,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import IconPicker from "@/components/shared/icon-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";

interface CategoryType {
  type_id: string;
  name_la: string;
  name_en: string;
  description: string;
  type_icon: string;
  type_image: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const emptyCategory: Omit<CategoryType, "type_id" | "created_at" | "updated_at"> = {
  name_la: "",
  name_en: "",
  description: "",
  type_icon: "",
  type_image: "",
  is_active: true,
};

export default function CategoriesPage() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryType | null>(null);
  const [formData, setFormData] = useState(emptyCategory);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("types")
        .select("*")
        .order("name_en", { ascending: true });

      if (!error && data) {
        setCategories(data as CategoryType[]);
      }
    } catch {
      /* ignore */
    }
    setLoading(false);
  };

  useEffect(() => {
    if (mounted) fetchCategories();
  }, [mounted]);

  const filteredCategories = categories.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name_en.toLowerCase().includes(q) ||
      c.name_la.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  });

  const activeCount = categories.filter((c) => c.is_active).length;
  const inactiveCount = categories.filter((c) => !c.is_active).length;

  const handleToggleActive = async (category: CategoryType) => {
    const newValue = !category.is_active;
    const { error } = await supabase
      .from("types")
      .update({ is_active: newValue })
      .eq("type_id", category.type_id);

    if (!error) {
      setCategories((prev) =>
        prev.map((c) =>
          c.type_id === category.type_id ? { ...c, is_active: newValue } : c
        )
      );
    }
  };

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData(emptyCategory);
    setDialogOpen(true);
  };

  const handleOpenEdit = (category: CategoryType) => {
    setEditingCategory(category);
    setFormData({
      name_la: category.name_la,
      name_en: category.name_en,
      description: category.description,
      type_icon: category.type_icon,
      type_image: category.type_image,
      is_active: category.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name_en.trim() || !formData.name_la.trim()) return;
    setSaving(true);
    console.log(editingCategory ? "Updating category..." : "Creating category...", formData);
    try {
      console.log('editingCategory.type_id:', editingCategory?.type_id);
      if (editingCategory) {
        const { error, data } = await supabase
          .from("types")
          .update({
            name_la: formData.name_la,
            name_en: formData.name_en,
            description: formData.description,
            type_icon: formData.type_icon,
            type_image: formData.type_image,
            is_active: formData.is_active,
          })
          .eq("type_id", editingCategory.type_id);

          console.log('Update result:', { error, data });
        if (!error) {
          setCategories((prev) =>
            prev.map((c) =>
              c.type_id === editingCategory.type_id
                ? { ...c, ...formData }
                : c
            )
          );
        }
        if (!error) toast.success("Category updated successfully");
        
      } else {
        const { data, error } = await supabase
          .from("types")
          .insert({
            name_la: formData.name_la,
            name_en: formData.name_en,
            description: formData.description,
            type_icon: formData.type_icon,
            type_image: formData.type_image,
            is_active: formData.is_active,
          })
          .select("*")
          .single();

        if (!error && data) {
          setCategories((prev) => [...prev, data as CategoryType]);
        }
        toast.success("Category created successfully");
      }
    } catch (error) {
      console.error("Error saving category", error);
      toast.error("Error saving category");
      /* ignore */
    }

    setSaving(false);
    setDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    setSaving(true);

    const { error } = await supabase
      .from("types")
      .delete()
      .eq("type_id", deletingCategory.type_id);

    if (!error) {
      setCategories((prev) =>
        prev.filter((c) => c.type_id !== deletingCategory.type_id)
      );
    }

    setSaving(false);
    setDeleteDialogOpen(false);
    setDeletingCategory(null);
  };

  if (!mounted) return null;

  return (
    <DashboardLayout
      title={t("sidebar.categories", "Categories")}
      subtitle="Manage attraction categories and types"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4 sm:space-y-6"
      >
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Total",
              count: categories.length,
              icon: Tag,
              color: "text-teal-500",
            },
            {
              label: "Active",
              count: activeCount,
              icon: ToggleRight,
              color: "text-emerald-500",
            },
            {
              label: "Inactive",
              count: inactiveCount,
              icon: ToggleLeft,
              color: "text-slate-400",
            },
          ].map((s) => (
            <motion.div key={s.label} variants={itemVariants}>
              <Card className="border-0 shadow-md text-center">
                <CardContent className="p-3 sm:p-4">
                  <s.icon
                    className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 ${s.color}`}
                  />
                  <p className="text-lg sm:text-2xl font-bold">{s.count}</p>
                  <p className="text-[10px] sm:text-sm text-muted-foreground">
                    {s.label}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Toolbar */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>
                <Button
                  onClick={handleOpenCreate}
                  className="bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Category
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Categories List */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Tag className="w-5 h-5 text-teal-500" />
                Categories ({filteredCategories.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="text-center py-12">
                  <Tag className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? "No categories match your search"
                      : "No categories yet. Create your first one!"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {filteredCategories.map((category) => (
                      <motion.div
                        key={category.type_id}
                        layout
                        exit={{ opacity: 0, x: -20 }}
                        className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border transition-colors ${
                          !category.is_active
                            ? "bg-muted/30 border-border opacity-60"
                            : "bg-card border-border hover:border-teal-500/30"
                        }`}
                      >
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/20 flex items-center justify-center shrink-0">
                          {category.type_icon && (LucideIcons as unknown as Record<string, React.ElementType>)[category.type_icon]
                            ? (() => {
                                const IconComp = (LucideIcons as unknown as Record<string, React.ElementType>)[category.type_icon];
                                return <IconComp className="w-5 h-5 text-teal-500" />;
                              })()
                            : <Tag className="w-4 h-4 text-teal-500" />
                          }
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">
                              {category.name_en}
                            </p>
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1.5 py-0 border-teal-500/30 text-teal-600"
                            >
                              EN
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-muted-foreground truncate">
                              {category.name_la}
                            </p>
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1.5 py-0 border-amber-500/30 text-amber-600"
                            >
                              LA
                            </Badge>
                          </div>
                          {category.description && (
                            <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-xs">
                              {category.description}
                            </p>
                          )}
                        </div>

                        {/* Active Toggle */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-muted-foreground hidden sm:inline">
                            {category.is_active ? "Active" : "Inactive"}
                          </span>
                          <Switch
                            checked={category.is_active}
                            onCheckedChange={() => handleToggleActive(category)}
                          />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-teal-600"
                            onClick={() => handleOpenEdit(category)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-red-600"
                            onClick={() => {
                              setDeletingCategory(category);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-teal-500" />
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update the category details below."
                : "Fill in the details to create a new attraction category."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* English Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-teal-500" />
                Name (English) <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Temples"
                value={formData.name_en}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, name_en: e.target.value }))
                }
              />
            </div>

            {/* Lao Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-amber-500" />
                Name (Lao) <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. ວັດ"
                value={formData.name_la}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, name_la: e.target.value }))
                }
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Brief description of this category..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
              />
            </div>

            {/* Icon Picker */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                Icon
              </label>
              <IconPicker
                value={formData.type_icon}
                onChange={(iconName) =>
                  setFormData((f) => ({ ...f, type_icon: iconName }))
                }
              />
            </div>

            {/* Image URL */}
            {/* <div className="space-y-1.5">
              <label className="text-sm font-medium">Image URL</label>
              <Input
                placeholder="https://..."
                value={formData.type_image}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, type_image: e.target.value }))
                }
              />
            </div> */}

            {/* Is Active Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-[10px] text-muted-foreground">
                  When active, this category is visible to all users
                </p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData((f) => ({ ...f, is_active: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                saving || !formData.name_en.trim() || !formData.name_la.trim()
              }
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
              ) : (
                <Plus className="w-4 h-4 mr-1.5" />
              )}
              {editingCategory ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete Category
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deletingCategory?.name_en}</strong>? This action cannot
              be undone. Attractions using this category will lose their
              category reference.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={saving}
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
              ) : (
                <Trash2 className="w-4 h-4 mr-1.5" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
