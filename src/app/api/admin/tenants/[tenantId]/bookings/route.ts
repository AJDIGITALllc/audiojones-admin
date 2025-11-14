// src/app/api/admin/tenants/[tenantId]/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { AdminBookingSummary } from '@/lib/types';

const mockBookings: AdminBookingSummary[] = [
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
  const { tenantId } = await params;
  const { searchParams } = request.nextUrl;
  const status = searchParams.get('status');

  let filtered = mockBookings.filter((b) => b.tenantId === tenantId);

  if (status) {
    filtered = filtered.filter((b) => b.status === status);
  }

  return NextResponse.json(filtered);
}
