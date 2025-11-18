/**
 * Whop Webhook Handler
 * 
 * Receives webhook calls from Whop when payment events occur.
 * Updates booking status and emits normalized events for automation.
 * 
 * Security:
 * - No Firebase Auth required (called by Whop servers)
 * - TODO: Verify Whop signature using shared secret from headers
 * - Always returns 200 to prevent retries on expected failures
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, query, collection, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { emitEvent, buildEvent } from '@/lib/events';
import { emitPortalMirror } from '@/lib/portal-events-mirror';
import { logError } from '@/lib/log';
import type { Booking, Service, User, BookingStatus } from '@/lib/types/firestore';

/**
 * Subset of Whop webhook payload we care about
 */
interface WhopWebhookPayload {
  event: string;
  data: {
    id?: string; // Whop transaction/payment ID
    product_id?: string; // Whop product ID
    user?: {
      email?: string;
      id?: string;
    };
    metadata?: Record<string, unknown>;
    price_cents?: number;
    currency?: string;
    status?: string;
  };
}

/**
 * Events we handle as "payment succeeded"
 */
const PAYMENT_SUCCESS_EVENTS = [
  'checkout.completed',
  'subscription.started',
  'subscription.payment_succeeded',
  'payment.succeeded',
];

export async function POST(request: NextRequest) {
  try {
    // Parse webhook payload
    const payload = await request.json() as WhopWebhookPayload;

    console.log('[WhopWebhook] Received event:', {
      event: payload.event,
      productId: payload.data?.product_id,
      userEmail: payload.data?.user?.email,
      metadata: payload.data?.metadata,
    });

    // Check if this is a payment success event we care about
    if (!PAYMENT_SUCCESS_EVENTS.includes(payload.event)) {
      console.log('[WhopWebhook] Ignoring event type:', payload.event);
      return NextResponse.json({ ok: true });
    }

    // Strategy 1: Try metadata.bookingId first (preferred)
    let booking: (Booking & { id: string }) | null = null;
    const bookingId = payload.data?.metadata?.bookingId as string | undefined;

    if (bookingId) {
      console.log('[WhopWebhook] Looking up booking by ID:', bookingId);
      const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
      
      if (bookingDoc.exists()) {
        booking = { id: bookingDoc.id, ...bookingDoc.data() } as Booking & { id: string };
        console.log('[WhopWebhook] Found booking via metadata:', booking.id);
      } else {
        console.warn('[WhopWebhook] Booking not found for ID:', bookingId);
      }
    }

    // Strategy 2: Fallback to product_id + user email
    if (!booking && payload.data?.product_id && payload.data?.user?.email) {
      console.log('[WhopWebhook] Trying fallback lookup via product + email');
      
      // Find service by Whop product ID
      const servicesQuery = query(
        collection(db, 'services'),
        where('whop.productId', '==', payload.data.product_id)
      );
      const servicesSnap = await getDocs(servicesQuery);
      
      if (servicesSnap.empty) {
        console.warn('[WhopWebhook] No service found for product_id:', payload.data.product_id);
        return NextResponse.json({ ok: true });
      }

      const service = servicesSnap.docs[0];
      const serviceId = service.id;

      // Find user by email
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', payload.data.user.email)
      );
      const usersSnap = await getDocs(usersQuery);

      if (usersSnap.empty) {
        console.warn('[WhopWebhook] No user found for email:', payload.data.user.email);
        return NextResponse.json({ ok: true });
      }

      const user = usersSnap.docs[0];
      const userId = user.id;

      // Find most recent pending booking (payment pending or draft)
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('userId', '==', userId),
        where('serviceId', '==', serviceId),
        where('status', 'in', ['pending', 'draft']),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      const bookingsSnap = await getDocs(bookingsQuery);

      if (!bookingsSnap.empty) {
        const bookingDoc = bookingsSnap.docs[0];
        booking = { id: bookingDoc.id, ...bookingDoc.data() } as Booking & { id: string };
        console.log('[WhopWebhook] Found booking via fallback:', booking.id);
      } else {
        console.warn('[WhopWebhook] No pending booking found for user/service');
        return NextResponse.json({ ok: true });
      }
    }

    // No booking found via either strategy
    if (!booking) {
      console.warn('[WhopWebhook] Could not locate booking for payment event');
      return NextResponse.json({ ok: true });
    }

    // Store old status for event emission
    const oldStatus = booking.status;
    const newStatus: BookingStatus = 'approved'; // Payment succeeded → approved

    // Update booking with payment metadata
    await updateDoc(doc(db, 'bookings', booking.id), {
      status: newStatus,
      paymentStatus: 'paid',
      paymentProvider: 'whop',
      paymentReference: payload.data?.id || null,
      paymentAmountCents: payload.data?.price_cents || null,
      paymentCurrency: payload.data?.currency || 'USD',
      updatedAt: Timestamp.now(),
    });

    console.log('[WhopWebhook] Updated booking:', {
      bookingId: booking.id,
      oldStatus,
      newStatus,
      paymentProvider: 'whop',
    });

    // Emit admin event (booking.status_updated)
    try {
      const adminEvent = buildEvent({
        name: 'booking.status_updated',
        tenantId: booking.tenantId || undefined,
        adminId: undefined, // System action
        moduleIds: undefined, // TODO: Add module field to Service type for module routing
        payload: {
          bookingId: booking.id,
          serviceId: booking.serviceId,
          oldStatus,
          newStatus,
          source: 'whop-webhook',
        },
      });
      await emitEvent(adminEvent);
    } catch (eventError) {
      console.error('[WhopWebhook] Failed to emit admin event:', eventError);
    }

    // Emit portal event (payment.completed)
    try {
      await emitPortalMirror({
        name: 'payment.completed',
        source: 'system',
        tenantId: booking.tenantId || undefined,
        userId: booking.userId,
        moduleIds: undefined, // TODO: Add module field to Service type for module routing
        payload: {
          bookingId: booking.id,
          serviceId: booking.serviceId,
          paymentProvider: 'whop',
          paymentReference: payload.data?.id,
          amountCents: payload.data?.price_cents,
          currency: payload.data?.currency || 'USD',
        },
      });
    } catch (eventError) {
      console.error('[WhopWebhook] Failed to emit portal event:', eventError);
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    logError('api/webhooks/whop POST', error, {
      url: request.url,
      method: 'POST',
    });

    // TODO: Add environment check for production vs development error details
    // In production, return generic error; in dev, expose details
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Reject non-POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
