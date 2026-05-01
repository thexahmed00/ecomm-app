'use client';
import React, { useEffect } from 'react';
import VendorSidebar from '@/components/vendor/sidebar';
import { useVendorStore } from '@/store/vendorStore';
import { useAuthStore } from '@/store/authStore';

const VendorLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { vendorProfile, loading, fetchVendorProfile } = useVendorStore();
  const firebaseUser = useAuthStore((state) => state.firebaseUser);

  useEffect(() => {
    if (!firebaseUser) return;
    firebaseUser.getIdToken().then((token) => fetchVendorProfile(token));
  }, [firebaseUser, fetchVendorProfile]);

  if (loading && !vendorProfile) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex flex-1 min-h-[calc(100vh-104px)]">
      <VendorSidebar />
      <main className="flex-1 p-8 bg-[#fcf9f3]">{children}</main>
    </div>
  );
};

export default VendorLayout;
