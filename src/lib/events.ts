/**
 * Admin Event Emitter
 * 
 * Normalized event emission for admin-side actions.
 * Events are written to Firestore collection "adminEvents" for automation consumption.
 * 
 * Best-effort, non-blocking: errors are logged but do not interrupt operations.
 */

import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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
 * Emit an admin event to Firestore
 * Best-effort: logs errors but does not throw
 */
export async function emitEvent(
  event: Omit<AdminEvent, "id">
): Promise<void> {
  try {
    const eventsRef = collection(db, "adminEvents");
    await addDoc(eventsRef, {
      ...event,
      createdAt: serverTimestamp(),
    });
    console.log(`[AdminEvent] Emitted: ${event.name}`, {
      tenantId: event.tenantId,
      moduleIds: event.moduleIds,
    });
  } catch (error) {
    console.error(`[AdminEvent] Failed to emit ${event.name}:`, error);
    // Swallow error - event emission should not break admin operations
  }
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
