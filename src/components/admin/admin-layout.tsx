"use client";

import React, { useState } from "react";
import { AdminSidebar } from "./sidebar";
import { AdminHeader } from "./header";
import { DashboardOverview } from "./dashboard-overview";
import { ProductsManagement } from "./products-management";
import { OrdersManagement } from "./orders-management";
import { CategoriesManagement } from "./categories-management";
import { CustomersManagement } from "./customers-management";
import { SettingsPage } from "./settings-page";
import type { AdminPage } from "@/lib/types";

export function AdminLayout() {
  const [currentPage, setCurrentPage] = useState<AdminPage>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardOverview />;
      case "products":
        return <ProductsManagement />;
      case "orders":
        return <OrdersManagement />;
      case "categories":
        return <CategoriesManagement />;
      case "customers":
        return <CustomersManagement />;
      case "settings":
        return <SettingsPage />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <AdminSidebar
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          setSidebarOpen(false);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <AdminHeader
          currentPage={currentPage}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
