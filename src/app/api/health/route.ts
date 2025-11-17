import { NextResponse } from "next/server";
import { logError } from "@/lib/logging";

export async function GET() {
  try {
    const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "unknown";
    const nodeEnv = process.env.NODE_ENV || "development";
    const timestamp = new Date().toISOString();

    return NextResponse.json({
      status: "ok",
      timestamp,
      env: nodeEnv,
      project: firebaseProjectId,
    });
  } catch (error) {
    logError("Health check failed", error as Error, { context: "health-api" });
    return NextResponse.json(
      { error: "unhealthy" },
      { status: 500 }
    );
  }
}
