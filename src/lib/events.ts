/**
 * Admin Event Emitter
 * 
 * Normalized event emission for admin-side actions.
 * Events are written to Firestore collection "adminEvents" for automation consumption.
 * Also supports direct HTTP emission to automation hub API.
 * 
 * Best-effort, non-blocking: errors are logged but do not interrupt operations.
 */

import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Automation hub API base URL (optional direct emission)
 */
const AUTOMATION_HUB_URL = process.env.NEXT_PUBLIC_AUTOMATION_HUB_URL;
const AUTOMATION_HUB_API_KEY = process.env.AUTOMATION_HUB_API_KEY;

export type EventName =
  | "booking.status_updated"
  | "tenant.config_updated"
  | "reporting.snapshot_generated";

export interface AdminEvent {
  id: string;
  name: EventName;
  source: "admin-portal";
  tenantId?: string;
  adminId?: string;
  moduleIds?: string[];
  occurredAt: string;
  payload: Record<string, unknown>;
}

interface BuildEventArgs {
  name: EventName;
  tenantId?: string;
  adminId?: string;
  moduleIds?: string[];
  payload: Record<string, unknown>;
}

/**
 * Build a normalized admin event with standard metadata
 */
export function buildEvent(args: BuildEventArgs): Omit<AdminEvent, "id"> {
  return {
    name: args.name,
    source: "admin-portal",
    tenantId: args.tenantId,
    adminId: args.adminId,
    moduleIds: args.moduleIds,
    occurredAt: new Date().toISOString(),
    payload: args.payload,
  };
}

/**
 * Emit event to automation hub via HTTP API (optional, direct)
 */
async function emitEventDirect(event: Omit<AdminEvent, "id"> & { id: string }): Promise<void> {
  if (!AUTOMATION_HUB_URL) {
    return; // Direct emission not configured
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (AUTOMATION_HUB_API_KEY) {
      headers['x-api-key'] = AUTOMATION_HUB_API_KEY;
    }

    const response = await fetch(`${AUTOMATION_HUB_URL}/api/events/intake`, {
      method: 'POST',
      headers,
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      throw new Error(`Automation hub API responded with ${response.status}`);
    }

    console.log(`[AdminEvent] Direct emit success: ${event.name} (${event.id})`);
  } catch (error) {
    // Log but don't throw - Firestore is primary, direct is fallback
    console.error(`[AdminEvent] Direct emit failed for ${event.name}:`, error);
  }
}

/**
 * Emit an admin event to Firestore
 * Optionally also emits directly to automation hub API
 * Best-effort: logs errors but does not throw
 */
export async function emitEvent(
  event: Omit<AdminEvent, "id">
): Promise<void> {
  // Generate event ID for tracking across systems
  const eventId = crypto.randomUUID();
  const fullEvent = { ...event, id: eventId };

  // Primary: Firestore
  try {
    const eventsRef = collection(db, "adminEvents");
    await addDoc(eventsRef, {
      ...fullEvent,
      status: 'pending', // Required by automation hub worker
      createdAt: serverTimestamp(),
    });
    console.log(`[AdminEvent] Firestore emit success: ${event.name} (${eventId})`, {
      tenantId: event.tenantId,
      moduleIds: event.moduleIds,
    });
  } catch (error) {
    console.error(`[AdminEvent] Firestore emit failed for ${event.name}:`, error);
    // Swallow error - event emission should not break admin operations
  }

  // Optional: Direct HTTP emission to automation hub
  await emitEventDirect(fullEvent);
}

/**
 * Convenience helper for booking status updates
 */
export async function emitBookingStatusUpdated(args: {
  tenantId: string;
  adminId: string;
  bookingId: string;
  oldStatus: string;
  newStatus: string;
  moduleIds?: string[];
}): Promise<void> {
  const event = buildEvent({
    name: "booking.status_updated",
    tenantId: args.tenantId,
    adminId: args.adminId,
    moduleIds: args.moduleIds,
    payload: {
      bookingId: args.bookingId,
      oldStatus: args.oldStatus,
      newStatus: args.newStatus,
    },
  });
  await emitEvent(event);
}

/**
 * Convenience helper for tenant config updates
 */
export async function emitTenantConfigUpdated(args: {
  tenantId: string;
  adminId: string;
  serviceId?: string;
  changedFields: string[];
  whopLinked?: boolean;
  billingProvider?: string;
  moduleIds?: string[];
}): Promise<void> {
  const event = buildEvent({
    name: "tenant.config_updated",
    tenantId: args.tenantId,
    adminId: args.adminId,
    moduleIds: args.moduleIds,
    payload: {
      serviceId: args.serviceId,
      changedFields: args.changedFields,
      whopLinked: args.whopLinked,
      billingProvider: args.billingProvider,
    },
  });
  await emitEvent(event);
}

/**
 * Build reporting snapshot event (stub for future use)
 */
export function buildReportingSnapshotEvent(args: {
  tenantId: string;
  period: string;
  modules?: string[];
}): Omit<AdminEvent, "id"> {
  return buildEvent({
    name: "reporting.snapshot_generated",
    tenantId: args.tenantId,
    moduleIds: args.modules,
    payload: {
      period: args.period,
      generatedAt: new Date().toISOString(),
    },
  });
}
