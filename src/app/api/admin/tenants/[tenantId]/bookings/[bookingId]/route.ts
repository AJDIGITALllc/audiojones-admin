// src/app/api/admin/tenants/[tenantId]/bookings/[bookingId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { AdminBookingDetail } from '@/lib/types';

const mockBookingDetails: AdminBookingDetail[] = [
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
  const { tenantId, bookingId } = await params;
  const booking = mockBookingDetails.find(
    (b) => b.id === bookingId && b.tenantId === tenantId
  );

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  return NextResponse.json(booking);
}
