// src/app/api/admin/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { requireAdmin, errorResponse } from '@/lib/api/middleware';
import type { Booking, User, Service } from '@/lib/types/firestore';
import type { AdminBookingSummary } from '@/lib/types';
import { logError } from '@/lib/log';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof Response) return authResult;

    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');
    const limitParam = searchParams.get('limit');

    let q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));

    if (status) {
      q = query(
        collection(db, 'bookings'),
        where('status', '==', status.toLowerCase()),
        orderBy('createdAt', 'desc')
      );
    }

    if (limitParam) {
      q = query(q, limit(parseInt(limitParam, 10)));
    }

    const snap = await getDocs(q);

    const bookings: AdminBookingSummary[] = await Promise.all(
      snap.docs.map(async (bookingDoc) => {
        const data = bookingDoc.data() as Booking;

        let clientName = 'Unknown';
        let clientAvatarUrl: string | undefined = undefined;
        try {
          const userDoc = await getDoc(doc(db, 'users', data.userId));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            clientName = userData.displayName;
          }
        } catch (err) {
          console.error('Failed to fetch user:', err);
        }

        let serviceName = 'Unknown Service';
        try {
          const serviceDoc = await getDoc(doc(db, 'services', data.serviceId));
          if (serviceDoc.exists()) {
            serviceName = (serviceDoc.data() as Service).name;
          }
        } catch (err) {
          console.error('Failed to fetch service:', err);
        }

        return {
          id: bookingDoc.id,
          tenantId: data.tenantId,
          clientId: data.userId,
          clientName,
          clientAvatarUrl,
          serviceId: data.serviceId,
          serviceName,
          startTime: data.startTime?.toDate().toISOString() || data.scheduledAt?.toDate().toISOString() || '',
          endTime: data.endTime?.toDate().toISOString() || data.scheduledAt?.toDate().toISOString() || '',
          status: data.status.toUpperCase().replace('_', '-') as any,
          source: 'CLIENT_PORTAL' as any,
          approvalRequired: true,
          createdAt: data.createdAt.toDate().toISOString(),
        };
      })
    );

    return NextResponse.json(bookings);
  } catch (error) {
    logError('api/admin/bookings GET', error, {
      url: request.url,
      method: 'GET',
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
