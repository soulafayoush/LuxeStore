"use client";

import React from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  Users,
  Settings,
  Store,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { AdminPage } from "@/lib/types";

interface AdminSidebarProps {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  isOpen: boolean;
  onClose: () => void;
}

const navItems: { id: AdminPage; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { id: "products", label: "المنتجات", icon: Package },
  { id: "orders", label: "الطلبات", icon: ShoppingCart },
  { id: "categories", label: "التصنيفات", icon: FolderTree },
  { id: "customers", label: "العملاء", icon: Users },
  { id: "settings", label: "الإعدادات", icon: Settings },
];

export function AdminSidebar({ currentPage, onNavigate, isOpen, onClose }: AdminSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 right-0 z-50 w-72 bg-card border-l border-border
          transform transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:z-auto
          ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Store className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold">LUXE Store</h1>
                <p className="text-xs text-muted-foreground">لوحة التحكم</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <Separator />

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                      transition-all duration-200
                      ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 px-2">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">م</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">مدير المتجر</p>
                <p className="text-xs text-muted-foreground truncate">admin@luxestore.sa</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
