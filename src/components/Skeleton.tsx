import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="bg-[#0F0F0F] rounded-lg overflow-hidden border border-gray-800 h-full flex flex-col animate-pulse">
      <div className="aspect-square bg-gray-900 w-full"></div>
      <div className="p-4 flex flex-col flex-1">
        <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-800 rounded w-1/2 mb-4"></div>
        <div className="mt-auto pt-2">
          <div className="h-5 bg-gray-800 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-800 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function OrderRowSkeleton() {
  return (
    <div className="animate-pulse flex items-center p-4 border-b border-gray-800">
      <div className="h-4 bg-gray-800 rounded w-1/6 mr-4"></div>
      <div className="h-4 bg-gray-800 rounded w-1/4 mr-4"></div>
      <div className="h-4 bg-gray-800 rounded w-1/6 mr-4"></div>
      <div className="h-6 bg-gray-800 rounded-full w-24 mr-4"></div>
      <div className="h-4 bg-gray-800 rounded w-1/12 ml-auto"></div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2">
          <div className="aspect-square bg-gray-900 rounded-lg mb-4"></div>
          <div className="flex gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-20 h-20 bg-gray-900 rounded-md"></div>
            ))}
          </div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="h-8 bg-gray-800 rounded w-3/4"></div>
          <div className="h-4 bg-gray-800 rounded w-1/4"></div>
          <div className="h-8 bg-gray-800 rounded w-1/3 mt-4"></div>
          <div className="h-24 bg-gray-800 rounded w-full mt-4"></div>
          <div className="flex gap-4 mt-6">
            <div className="h-12 bg-gray-800 rounded w-1/2"></div>
            <div className="h-12 bg-gray-800 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
