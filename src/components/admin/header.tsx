"use client";

import React from "react";
import { Menu, Search, Bell, Moon, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import type { AdminPage } from "@/lib/types";

const pageTitles: Record<AdminPage, string> = {
  dashboard: "لوحة التحكم",
  products: "إدارة المنتجات",
  orders: "إدارة الطلبات",
  categories: "إدارة التصنيفات",
  customers: "إدارة العملاء",
  settings: "الإعدادات",
};

interface AdminHeaderProps {
  currentPage: AdminPage;
  onMenuClick: () => void;
}

export function AdminHeader({ currentPage, onMenuClick }: AdminHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-30 bg-card border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Right side: Menu button and title */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-semibold hidden sm:block">
            {pageTitles[currentPage]}
          </h2>
        </div>

        {/* Left side: Search, notifications, theme, profile */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="بحث..."
              className="w-64 pr-9 h-9"
            />
          </div>

          {/* Theme toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
          )}

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                <Bell className="w-4 h-4" />
                <Badge className="absolute -top-1 -left-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>الإشعارات</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                <span className="text-sm font-medium">طلب جديد #ORD-2024-0010</span>
                <span className="text-xs text-muted-foreground">منذ 5 دقائق</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                <span className="text-sm font-medium">تنبيه: مخزون منخفض لمنتج "ساعة ذكية"</span>
                <span className="text-xs text-muted-foreground">منذ ساعة</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                <span className="text-sm font-medium">تقييم جديد 5 نجوم على "قميص رجالي فاخر"</span>
                <span className="text-xs text-muted-foreground">منذ 3 ساعات</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">م</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>حسابي</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="w-4 h-4 ml-2" />
                الملف الشخصي
              </DropdownMenuItem>
              <DropdownMenuItem>الإعدادات</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>تسجيل الخروج</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
