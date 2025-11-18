/**
 * Portal Events Mirror
 * 
 * Allows admin-side system actions to emit events to the portalEvents collection
 * that the automation hub can consume alongside client-initiated events.
 * 
 * This is used when the admin or system takes an action that affects client-visible
 * state (e.g., payment completion, booking approval).
 */

import { db } from './firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { randomUUID } from 'crypto';

export interface PortalEventMirror {
  id: string;
  name: 'payment.completed' | 'booking.approved' | 'booking.completed';
  source: 'system' | 'admin-portal';
  tenantId?: string;
  userId?: string;
  moduleIds?: string[];
  occurredAt: string;
  payload: Record<string, unknown>;
}

/**
 * Emit an event to the portalEvents collection from admin/system context
 * Best-effort: logs errors but does not throw
 */
export async function emitPortalMirror(event: Omit<PortalEventMirror, 'id' | 'occurredAt'>): Promise<void> {
  try {
    const eventDoc: PortalEventMirror = {
      ...event,
      id: randomUUID(),
      occurredAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'portalEvents', eventDoc.id), {
      ...eventDoc,
      createdAt: serverTimestamp(),
    });

    console.log(`[PortalEventMirror] Emitted: ${eventDoc.name}`, {
      id: eventDoc.id,
      tenantId: eventDoc.tenantId,
      userId: eventDoc.userId,
    });
  } catch (error) {
    console.error(`[PortalEventMirror] Failed to emit ${event.name}:`, error);
    // Swallow error - event emission should not break webhook processing
  }
}
