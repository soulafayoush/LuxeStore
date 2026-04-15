"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Eye,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Calendar,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockUsers, mockOrders, orderStatusLabels, orderStatusColors } from "@/lib/mock-data";
import type { User, Order } from "@/lib/types";

export function CustomersManagement() {
  const [users] = useState<User[]>(mockUsers.filter((u) => u.role === "USER"));
  const [searchQuery, setSearchQuery] = useState("");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name?.includes(searchQuery) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone?.includes(searchQuery)
    );
  }, [users, searchQuery]);

  const getUserOrders = (userId: string): Order[] => {
    return mockOrders.filter((o) => o.userId === userId);
  };

  const getUserTotalSpent = (userId: string): number => {
    return mockOrders
      .filter((o) => o.userId === userId && o.status !== "CANCELLED" && o.status !== "REFUNDED")
      .reduce((sum, o) => sum + o.totalAmount, 0);
  };

  const openDetail = (user: User) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  const getInitials = (name: string | null): string => {
    if (!name) return "؟";
    return name.charAt(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">العملاء</h2>
          <p className="text-muted-foreground">
            إدارة حسابات العملاء ({filteredUsers.length} عميل)
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالاسم أو البريد أو الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">إجمالي العملاء</p>
              <p className="text-xl font-bold">{users.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">عملاء جدد (الشهر الماضي)</p>
              <p className="text-xl font-bold">3</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <span className="text-lg">💰</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">متوسط الإنفاق</p>
              <p className="text-xl font-bold">
                ر.س {Math.round(users.reduce((sum, u) => sum + getUserTotalSpent(u.id), 0) / users.length).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>العميل</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>الهاتف</TableHead>
                  <TableHead>الطلبات</TableHead>
                  <TableHead>إجمالي الإنفاق</TableHead>
                  <TableHead className="text-left">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const userOrders = getUserOrders(user.id);
                  const totalSpent = getUserTotalSpent(user.id);
                  return (
                    <TableRow key={user.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(user.createdAt).toLocaleDateString("ar-SA")}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm" dir="ltr">{user.email}</TableCell>
                      <TableCell className="text-sm" dir="ltr">{user.phone || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {userOrders.length} طلب
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        ر.س {totalSpent.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => openDetail(user)}
                        >
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

      {/* Customer Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>تفاصيل العميل</DialogTitle>
            <DialogDescription>عرض معلومات العميل وسجل طلباته</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">
                      {getInitials(selectedUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                    <p className="text-sm text-muted-foreground" dir="ltr">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span dir="ltr">{selectedUser.phone || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedUser.address || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span dir="ltr">{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>عضو منذ {new Date(selectedUser.createdAt).toLocaleDateString("ar-SA")}</span>
                  </div>
                </div>

                <Separator />

                {/* Customer Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold">{getUserOrders(selectedUser.id).length}</p>
                      <p className="text-xs text-muted-foreground">إجمالي الطلبات</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold">ر.س {getUserTotalSpent(selectedUser.id).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">إجمالي الإنفاق</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold">
                        {getUserOrders(selectedUser.id).length > 0
                          ? Math.round(
                              getUserTotalSpent(selectedUser.id) / getUserOrders(selectedUser.id).length
                            )
                          : 0}
                      </p>
                      <p className="text-xs text-muted-foreground">متوسط الطلب</p>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                {/* Order History */}
                <div>
                  <h4 className="text-base font-semibold mb-3">سجل الطلبات</h4>
                  <div className="space-y-2">
                    {getUserOrders(selectedUser.id).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <ShoppingBag className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{order.orderNumber}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString("ar-SA")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">
                            ر.س {order.totalAmount.toLocaleString()}
                          </span>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${orderStatusColors[order.status]}`}
                          >
                            {orderStatusLabels[order.status]}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {getUserOrders(selectedUser.id).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        لا توجد طلبات لهذا العميل
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
