// src/app/api/admin/tenants/[tenantId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Tenant } from '@/lib/types';
import type { Tenant as FirestoreTenant } from '@/lib/types/firestore';
import { logError } from '@/lib/log';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    
    const tenantDoc = await getDoc(doc(db, 'tenants', tenantId));
    
    if (!tenantDoc.exists()) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const data = tenantDoc.data() as FirestoreTenant;
    const tenant: Tenant = {
      id: tenantDoc.id,
      name: data.name,
      slug: data.slug,
      status: data.status.toUpperCase() as any,
      primaryColor: data.primaryColor,
      createdAt: data.createdAt.toDate().toISOString(),
    };

    return NextResponse.json(tenant);
  } catch (error) {
    logError('api/admin/tenants/[tenantId] GET', error, {
      url: request.url,
      method: 'GET',
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
