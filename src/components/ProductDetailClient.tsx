'use client';

import { useMemo, useState } from 'react';
import { CldImage } from 'next-cloudinary';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Heart, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useUIStore } from '@/store/uiStore';
import StarRating from '@/components/StarRating';
import ProductCard from '@/components/ProductCard';
import type { CloudinaryImage, ProductDetail, ProductSummary } from '@/types';

type Props = {
  product: ProductDetail & { stock: number; category?: { name: string; slug: string } | null; images: CloudinaryImage[] };
  relatedProducts: ProductSummary[];
};

export default function ProductDetailClient({ product, relatedProducts }: Props) {
  const hasCloudinary = !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'shipping'>('description');

  const { addItem } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();
  const { addToast } = useUIStore();

  const wishlisted = isWishlisted(product._id);
  const images = useMemo(() => product.images || [], [product.images]);
  const active = images?.[activeImage];
  const activeUrl = active?.url;
  const normalizedActiveUrl =
    activeUrl && !activeUrl.startsWith('http') && !activeUrl.startsWith('/')
      ? `/${activeUrl}`
      : activeUrl;

  const handleAddToCart = () => {
    addItem({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity,
      image: images?.[0]?.url,
    });
    addToast('Added to cart', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-[#E8A020]">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/shop" className="hover:text-[#E8A020]">Shop</Link>
        <ChevronRight className="w-4 h-4" />
        {product.category && (
          <>
            <Link href={`/shop?category=${product.category.slug}`} className="hover:text-[#E8A020]">
              {product.category.name}
            </Link>
            <ChevronRight className="w-4 h-4" />
          </>
        )}
        <span className="text-[#F5F0E8] truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
            {normalizedActiveUrl ? (
              hasCloudinary && active?.publicId ? (
                <CldImage
                  src={active.publicId}
                  alt={product.name}
                  fill
                  className="object-cover cursor-zoom-in"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <img
                  src={normalizedActiveUrl}
                  alt={product.name}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-700">No Image</div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.publicId ?? `${img.url}-${idx}`}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors ${
                    idx === activeImage ? 'border-[#E8A020]' : 'border-transparent hover:border-gray-600'
                  }`}
                >
                  {hasCloudinary && img.publicId ? (
                    <CldImage src={img.publicId} alt={`${product.name} ${idx + 1}`} fill className="object-cover" sizes="80px" />
                  ) : (
                    <img
                      src={!img.url.startsWith('http') && !img.url.startsWith('/') ? `/${img.url}` : img.url}
                      alt={`${product.name} ${idx + 1}`}
                      className="object-cover w-full h-full"
                      loading="lazy"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <h1 className="text-3xl md:text-4xl font-playfair font-bold text-[#F5F0E8] mb-4">{product.name}</h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <StarRating rating={product.avgRating || 0} />
              <span className="text-sm text-gray-400">({product.numReviews || 0} reviews)</span>
            </div>
            <span className="text-gray-600">|</span>
            <span className={`text-sm ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-3xl font-bold text-[#E8A020]">₹{product.price}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-xl text-gray-500 line-through">₹{product.comparePrice}</span>
            )}
          </div>

          <p className="text-gray-300 mb-8 leading-relaxed">
            {product.shortDescription || 'Premium quality product tailored for excellence.'}
          </p>

          <div className="mt-auto pt-8 border-t border-gray-800">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-700 rounded-md bg-[#0F0F0F]">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3 text-gray-400 hover:text-white transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock || q + 1, q + 1))}
                  className="p-3 text-gray-400 hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-[#E8A020] text-black font-bold py-3 px-8 rounded-md flex items-center justify-center gap-2 hover:bg-[#d6901a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(232,160,32,0.2)] hover:shadow-[0_0_25px_rgba(232,160,32,0.4)]"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>

              <button
                onClick={() => {
                  toggle(product._id);
                  addToast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist', 'info');
                }}
                className={`p-3 rounded-md border transition-colors flex items-center justify-center ${
                  wishlisted
                    ? 'border-[#E8A020] bg-[#E8A020]/10 text-[#E8A020]'
                    : 'border-gray-700 bg-[#0F0F0F] text-gray-400 hover:border-gray-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-16">
        <div className="flex border-b border-gray-800 mb-8">
          {(['description', 'reviews', 'shipping'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 font-medium capitalize transition-colors relative ${
                activeTab === tab ? 'text-[#E8A020]' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8A020]"
                />
              )}
            </button>
          ))}
        </div>

        <div className="min-h-[200px] text-gray-300 leading-relaxed">
          {activeTab === 'description' && (
            <div dangerouslySetInnerHTML={{ __html: product.description || 'No description available.' }} />
          )}
          {activeTab === 'reviews' && (
            <div>
              <p>Reviews feature coming soon.</p>
            </div>
          )}
          {activeTab === 'shipping' && (
            <div className="space-y-4">
              <p><strong>Free Standard Shipping</strong> on all orders over ₹5000.</p>
              <p>Estimated delivery: 3-5 business days.</p>
              <p><strong>Express Shipping</strong> available at checkout for ₹500.</p>
              <p>Estimated delivery: 1-2 business days.</p>
            </div>
          )}
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-playfair font-bold text-[#F5F0E8] mb-8">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
