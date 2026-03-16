import { ProductDetailSkeleton } from '@/components/Skeleton';

export default function ProductLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProductDetailSkeleton />
    </div>
  );
}