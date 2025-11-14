// src/app/api/admin/tenants/[tenantId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { Tenant } from '@/lib/types';

const mockTenants: Tenant[] = [
  {
    id: 'tenant-audiojones',
    name: 'Audio Jones',
    slug: 'audiojones',
    status: 'ACTIVE',
    primaryColor: '#FF4500',
    createdAt: '2024-01-15T00:00:00Z',
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  const { tenantId } = await params;
  const tenant = mockTenants.find((t) => t.id === tenantId);

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  return NextResponse.json(tenant);
}
