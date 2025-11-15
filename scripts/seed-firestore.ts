// Firestore seed script - Run once to populate initial data
// Usage: npm run seed:firestore
// Note: Requires GOOGLE_APPLICATION_CREDENTIALS env var or Application Default Credentials
// Run: gcloud auth application-default login (if using local development)

import admin = require('firebase-admin');

// Initialize Firebase Admin
// For this to work, you need to:
// 1. Download service account JSON from Firebase Console
// 2. Set GOOGLE_APPLICATION_CREDENTIALS environment variable
// OR run: gcloud auth application-default login

const projectId = 'audiojoneswebsite';

try {
  admin.initializeApp({
    projectId: projectId,
  });
} catch (error: any) {
  if (error.code !== 'app/duplicate-app') {
    console.error('Failed to initialize Firebase Admin:', error);
    throw error;
  }
}

const db = admin.firestore();
const auth = admin.auth();

async function seedFirestore() {
  console.log('🌱 Seeding Firestore...\n');

  try {
    // 1. Create Tenants
    console.log('Creating tenants...');
    await db.collection('tenants').doc('tenant-audiojones').set({
      name: 'Audio Jones',
      slug: 'audiojones',
      status: 'active',
      plan: 'pro',
      ownerUserId: '', // Will update after admin user is created
      primaryColor: '#FF4500',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection('tenants').doc('tenant-artisthub').set({
      name: 'Artist Hub',
      slug: 'artist-hub',
      status: 'active',
      plan: 'standard',
      ownerUserId: '', // Will update after admin user is created
      primaryColor: '#FFD700',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✅ Tenants created\n');

    // 2. Create Users (Firebase Auth + Firestore)
    console.log('Creating users...');
    
    // Admin user
    const adminPassword = 'AdminTest123!';
    let adminUser;
    try {
      adminUser = await auth.createUser({
        email: 'admin@audiojones.com',
        password: adminPassword,
        displayName: 'Admin User',
        emailVerified: true,
      });
      console.log(`  Created Auth user: admin@audiojones.com (${adminUser.uid})`);
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`  Auth user already exists: admin@audiojones.com`);
        adminUser = await auth.getUserByEmail('admin@audiojones.com');
      } else {
        throw error;
      }
    }

    await db.collection('users').doc(adminUser.uid).set({
      uid: adminUser.uid,
      email: 'admin@audiojones.com',
      role: 'admin',
      tenantId: 'tenant-audiojones',
      displayName: 'Admin User',
      emailVerified: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update tenants with admin's UID
    await db.collection('tenants').doc('tenant-audiojones').update({
      ownerUserId: adminUser.uid,
    });
    await db.collection('tenants').doc('tenant-artisthub').update({
      ownerUserId: adminUser.uid,
    });

    // Client user 1
    const client1Password = 'ClientTest123!';
    let client1User;
    try {
      client1User = await auth.createUser({
        email: 'marcus@example.com',
        password: client1Password,
        displayName: 'Marcus Williams',
        emailVerified: true,
      });
      console.log(`  Created Auth user: marcus@example.com (${client1User.uid})`);
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`  Auth user already exists: marcus@example.com`);
        client1User = await auth.getUserByEmail('marcus@example.com');
      } else {
        throw error;
      }
    }

    await db.collection('users').doc(client1User.uid).set({
      uid: client1User.uid,
      email: 'marcus@example.com',
      role: 'client',
      tenantId: 'tenant-audiojones',
      displayName: 'Marcus Williams',
      emailVerified: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Client user 2
    const client2Password = 'ClientTest123!';
    let client2User;
    try {
      client2User = await auth.createUser({
        email: 'sarah@example.com',
        password: client2Password,
        displayName: 'Sarah Chen',
        emailVerified: true,
      });
      console.log(`  Created Auth user: sarah@example.com (${client2User.uid})`);
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`  Auth user already exists: sarah@example.com`);
        client2User = await auth.getUserByEmail('sarah@example.com');
      } else {
        throw error;
      }
    }

    await db.collection('users').doc(client2User.uid).set({
      uid: client2User.uid,
      email: 'sarah@example.com',
      role: 'client',
      tenantId: 'tenant-audiojones',
      displayName: 'Sarah Chen',
      emailVerified: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log('✅ Users created (Auth + Firestore)\n');
    console.log('🔐 Test credentials:');
    console.log('  Admin: admin@audiojones.com / AdminTest123!');
    console.log('  Client 1: marcus@example.com / ClientTest123!');
    console.log('  Client 2: sarah@example.com / ClientTest123!\n');

    // 3. Create Services
    console.log('Creating services...');
    await db.collection('services').doc('svc-mixing').set({
      tenantId: 'tenant-audiojones',
      name: 'Professional Mixing',
      category: 'artist',
      description: 'Get your tracks mixed by industry professionals. Includes unlimited revisions and stems delivery.',
      basePrice: 50000, // $500
      active: true,
      duration: 120,
      requiresApproval: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection('services').doc('svc-mastering').set({
      tenantId: 'tenant-audiojones',
      name: 'Mastering Session',
      category: 'artist',
      description: 'Professional mastering to make your tracks radio-ready. Includes streaming optimization.',
      basePrice: 30000, // $300
      active: true,
      duration: 60,
      requiresApproval: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection('services').doc('svc-consultation').set({
      tenantId: 'tenant-audiojones',
      name: 'Strategy Consultation',
      category: 'consulting',
      description: '1-on-1 strategy session for artists looking to level up their career and brand.',
      basePrice: 20000, // $200
      active: true,
      duration: 60,
      requiresApproval: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection('services').doc('svc-production').set({
      tenantId: 'tenant-audiojones',
      name: 'Beat Production',
      category: 'artist',
      description: 'Custom beat production tailored to your sound. Includes trackouts and unlimited revisions.',
      basePrice: 80000, // $800
      active: true,
      duration: 180,
      requiresApproval: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✅ Services created\n');

    // 4. Create Bookings (use actual user IDs)
    console.log('Creating bookings...');
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

    await db.collection('bookings').add({
      tenantId: 'tenant-audiojones',
      userId: client1User.uid,
      serviceId: 'svc-mixing',
      status: 'pending',
      scheduledAt: admin.firestore.Timestamp.fromDate(twoDaysFromNow),
      notes: 'Looking for a professional mix on my latest single. I have stems ready.',
      priceCents: 50000,
      startTime: admin.firestore.Timestamp.fromDate(twoDaysFromNow),
      endTime: admin.firestore.Timestamp.fromDate(new Date(twoDaysFromNow.getTime() + 2 * 60 * 60 * 1000)),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection('bookings').add({
      tenantId: 'tenant-audiojones',
      userId: client2User.uid,
      serviceId: 'svc-mastering',
      status: 'approved',
      scheduledAt: admin.firestore.Timestamp.fromDate(fiveDaysFromNow),
      notes: 'Final mastering for my EP. Need it to sound competitive on streaming.',
      priceCents: 30000,
      startTime: admin.firestore.Timestamp.fromDate(fiveDaysFromNow),
      endTime: admin.firestore.Timestamp.fromDate(new Date(fiveDaysFromNow.getTime() + 60 * 60 * 1000)),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection('bookings').add({
      tenantId: 'tenant-audiojones',
      userId: client1User.uid,
      serviceId: 'svc-consultation',
      status: 'approved',
      scheduledAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)),
      notes: 'Want to discuss my artist brand strategy and next release plan.',
      priceCents: 20000,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✅ Bookings created\n');

    console.log('✅ Firestore seeding complete!\n');
    console.log('Created:');
    console.log('  - 2 tenants (audiojones, artist-hub)');
    console.log('  - 3 users (1 admin, 2 clients)');
    console.log('  - 4 services (mixing, mastering, consultation, production)');
    console.log('  - 3 bookings (1 pending, 2 approved)');
    console.log('\nYou can now test the portals with real data!');
    
  } catch (error) {
    console.error('❌ Error seeding Firestore:', error);
    throw error;
  }
}

seedFirestore()
  .then(() => {
    console.log('🎉 Done! You can now test both portals with these credentials.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
