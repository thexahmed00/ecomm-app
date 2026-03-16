'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Truck, RotateCcw, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/Skeleton';
import type { ProductSummary } from '@/types';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch('/api/products?featured=true&limit=6');
        const data = await res.json();
        setFeaturedProducts(data.products || []);
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[#0F0F0F] z-0">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-playfair font-bold text-[#F5F0E8] mb-6 leading-tight"
          >
            Elevate Your <span className="text-[#E8A020] italic">Lifestyle</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
          >
            Discover our curated collection of premium essentials designed for the modern connoisseur.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link 
              href="/shop" 
              className="inline-flex items-center gap-2 bg-[#E8A020] text-black px-8 py-4 rounded-md font-bold text-lg hover:bg-[#d6901a] transition-colors shadow-[0_0_20px_rgba(232,160,32,0.3)] hover:shadow-[0_0_30px_rgba(232,160,32,0.5)]"
            >
              Shop Collection <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Why Us Strip */}
      <section className="bg-gray-900/50 border-y border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center justify-center">
              <Truck className="w-8 h-8 text-[#E8A020] mb-3" />
              <h3 className="text-[#F5F0E8] font-medium mb-1">Free Shipping</h3>
              <p className="text-sm text-gray-500">On orders over ₹5000</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <RotateCcw className="w-8 h-8 text-[#E8A020] mb-3" />
              <h3 className="text-[#F5F0E8] font-medium mb-1">Easy Returns</h3>
              <p className="text-sm text-gray-500">30-day return policy</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-[#E8A020] mb-3" />
              <h3 className="text-[#F5F0E8] font-medium mb-1">Secure Payment</h3>
              <p className="text-sm text-gray-500">100% safe checkout</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <Clock className="w-8 h-8 text-[#E8A020] mb-3" />
              <h3 className="text-[#F5F0E8] font-medium mb-1">24/7 Support</h3>
              <p className="text-sm text-gray-500">Always here for you</p>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-[#F5F0E8] mb-4">Shop by Category</h2>
            <div className="w-24 h-1 bg-[#E8A020] mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['electronics', 'fashion', 'home-living'].map((slug) => (
              <Link key={slug} href={`/shop?category=${slug}`} className="group relative h-96 overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-gray-900">
                  {/* Fallback pattern if no image */}
                  <div className="w-full h-full opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black"></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity group-hover:opacity-90"></div>
                <div className="absolute inset-0 flex flex-col justify-end p-8 z-20">
                  <h3 className="text-2xl font-playfair font-bold text-white mb-2 capitalize group-hover:-translate-y-2 transition-transform duration-300">{slug.replace('-', ' ')}</h3>
                  <span className="text-[#E8A020] font-medium opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2">
                    Explore <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-playfair font-bold text-[#F5F0E8] mb-4">Featured Collection</h2>
              <div className="w-24 h-1 bg-[#E8A020]"></div>
            </div>
            <Link href="/shop" className="hidden md:flex items-center gap-2 text-[#E8A020] hover:text-amber-500 transition-colors font-medium">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {loading ? (
            <ProductGridSkeleton count={6} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
          
          <div className="mt-10 text-center md:hidden">
            <Link href="/shop" className="inline-flex items-center gap-2 text-[#E8A020] border border-[#E8A020] px-6 py-3 rounded-md hover:bg-[#E8A020]/10 transition-colors font-medium">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0F0F0F] z-0 border-t border-gray-800"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-[#F5F0E8] mb-4">Join the Inner Circle</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Subscribe to receive exclusive access to new collections, limited editions, and curated editorial content.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => { e.preventDefault(); alert('Subscribed!'); }}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              required
              className="flex-1 bg-gray-900 border border-gray-700 rounded-md px-4 py-3 text-[#F5F0E8] focus:outline-none focus:border-[#E8A020] transition-colors"
            />
            <button 
              type="submit"
              className="bg-[#E8A020] text-black font-bold px-8 py-3 rounded-md hover:bg-[#d6901a] transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
