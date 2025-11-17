# Regression Checklist

Fast sanity checks to run after making changes to the admin portal.

## Authentication & Access

- [ ] Login works (email/password)
- [ ] Logout redirects to login page
- [ ] Protected routes redirect to login when not authenticated

## Core Pages

- [ ] Dashboard loads without console errors
- [ ] Dashboard displays correct stats and data
- [ ] Services page loads and displays services table
- [ ] Services page inline editing works (save/cancel)
- [ ] Billing page loads and displays bookings with payment info
- [ ] Billing page filters work (status, provider)

## System Health

- [ ] System Status page loads at `/system/status`
- [ ] System Status shows current environment correctly
- [ ] System Status shows Firebase project ID
- [ ] System Status shows current user email and UID
- [ ] System Status API health check shows "API: healthy"
- [ ] Health API endpoint returns 200 at `/api/health`

## API Routes

- [ ] No 500s from `/api/**` routes in Network tab
- [ ] API routes return proper error codes (401, 403, 500)
- [ ] Dashboard API returns tenant and booking data
- [ ] Services API can be queried successfully

## Data Operations

- [ ] Admin can view all tenant bookings
- [ ] Admin can update service scheduling configuration
- [ ] Admin can filter bookings by payment status
- [ ] Status history displays correctly for bookings

## Build & Deploy

- [ ] `npm run validate:env` passes
- [ ] `npm run build` completes without errors
- [ ] No TypeScript compilation errors
- [ ] No ESLint errors in critical files

## Browser Console

- [ ] No unhandled promise rejections
- [ ] No React hydration errors
- [ ] No CORS errors when calling Firebase
- [ ] No missing environment variable warnings
