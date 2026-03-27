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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 w-full">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
        <div>
          <p className="text-xs tracking-[0.28em] uppercase text-[#7f7663]">Collections</p>
          <h1 className="mt-4 text-3xl md:text-4xl font-playfair text-[#1c1c18]">Shop</h1>
          <p className="mt-3 text-sm text-[#4d4635]">Showing {products.length} of {total} pieces</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            className="md:hidden flex items-center gap-2 text-xs tracking-[0.24em] uppercase text-[#4d4635] hover:text-[#1c1c18]"
            onClick={() => setShowFilters(true)}
          >
            <Filter className="w-4 h-4" /> Filters
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs tracking-[0.24em] uppercase text-[#7f7663]">Sort</span>
            <select
              value={currentSort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="bg-transparent border-b border-[#d0c5af] text-sm py-2 px-1 focus:outline-none focus:border-[#d4af37]"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price (Low)</option>
              <option value="price_desc">Price (High)</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className={`
          fixed inset-0 z-50 bg-[#fcf9f3] p-6 md:static md:bg-transparent md:p-0 md:z-auto md:w-64 flex-shrink-0 transition-transform duration-300
          overflow-y-auto md:overflow-visible
          ${showFilters ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="flex justify-between items-center md:hidden mb-6">
            <h2 className="text-base tracking-[0.24em] uppercase text-[#1c1c18]">Filters</h2>
            <button onClick={() => setShowFilters(false)} className="text-[#4d4635]">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-xs tracking-[0.24em] uppercase text-[#4d4635] mb-6 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#d4af37]" /> Categories
              </h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="category" 
                    checked={currentCategory === ''}
                    onChange={() => updateFilter('category', '')}
                    className="accent-[#d4af37]"
                  />
                  <span className={`text-sm ${currentCategory === '' ? 'text-[#1c1c18] underline underline-offset-8 decoration-[#d4af37]' : 'text-[#4d4635]'}`}>
                    All Pieces
                  </span>
                </label>
                {categories.map((cat) => (
                  <label key={cat._id} className="flex items-center justify-between gap-3 cursor-pointer">
                    <input 
                      type="radio" 
                      name="category" 
                      checked={currentCategory === cat.slug}
                      onChange={() => updateFilter('category', cat.slug)}
                      className="accent-[#d4af37]"
                    />
                    <span className={`text-sm ${currentCategory === cat.slug ? 'text-[#1c1c18] underline underline-offset-8 decoration-[#d4af37]' : 'text-[#4d4635]'}`}>
                      {cat.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional filters can be added here (Price, Rating, etc.) */}
            <div className="md:hidden pt-6 border-t border-[#d0c5af]">
              <button 
                onClick={() => setShowFilters(false)}
                className="w-full bg-[#d4af37] text-[#1c1c18] py-4 text-xs tracking-[0.24em] uppercase hover:bg-[#c29a30] transition-colors"
              >
                Apply
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
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#ffffff] border border-[#d0c5af]">
              <h3 className="text-xl font-playfair text-[#1c1c18] mb-3">No results</h3>
              <p className="text-sm text-[#4d4635]">Adjust filters to refine your selection.</p>
              <button 
                onClick={() => router.push('/shop')}
                className="mt-8 text-xs tracking-[0.24em] uppercase text-[#1c1c18] underline underline-offset-8 decoration-[#d4af37]"
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
