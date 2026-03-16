'use client';

import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/Skeleton';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ProductSummary } from '@/types';

export default function WishlistPage() {
  const { productIds } = useWishlistStore();
  const { mongoUser, loading: authLoading } = useAuthStore();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !mongoUser) {
      router.push('/auth/login?redirect=/wishlist');
    }
  }, [authLoading, mongoUser, router]);

  useEffect(() => {
    async function fetchWishlistProducts() {
      if (productIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // We'll fetch products one by one or we could add a bulk fetch endpoint.
        // For simplicity, we'll use Promise.all with individual fetches
        const promises = productIds.map(id => fetch(`/api/products/${id}`).then(res => res.ok ? res.json() : null));
        const results = await Promise.all(promises);
        setProducts(results.filter(Boolean));
      } catch (error) {
        console.error('Failed to fetch wishlist products:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (mongoUser) {
      fetchWishlistProducts();
    }
  }, [productIds, mongoUser]);

  if (authLoading || (!mongoUser && loading)) {
    return <div className="max-w-7xl mx-auto px-4 py-12"><ProductGridSkeleton count={4} /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1">
      <h1 className="text-3xl font-playfair font-bold text-[#F5F0E8] mb-8">My Wishlist</h1>

      {loading ? (
        <ProductGridSkeleton count={4} />
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-900/30 rounded-lg border border-gray-800">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <Heart className="w-10 h-10 text-gray-500" />
          </div>
          <h2 className="text-xl font-medium text-[#F5F0E8] mb-2">Your wishlist is empty</h2>
          <p className="text-gray-400 mb-8 text-center max-w-md">
            Save items you love to your wishlist. Review them anytime and easily move them to your cart.
          </p>
          <Link href="/shop" className="bg-[#E8A020] text-black font-medium px-8 py-3 rounded hover:bg-[#d6901a] transition-colors">
            Discover Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product._id} className="relative">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
