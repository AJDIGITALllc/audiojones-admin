// src/app/api/admin/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { requireAdmin, errorResponse } from '@/lib/api/middleware';
import type { Tenant, Booking, User } from '@/lib/types/firestore';
import type { AdminDashboardStats } from '@/lib/types';
import { logError } from '@/lib/log';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof Response) return authResult;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Count active tenants
    const tenantsSnap = await getDocs(
      query(collection(db, 'tenants'), where('status', '==', 'active'))
    );
    const activeTenants = tenantsSnap.size;

    // Get all bookings
    const bookingsSnap = await getDocs(collection(db, 'bookings'));
    const bookings = bookingsSnap.docs.map(doc => doc.data() as Booking);

    // Count upcoming sessions (approved, scheduled in future)
    const upcomingSessionsCount = bookings.filter(b => 
      b.status === 'approved' && 
      b.scheduledAt && 
      b.scheduledAt.toDate() > now
    ).length;

    // Count pending approvals
    const pendingApprovalsCount = bookings.filter(b => b.status === 'pending').length;

    // Count new clients this week
    const usersSnap = await getDocs(
      query(
        collection(db, 'users'),
        where('role', '==', 'client'),
        where('createdAt', '>=', Timestamp.fromDate(weekAgo))
      )
    );
    const newClientsThisWeek = usersSnap.size;

    const stats: AdminDashboardStats = {
      activeTenants,
      upcomingSessionsCount,
      pendingApprovalsCount,
      newClientsThisWeek,
    };

    return NextResponse.json(stats);
  } catch (error) {
    logError('api/admin/dashboard GET', error, {
      url: request.url,
      method: 'GET',
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
