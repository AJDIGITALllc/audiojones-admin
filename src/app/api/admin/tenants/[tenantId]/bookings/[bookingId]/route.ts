// src/app/api/admin/tenants/[tenantId]/bookings/[bookingId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import type { AdminBookingDetail } from '@/lib/types';

// Removed mock data - using Firestore
const _mockBookingDetails_removed: AdminBookingDetail[] = [
  {
    id: 'booking-admin-1',
    tenantId: 'tenant-audiojones',
    clientId: 'client-1',
    clientName: 'Marcus Williams',
    serviceId: 'svc-mixing',
    serviceName: 'Professional Mixing',
    startTime: new Date(Date.now() + 86400000 * 2).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 2 + 7200000).toISOString(),
    status: 'APPROVED',
    source: 'CLIENT_PORTAL',
    approvalRequired: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    priceCents: 50000,
    notesFromClient: 'Looking for a professional mix on my latest single. I have stems ready.',
    internalNotes: 'Client prefers warm analog sound. Use LA-2A on vocals.',
    intakeAnswers: {
      genre: 'Hip-Hop / R&B',
      trackCount: '8 stems',
      deadline: 'ASAP',
    },
    assets: [],
    timeline: [
      {
        id: 'timeline-1',
        label: 'Booking Created',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        actorLabel: 'Marcus Williams',
        type: 'BOOKING_CREATED',
      },
      {
        id: 'timeline-2',
        label: 'Approved by Admin',
        description: 'Assigned to Lead Engineer',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        actorLabel: 'System',
        type: 'APPROVED',
      },
    ],
  },
  {
    id: 'booking-admin-2',
    tenantId: 'tenant-audiojones',
    clientId: 'client-2',
    clientName: 'Sarah Chen',
    serviceId: 'svc-mastering',
    serviceName: 'Mastering Session',
    startTime: new Date(Date.now() + 86400000 * 5).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 5 + 3600000).toISOString(),
    status: 'PENDING_ADMIN',
    source: 'CLIENT_PORTAL',
    approvalRequired: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    priceCents: 30000,
    notesFromClient: 'Final mastering for my EP. Need it to sound competitive on streaming.',
    intakeAnswers: {
      trackCount: '5 tracks',
      hasReferences: 'Yes',
    },
    assets: [],
    timeline: [
      {
        id: 'timeline-1',
        label: 'Booking Created',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        actorLabel: 'Sarah Chen',
        type: 'BOOKING_CREATED',
      },
    ],
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string; bookingId: string }> }
) {
  try {
    const { tenantId, bookingId } = await params;
    
    // Fetch booking document
    const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
    
    if (!bookingDoc.exists()) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const data = bookingDoc.data();
    
    // Verify tenant ownership
    if (data.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Fetch user name
    const userQuery = query(collection(db, 'users'), where('uid', '==', data.userId));
    const userSnapshot = await getDocs(userQuery);
    const userName = userSnapshot.docs[0]?.data()?.displayName || 'Unknown User';

    // Fetch service details
    const serviceDoc = await getDoc(doc(db, 'services', data.serviceId));
    const serviceName = serviceDoc.data()?.name || 'Unknown Service';
    const servicePrice = serviceDoc.data()?.basePrice || 0;

    // Build detailed booking response
    const booking: AdminBookingDetail = {
      id: bookingDoc.id,
      tenantId: data.tenantId,
      clientId: data.userId,
      clientName: userName,
      serviceId: data.serviceId,
      serviceName: serviceName,
      startTime: data.startTime?.toDate?.()?.toISOString() || data.scheduledAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      endTime: data.endTime?.toDate?.()?.toISOString() || new Date().toISOString(),
      status: data.status?.toUpperCase() || 'PENDING',
      source: 'CLIENT_PORTAL',
      approvalRequired: true,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      priceCents: data.priceCents || servicePrice || 0,
      notesFromClient: data.notes || '',
      internalNotes: data.internalNotes || '',
      intakeAnswers: data.intakeAnswers || {},
      assets: [],
      timeline: [
        {
          id: 'timeline-1',
          label: 'Booking Created',
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          actorLabel: userName,
          type: 'BOOKING_CREATED',
        },
      ],
    };

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error fetching booking detail:', error);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}
