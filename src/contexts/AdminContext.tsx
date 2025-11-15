"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import type { User, Tenant } from '@/lib/types/firestore';

interface AdminContextValue {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  selectedTenantId: string | null;
  setSelectedTenantId: (tenantId: string | null) => void;
  tenants: Tenant[];
  loading: boolean;
}

const AdminContext = createContext<AdminContextValue>({
  user: null,
  firebaseUser: null,
  selectedTenantId: null,
  setSelectedTenantId: () => {},
  tenants: [],
  loading: true,
});

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Fetch user document
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser(userData);

            // If admin, fetch all tenants
            if (userData.role === 'admin') {
              const tenantsSnap = await getDocs(
                query(collection(db, 'tenants'), where('status', '==', 'active'))
              );
              const tenantsData = tenantsSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              })) as Tenant[];
              setTenants(tenantsData);

              // Default to first tenant or "all"
              if (tenantsData.length > 0 && !selectedTenantId) {
                setSelectedTenantId(null); // null = "all tenants"
              }
            }
          } else {
            console.warn('User document not found for:', firebaseUser.uid);
            setUser(null);
          }
        } catch (error) {
          console.error('Failed to fetch admin data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
        setTenants([]);
        setSelectedTenantId(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AdminContext.Provider
      value={{
        user,
        firebaseUser,
        selectedTenantId,
        setSelectedTenantId,
        tenants,
        loading,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
