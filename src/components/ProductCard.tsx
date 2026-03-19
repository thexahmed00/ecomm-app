'use client';

import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useUIStore } from '@/store/uiStore';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { CldImage } from 'next-cloudinary';
import StarRating from './StarRating';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number;
    images: { url: string; publicId?: string }[];
    avgRating: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const hasCloudinary = !!cloudName;
  const { addItem } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();
  const { addToast } = useUIStore();

  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0]?.url,
    });
    addToast('Added to cart', 'success');
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product._id);
    addToast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist', 'info');
  };

  const primaryImage = product.images?.[0];
  const primaryImageUrl = primaryImage?.url;
  const primaryPublicId = primaryImage?.publicId;
  const normalizedImageUrl =
    primaryImageUrl && !primaryImageUrl.startsWith('http') && !primaryImageUrl.startsWith('/')
      ? `/${primaryImageUrl}`
      : primaryImageUrl;
  const canUseCldImage =
    typeof primaryPublicId === 'string' &&
    (typeof primaryImageUrl !== 'string' ||
      primaryImageUrl.length === 0 ||
      (hasCloudinary && primaryImageUrl.includes(`res.cloudinary.com/${cloudName}/`)));

  return (
    <Link href={`/shop/${product.slug}`} className="block group">
      <motion.div
        className="bg-[#0F0F0F] rounded-lg overflow-hidden border border-gray-800 transition-all duration-300 hover:shadow-[0_0_20px_rgba(232,160,32,0.15)] hover:border-[#E8A020]/30 h-full flex flex-col relative"
        whileHover={{ y: -5 }}
      >
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 backdrop-blur-md text-gray-300 hover:text-[#E8A020] transition-colors"
        >
          <Heart
            className={`w-5 h-5 ${wishlisted ? 'fill-[#E8A020] text-[#E8A020]' : ''}`}
            suppressHydrationWarning={true}
          />
        </button>

        <div className="relative aspect-square overflow-hidden bg-gray-900">
          {normalizedImageUrl ? (
            canUseCldImage ? (
              <CldImage
                src={primaryPublicId}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <img
                src={normalizedImageUrl}
                alt={product.name}
                className="object-cover w-full h-full"
                loading="lazy"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-700">
              No Image
            </div>
          )}
          
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10 bg-gradient-to-t from-black/80 to-transparent">
            <button
              onClick={handleAddToCart}
              className="w-full py-2.5 bg-[#E8A020] text-black font-semibold rounded-md flex items-center justify-center gap-2 hover:bg-[#d6901a] transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-[#F5F0E8] font-medium line-clamp-2 mb-1">{product.name}</h3>
          
          <div className="mt-auto pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-[#E8A020] font-bold">₹{product.price}</span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-gray-500 text-sm line-through">₹{product.comparePrice}</span>
                )}
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <StarRating rating={product.avgRating} size="sm" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
