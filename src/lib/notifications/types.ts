// src/lib/notifications/types.ts

export type NotificationChannel = "email";

export type NotificationEventType =
  | "booking_created"
  | "booking_status_changed";

export interface NotificationPayloadBase {
  tenantId: string;
  bookingId: string;
  userId: string;
  channel: NotificationChannel;
  eventType: NotificationEventType;
  createdAt: string;
}

export interface BookingCreatedPayload extends NotificationPayloadBase {
  eventType: "booking_created";
  serviceName?: string;
  clientEmail?: string;
  clientName?: string;
}

export interface BookingStatusChangedPayload extends NotificationPayloadBase {
  eventType: "booking_status_changed";
  oldStatus: string;
  newStatus: string;
}
