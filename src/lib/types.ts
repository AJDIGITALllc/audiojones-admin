// src/lib/types.ts

// Tenants
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  primaryColor?: string;
  createdAt: string;
}

// Clients (per-tenant)
export interface AdminClientSummary {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  totalBookings: number;
  lastActiveAt?: string;
}

// Services (admin-side definition)
export interface ServiceDefinition {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  category: 'ARTIST' | 'CONSULTING' | 'STRATEGY' | 'PRODUCTION' | 'SMB' | 'OTHER';
  iconEmoji?: string;
  durationMinutes?: number;
  basePrice: number;
  priceType: 'FIXED' | 'HOURLY' | 'PROJECT';
  requiresApproval: boolean;
  intakeSchemaId?: string;
  assetRequirements?: string[];
  isActive: boolean;
}

// Bookings (admin view)
export type BookingStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'PENDING_ADMIN'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'DECLINED'
  | 'CANCELED'
  | 'COMPLETED';

export interface BookingStatusEvent {
  status: BookingStatus;
  changedAt: string; // ISO timestamp
  changedByUserId?: string;
  note?: string;
}

export interface AdminBookingSummary {
  id: string;
  tenantId: string;
  clientId: string;
  clientName: string;
  clientAvatarUrl?: string;
  serviceId: string;
  serviceName: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  source: 'CLIENT_PORTAL' | 'MANUAL_ENTRY' | 'WHOP' | 'OTHER';
  approvalRequired: boolean;
  createdAt: string;
}

export interface AdminBookingDetail extends AdminBookingSummary {
  priceCents: number;
  variantLabel?: string;
  notesFromClient?: string;
  internalNotes?: string;
  intakeAnswers: Record<string, unknown>;
  assets: AssetFileSummary[];
  timeline: BookingTimelineEvent[];
  updatedAt?: string;
  statusHistory?: BookingStatusEvent[];
}

export interface BookingTimelineEvent {
  id: string;
  label: string;
  description?: string;
  createdAt: string;
  actorLabel: string;
  type:
    | 'BOOKING_CREATED'
    | 'CLIENT_UPDATED'
    | 'ASSETS_UPLOADED'
    | 'APPROVED'
    | 'DECLINED'
    | 'CANCELED'
    | 'COMPLETED'
    | 'NOTE_ADDED';
}

// Assets
export type AssetFileType = 'AUDIO' | 'VIDEO' | 'DOCUMENT' | 'IMAGE' | 'OTHER';

export interface AssetFileSummary {
  id: string;
  tenantId: string;
  bookingId: string;
  clientId: string;
  fileName: string;
  fileType: AssetFileType;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  storageUrl: string;
  source: 'CLIENT_UPLOAD' | 'STAFF_UPLOAD' | 'SYSTEM_IMPORT';
}

// Automation events
export interface AdminAutomationEvent {
  id: string;
  tenantId: string;
  eventType:
    | 'BOOKING_CREATED'
    | 'BOOKING_APPROVED'
    | 'BOOKING_CANCELLED'
    | 'ASSET_UPLOADED'
    | 'CLIENT_CREATED';
  payload: Record<string, unknown>;
  createdAt: string;
  deliveredAt?: string;
  status: 'QUEUED' | 'DELIVERED' | 'FAILED';
  destination: 'N8N' | 'ZAPIER' | 'WEBHOOK' | 'INTERNAL';
}

// Dashboard Stats
export interface AdminDashboardStats {
  activeTenants: number;
  upcomingSessionsCount: number;
  pendingApprovalsCount: number;
  newClientsThisWeek: number;
}
