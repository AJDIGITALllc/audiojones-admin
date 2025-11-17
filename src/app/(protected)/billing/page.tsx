"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Booking, Service, PaymentStatus, BillingProvider } from "@/lib/types/firestore";
import EmptyState from "@/components/EmptyState";

interface BookingRow {
  id: string;
  tenantId: string;
  userId: string;
  serviceName: string | null;
  paymentStatus: PaymentStatus;
  paymentProvider: BillingProvider;
  createdAt: string;
}

export default function BillingPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");
  const [providerFilter, setProviderFilter] = useState<BillingProvider | "all">("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      setLoading(true);

      // Fetch bookings with basic ordering
      const bookingsQuery = query(
        collection(db, "bookings"),
        orderBy("createdAt", "desc")
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      
      const bookingsData: Booking[] = [];
      bookingsSnapshot.forEach((doc) => {
        bookingsData.push({ id: doc.id, ...doc.data() } as Booking);
      });

      // Fetch services for names
      const servicesSnapshot = await getDocs(collection(db, "services"));
      const servicesMap = new Map<string, string>();
      servicesSnapshot.forEach((doc) => {
        const service = doc.data() as Service;
        servicesMap.set(doc.id, service.name);
      });

      // Map bookings to rows
      const rows: BookingRow[] = bookingsData.map((booking) => ({
        id: booking.id,
        tenantId: booking.tenantId,
        userId: booking.userId,
        serviceName: servicesMap.get(booking.serviceId) || null,
        paymentStatus: booking.paymentStatus || "unpaid",
        paymentProvider: booking.paymentProvider || "none",
        createdAt: booking.createdAt
          ? new Date(booking.createdAt.seconds * 1000).toLocaleDateString()
          : "N/A",
      }));

      setBookings(rows);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    if (statusFilter !== "all" && booking.paymentStatus !== statusFilter) return false;
    if (providerFilter !== "all" && booking.paymentProvider !== providerFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Billing & Payments</h1>
        <p className="text-gray-400 mt-1">
          Track payment status for all bookings
        </p>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-lg p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | "all")}
            className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="all">All</option>
            <option value="unpaid">Unpaid</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Provider:</label>
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value as BillingProvider | "all")}
            className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="all">All</option>
            <option value="none">None</option>
            <option value="whop">Whop</option>
            <option value="stripe">Stripe</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        <button
          onClick={() => {
            setStatusFilter("all");
            setProviderFilter("all");
          }}
          className="ml-auto px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-white text-sm transition-colors"
        >
          Clear Filters
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-gray-900 rounded-lg p-12 text-center">
          <p className="text-gray-400">Loading billing data...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          title={bookings.length === 0 ? "No Bookings Yet" : "No Matching Bookings"}
          description={
            bookings.length === 0
              ? "Billing information will appear here once clients create bookings."
              : "Try adjusting your filters to see more results."
          }
          action={
            bookings.length > 0
              ? {
                  label: "Clear Filters",
                  onClick: () => {
                    setStatusFilter("all");
                    setProviderFilter("all");
                  },
                }
              : undefined
          }
        />
      ) : (
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Tenant ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-400">
                      {booking.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-400">
                      {booking.tenantId.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-400">
                      {booking.userId.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3 text-sm text-white">
                      {booking.serviceName || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          booking.paymentStatus === "paid"
                            ? "bg-green-500/10 text-green-500"
                            : booking.paymentStatus === "pending"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : booking.paymentStatus === "refunded"
                            ? "bg-gray-500/10 text-gray-400"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {booking.paymentProvider}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {booking.createdAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary */}
      {!loading && filteredBookings.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-4">
          <p className="text-sm text-gray-400">
            Showing <span className="text-white font-medium">{filteredBookings.length}</span>{" "}
            of <span className="text-white font-medium">{bookings.length}</span> total bookings
          </p>
        </div>
      )}
    </div>
  );
}
