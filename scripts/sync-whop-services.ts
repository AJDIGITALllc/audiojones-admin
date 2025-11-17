// Sync script to update services from Whop product data
// Run with: npm run sync:whop

import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
import { fetchWhopProduct } from "../src/lib/whop";
import type { Service, WhopConfig } from "../src/lib/types/firestore";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // Use Firebase client config for now (temporary)
  // TODO: Switch to service account for server-side scripts
  const firebaseConfig = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  };

  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    ...firebaseConfig,
  });
}

const db = admin.firestore();

interface SyncResult {
  scanned: number;
  updated: number;
  failed: string[];
}

async function syncWhopServices(): Promise<SyncResult> {
  console.log("🔄 Starting Whop service sync...\n");

  const result: SyncResult = {
    scanned: 0,
    updated: 0,
    failed: [],
  };

  try {
    // Query all services with Whop sync enabled
    const servicesSnapshot = await db.collection("services").get();
    
    for (const doc of servicesSnapshot.docs) {
      const service = doc.data() as Service;
      const whopConfig = service.whop as WhopConfig | undefined;

      result.scanned++;

      // Skip if sync not enabled or no product ID
      if (!whopConfig?.syncEnabled || !whopConfig?.productId) {
        continue;
      }

      console.log(`Syncing service: ${service.name} (${doc.id})`);
      console.log(`  Whop Product ID: ${whopConfig.productId}`);

      try {
        const whopProduct = await fetchWhopProduct(whopConfig.productId);

        if (!whopProduct) {
          console.log(`  ❌ Failed to fetch Whop product\n`);
          result.failed.push(`${service.name}: Product not found`);
          continue;
        }

        // Update service with Whop data
        const updates: Partial<Service> = {
          priceCents: whopProduct.priceCents,
          currency: whopProduct.currency,
          whop: {
            ...whopConfig,
            url: whopProduct.url,
          },
          updatedAt: admin.firestore.Timestamp.now(),
        };

        await db.collection("services").doc(doc.id).update(updates);

        console.log(`  ✅ Updated: price=${whopProduct.priceCents} ${whopProduct.currency}`);
        if (whopProduct.url) {
          console.log(`  🔗 Checkout URL: ${whopProduct.url}`);
        }
        console.log("");

        result.updated++;
      } catch (error) {
        console.error(`  ❌ Error syncing: ${(error as Error).message}\n`);
        result.failed.push(`${service.name}: ${(error as Error).message}`);
      }
    }
  } catch (error) {
    console.error("Fatal error during sync:", error);
    throw error;
  }

  return result;
}

// Run the sync
syncWhopServices()
  .then((result) => {
    console.log("✅ Sync complete!\n");
    console.log(`📊 Summary:`);
    console.log(`   Services scanned: ${result.scanned}`);
    console.log(`   Services updated: ${result.updated}`);
    
    if (result.failed.length > 0) {
      console.log(`\n⚠️  Failures (${result.failed.length}):`);
      result.failed.forEach((msg) => console.log(`   - ${msg}`));
    }

    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Sync failed:", error);
    process.exit(1);
  });
