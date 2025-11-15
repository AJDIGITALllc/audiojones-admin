// src/app/(protected)/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";
import { getAdminDashboardStats, listTenants, listTenantBookings } from "@/lib/api/admin";
import type { AdminDashboardStats, Tenant, AdminBookingSummary } from "@/lib/types";
import { TenantSelector } from "@/components/TenantSelector";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<AdminBookingSummary[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<AdminBookingSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, tenantsData] = await Promise.all([
          getAdminDashboardStats(),
          listTenants(),
        ]);

        setStats(statsData);
        setTenants(tenantsData);

        // Fetch bookings from all tenants
        if (tenantsData.length > 0) {
          const bookingsPromises = tenantsData.map((t) =>
            listTenantBookings(t.id)
          );
          const allBookings = (await Promise.all(bookingsPromises)).flat();

          // Filter upcoming (approved/in-progress)
          const upcoming = allBookings
            .filter(
              (b) =>
                (b.status === 'APPROVED' || b.status === 'IN_PROGRESS') &&
                new Date(b.startTime) > new Date()
            )
            .sort(
              (a, b) =>
                new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            )
            .slice(0, 5);

          // Filter pending
          const pending = allBookings
            .filter((b) => b.status === 'PENDING_ADMIN')
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

          setUpcomingBookings(upcoming);
          setPendingApprovals(pending);
        }
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  async function handleSignOut() {
    await signOut();
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-400">
              Multi-tenant management and oversight
            </p>
          </div>
          <div className="flex items-center gap-4">
            <TenantSelector />
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-gray-400 hover:text-white rounded-lg transition-colors border border-zinc-800"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 animate-pulse"
              >
                <div className="h-4 bg-zinc-700 rounded w-1/2 mb-4" />
                <div className="h-8 bg-zinc-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Active Tenants"
              value={stats.activeTenants.toString()}
              icon="🏢"
              color="primary"
            />
            <StatCard
              title="Upcoming Sessions"
              value={stats.upcomingSessionsCount.toString()}
              icon="📅"
              color="accent"
            />
            <StatCard
              title="Pending Approvals"
              value={stats.pendingApprovalsCount.toString()}
              icon="⏳"
              color="support"
            />
            <StatCard
              title="New Clients (7d)"
              value={stats.newClientsThisWeek.toString()}
              icon="👥"
              color="primary"
            />
          </div>
        ) : null}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Approval Queue */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Pending Approvals
              </h2>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-black rounded-xl p-4 animate-pulse"
                    >
                      <div className="h-4 bg-zinc-700 rounded w-2/3 mb-2" />
                      <div className="h-3 bg-zinc-700 rounded w-1/3" />
                    </div>
                  ))}
                </div>
              ) : pendingApprovals.length > 0 ? (
                <div className="space-y-4">
                  {pendingApprovals.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-black rounded-xl p-4 hover:bg-zinc-950 transition-colors cursor-pointer"
                      onClick={() =>
                        router.push(
                          `/tenants/${booking.tenantId}/bookings?id=${booking.id}`
                        )
                      }
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-medium mb-1">
                            {booking.serviceName}
                          </h3>
                          <p className="text-gray-400 text-sm mb-2">
                            {booking.clientName}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {new Date(booking.startTime).toLocaleDateString()} at{' '}
                            {new Date(booking.startTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 rounded-full text-xs font-medium">
                          Needs Approval
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No pending approvals
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Tenants */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                {tenants.map((tenant) => (
                  <button
                    key={tenant.id}
                    onClick={() => router.push(`/tenants/${tenant.id}/bookings`)}
                    className="w-full px-4 py-3 bg-black hover:bg-zinc-950 text-white rounded-lg font-medium transition-colors flex items-center gap-3 text-left"
                  >
                    <span className="text-2xl">🏢</span>
                    <span>Manage {tenant.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Upcoming Sessions
              </h2>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="bg-black rounded-xl p-3 animate-pulse"
                    >
                      <div className="h-3 bg-zinc-700 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-zinc-700 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : upcomingBookings.length > 0 ? (
                <div className="space-y-3">
                  {upcomingBookings.slice(0, 5).map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-black rounded-xl p-3 hover:bg-zinc-950 transition-colors cursor-pointer"
                      onClick={() =>
                        router.push(
                          `/tenants/${booking.tenantId}/bookings?id=${booking.id}`
                        )
                      }
                    >
                      <p className="text-white text-sm font-medium mb-1">
                        {booking.serviceName}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {new Date(booking.startTime).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400 text-sm">
                  No upcoming sessions
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: string;
  color: 'primary' | 'accent' | 'support';
}) {
  const colorClasses = {
    primary: 'bg-[#FF4500]/10 text-[#FF4500]',
    accent: 'bg-[#FFD700]/10 text-[#FFD700]',
    support: 'bg-[#008080]/10 text-[#008080]',
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-400 text-sm font-medium">{title}</span>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${colorClasses[color]}`}
        >
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </div>
  );
}
