# Operations Manual

## Local Development

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore enabled
- `.env.local` file with required environment variables (see `.env.schema.json`)

### Setup Commands

```bash
# Install dependencies
npm install

# Validate environment variables
npm run validate:env

# Start development server (http://localhost:3000)
npm run dev

# Run type checking
npm run lint
```

### Environment Configuration

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_APP_ENV=development
```

**Required variables** are validated against `.env.schema.json` during build.

## Deployment

### Vercel Deployment

The admin portal is deployed to Vercel and automatically builds on push to the main branch.

**Build Process**:
1. Vercel detects push to `main` branch
2. Runs `npm run build` which includes:
   - Environment validation (`npm run validate:env`)
   - TypeScript compilation
   - Next.js production build with Turbopack
3. Deploys to production URL

**Environment Variables**:
- Set in Vercel dashboard under **Settings → Environment Variables**
- Same keys as `.env.local` (see `.env.schema.json`)
- Environment variables are **not** committed to the repository

**Build Command**: `npm run build`  
**Output Directory**: `.next`  
**Install Command**: `npm install`

For detailed deployment steps, see [DEPLOYMENT.md](./DEPLOYMENT.md) if present.

## Environments

### Local Development

- **URL**: http://localhost:3000
- **Firebase**: Development project (or shared staging)
- **Purpose**: Feature development and testing
- **Data**: Can use seed scripts or test data

### Vercel Preview

- **URL**: Auto-generated per PR (e.g., `*.vercel.app`)
- **Firebase**: Same as production or dedicated preview project
- **Purpose**: Review deployments for pull requests
- **Data**: Shares production database (use caution)

### Vercel Production

- **URL**: Custom domain (e.g., admin.audiojones.com)
- **Firebase**: Production project
- **Purpose**: Live admin portal for Audio Jones team
- **Data**: Real production data

**Note**: Currently all environments share the same Firebase project. Consider separating development/staging/production projects in the future.

## Routine Checks

### Before Shipping (Pre-Deployment Checklist)

Reference [REGRESSION.md](./REGRESSION.md) for a full sanity checklist. Quick checks:

- [ ] `npm run validate:env` passes locally
- [ ] `npm run build` completes without errors
- [ ] Login/logout works
- [ ] System Status page shows "API: healthy"
- [ ] No console errors on dashboard or key pages
- [ ] Services and billing pages load correctly

### Post-Deployment Verification

1. Visit production URL
2. Log in with admin account
3. Navigate to **System Status** page
4. Verify:
   - Environment shows "production"
   - Firebase project ID is correct
   - API health check returns 200
5. Spot-check critical flows:
   - Dashboard loads with correct data
   - Services page displays and edits work
   - Billing page shows recent bookings

### Monitoring & Health

- **Health Endpoint**: `GET /api/health`
  - Returns 200 with `{ status: "ok", timestamp, env, project }`
  - Use for uptime monitoring (Vercel, UptimeRobot, etc.)
- **System Status Page**: `/system/status` (authenticated)
  - Internal debug panel showing environment, user, and API health
  - Check here first if issues are reported

### Logs & Debugging

- **Vercel Logs**: View in Vercel dashboard under **Deployments → [Build] → Function Logs**
- **Browser Console**: Check for client-side errors in dev tools
- **Firestore Console**: Inspect data directly in Firebase console
- **Logging**: Server-side logs use centralized helpers (`src/lib/logging.ts`)

## Common Tasks

### Adding a New API Route

1. Create file: `src/app/api/admin/[resource]/route.ts`
2. Import middleware: `import { requireAdmin, errorResponse } from '@/lib/api/middleware'`
3. Add auth check at start of handler:
   ```ts
   const authResult = await requireAdmin(request);
   if (authResult instanceof Response) return authResult;
   ```
4. Implement business logic with Firestore
5. Test locally and add to REGRESSION.md

### Updating Environment Variables

1. Update `.env.schema.json` if adding new required variable
2. Add variable to `.env.local` for local dev
3. Update Vercel environment variables in dashboard
4. Redeploy to apply changes

### Running Database Seed Scripts

```bash
npm run seed:firestore
```

(If seed script exists; see `scripts/` directory)

## Troubleshooting

### Build Fails with "Module not found"

- Check import paths use `@/` alias correctly
- Verify file exists at expected location
- Clear `.next` cache: `rm -rf .next && npm run build`

### "UNAUTHENTICATED" or 401 Errors

- Ensure Firebase Auth is initialized in browser
- Check `.env.local` has all required Firebase variables
- Verify user is logged in before accessing protected routes

### Firestore Permission Errors

- Check Firestore security rules in Firebase console
- Verify user has correct role (`admin` vs `client`)
- Check `tenantId` is set correctly on user document

### Environment Validation Fails

- Compare `.env.local` against `.env.schema.json`
- Ensure all required variables are set
- Check for typos in variable names or values
