"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { listTenantBookings, getBookingDetail, getTenant } from "@/lib/api/admin";
import type { AdminBookingSummary, AdminBookingDetail, Tenant, BookingStatus } from "@/lib/types";
import { getModulePlaybook, getBookingFunnelStage } from "@/lib/playbooks-local";

const statusFilters = [
  { value: "ALL", label: "All" },
  { value: "PENDING_ADMIN", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELED", label: "Canceled" },
];

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-500/20 text-gray-400 border-gray-500/50",
  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  PENDING_ADMIN: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  APPROVED: "bg-green-500/20 text-green-400 border-green-500/50",
  IN_PROGRESS: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  COMPLETED: "bg-[#FF4500]/20 text-[#FF4500] border-[#FF4500]/50",
  CANCELED: "bg-red-500/20 text-red-400 border-red-500/50",
  DECLINED: "bg-red-500/20 text-red-400 border-red-500/50",
};

export default function TenantBookingsPage() {
  const params = useParams<{ tenantId: string }>();
  const searchParams = useSearchParams();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [bookings, setBookings] = useState<AdminBookingSummary[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<AdminBookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const data = await getTenant(params.tenantId);
        setTenant(data);
      } catch (err) {
        console.error('Failed to load tenant:', err);
      }
    };

    fetchTenant();
  }, [params.tenantId]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const filterParams = statusFilter !== "ALL" ? { status: statusFilter as BookingStatus } : undefined;
        const data = await listTenantBookings(params.tenantId, filterParams);
        setBookings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [params.tenantId, statusFilter]);

  // Handle deep link to specific booking
  useEffect(() => {
    const bookingId = searchParams.get('id');
    if (bookingId && bookings.length > 0) {
      handleBookingClick(bookingId);
    }
  }, [searchParams, bookings]);

  const handleBookingClick = async (bookingId: string) => {
    try {
      setDetailLoading(true);
      const detail = await getBookingDetail(params.tenantId, bookingId);
      setSelectedBooking(detail);
    } catch (err) {
      console.error("Failed to load booking detail:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {tenant ? `${tenant.name} - Bookings` : 'Bookings'}
          </h1>
          <p className="text-gray-400">Manage and approve client bookings</p>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === filter.value
                  ? "bg-[#FF4500] text-white"
                  : "bg-zinc-900 border border-zinc-800 text-gray-400 hover:bg-zinc-800"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Bookings Table */}
        {loading ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-zinc-800 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
            <p className="text-gray-400 text-lg">No bookings found</p>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Source
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      onClick={() => handleBookingClick(booking.id)}
                      className="hover:bg-zinc-950 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-sm font-medium text-white">
                            {booking.clientName.charAt(0)}
                          </div>
                          <span className="ml-3 text-white font-medium">
                            {booking.clientName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white">{booking.serviceName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white text-sm">
                          {new Date(booking.startTime).toLocaleDateString()}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {new Date(booking.startTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            statusColors[booking.status]
                          }`}
                        >
                          {booking.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-400 text-sm">
                          {booking.source.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Booking Detail Drawer */}
      {selectedBooking && (
        <BookingDetailDrawer
          booking={selectedBooking}
          loading={detailLoading}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}

function BookingDetailDrawer({
  booking,
  loading,
  onClose,
}: {
  booking: AdminBookingDetail;
  loading: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full md:w-[600px] bg-zinc-900 z-50 overflow-y-auto border-l border-zinc-800">
        {loading ? (
          <div className="p-8 space-y-4">
            <div className="h-8 bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 bg-zinc-800 rounded animate-pulse" />
          </div>
        ) : (
          <div className="p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {booking.serviceName}
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    statusColors[booking.status]
                  }`}
                >
                  {booking.status.replace(/_/g, ' ')}
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div className="bg-black border border-zinc-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400 mb-1">Client</h4>
                <p className="text-white text-lg">{booking.clientName}</p>
              </div>

              <div className="bg-black border border-zinc-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400 mb-1">
                  Booking ID
                </h4>
                <p className="text-white font-mono text-sm">{booking.id}</p>
              </div>

              <div className="bg-black border border-zinc-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400 mb-1">
                  Scheduled Time
                </h4>
                <p className="text-white">
                  {new Date(booking.startTime).toLocaleString()}
                </p>
              </div>

              {booking.priceCents && (
                <div className="bg-black border border-zinc-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Price</h4>
                  <p className="text-white text-xl font-semibold">
                    ${(booking.priceCents / 100).toFixed(2)}
                  </p>
                </div>
              )}

              {booking.notesFromClient && (
                <div className="bg-black border border-zinc-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">
                    Client Notes
                  </h4>
                  <p className="text-white">{booking.notesFromClient}</p>
                </div>
              )}

              {booking.internalNotes && (
                <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-yellow-400 mb-2">
                    Internal Notes
                  </h4>
                  <p className="text-white">{booking.internalNotes}</p>
                </div>
              )}

              {Object.keys(booking.intakeAnswers).length > 0 && (
                <div className="bg-black border border-zinc-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">
                    Intake Answers
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(booking.intakeAnswers).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-gray-400 text-xs uppercase tracking-wide">
                          {key}
                        </p>
                        <p className="text-white text-sm">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {booking.timeline && booking.timeline.length > 0 && (
                <div className="bg-black border border-zinc-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-4">
                    Timeline
                  </h4>
                  <div className="space-y-4">
                    {booking.timeline.map((event, idx) => (
                      <div key={event.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-[#FF4500]" />
                          {idx < booking.timeline.length - 1 && (
                            <div className="w-px h-full bg-zinc-800 mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-white text-sm font-medium">
                            {event.label}
                          </p>
                          {event.description && (
                            <p className="text-gray-400 text-xs mt-1">
                              {event.description}
                            </p>
                          )}
                          <p className="text-gray-500 text-xs mt-1">
                            {new Date(event.createdAt).toLocaleString()} •{' '}
                            {event.actorLabel}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Module Ops Notes */}
              {(() => {
                const funnelStage = getBookingFunnelStage(booking.status as any);
                const moduleId = booking.serviceName.toLowerCase().includes('ai') 
                  ? 'ai-optimization'
                  : booking.serviceName.toLowerCase().includes('data')
                  ? 'data-intelligence'
                  : booking.serviceName.toLowerCase().includes('market')
                  ? 'marketing-automation'
                  : 'client-delivery';
                const playbook = getModulePlaybook(moduleId);
                
                if (!playbook) return null;

                return (
                  <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-400 mb-3">
                      📋 Module Ops Notes: {playbook.name}
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-blue-300 uppercase tracking-wide mb-2">
                          Should Achieve (During Delivery)
                        </p>
                        <ul className="space-y-1">
                          {playbook.opsChecks.shouldAchieve.map((check, idx) => (
                            <li key={idx} className="text-sm text-white flex items-start gap-2">
                              <span className="text-blue-400 mt-0.5">•</span>
                              <span>{check}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-green-300 uppercase tracking-wide mb-2">
                          Verify Post-Delivery
                        </p>
                        <ul className="space-y-1">
                          {playbook.opsChecks.verifyPostDelivery.map((check, idx) => (
                            <li key={idx} className="text-sm text-white flex items-start gap-2">
                              <span className="text-green-400 mt-0.5">•</span>
                              <span>{check}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="pt-2 border-t border-blue-500/30">
                        <p className="text-xs text-gray-400">
                          Funnel Stage: <span className="text-blue-300">{funnelStage || 'Unknown'}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Actions */}
            {booking.status === 'PENDING_ADMIN' && (
              <div className="mt-8 flex gap-3">
                <button className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                  Approve
                </button>
                <button className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                  Decline
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
