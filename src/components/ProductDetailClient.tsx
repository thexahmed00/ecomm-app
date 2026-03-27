'use client';

import { useMemo, useState } from 'react';
import { CldImage } from 'next-cloudinary';
import Link from 'next/link';
import Image from 'next/image';
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
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const hasCloudinary = !!cloudName;
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { addItem } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();
  const { addToast } = useUIStore();

  const wishlisted = isWishlisted(product._id);
  const images = useMemo(() => product.images || [], [product.images]);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const v of product.variants ?? []) {
      const key = v?.name?.trim();
      const value = v?.options?.[0];
      if (key && value) initial[key] = value;
    }
    return initial;
  });
  const active = images?.[activeImage];
  const activeUrl = active?.url;
  const activePublicId = active?.publicId;
  const normalizedActiveUrl =
    activeUrl && !activeUrl.startsWith('http') && !activeUrl.startsWith('/')
      ? `/${activeUrl}`
      : activeUrl;
  const canUseActiveCldImage =
    typeof activePublicId === 'string' &&
    (typeof activeUrl !== 'string' ||
      activeUrl.length === 0 ||
      (hasCloudinary && activeUrl.includes(`res.cloudinary.com/${cloudName}/`)));

  const handleAddToCart = () => {
    addItem({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity,
      image: images?.[0]?.url,
      selectedVariants,
    });
    addToast('Added to cart', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <nav className="flex items-center gap-2 text-xs tracking-[0.22em] uppercase text-[#7f7663] mb-10">
        <Link href="/shop" className="hover:text-[#1c1c18] hover:underline underline-offset-8 decoration-[#d4af37]">
          Collections
        </Link>
        <ChevronRight className="w-4 h-4" />
        {product.category ? (
          <>
            <Link
              href={`/shop?category=${product.category.slug}`}
              className="hover:text-[#1c1c18] hover:underline underline-offset-8 decoration-[#d4af37]"
            >
              {product.category.name}
            </Link>
            <ChevronRight className="w-4 h-4" />
          </>
        ) : null}
        <span className="text-[#4d4635] truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative aspect-square bg-[#f6f3ed] overflow-hidden border border-[#d0c5af]">
            {normalizedActiveUrl ? (
              canUseActiveCldImage ? (
                <CldImage
                  src={activePublicId}
                  alt={product.name}
                  fill
                  className="object-cover cursor-zoom-in"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <Image
                  src={normalizedActiveUrl}
                  alt={product.name}
                  fill
                  className="object-cover cursor-zoom-in"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#7f7663] text-sm tracking-[0.18em] uppercase">
                No Image
              </div>
            )}

            {images.length > 0 ? (
              <div className="absolute top-4 left-4 bg-[#fcf9f3]/80 backdrop-blur-[20px] border border-[#d0c5af] px-3 py-2 text-[11px] tracking-[0.22em] uppercase text-[#4d4635]">
                {String(activeImage + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
              </div>
            ) : null}
          </div>

          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.publicId ?? `${img.url}-${idx}`}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-20 h-20 flex-shrink-0 overflow-hidden border transition-colors ${
                    idx === activeImage ? 'border-[#d4af37]' : 'border-[#d0c5af] hover:border-[#7f7663]'
                  }`}
                >
                  {hasCloudinary && img.publicId && img.url.includes(`res.cloudinary.com/${cloudName}/`) ? (
                    <CldImage src={img.publicId} alt={`${product.name} ${idx + 1}`} fill className="object-cover" sizes="80px" />
                  ) : (
                    <Image
                      src={!img.url.startsWith('http') && !img.url.startsWith('/') ? `/${img.url}` : img.url}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <h1 className="text-3xl md:text-4xl font-playfair leading-tight text-[#1c1c18]">
            {product.name}
          </h1>
          <p className="mt-4 text-sm leading-6 text-[#4d4635]">
            {product.shortDescription || 'A quiet study in proportion and craft, designed to be worn for decades.'}
          </p>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <StarRating rating={product.avgRating || 0} />
              <span className="text-xs text-[#7f7663]">({product.numReviews || 0})</span>
            </div>
            <span className="text-[#d0c5af]">|</span>
            <span className={`text-xs tracking-[0.18em] uppercase ${product.stock > 0 ? 'text-[#4d4635]' : 'text-[#8f0402]'}`}>
              {product.stock > 0 ? 'Available' : 'Sold Out'}
            </span>
          </div>

          <div className="mt-8 flex items-baseline gap-4">
            <span className="text-2xl font-playfair text-[#1c1c18]">₹{product.price}</span>
            {product.comparePrice && product.comparePrice > product.price ? (
              <span className="text-sm text-[#7f7663] line-through">₹{product.comparePrice}</span>
            ) : null}
          </div>

          {(product.variants?.length ?? 0) > 0 ? (
            <div className="mt-10 space-y-8">
              {product.variants?.map((variant) => {
                const name = variant.name;
                const selected = selectedVariants[name];
                return (
                  <div key={name}>
                    <div className="flex items-baseline justify-between gap-6">
                      <h3 className="text-xs tracking-[0.24em] uppercase text-[#4d4635]">{name}</h3>
                      {selected ? <span className="text-xs text-[#7f7663]">{selected}</span> : null}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
                      {variant.options.map((option) => {
                        const isSelected = selected === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setSelectedVariants((prev) => ({ ...prev, [name]: option }))}
                            className={`text-sm pb-1 transition-colors ${
                              isSelected
                                ? 'text-[#1c1c18] border-b-2 border-[#d4af37]'
                                : 'text-[#4d4635] border-b-2 border-transparent hover:border-[#d4af37]/60'
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          <div className="mt-12 border-t border-[#d0c5af] pt-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <div className="flex items-center border border-[#d0c5af] bg-[#fcf9f3]">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-3 text-[#4d4635] hover:text-[#1c1c18] transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock || q + 1, q + 1))}
                    className="p-3 text-[#4d4635] hover:text-[#1c1c18] transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    toggle(product._id);
                    addToast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist', 'info');
                  }}
                  className={`p-3 border transition-colors flex items-center justify-center ${
                    wishlisted ? 'border-[#d4af37] bg-[#fcf9f3] text-[#d4af37]' : 'border-[#d0c5af] bg-[#fcf9f3] text-[#4d4635] hover:text-[#1c1c18]'
                  }`}
                  aria-label="Toggle wishlist"
                >
                  <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} suppressHydrationWarning={true} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full sm:flex-1 bg-[#d4af37] text-[#1c1c18] text-xs tracking-[0.24em] uppercase font-medium py-4 px-8 flex items-center justify-center gap-3 hover:bg-[#c29a30] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Bag
              </button>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => addToast('A client advisor will contact you shortly.', 'info')}
                className="w-full py-3 text-xs tracking-[0.24em] uppercase border border-[#d0c5af] text-[#1c1c18] hover:bg-[#f6f3ed] transition-colors"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-4">
            <details className="border border-[#d0c5af] bg-[#ffffff]">
              <summary className="cursor-pointer px-5 py-4 text-xs tracking-[0.24em] uppercase text-[#1c1c18]">
                Description
              </summary>
              <div className="px-5 pb-5 text-sm leading-7 text-[#4d4635]">
                <div dangerouslySetInnerHTML={{ __html: product.description || 'No description available.' }} />
              </div>
            </details>

            <details className="border border-[#d0c5af] bg-[#ffffff]">
              <summary className="cursor-pointer px-5 py-4 text-xs tracking-[0.24em] uppercase text-[#1c1c18]">
                Materials
              </summary>
              <div className="px-5 pb-5 text-sm leading-7 text-[#4d4635]">
                <p>Metals and stones are selected for longevity, proportion, and light. Each piece is finished by hand.</p>
              </div>
            </details>

            <details className="border border-[#d0c5af] bg-[#ffffff]">
              <summary className="cursor-pointer px-5 py-4 text-xs tracking-[0.24em] uppercase text-[#1c1c18]">
                Care
              </summary>
              <div className="px-5 pb-5 text-sm leading-7 text-[#4d4635]">
                <p>Store in its box between wears. Avoid direct contact with perfume, lotions, and harsh chemicals.</p>
              </div>
            </details>
          </div>

          <div className="lg:col-span-5">
            <div className="border border-[#d0c5af] bg-[#f6f3ed] p-6">
              <h3 className="text-xs tracking-[0.24em] uppercase text-[#4d4635]">Delivery</h3>
              <p className="mt-4 text-sm leading-7 text-[#4d4635]">
                Complimentary standard delivery. Express delivery available at checkout. Boutique pickup by appointment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-xl font-playfair text-[#1c1c18] mb-8">You May Also Like</h2>
          <div className="flex gap-6 overflow-x-auto pb-2">
            {relatedProducts.map((p) => (
              <div key={p._id} className="min-w-[260px] max-w-[260px]">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
