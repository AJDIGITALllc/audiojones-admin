// src/lib/api/admin.ts
import type {
  Tenant,
  AdminBookingSummary,
  AdminBookingDetail,
  BookingStatus,
  AssetFileSummary,
  AssetFileType,
  ServiceDefinition,
  AdminDashboardStats,
} from '@/lib/types';

const ADMIN_API_BASE = process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL ?? '/api';

async function adminApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${ADMIN_API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Admin API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// Dashboard
export function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  return adminApi<AdminDashboardStats>('/admin/dashboard');
}

// Tenants
export function listTenants(): Promise<Tenant[]> {
  return adminApi<Tenant[]>('/admin/tenants');
}

export function getTenant(tenantId: string): Promise<Tenant> {
  return adminApi<Tenant>(`/admin/tenants/${tenantId}`);
}

// Bookings
export function listTenantBookings(
  tenantId: string,
  params?: {
    status?: BookingStatus;
    from?: string;
    to?: string;
    q?: string;
  }
): Promise<AdminBookingSummary[]> {
  const search = new URLSearchParams();
  if (params?.status) search.set('status', params.status);
  if (params?.from) search.set('from', params.from);
  if (params?.to) search.set('to', params.to);
  if (params?.q) search.set('q', params.q);

  const qs = search.toString();
  return adminApi<AdminBookingSummary[]>(
    `/admin/tenants/${tenantId}/bookings${qs ? `?${qs}` : ''}`
  );
}

export function getBookingDetail(
  tenantId: string,
  bookingId: string
): Promise<AdminBookingDetail> {
  return adminApi<AdminBookingDetail>(
    `/admin/tenants/${tenantId}/bookings/${bookingId}`
  );
}

export function updateBookingStatus(
  tenantId: string,
  bookingId: string,
  status: BookingStatus,
  internalNotes?: string
) {
  return adminApi<AdminBookingDetail>(
    `/admin/tenants/${tenantId}/bookings/${bookingId}/status`,
    {
      method: 'POST',
      body: JSON.stringify({ status, internalNotes }),
    }
  );
}

// Assets
export function listTenantAssets(
  tenantId: string,
  params?: { fileType?: AssetFileType; q?: string; bookingId?: string }
): Promise<AssetFileSummary[]> {
  const search = new URLSearchParams();
  if (params?.fileType) search.set('fileType', params.fileType);
  if (params?.bookingId) search.set('bookingId', params.bookingId);
  if (params?.q) search.set('q', params.q);
  const qs = search.toString();

  return adminApi<AssetFileSummary[]>(
    `/admin/tenants/${tenantId}/assets${qs ? `?${qs}` : ''}`
  );
}

// Services
export function listServicesForTenant(
  tenantId: string
): Promise<ServiceDefinition[]> {
  return adminApi<ServiceDefinition[]>(`/admin/tenants/${tenantId}/services`);
}
