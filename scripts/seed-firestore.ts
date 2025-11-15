// Firestore seed script - Run once to populate initial data
// Usage: node --loader ts-node/esm scripts/seed-firestore.ts

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, setDoc, doc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedFirestore() {
  console.log('🌱 Seeding Firestore...\n');

  try {
    // 1. Create Tenants
    console.log('Creating tenants...');
    const tenant1 = await setDoc(doc(db, 'tenants', 'tenant-audiojones'), {
      name: 'Audio Jones',
      slug: 'audiojones',
      status: 'active',
      plan: 'pro',
      ownerUserId: 'user-admin',
      primaryColor: '#FF4500',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    const tenant2 = await setDoc(doc(db, 'tenants', 'tenant-artisthub'), {
      name: 'Artist Hub',
      slug: 'artist-hub',
      status: 'active',
      plan: 'standard',
      ownerUserId: 'user-admin',
      primaryColor: '#FFD700',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log('✅ Tenants created\n');

    // 2. Create Users
    console.log('Creating users...');
    await setDoc(doc(db, 'users', 'user-admin'), {
      uid: 'user-admin',
      email: 'admin@audiojones.com',
      role: 'admin',
      tenantId: 'tenant-audiojones',
      displayName: 'Admin User',
      emailVerified: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    await setDoc(doc(db, 'users', 'user-client1'), {
      uid: 'user-client1',
      email: 'marcus@example.com',
      role: 'client',
      tenantId: 'tenant-audiojones',
      displayName: 'Marcus Williams',
      emailVerified: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    await setDoc(doc(db, 'users', 'user-client2'), {
      uid: 'user-client2',
      email: 'sarah@example.com',
      role: 'client',
      tenantId: 'tenant-audiojones',
      displayName: 'Sarah Chen',
      emailVerified: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log('✅ Users created\n');

    // 3. Create Services
    console.log('Creating services...');
    const service1 = await setDoc(doc(db, 'services', 'svc-mixing'), {
      tenantId: 'tenant-audiojones',
      name: 'Professional Mixing',
      category: 'artist',
      description: 'Get your tracks mixed by industry professionals. Includes unlimited revisions and stems delivery.',
      basePrice: 50000, // $500
      active: true,
      duration: 120,
      requiresApproval: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    await setDoc(doc(db, 'services', 'svc-mastering'), {
      tenantId: 'tenant-audiojones',
      name: 'Mastering Session',
      category: 'artist',
      description: 'Professional mastering to make your tracks radio-ready. Includes streaming optimization.',
      basePrice: 30000, // $300
      active: true,
      duration: 60,
      requiresApproval: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    await setDoc(doc(db, 'services', 'svc-consultation'), {
      tenantId: 'tenant-audiojones',
      name: 'Strategy Consultation',
      category: 'consulting',
      description: '1-on-1 strategy session for artists looking to level up their career and brand.',
      basePrice: 20000, // $200
      active: true,
      duration: 60,
      requiresApproval: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    await setDoc(doc(db, 'services', 'svc-production'), {
      tenantId: 'tenant-audiojones',
      name: 'Beat Production',
      category: 'artist',
      description: 'Custom beat production tailored to your sound. Includes trackouts and unlimited revisions.',
      basePrice: 80000, // $800
      active: true,
      duration: 180,
      requiresApproval: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log('✅ Services created\n');

    // 4. Create Bookings
    console.log('Creating bookings...');
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

    await addDoc(collection(db, 'bookings'), {
      tenantId: 'tenant-audiojones',
      userId: 'user-client1',
      serviceId: 'svc-mixing',
      status: 'pending',
      scheduledAt: Timestamp.fromDate(twoDaysFromNow),
      notes: 'Looking for a professional mix on my latest single. I have stems ready.',
      priceCents: 50000,
      startTime: Timestamp.fromDate(twoDaysFromNow),
      endTime: Timestamp.fromDate(new Date(twoDaysFromNow.getTime() + 2 * 60 * 60 * 1000)),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    await addDoc(collection(db, 'bookings'), {
      tenantId: 'tenant-audiojones',
      userId: 'user-client2',
      serviceId: 'svc-mastering',
      status: 'approved',
      scheduledAt: Timestamp.fromDate(fiveDaysFromNow),
      notes: 'Final mastering for my EP. Need it to sound competitive on streaming.',
      priceCents: 30000,
      startTime: Timestamp.fromDate(fiveDaysFromNow),
      endTime: Timestamp.fromDate(new Date(fiveDaysFromNow.getTime() + 60 * 60 * 1000)),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    await addDoc(collection(db, 'bookings'), {
      tenantId: 'tenant-audiojones',
      userId: 'user-client1',
      serviceId: 'svc-consultation',
      status: 'approved',
      scheduledAt: Timestamp.fromDate(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)),
      notes: 'Want to discuss my artist brand strategy and next release plan.',
      priceCents: 20000,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
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

seedFirestore();
