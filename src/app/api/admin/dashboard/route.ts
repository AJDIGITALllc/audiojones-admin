// src/app/api/admin/dashboard/route.ts
import { NextResponse } from 'next/server';
import type { AdminDashboardStats } from '@/lib/types';

export async function GET() {
  const mockStats: AdminDashboardStats = {
    activeTenants: 3,
    upcomingSessionsCount: 12,
    pendingApprovalsCount: 5,
    newClientsThisWeek: 8,
  };

  return NextResponse.json(mockStats);
}
