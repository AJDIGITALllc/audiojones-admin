// src/app/api/admin/tenants/route.ts
import { NextResponse } from 'next/server';
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
  {
    id: 'tenant-artisthub',
    name: 'Artist Hub',
    slug: 'artist-hub',
    status: 'ACTIVE',
    primaryColor: '#FFD700',
    createdAt: '2024-06-20T00:00:00Z',
  },
  {
    id: 'tenant-smb-audio',
    name: 'SMB Audio Solutions',
    slug: 'smb-audio',
    status: 'ACTIVE',
    primaryColor: '#008080',
    createdAt: '2024-09-10T00:00:00Z',
  },
];

export async function GET() {
  return NextResponse.json(mockTenants);
}
