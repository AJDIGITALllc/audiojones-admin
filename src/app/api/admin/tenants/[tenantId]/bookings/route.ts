// src/app/api/admin/tenants/[tenantId]/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import type { AdminBookingSummary } from '@/lib/types';
import { logError } from '@/lib/log';

// Removed mock data - using Firestore
const _mockBookings_removed: AdminBookingSummary[] = [
  {
    id: 'booking-admin-1',
    tenantId: 'tenant-audiojones',
    clientId: 'client-1',
    clientName: 'Marcus Williams',
    clientAvatarUrl: undefined,
    serviceId: 'svc-mixing',
    serviceName: 'Professional Mixing',
    startTime: new Date(Date.now() + 86400000 * 2).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 2 + 7200000).toISOString(),
    status: 'APPROVED',
    source: 'CLIENT_PORTAL',
    approvalRequired: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'booking-admin-2',
    tenantId: 'tenant-audiojones',
    clientId: 'client-2',
    clientName: 'Sarah Chen',
    clientAvatarUrl: undefined,
    serviceId: 'svc-mastering',
    serviceName: 'Mastering Session',
    startTime: new Date(Date.now() + 86400000 * 5).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 5 + 3600000).toISOString(),
    status: 'PENDING_ADMIN',
    source: 'CLIENT_PORTAL',
    approvalRequired: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'booking-admin-3',
    tenantId: 'tenant-audiojones',
    clientId: 'client-3',
    clientName: 'DJ TechFlow',
    clientAvatarUrl: undefined,
    serviceId: 'svc-consultation',
    serviceName: 'Strategy Consultation',
    startTime: new Date(Date.now() + 86400000 * 7).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 7 + 3600000).toISOString(),
    status: 'PENDING_ADMIN',
    source: 'CLIENT_PORTAL',
    approvalRequired: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'booking-admin-4',
    tenantId: 'tenant-audiojones',
    clientId: 'client-4',
    clientName: 'Indie Records LLC',
    clientAvatarUrl: undefined,
    serviceId: 'svc-production',
    serviceName: 'Beat Production',
    startTime: new Date(Date.now() - 86400000 * 14).toISOString(),
    endTime: new Date(Date.now() - 86400000 * 14 + 10800000).toISOString(),
    status: 'COMPLETED',
    source: 'MANUAL_ENTRY',
    approvalRequired: false,
    createdAt: new Date(Date.now() - 86400000 * 21).toISOString(),
  },
  {
    id: 'booking-admin-5',
    tenantId: 'tenant-audiojones',
    clientId: 'client-1',
    clientName: 'Marcus Williams',
    clientAvatarUrl: undefined,
    serviceId: 'svc-mixing',
    serviceName: 'Professional Mixing',
    startTime: new Date(Date.now() - 86400000).toISOString(),
    endTime: new Date(Date.now() - 86400000 + 7200000).toISOString(),
    status: 'IN_PROGRESS',
    source: 'CLIENT_PORTAL',
    approvalRequired: true,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const { searchParams } = request.nextUrl;
    const statusFilter = searchParams.get('status');

    // Build Firestore query
    let q = query(
      collection(db, 'bookings'),
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    let bookings: AdminBookingSummary[] = [];

    // Get user and service names for each booking
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Fetch user name
      const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', data.userId)));
      const userName = userDoc.docs[0]?.data()?.displayName || 'Unknown User';
      
      // Fetch service name
      const serviceDoc = await getDocs(query(collection(db, 'services'), where('__name__', '==', data.serviceId)));
      const serviceName = serviceDoc.docs[0]?.data()?.name || 'Unknown Service';

      const booking: AdminBookingSummary = {
        id: doc.id,
        tenantId: data.tenantId,
        clientId: data.userId,
        clientName: userName,
        clientAvatarUrl: undefined,
        serviceId: data.serviceId,
        serviceName: serviceName,
        startTime: data.startTime?.toDate?.()?.toISOString() || data.scheduledAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        endTime: data.endTime?.toDate?.()?.toISOString() || new Date().toISOString(),
        status: data.status?.toUpperCase() || 'PENDING',
        source: 'CLIENT_PORTAL',
        approvalRequired: true,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };

      bookings.push(booking);
    }

    // Filter by status if provided
    if (statusFilter) {
      bookings = bookings.filter((b) => b.status === statusFilter.toUpperCase());
    }

    return NextResponse.json(bookings);
  } catch (error) {
    logError('api/admin/tenants/[tenantId]/bookings GET', error, {
      url: request.url,
      method: 'GET',
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
