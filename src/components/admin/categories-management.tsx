"use client";

import React, { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronLeft,
  FolderTree,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { mockCategories } from "@/lib/mock-data";
import type { Category } from "@/lib/types";

interface CategoryFormData {
  name: string;
  nameEn: string;
  slug: string;
  parentId: string;
  image: string;
}

interface CategoryFormProps {
  formData: CategoryFormData;
  setFormData: React.Dispatch<React.SetStateAction<CategoryFormData>>;
  parentCategories: Category[];
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
}

function CategoryForm({ formData, setFormData, parentCategories, onClose, onSubmit, submitLabel }: CategoryFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cat-name">اسم التصنيف (عربي) *</Label>
        <Input
          id="cat-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
          placeholder="أدخل اسم التصنيف"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cat-nameEn">اسم التصنيف (إنجليزي)</Label>
        <Input
          id="cat-nameEn"
          value={formData.nameEn}
          onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
          placeholder="Category name in English"
          dir="ltr"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cat-slug">الرابط (Slug) *</Label>
        <Input
          id="cat-slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          placeholder="category-slug"
          dir="ltr"
        />
      </div>

      <div className="space-y-2">
        <Label>التصنيف الرئيسي</Label>
        <Select
          value={formData.parentId}
          onValueChange={(val) => setFormData({ ...formData, parentId: val === "none" ? "" : val })}
        >
          <SelectTrigger>
            <SelectValue placeholder="تصنيف رئيسي (اختياري)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">بدون تصنيف رئيسي</SelectItem>
            {parentCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>صورة التصنيف</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
          <ImageIcon className="w-6 h-6 mx-auto text-muted-foreground mb-2" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">انقر لاختيار صورة</p>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          إلغاء
        </Button>
        <Button onClick={onSubmit}>{submitLabel}</Button>
      </DialogFooter>
    </div>
  );
}

export function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["cat1", "cat2", "cat3"]));
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Form state
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    nameEn: "",
    slug: "",
    parentId: "",
    image: "",
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const openAddDialog = (parentId?: string) => {
    setFormData({
      name: "",
      nameEn: "",
      slug: "",
      parentId: parentId || "",
      image: "",
    });
    setSelectedCategory(null);
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      nameEn: category.nameEn || "",
      slug: category.slug,
      parentId: category.parentId || "",
      image: category.image || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleAddCategory = () => {
    const newCategory: Category = {
      id: `cat${Date.now()}`,
      name: formData.name,
      nameEn: formData.nameEn || null,
      slug: formData.slug,
      image: formData.image || null,
      parentId: formData.parentId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      children: [],
    };

    if (formData.parentId) {
      setCategories(
        categories.map((cat) =>
          cat.id === formData.parentId
            ? { ...cat, children: [...(cat.children || []), newCategory] }
            : cat
        )
      );
    } else {
      setCategories([...categories, newCategory]);
    }
    setIsAddDialogOpen(false);
  };

  const handleEditCategory = () => {
    if (!selectedCategory) return;
    const updateCategory = (cats: Category[]): Category[] =>
      cats.map((cat) => {
        if (cat.id === selectedCategory.id) {
          return {
            ...cat,
            name: formData.name,
            nameEn: formData.nameEn || null,
            slug: formData.slug,
            image: formData.image || null,
            parentId: formData.parentId || null,
            updatedAt: new Date().toISOString(),
          };
        }
        if (cat.children) {
          return { ...cat, children: updateCategory(cat.children) };
        }
        return cat;
      });
    setCategories(updateCategory(categories));
    setIsEditDialogOpen(false);
    setSelectedCategory(null);
  };

  const handleDeleteCategory = () => {
    if (!selectedCategory) return;
    const removeCategory = (cats: Category[]): Category[] =>
      cats
        .filter((cat) => cat.id !== selectedCategory.id)
        .map((cat) => ({
          ...cat,
          children: cat.children ? removeCategory(cat.children) : [],
        }));
    setCategories(removeCategory(categories));
    setIsDeleteDialogOpen(false);
    setSelectedCategory(null);
  };

  const getParentCategories = () => categories.filter((c) => !c.parentId);

  const closeDialog = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
  };

  const renderCategoryRow = (category: Category, level: number = 0) => {
    const isExpanded = expandedIds.has(category.id);
    const hasChildren = category.children && category.children.length > 0;
    const childCount = category.children?.length || 0;

    return (
      <React.Fragment key={category.id}>
        <div
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
          style={{ paddingRight: `${16 + level * 32}px` }}
        >
          {/* Expand toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => toggleExpand(category.id)}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )
            ) : (
              <div className="w-4" />
            )}
          </Button>

          {/* Icon */}
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
            {category.image ? (
              <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
            ) : (
              <FolderTree className="w-5 h-5 text-muted-foreground" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm truncate">{category.name}</p>
              {category.nameEn && (
                <span className="text-xs text-muted-foreground" dir="ltr">
                  {category.nameEn}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground" dir="ltr">
              /{category.slug}
            </p>
          </div>

          {/* Children count */}
          {hasChildren && (
            <Badge variant="secondary" className="text-xs">
              {childCount} تصنيفات فرعية
            </Badge>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => openAddDialog(category.id)}
              title="إضافة تصنيف فرعي"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => openEditDialog(category)}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => openDeleteDialog(category)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {category.children!.map((child) => renderCategoryRow(child, level + 1))}
          </div>
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">التصنيفات</h2>
          <p className="text-muted-foreground">
            إدارة تصنيفات المنتجات ({categories.length} تصنيف رئيسي)
          </p>
        </div>
        <Button onClick={() => openAddDialog()}>
          <Plus className="w-4 h-4 ml-2" />
          إضافة تصنيف
        </Button>
      </div>

      {/* Categories Tree */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">شجرة التصنيفات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {categories.map((category) => renderCategoryRow(category))}
          </div>
        </CardContent>
      </Card>

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة تصنيف جديد</DialogTitle>
            <DialogDescription>أدخل بيانات التصنيف الجديد</DialogDescription>
          </DialogHeader>
          <CategoryForm
            formData={formData}
            setFormData={setFormData}
            parentCategories={getParentCategories()}
            onClose={closeDialog}
            onSubmit={handleAddCategory}
            submitLabel="إضافة التصنيف"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل التصنيف</DialogTitle>
            <DialogDescription>تعديل بيانات التصنيف</DialogDescription>
          </DialogHeader>
          <CategoryForm
            formData={formData}
            setFormData={setFormData}
            parentCategories={getParentCategories()}
            onClose={closeDialog}
            onSubmit={handleEditCategory}
            submitLabel="حفظ التعديلات"
          />
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف التصنيف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف التصنيف &quot;{selectedCategory?.name}&quot؛؟
              {selectedCategory?.children && selectedCategory.children.length > 0 && (
                <span className="block mt-2 text-destructive">
                  تحذير: سيتم حذف جميع التصنيفات الفرعية أيضاً.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
