'use client';

import { useUIStore } from '@/store/uiStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search as SearchIcon, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { CldImage } from 'next-cloudinary';
import { useRouter } from 'next/navigation';
import type { ProductSummary } from '@/types';

type SearchResult = Pick<ProductSummary, '_id' | 'slug' | 'name' | 'price' | 'images'>;

export default function SearchModal() {
  const hasCloudinary = !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const { searchOpen, closeSearch } = useUIStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [searchOpen]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        router.push(`/shop/${results[selectedIndex].slug}`);
        closeSearch();
      } else if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
        closeSearch();
      }
    } else if (e.key === 'Escape') {
      closeSearch();
    }
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[80] flex flex-col items-center pt-20 px-4"
        >
          <div className="w-full max-w-3xl bg-[#0F0F0F] rounded-xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center p-4 border-b border-gray-800">
              <SearchIcon className="w-6 h-6 text-gray-400 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search products, categories..."
                className="flex-1 bg-transparent text-xl text-[#F5F0E8] outline-none placeholder:text-gray-600 font-sans"
              />
              {loading && <Loader2 className="w-5 h-5 text-[#E8A020] animate-spin mr-3" />}
              <button onClick={closeSearch} className="p-2 text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {results.length > 0 ? (
                <ul className="py-2">
                  {results.map((product, idx) => (
                    <li key={product._id}>
                      <Link
                        href={`/shop/${product.slug}`}
                        onClick={closeSearch}
                        className={`flex items-center p-4 hover:bg-gray-900 transition-colors ${
                          idx === selectedIndex ? 'bg-gray-900' : ''
                        }`}
                      >
                        <div className="w-12 h-12 relative bg-gray-800 rounded overflow-hidden mr-4 flex-shrink-0">
                          {product.images?.[0]?.url ? (
                            hasCloudinary ? (
                              <CldImage
                                src={product.images[0].url}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            ) : (
                              <img
                                src={product.images[0].url}
                                alt={product.name}
                                className="object-cover w-full h-full"
                                loading="lazy"
                              />
                            )
                          ) : null}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-[#F5F0E8] font-medium">{product.name}</h4>
                          <p className="text-sm text-[#E8A020]">₹{product.price}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : query.trim().length >= 2 && !loading ? (
                <div className="p-8 text-center text-gray-500">
                  No results found for {`"${query}"`}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-600 text-sm">
                  Start typing to search...
                </div>
              )}
            </div>
            {query.trim().length > 0 && (
              <div className="p-3 bg-gray-900/50 border-t border-gray-800 text-center">
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={closeSearch}
                  className="text-sm text-[#E8A020] hover:underline"
                >
                  View all results
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
