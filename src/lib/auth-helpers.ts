// Centralized auth context extraction and enforcement for API routes

export interface AuthContext {
  uid: string;
  email?: string;
  role?: "admin" | "client";
  tenantId?: string;
}

/**
 * Extract auth context from request.
 * For now, uses a debug header for local testing.
 * TODO: Replace with real Firebase token verification.
 */
export async function getAuthContextFromRequest(
  req: Request
): Promise<AuthContext | null> {
  // Temporary: read from debug header for local testing
  const debugUserId = req.headers.get("x-debug-user-id");
  const debugRole = req.headers.get("x-debug-role") as "admin" | "client" | null;
  const debugTenantId = req.headers.get("x-debug-tenant-id");

  if (debugUserId) {
    return {
      uid: debugUserId,
      email: `debug-${debugUserId}@example.com`,
      role: debugRole || "admin",
      tenantId: debugTenantId || undefined,
    };
  }

  // TODO: Real implementation:
  // 1. Extract Authorization: Bearer <token> header
  // 2. Verify token with Firebase Admin SDK or client-side verification
  // 3. Extract uid, email from verified token
  // 4. Query Firestore users collection for role + tenantId
  // 5. Return AuthContext or null if invalid

  return null;
}

/**
 * Assert that auth context exists (user is authenticated).
 * Throws if not authenticated.
 */
export function requireAuth(ctx: AuthContext | null): asserts ctx is AuthContext {
  if (!ctx) {
    throw new Error("UNAUTHENTICATED");
  }
}

/**
 * Assert that user has admin role.
 * Throws if not admin.
 */
export function requireAdmin(ctx: AuthContext): void {
  if (ctx.role !== "admin") {
    throw new Error("FORBIDDEN_ADMIN_ONLY");
  }
}

/**
 * Assert that user has a tenant assigned.
 * Throws if tenant is missing.
 */
export function requireTenant(ctx: AuthContext): void {
  if (!ctx.tenantId) {
    throw new Error("MISSING_TENANT");
  }
}

/**
 * Map auth errors to HTTP status codes.
 */
export function mapAuthErrorToStatus(error: Error): number {
  if (error.message === "UNAUTHENTICATED") return 401;
  if (error.message === "FORBIDDEN_ADMIN_ONLY") return 403;
  if (error.message === "MISSING_TENANT") return 400;
  return 500;
}
