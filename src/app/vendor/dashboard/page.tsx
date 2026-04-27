'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { auth } from '@/lib/firebase';

interface VendorProfile {
  storeName: string;
  storeSlug: string;
  bio: string;
  totalEarnings: number;
  pendingPayout: number;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  isActive: boolean;
  images: { url: string; alt?: string }[];
}

async function fetchWithAuth(url: string) {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
}

export default function VendorDashboard() {
  const { mongoUser, firebaseUser } = useAuthStore();
  const router = useRouter();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseUser && !mongoUser) return;
    if (mongoUser && mongoUser.role !== 'vendor') {
      router.push('/');
      return;
    }
  }, [firebaseUser, mongoUser, router]);

  useEffect(() => {
    if (!firebaseUser) return;
    Promise.all([
      fetchWithAuth('/api/vendor/profile'),
      fetchWithAuth('/api/vendor/products'),
    ])
      .then(([profileData, productsData]) => {
        setProfile(profileData.profile);
        setProducts(productsData.products);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [firebaseUser]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    const token = await auth.currentUser?.getIdToken();
    await fetch(`/api/vendor/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setProducts((prev) => prev.filter((p) => p._id !== id));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* Store header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{profile?.storeName}</h1>
          <p className="text-sm text-gray-500">/{profile?.storeSlug}</p>
        </div>
        <Link
          href="/vendor/products/new"
          className="inline-block bg-[#d4af37] text-[#1c1c18] py-3 px-6 text-xs tracking-[0.24em] uppercase hover:bg-[#c29a30] transition-colors"
        >
          Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Products', value: products.length },
          { label: 'Total Earnings', value: `$${profile?.totalEarnings.toFixed(2)}` },
          { label: 'Pending Payout', value: `$${profile?.pendingPayout.toFixed(2)}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Products list */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Products</h2>
        {products.length === 0 ? (
          <p className="text-gray-400 text-sm">No products yet. Add your first one.</p>
        ) : (
          // TODO(human): Render the products list here.
          // Each row should show: product image thumbnail, name, price, stock count, active status badge, and Edit/Delete buttons.
          // Use <table> or a flex/grid layout — your choice. Delete calls handleDelete(product._id).
          // Edit should link to /vendor/products/[id]/edit (page doesn't exist yet, just wire the link).
          <div />
        )}
      </div>
    </div>
  );
}
