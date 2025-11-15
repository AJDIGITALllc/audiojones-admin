// src/app/api/admin/tenants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { requireAdmin, errorResponse } from '@/lib/api/middleware';
import type { Tenant as FirestoreTenant } from '@/lib/types/firestore';
import type { Tenant } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof Response) return authResult;

    const tenantsSnap = await getDocs(
      query(collection(db, 'tenants'), orderBy('createdAt', 'desc'))
    );

    const tenants: Tenant[] = tenantsSnap.docs.map(doc => {
      const data = doc.data() as FirestoreTenant;
      return {
        id: doc.id,
        name: data.name,
        slug: data.slug,
        status: data.status.toUpperCase() as any,
        primaryColor: data.primaryColor,
        createdAt: data.createdAt.toDate().toISOString(),
      };
    });

    return NextResponse.json(tenants);
  } catch (error) {
    console.error('Failed to fetch tenants:', error);
    return errorResponse('Failed to fetch tenants');
  }
}
