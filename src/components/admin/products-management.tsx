"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Filter,
  Upload,
  X,
  Star,
  Archive,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { mockProducts, mockCategories, mockColors, mockSizes } from "@/lib/mock-data";
import type { Product, Category } from "@/lib/types";

interface ProductFormData {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: string;
  comparePrice: string;
  sku: string;
  isActive: boolean;
  isFeatured: boolean;
  stock: string;
  categoryId: string;
}

interface ProductFormProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  categories: Category[];
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
}

function ProductForm({ formData, setFormData, categories, onClose, onSubmit, submitLabel }: ProductFormProps) {
  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">اسم المنتج (عربي) *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="أدخل اسم المنتج بالعربية"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nameEn">اسم المنتج (إنجليزي)</Label>
          <Input
            id="nameEn"
            value={formData.nameEn}
            onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
            placeholder="Product name in English"
            dir="ltr"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">السعر (ر.س) *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="0.00"
            dir="ltr"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="comparePrice">سعر المقارنة (ر.س)</Label>
          <Input
            id="comparePrice"
            type="number"
            value={formData.comparePrice}
            onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
            placeholder="0.00"
            dir="ltr"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sku">رمز المنتج (SKU) *</Label>
          <Input
            id="sku"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            placeholder="SKU-001"
            dir="ltr"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">المخزون *</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            placeholder="0"
            dir="ltr"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">التصنيف</Label>
        <Select
          value={formData.categoryId}
          onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر التصنيف" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">الوصف (عربي)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="أدخل وصف المنتج"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descriptionEn">الوصف (إنجليزي)</Label>
        <Textarea
          id="descriptionEn"
          value={formData.descriptionEn}
          onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
          placeholder="Product description in English"
          rows={3}
          dir="ltr"
        />
      </div>

      <div className="space-y-2">
        <Label>صور المنتج</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            اسحب الصور هنا أو انقر للرفع
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG, WebP (الحد الأقصى 5MB)
          </p>
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Switch
            checked={formData.isActive}
            onCheckedChange={(val) => setFormData({ ...formData, isActive: val })}
          />
          <Label>منتج نشط</Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            checked={formData.isFeatured}
            onCheckedChange={(val) => setFormData({ ...formData, isFeatured: val })}
          />
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <Label>منتج مميز</Label>
          </div>
        </div>
      </div>

      <DialogFooter className="pt-4">
        <Button variant="outline" onClick={onClose}>
          إلغاء
        </Button>
        <Button onClick={onSubmit}>{submitLabel}</Button>
      </DialogFooter>
    </div>
  );
}

export function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    nameEn: "",
    description: "",
    descriptionEn: "",
    price: "",
    comparePrice: "",
    sku: "",
    isActive: true,
    isFeatured: false,
    stock: "",
    categoryId: "",
  });

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.includes(searchQuery) ||
        (product.nameEn && product.nameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || product.categoryId === categoryFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && product.isActive) ||
        (statusFilter === "inactive" && !product.isActive);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, categoryFilter, statusFilter]);

  const openAddDialog = () => {
    setFormData({
      name: "",
      nameEn: "",
      description: "",
      descriptionEn: "",
      price: "",
      comparePrice: "",
      sku: "",
      isActive: true,
      isFeatured: false,
      stock: "",
      categoryId: "",
    });
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      nameEn: product.nameEn || "",
      description: product.description || "",
      descriptionEn: product.descriptionEn || "",
      price: String(product.price),
      comparePrice: product.comparePrice ? String(product.comparePrice) : "",
      sku: product.sku,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      stock: String(product.stock),
      categoryId: product.categoryId || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const openViewDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsViewDialogOpen(true);
  };

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: `p${Date.now()}`,
      name: formData.name,
      nameEn: formData.nameEn || null,
      description: formData.description || null,
      descriptionEn: formData.descriptionEn || null,
      price: parseFloat(formData.price) || 0,
      comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
      sku: formData.sku,
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
      images: "[]",
      stock: parseInt(formData.stock) || 0,
      categoryId: formData.categoryId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts([newProduct, ...products]);
    setIsAddDialogOpen(false);
  };

  const handleEditProduct = () => {
    if (!selectedProduct) return;
    setProducts(
      products.map((p) =>
        p.id === selectedProduct.id
          ? {
              ...p,
              name: formData.name,
              nameEn: formData.nameEn || null,
              description: formData.description || null,
              descriptionEn: formData.descriptionEn || null,
              price: parseFloat(formData.price) || 0,
              comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
              sku: formData.sku,
              isActive: formData.isActive,
              isFeatured: formData.isFeatured,
              stock: parseInt(formData.stock) || 0,
              categoryId: formData.categoryId || null,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
    setIsEditDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = () => {
    if (!selectedProduct) return;
    setProducts(products.filter((p) => p.id !== selectedProduct.id));
    setIsDeleteDialogOpen(false);
    setSelectedProduct(null);
  };

  const getCategoryName = (catId?: string | null) => {
    if (!catId) return "—";
    const findCategory = (cats: Category[]): string | undefined => {
      for (const cat of cats) {
        if (cat.id === catId) return cat.name;
        if (cat.children) {
          const found = findCategory(cat.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return findCategory(mockCategories) || "—";
  };

  const closeDialog = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">المنتجات</h2>
          <p className="text-muted-foreground">
            إدارة جميع المنتجات ({filteredProducts.length} منتج)
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="w-4 h-4 ml-2" />
          إضافة منتج
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم أو SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 ml-2" />
                <SelectValue placeholder="التصنيف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التصنيفات</SelectItem>
                {mockCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>المنتج</TableHead>
                  <TableHead>التصنيف</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>المخزون</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-left">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product, index) => {
                  const images: string[] = JSON.parse(product.images || "[]");
                  return (
                    <TableRow key={product.id} className="group">
                      <TableCell className="text-muted-foreground text-sm">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {images.length > 0 ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                              <img
                                src={images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <Package className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate max-w-48">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground" dir="ltr">
                              {product.sku}
                            </p>
                          </div>
                          {product.isFeatured && (
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 shrink-0" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {getCategoryName(product.categoryId)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-medium">ر.س {product.price}</span>
                          {product.comparePrice && (
                            <span className="text-muted-foreground line-through text-xs mr-2">
                              ر.س {product.comparePrice}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            product.stock === 0
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              : product.stock < 50
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          }
                        >
                          {product.stock === 0 ? "نفذ" : product.stock}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            product.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                          }
                        >
                          {product.isActive ? "نشط" : "غير نشط"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openViewDialog(product)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(product)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => openDeleteDialog(product)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إضافة منتج جديد</DialogTitle>
            <DialogDescription>أدخل بيانات المنتج الجديد</DialogDescription>
          </DialogHeader>
          <ProductForm
            formData={formData}
            setFormData={setFormData}
            categories={mockCategories}
            onClose={closeDialog}
            onSubmit={handleAddProduct}
            submitLabel="إضافة المنتج"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل المنتج</DialogTitle>
            <DialogDescription>تعديل بيانات المنتج</DialogDescription>
          </DialogHeader>
          <ProductForm
            formData={formData}
            setFormData={setFormData}
            categories={mockCategories}
            onClose={closeDialog}
            onSubmit={handleEditProduct}
            submitLabel="حفظ التعديلات"
          />
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المنتج</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف المنتج &quot;{selectedProduct?.name}&quot؛؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Product Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل المنتج</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="flex gap-4">
                {(() => {
                  const images: string[] = JSON.parse(selectedProduct.images || "[]");
                  return images.length > 0 ? (
                    <div className="w-40 h-40 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img src={images[0]} alt={selectedProduct.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-40 h-40 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Archive className="w-10 h-10 text-muted-foreground" />
                    </div>
                  );
                })()}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold">{selectedProduct.name}</h3>
                  {selectedProduct.nameEn && (
                    <p className="text-sm text-muted-foreground" dir="ltr">{selectedProduct.nameEn}</p>
                  )}
                  <p className="text-sm text-muted-foreground">SKU: {selectedProduct.sku}</p>
                  <div className="flex gap-2">
                    <Badge>{selectedProduct.isActive ? "نشط" : "غير نشط"}</Badge>
                    {selectedProduct.isFeatured && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        مميز
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">السعر: </span>
                  <span className="font-bold">ر.س {selectedProduct.price}</span>
                  {selectedProduct.comparePrice && (
                    <span className="text-muted-foreground line-through text-xs mr-1">
                      ر.س {selectedProduct.comparePrice}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">المخزون: </span>
                  <span className="font-bold">{selectedProduct.stock}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">التصنيف: </span>
                  <span>{getCategoryName(selectedProduct.categoryId)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">تاريخ الإنشاء: </span>
                  <span>{new Date(selectedProduct.createdAt).toLocaleDateString("ar-SA")}</span>
                </div>
              </div>
              {selectedProduct.description && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-1">الوصف</h4>
                    <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
