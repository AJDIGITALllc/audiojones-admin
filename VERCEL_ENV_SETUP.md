# Vercel Environment Variables Setup

## Required for Admin Portal (`audiojones-admin`)

Go to **Vercel Dashboard → audiojones-admin → Settings → Environment Variables**

Add these exact variables (no quotes, no trailing spaces):

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAc-WT9sSaJ3oLqGDmfQtmixyjEtgNarSE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=audiojoneswebsite.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=audiojoneswebsite
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=audiojoneswebsite.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=392639855167
NEXT_PUBLIC_FIREBASE_APP_ID=1:392639855167:web:7ba857e5c4ab2a4212168a
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ZLT4D4YBCS
```

**Scope**: Production (and Preview if needed)

## Required for Client Portal (`audiojones-client`)

Same Firebase variables as admin (same project):

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAc-WT9sSaJ3oLqGDmfQtmixyjEtgNarSE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=audiojoneswebsite.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=audiojoneswebsite
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=audiojoneswebsite.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=392639855167
NEXT_PUBLIC_FIREBASE_APP_ID=1:392639855167:web:7ba857e5c4ab2a4212168a
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ZLT4D4YBCS
```

**Scope**: Production (and Preview if needed)

## After Setting Variables

1. Save in Vercel dashboard
2. Trigger redeploy (automatic on next git push, or use Vercel "Redeploy" button)
3. Verify build succeeds and Firebase initializes correctly

## Verification

Once deployed, both portals should:
- Initialize Firebase without `auth/invalid-api-key` errors
- Connect to Firestore database
- Load user/tenant data correctly
