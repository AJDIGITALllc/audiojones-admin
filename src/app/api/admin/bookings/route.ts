// src/app/api/admin/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { AdminBookingSummary } from '@/lib/types';

const mockBookings: AdminBookingSummary[] = [
  {
    id: 'booking-1',
    tenantId: 'tenant-audiojones',
    clientId: 'client-1',
    clientName: 'Marcus Williams',
    clientAvatarUrl: undefined,
    serviceId: 'svc-mixing',
    serviceName: 'Professional Mixing',
    startTime: new Date(Date.now() + 86400000 * 2).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 2 + 7200000).toISOString(),
    status: 'PENDING_ADMIN',
    source: 'CLIENT_PORTAL',
    approvalRequired: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'booking-2',
    tenantId: 'tenant-audiojones',
    clientId: 'client-2',
    clientName: 'Sarah Chen',
    clientAvatarUrl: undefined,
    serviceId: 'svc-consultation',
    serviceName: 'Strategy Consultation',
    startTime: new Date(Date.now() + 86400000 * 5).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 5 + 3600000).toISOString(),
    status: 'APPROVED',
    source: 'CLIENT_PORTAL',
    approvalRequired: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'booking-3',
    tenantId: 'tenant-artisthub',
    clientId: 'client-3',
    clientName: 'David Rodriguez',
    clientAvatarUrl: undefined,
    serviceId: 'svc-production',
    serviceName: 'Beat Production',
    startTime: new Date(Date.now() + 86400000).toISOString(),
    endTime: new Date(Date.now() + 86400000 + 10800000).toISOString(),
    status: 'IN_PROGRESS',
    source: 'MANUAL_ENTRY',
    approvalRequired: false,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'booking-4',
    tenantId: 'tenant-audiojones',
    clientId: 'client-4',
    clientName: 'Lisa Thompson',
    clientAvatarUrl: undefined,
    serviceId: 'svc-mastering',
    serviceName: 'Mastering Session',
    startTime: new Date(Date.now() + 86400000 * 7).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 7 + 3600000).toISOString(),
    status: 'PENDING_ADMIN',
    source: 'CLIENT_PORTAL',
    approvalRequired: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'booking-5',
    tenantId: 'tenant-smb-demo',
    clientId: 'client-5',
    clientName: 'Tech Startup Inc',
    clientAvatarUrl: undefined,
    serviceId: 'svc-podcast',
    serviceName: 'Podcast Production',
    startTime: new Date(Date.now() + 86400000 * 3).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 3 + 7200000).toISOString(),
    status: 'APPROVED',
    source: 'WHOP',
    approvalRequired: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const status = searchParams.get('status');
  const limit = searchParams.get('limit');

  let filtered = mockBookings;

  if (status) {
    filtered = filtered.filter((b) => b.status === status);
  }

  if (limit) {
    filtered = filtered.slice(0, parseInt(limit));
  }

  return NextResponse.json(filtered);
}
