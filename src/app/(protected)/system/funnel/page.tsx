"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/contexts/AdminContext";
import { loadFunnelMap, getCadenceTasks } from "@/lib/playbooks-local";
import Link from "next/link";

interface FunnelStage {
  id: string;
  name: string;
  count: number;
  statuses: string[];
}

interface StuckBooking {
  id: string;
  serviceName: string;
  status: string;
  createdAt: string;
  daysStuck: number;
}

export default function FunnelViewPage() {
  const { selectedTenantId, tenants } = useAdmin();
  const [stages, setStages] = useState<FunnelStage[]>([]);
  const [stuckBookings, setStuckBookings] = useState<StuckBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedTenant = tenants.find(t => t.id === selectedTenantId);

  useEffect(() => {
    async function loadFunnelData() {
      if (!selectedTenant) {
        setLoading(false);
        return;
      }

      try {
        // Fetch bookings for the selected tenant
        // In production, this would be a proper API endpoint
        // For now, we'll use mock data structure

        // Define funnel stages
        const funnelStages: FunnelStage[] = [
          {
            id: "lead",
            name: "Lead / Discovery",
            count: 0,
            statuses: ["draft"],
          },
          {
            id: "booked",
            name: "Booked Session",
            count: 0,
            statuses: ["pending"],
          },
          {
            id: "delivery",
            name: "In Delivery",
            count: 0,
            statuses: ["approved", "in_progress"],
          },
          {
            id: "payment",
            name: "Awaiting Payment",
            count: 0,
            statuses: ["pending_payment"],
          },
          {
            id: "completed",
            name: "Completed / Retained",
            count: 0,
            statuses: ["completed"],
          },
        ];

        // Mock data - in production, fetch from API
        // For now, set placeholder counts
        funnelStages[0].count = 3;
        funnelStages[1].count = 5;
        funnelStages[2].count = 8;
        funnelStages[3].count = 2;
        funnelStages[4].count = 15;

        setStages(funnelStages);

        // Mock stuck bookings
        const stuck: StuckBooking[] = [
          {
            id: "1",
            serviceName: "Podcast Production",
            status: "pending_payment",
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            daysStuck: 10,
          },
          {
            id: "2",
            serviceName: "Marketing Strategy",
            status: "draft",
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            daysStuck: 14,
          },
        ];

        setStuckBookings(stuck);
      } catch (error) {
        console.error("Failed to load funnel data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadFunnelData();
  }, [selectedTenant, selectedTenantId, tenants]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!selectedTenant) {
    return (
      <div className="p-8">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
          <p className="text-yellow-400">
            Please select a tenant to view funnel data
          </p>
        </div>
      </div>
    );
  }

  const totalBookings = stages.reduce((sum, stage) => sum + stage.count, 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Funnel View</h1>
        <p className="text-gray-400">
          Customer journey visualization for {selectedTenant.name}
        </p>
      </div>

      {/* Funnel Stages */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-6">Pipeline Stages</h2>

        <div className="space-y-4">
          {stages.map((stage, index) => {
            const percentage =
              totalBookings > 0 ? (stage.count / totalBookings) * 100 : 0;

            return (
              <div key={stage.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-white">
                      {index + 1}
                    </span>
                    <h3 className="font-medium text-white">{stage.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-white">
                      {stage.count}
                    </span>
                    <span className="text-sm text-gray-400 ml-2">
                      ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-8 bg-background rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Statuses */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {stage.statuses.map((status) => (
                    <span
                      key={status}
                      className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                    >
                      {status.replace("_", " ")}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stuck Items Alert */}
      {stuckBookings.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-red-400 mb-2">
                ⚠️ Stuck Items ({stuckBookings.length})
              </h2>
              <p className="text-gray-400 text-sm">
                Bookings that haven't progressed in 7+ days
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {stuckBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-card border border-red-500/20 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-white mb-1">
                      {booking.serviceName}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Status: {booking.status.replace("_", " ")} • Stuck for{" "}
                      {booking.daysStuck} days
                    </p>
                  </div>
                  <Link
                    href={`/bookings?id=${booking.id}`}
                    className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary/80 transition-colors"
                  >
                    Review →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-3xl font-bold text-white mb-1">
            {totalBookings}
          </div>
          <div className="text-gray-400 text-sm">Total in Pipeline</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-3xl font-bold text-green-400 mb-1">
            {stages[4]?.count || 0}
          </div>
          <div className="text-gray-400 text-sm">Completed</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-3xl font-bold text-purple-400 mb-1">
            {stages[3]?.count || 0}
          </div>
          <div className="text-gray-400 text-sm">Awaiting Payment</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-3xl font-bold text-red-400 mb-1">
            {stuckBookings.length}
          </div>
          <div className="text-gray-400 text-sm">Needs Attention</div>
        </div>
      </div>

      {/* Governance Cadence */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Governance Cadence</h2>
        <p className="text-gray-400 text-sm mb-6">
          Operational rituals to keep the funnel healthy
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Weekly */}
          <div>
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">
              Weekly
            </h3>
            <ul className="space-y-2">
              {getCadenceTasks("weekly").map((task, index) => (
                <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Monthly */}
          <div>
            <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wide mb-3">
              Monthly
            </h3>
            <ul className="space-y-2">
              {getCadenceTasks("monthly").map((task, index) => (
                <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quarterly */}
          <div>
            <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wide mb-3">
              Quarterly
            </h3>
            <ul className="space-y-2">
              {getCadenceTasks("quarterly").map((task, index) => (
                <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
