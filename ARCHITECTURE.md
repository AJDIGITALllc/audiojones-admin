# Architecture Documentation

## Overview

The **Audio Jones Admin Portal** is a Next.js-based management interface for the Audio Jones multi-tenant booking platform. It provides administrators with tools to manage tenants, services, bookings, billing, and system health across the entire platform.

## Tech Stack

- **Framework**: Next.js 16.0.3 with App Router
- **Language**: TypeScript
- **Runtime**: Node.js
- **Authentication**: Firebase Authentication (client-side)
- **Database**: Firebase Firestore (NoSQL document database)
- **Styling**: Tailwind CSS with dark theme
- **Build Tool**: Turbopack
- **Deployment**: Vercel

## Runtime Architecture

### Authentication Flow

1. **Client-side auth**: Firebase Authentication SDK handles user sign-in/sign-out
2. **Protected routes**: `(protected)` layout checks auth state via `onAuthStateChanged`
3. **API authentication**: Routes under `/api/admin/` use middleware to verify admin role
4. **Session management**: Firebase maintains session tokens automatically

### Data Flow

```
UI Components → React Hooks → API Routes (/api/admin/**) → Firebase Firestore
                                ↓
                          Middleware (requireAdmin)
                                ↓
                          Role/Tenant Validation
```

**Pattern**:
- Pages call internal API routes (not Firestore directly in most cases)
- API routes enforce authentication and authorization
- Middleware centralizes auth checks (`requireAuth`, `requireAdmin`, `requireTenantAssignment`)
- Firestore operations use Firebase Client SDK

### Tenant Model

- **Multi-tenant architecture**: Each tenant represents an independent workspace (e.g., "Inner Circle", "AJ Digital")
- **Tenant isolation**: Bookings, services, and users are scoped to `tenantId`
- **Admin access**: Admin role can view/manage all tenants; client role limited to own tenant
- **Tenant assignment**: Users have a `tenantId` field; services may be global (`tenantId: null`) or tenant-specific

## Important Directories

- **`src/app/`**: Next.js App Router pages and API routes
  - `(protected)/`: Authenticated admin pages (dashboard, services, billing, system status)
  - `api/admin/`: Admin API endpoints with role enforcement
  - `api/health/`: Health check endpoint for monitoring
- **`src/lib/`**: Shared utilities and business logic
  - `firebase.ts`: Firebase client initialization
  - `types/firestore.ts`: TypeScript types matching Firestore schema
  - `api/middleware.ts`: Auth middleware for API routes
  - `auth-helpers.ts`: Reusable auth context extraction and guards
  - `logging.ts`: Centralized logging helpers
- **`src/components/`**: Reusable React components
  - `Sidebar.tsx`: Main navigation sidebar
  - `EmptyState.tsx`: Consistent empty state UI
- **`src/contexts/`**: React context providers (if any)
- **`scripts/`**: Build and maintenance scripts
  - `validate-env.ts`: Environment variable validation against `.env.schema.json`
  - `sync-whop-services.ts`: (Future) Whop integration sync

## External Integrations

### Firebase (Required)

- **Purpose**: Authentication and Firestore database
- **Environment Variables**:
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`
  - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (optional)
- **Documentation**: See `.env.schema.json` for full schema

### Whop (Planned)

- **Purpose**: Payment processing and membership gating for certain services
- **Environment Variables**: 
  - `WHOP_API_BASE_URL`
  - `WHOP_API_KEY`
- **Status**: Skeleton integration in place; requires API credentials

### Stripe (Planned)

- **Purpose**: Alternative payment processing
- **Status**: Data model supports Stripe; integration pending

### Email/Notifications (Planned)

- **Purpose**: Booking confirmations, status updates
- **Status**: Notification skeleton exists; email provider TBD

## Data Model Summary

- **Collections**: `users`, `tenants`, `services`, `bookings`, `assets`
- **Key Types**: Defined in `src/lib/types/firestore.ts`
  - `User`: uid, email, role (admin/client), tenantId
  - `Tenant`: id, name, slug, status, plan
  - `Service`: id, name, category, scheduling config, billing config
  - `Booking`: id, tenantId, userId, serviceId, status, payment fields, status history
  - `Asset`: id, bookingId, file metadata

## Security Model

- **Authentication**: Required for all protected routes and API endpoints
- **Authorization**: Role-based (admin vs client)
- **Tenant Isolation**: Enforced in API middleware; clients can only access own tenant
- **Secrets Management**: Environment variables validated at build time; never committed to repo

## System Modules & Funnel View

### Module System

The admin portal now includes a module-based view of the platform's capabilities:

- **Client Delivery**: Project delivery, bookings, and asset management
- **Marketing Automation**: Campaign automation and audience engagement  
- **AI Optimization**: AI-powered content and process optimization       
- **Data Intelligence**: Analytics, reporting, and business intelligence 

**Implementation**:
- Module configuration: src/config/modules.ts
- Module analytics page: src/app/(protected)/system/modules/page.tsx  
- Service tagging: Services mapped to modules via category matching (e.g., 'artist'  client_delivery)

**Module Stats Display**:
- Booking count per module
- Active clients per module
- Pending payment count
- Total completed revenue
- Whop-backed service count

### Funnel View

The funnel view provides a visual pipeline of the customer journey:

**Stages**:
1. Lead / Discovery (draft bookings)
2. Booked Session (pending bookings)
3. In Delivery (approved, in_progress bookings)
4. Awaiting Payment (pending_payment bookings)
5. Completed / Retained (completed bookings)

**Implementation**:
- Funnel visualization: src/app/(protected)/system/funnel/page.tsx    
- Derives stage counts from booking statuses
- Highlights "stuck" items (bookings with no updates in 7+ days)
- Shows percentage distribution across stages

**Navigation**:
- Added to System section in sidebar
- Accessible via /system/funnel and /system/modules

### Whop Integration Awareness

Both views expose Whop-backed service metrics:
- Count of services with illingProvider === "whop"
- Count of bookings tied to Whop services
- Note that full sync is handled by scripts/sync-whop-services.ts

