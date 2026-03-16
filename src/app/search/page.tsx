'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import ProductCard from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/Skeleton';
import { Search as SearchIcon } from 'lucide-react';
import type { ProductSummary } from '@/types';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      if (!query) {
        setResults([]);
        setLoading(false);
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
    }
    
    fetchResults();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1">
      <div className="mb-8">
        <h1 className="text-3xl font-playfair font-bold text-[#F5F0E8] mb-2">
          Search Results
        </h1>
        {query && (
          <p className="text-gray-400">
            Showing results for <span className="text-[#E8A020] font-medium">{`"${query}"`}</span>
          </p>
        )}
      </div>

      {!query ? (
        <div className="py-20 text-center">
          <SearchIcon className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-xl text-gray-500">Please enter a search term to find products.</p>
        </div>
      ) : loading ? (
        <ProductGridSkeleton count={8} />
      ) : results.length === 0 ? (
        <div className="py-20 text-center bg-gray-900/30 rounded-lg border border-gray-800">
          <SearchIcon className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-[#F5F0E8] mb-2">No results found</h2>
          <p className="text-gray-400 max-w-md mx-auto">
            We could not find any products matching {`"${query}"`}. Try checking your spelling or using different keywords.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-12"><ProductGridSkeleton count={8} /></div>}>
      <SearchContent />
    </Suspense>
  );
}
