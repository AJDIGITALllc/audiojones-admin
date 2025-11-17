"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { modules } from "@/config/modules";
import Link from "next/link";

interface ModuleStats {
  moduleId: string;
  bookingCount: number;
  activeClients: number;
  pendingPayment: number;
  totalRevenue: number;
  whopBackedCount: number;
}

export default function ModulesPage() {
  const { selectedTenantId, tenants } = useAdmin();
  const [moduleStats, setModuleStats] = useState<ModuleStats[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedTenant = tenants.find(t => t.id === selectedTenantId);

  useEffect(() => {
    async function loadModuleStats() {
      if (!selectedTenant) {
        setLoading(false);
        return;
      }

      try {
        // In production, fetch from API
        // For now, use mock data

        const stats: ModuleStats[] = modules.map((module) => ({
          moduleId: module.id,
          bookingCount: Math.floor(Math.random() * 20) + 5,
          activeClients: Math.floor(Math.random() * 10) + 2,
          pendingPayment: Math.floor(Math.random() * 3),
          totalRevenue: Math.floor(Math.random() * 10000) + 1000,
          whopBackedCount: Math.floor(Math.random() * 5),
        }));

        setModuleStats(stats);
      } catch (error) {
        console.error("Failed to load module stats:", error);
      } finally {
        setLoading(false);
      }
    }

    loadModuleStats();
  }, [selectedTenant, selectedTenantId, tenants]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!selectedTenant) {
    return (
      <div className="p-8">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
          <p className="text-yellow-400">
            Please select a tenant to view module analytics
          </p>
        </div>
      </div>
    );
  }

  const totalBookings = moduleStats.reduce((sum, s) => sum + s.bookingCount, 0);
  const totalRevenue = moduleStats.reduce((sum, s) => sum + s.totalRevenue, 0);
  const totalWhopBacked = moduleStats.reduce((sum, s) => sum + s.whopBackedCount, 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">System Modules</h1>
        <p className="text-gray-400">
          Analytics and performance across all modules for {selectedTenant.name}
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded border border-purple-500/30">
            {totalWhopBacked} Whop-backed services tracked
          </div>
          <p className="text-gray-500">
            Full sync handled by sync-whop-services script
          </p>
        </div>
      </div>

      {/* Module Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {modules.map((module) => {
          const stats = moduleStats.find((s) => s.moduleId === module.id);
          if (!stats) return null;

          return (
            <div
              key={module.id}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <span className="text-4xl">{module.icon}</span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {module.name}
                  </h3>
                  <p className="text-gray-400 text-sm">{module.description}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-2xl font-bold text-white">
                    {stats.bookingCount}
                  </div>
                  <div className="text-gray-400 text-xs">Bookings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {stats.activeClients}
                  </div>
                  <div className="text-gray-400 text-xs">Active Clients</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">
                    {stats.pendingPayment}
                  </div>
                  <div className="text-gray-400 text-xs">Pending Payment</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    ${(stats.totalRevenue / 100).toFixed(0)}
                  </div>
                  <div className="text-gray-400 text-xs">Revenue (Completed)</div>
                </div>
              </div>

              {/* Whop Badge */}
              {stats.whopBackedCount > 0 && (
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                      Whop
                    </span>
                    <span className="text-gray-400">
                      {stats.whopBackedCount} Whop-backed services
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-border flex gap-2">
                <Link
                  href={`/bookings?module=${module.id}`}
                  className="px-3 py-2 bg-background border border-border text-white text-sm rounded hover:border-primary/50 transition-colors"
                >
                  View Bookings
                </Link>
                <Link
                  href={`/services?module=${module.id}`}
                  className="px-3 py-2 bg-background border border-border text-white text-sm rounded hover:border-primary/50 transition-colors"
                >
                  Services
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-3xl font-bold text-white mb-1">
            {totalBookings}
          </div>
          <div className="text-gray-400 text-sm">Total Bookings</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-3xl font-bold text-green-400 mb-1">
            ${(totalRevenue / 100).toFixed(0)}
          </div>
          <div className="text-gray-400 text-sm">Total Revenue</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-3xl font-bold text-purple-400 mb-1">
            {totalWhopBacked}
          </div>
          <div className="text-gray-400 text-sm">Whop Services</div>
        </div>
      </div>
    </div>
  );
}
