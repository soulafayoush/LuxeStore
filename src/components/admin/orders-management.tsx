"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Eye,
  Download,
  Filter,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockOrders, mockUsers, orderStatusLabels, orderStatusColors } from "@/lib/mock-data";
import type { Order, OrderStatus } from "@/lib/types";

const statusIcons: Record<string, React.ElementType> = {
  PENDING: Clock,
  PROCESSING: CheckCircle2,
  SHIPPED: Truck,
  DELIVERED: PackageCheck,
  CANCELLED: XCircle,
  REFUNDED: RotateCcw,
};

const orderTimeline = [
  { status: "تم إنشاء الطلب", time: "2024-06-07 10:15", done: true },
  { status: "تم تأكيد الدفع", time: "2024-06-07 10:16", done: true },
  { status: "قيد المعالجة", time: "2024-06-07 11:00", done: true },
  { status: "تم الشحن", time: "—", done: false },
  { status: "تم التسليم", time: "—", done: false },
];

export function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const orderCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const getUser = (userId: string) => mockUsers.find((u) => u.id === userId);

  const openDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const updateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(
      orders.map((o) =>
        o.id === orderId
          ? { ...o, status: newStatus, updatedAt: new Date().toISOString() }
          : o
      )
    );
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const handleExport = () => {
    // Simulate export
    const csvContent = [
      ["رقم الطلب", "العميل", "المبلغ", "الحالة", "التاريخ"],
      ...filteredOrders.map((o) => [
        o.orderNumber,
        getUser(o.userId)?.name || "—",
        o.totalAmount,
        orderStatusLabels[o.status],
        new Date(o.createdAt).toLocaleDateString("ar-SA"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "orders.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">الطلبات</h2>
          <p className="text-muted-foreground">
            إدارة جميع الطلبات ({filteredOrders.length} طلب)
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 ml-2" />
          تصدير الطلبات
        </Button>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: "all", label: "الكل" },
          { value: "PENDING", label: "قيد الانتظار" },
          { value: "PROCESSING", label: "قيد المعالجة" },
          { value: "SHIPPED", label: "تم الشحن" },
          { value: "DELIVERED", label: "تم التسليم" },
          { value: "CANCELLED", label: "ملغي" },
          { value: "REFUNDED", label: "مسترجع" },
        ].map((tab) => (
          <Button
            key={tab.value}
            variant={statusFilter === tab.value ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(tab.value)}
            className="text-xs"
          >
            {tab.label}
            <Badge variant="secondary" className="mr-1.5 h-5 px-1.5 text-[10px]">
              {orderCounts[tab.value] || 0}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="بحث برقم الطلب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الطلب</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead className="text-left">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const user = getUser(order.userId);
                  return (
                    <TableRow key={order.id} className="group cursor-pointer" onClick={() => openDetail(order)}>
                      <TableCell className="font-medium text-sm">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell className="text-sm">{user?.name || "—"}</TableCell>
                      <TableCell className="text-sm font-medium">
                        ر.س {order.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${orderStatusColors[order.status]}`}
                        >
                          {orderStatusLabels[order.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("ar-SA")}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); openDetail(order); }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>تفاصيل الطلب {selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>
              تم إنشاء الطلب في {selectedOrder && new Date(selectedOrder.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-6">
                {/* Order Status */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const Icon = statusIcons[selectedOrder.status] || Clock;
                      return <Icon className="w-5 h-5" />;
                    })()}
                    <div>
                      <p className="text-sm font-medium">حالة الطلب</p>
                      <Badge
                        variant="secondary"
                        className={`mt-1 ${orderStatusColors[selectedOrder.status]}`}
                      >
                        {orderStatusLabels[selectedOrder.status]}
                      </Badge>
                    </div>
                  </div>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(val) => updateStatus(selectedOrder.id, val as OrderStatus)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(orderStatusLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Info */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">معلومات العميل</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {(() => {
                        const user = getUser(selectedOrder.userId);
                        return user ? (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">الاسم:</span>
                              <span className="font-medium">{user.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">البريد:</span>
                              <span>{user.email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">الهاتف:</span>
                              <span dir="ltr">{user.phone}</span>
                            </div>
                          </>
                        ) : (
                          <p className="text-muted-foreground">لا توجد معلومات</p>
                        );
                      })()}
                    </CardContent>
                  </Card>

                  {/* Shipping Info */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">معلومات الشحن</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">العنوان:</span>
                        <span className="text-left max-w-[200px] truncate">{selectedOrder.shippingAddress || "—"}</span>
                      </div>
                      {selectedOrder.notes && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ملاحظات:</span>
                          <span>{selectedOrder.notes}</span>
                        </div>
                      )}
                      {selectedOrder.couponCode && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">كوبون:</span>
                          <Badge variant="outline">{selectedOrder.couponCode}</Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Order Timeline */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">مسار الطلب</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orderTimeline.map((step, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                step.done ? "bg-green-500" : "bg-muted-foreground/30"
                              }`}
                            />
                            {index < orderTimeline.length - 1 && (
                              <div
                                className={`w-0.5 h-8 ${
                                  step.done ? "bg-green-500" : "bg-muted-foreground/20"
                                }`}
                              />
                            )}
                          </div>
                          <div className="flex-1 -mt-1">
                            <p className={`text-sm ${step.done ? "font-medium" : "text-muted-foreground"}`}>
                              {step.status}
                            </p>
                            <p className="text-xs text-muted-foreground">{step.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Order Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">ملخص الطلب</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">المجموع الفرعي:</span>
                      <span>ر.س {selectedOrder.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الضريبة:</span>
                      <span>ر.س {selectedOrder.tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">تكلفة الشحن:</span>
                      <span>ر.س {selectedOrder.shippingCost.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-base font-bold">
                      <span>الإجمالي:</span>
                      <span>ر.س {selectedOrder.totalAmount.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
