'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/Skeleton';
import { motion } from 'framer-motion';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import type { CategorySummary, ProductSummary } from '@/types';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [total, setTotal] = useState(0);

  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || 'newest';

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams(searchParams.toString());
        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        setProducts(data.products || []);
        setTotal(data.total || 0);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [searchParams]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset to page 1 on filter change
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-playfair font-bold text-[#F5F0E8] mb-2">Shop Collection</h1>
          <p className="text-gray-400">Showing {products.length} of {total} products</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            className="md:hidden flex items-center gap-2 text-gray-400 hover:text-[#E8A020]"
            onClick={() => setShowFilters(true)}
          >
            <Filter className="w-5 h-5" /> Filters
          </button>
          
          <div className="hidden md:flex items-center gap-2">
            <span className="text-gray-400 text-sm">Sort by:</span>
            <select 
              value={currentSort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="bg-[#0F0F0F] border border-gray-800 rounded-md text-[#F5F0E8] text-sm py-2 px-3 focus:outline-none focus:border-[#E8A020]"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className={`
          fixed inset-0 z-50 bg-[#0F0F0F] p-6 md:static md:bg-transparent md:p-0 md:z-auto md:w-64 flex-shrink-0 transition-transform duration-300
          ${showFilters ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="flex justify-between items-center md:hidden mb-6">
            <h2 className="text-xl font-bold text-[#F5F0E8]">Filters</h2>
            <button onClick={() => setShowFilters(false)} className="text-gray-400">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-[#F5F0E8] font-medium mb-4 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#E8A020]" /> Categories
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="category" 
                    checked={currentCategory === ''}
                    onChange={() => updateFilter('category', '')}
                    className="accent-[#E8A020] bg-gray-900 border-gray-700"
                  />
                  <span className={`text-sm ${currentCategory === '' ? 'text-[#E8A020]' : 'text-gray-400'}`}>All Products</span>
                </label>
                {categories.map((cat) => (
                  <label key={cat._id} className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="radio" 
                      name="category" 
                      checked={currentCategory === cat.slug}
                      onChange={() => updateFilter('category', cat.slug)}
                      className="accent-[#E8A020] bg-gray-900 border-gray-700"
                    />
                    <span className={`text-sm ${currentCategory === cat.slug ? 'text-[#E8A020]' : 'text-gray-400'}`}>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional filters can be added here (Price, Rating, etc.) */}
            <div className="md:hidden pt-6 border-t border-gray-800">
              <button 
                onClick={() => setShowFilters(false)}
                className="w-full bg-[#E8A020] text-black font-bold py-3 rounded-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <ProductGridSkeleton count={9} />
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-900/20 rounded-lg border border-gray-800">
              <h3 className="text-xl text-[#F5F0E8] mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your filters to find what you are looking for.</p>
              <button 
                onClick={() => router.push('/shop')}
                className="mt-6 text-[#E8A020] hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-12"><ProductGridSkeleton count={12} /></div>}>
      <ShopContent />
    </Suspense>
  );
}
