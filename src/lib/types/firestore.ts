// Platform-wide Firestore data model
// Single source of truth for both client and admin portals

import { Timestamp } from "firebase/firestore";

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export type UserRole = "admin" | "client" | "internal";

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  tenantId: string;
  displayName: string;
  emailVerified?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// TENANT MANAGEMENT
// ============================================================================

export type TenantStatus = "active" | "suspended";
export type TenantPlan = "free" | "standard" | "pro";

export interface Tenant {
  id: string;
  name: string;
  slug: string; // e.g., "inner-circle", "aj-digital"
  status: TenantStatus;
  plan: TenantPlan;
  ownerUserId: string;
  primaryColor?: string;
  logoUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// SERVICE CATALOG
// ============================================================================

export type ServiceCategory = "artist" | "consulting" | "podcast" | "other";
export type SchedulingProvider = "calcom" | "calendly" | "other" | "none";
export type BillingProvider = "whop" | "stripe" | "manual" | "none";

export interface WhopConfig {
  productId?: string;
  url?: string; // public checkout URL if known
  syncEnabled?: boolean; // whether this service should sync with Whop
}

export interface Service {
  id: string;
  tenantId: string | null; // null = global catalog, tenant-specific otherwise
  name: string;
  category: ServiceCategory;
  description: string;
  basePrice: number; // in cents
  active: boolean;
  duration?: number; // minutes
  requiresApproval?: boolean;
  schedulingProvider?: SchedulingProvider;
  schedulingUrl?: string | null;
  defaultDurationMinutes?: number | null;
  billingProvider?: BillingProvider;
  billingProductId?: string | null;
  priceCents?: number | null;
  currency?: string | null;
  whop?: WhopConfig;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// BOOKING MANAGEMENT
// ============================================================================

export type BookingStatus =
  | "draft"
  | "pending"
  | "approved"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "declined";

export interface BookingStatusEvent {
  status: BookingStatus;
  changedAt: string; // ISO timestamp
  changedByUserId?: string;
  note?: string;
}

export type PaymentStatus = "unpaid" | "pending" | "paid" | "refunded";

export interface Booking {
  id: string;
  tenantId: string;
  userId: string;
  serviceId: string;
  status: BookingStatus;
  scheduledAt: Timestamp | null;
  notes: string;
  internalNotes?: string;
  priceCents?: number;
  startTime?: Timestamp;
  endTime?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  statusHistory?: BookingStatusEvent[];
  paymentStatus?: PaymentStatus;
  paymentProvider?: BillingProvider;
  paymentExternalId?: string | null;
  paymentUrl?: string | null;
  paymentReference?: string | null; // Whop transaction ID or other payment reference
  paymentAmountCents?: number | null; // Actual amount charged
  paymentCurrency?: string | null; // Currency code (e.g., USD)
}

// ============================================================================
// ASSET MANAGEMENT
// ============================================================================

export type AssetFileType = "audio" | "video" | "image" | "document" | "other";

export interface Asset {
  id: string;
  tenantId: string;
  bookingId: string;
  userId: string;
  fileName: string;
  fileType: AssetFileType;
  storagePath: string;
  storageUrl?: string;
  size: number; // bytes
  mimeType?: string;
  createdAt: Timestamp;
}

// ============================================================================
// HELPER TYPES FOR API RESPONSES
// ============================================================================

export interface UserWithTenant extends User {
  tenant?: Tenant;
}

export interface BookingWithDetails extends Booking {
  serviceName?: string;
  userName?: string;
  userEmail?: string;
}

export interface ServiceWithTenant extends Service {
  tenantName?: string;
}
