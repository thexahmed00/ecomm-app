'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Sparkles } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { ProductGridSkeleton } from '@/components/Skeleton';
import type { ProductSummary } from '@/types';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      carouselRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

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
    <div className="flex flex-col">
      <section className="relative w-full">
        <div className="relative h-[90vh] w-full overflow-hidden">
          <Image src="/category.jpeg" alt="Featured piece" fill className="object-cover" sizes="100vw" priority />

          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(28,28,24,0.18),rgba(28,28,24,0.82))]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c18]/50 via-transparent to-transparent" />

          <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl text-center">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-[11px] tracking-[0.3em] uppercase text-[#fcf9f3]/80"
              >
                The Art of Creation
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.08 }}
                className="mt-6 font-playfair text-[#ffffff] text-6xl md:text-8xl leading-[1.05]"
              >
                Timeless <span className="italic">Elegance</span>,<br />
                Defined by Hand.
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6"
              >
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center px-12 py-4 bg-[#ffffff] text-[#1c1c18] text-[11px] tracking-[0.2em] uppercase hover:bg-[#f6f3ed] transition-colors"
                >
                  Shop Collection
                </Link>
                <Link
                  href="/#about"
                  className="inline-flex items-center justify-center px-12 py-4 border border-[#ffffff] text-[#ffffff] text-[11px] tracking-[0.2em] uppercase hover:bg-[#ffffff]/10 transition-colors"
                >
                  Discover Craft
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
          {/* Jewelry Category */}
          <Link href="/shop?category=jewelry" className="group relative h-[50vh] sm:h-[60vh] overflow-hidden">
            <div className="absolute inset-0">
              <Image src="/herojewel.jpeg" alt="Jewelry" fill className="object-cover group-hover:grayscale-0 transition-all duration-700" sizes="(max-width: 768px) 100vw, 33vw" priority />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c18]/80 to-transparent" />
            <div className="absolute bottom-8 left-8">
              <h3 className="text-2xl sm:text-3xl font-playfair text-white mb-1">Jewelry</h3>
              <p className="text-xs tracking-[0.24em] uppercase text-[#d4af37] group-hover:text-[#fcf9f3] transition-colors">EXPLORE CREATIONS</p>
            </div>
          </Link>
          {/* Watches Category */}
          <Link href="/shop?category=watches" className="group relative h-[50vh] sm:h-[60vh] overflow-hidden">
            <div className="absolute inset-0">
              <Image src="/cat2.jpeg" alt="Watches" fill className="object-cover  group-hover:grayscale-0 transition-all duration-700" sizes="(max-width: 768px) 100vw, 33vw" priority />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c18]/80 to-transparent" />
            <div className="absolute bottom-8 left-8">
              <h3 className="text-2xl sm:text-3xl font-playfair text-white mb-1">Watches</h3>
              <p className="text-xs tracking-[0.24em] uppercase text-[#d4af37] group-hover:text-[#fcf9f3] transition-colors">THE COLLECTION</p>
            </div>
          </Link>
          {/* Accessories Category */}
          <Link href="/shop?category=accessories" className="group relative h-[50vh] sm:h-[60vh] overflow-hidden">
            <div className="absolute inset-0">
              <Image src="/cat3.jpeg" alt="Accessories" fill className="object-cover  group-hover:grayscale-0 transition-all duration-700" sizes="(max-width: 768px) 100vw, 33vw" priority />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c18]/80 to-transparent" />
            <div className="absolute bottom-8 left-8">
              <h3 className="text-2xl sm:text-3xl font-playfair text-white mb-1">Accessories</h3>
              <p className="text-xs tracking-[0.24em] uppercase text-[#d4af37] group-hover:text-[#fcf9f3] transition-colors">SHOP ALL</p>
            </div>
          </Link>
        </div>
      </section>

      <section className="bg-[#F0EEE8]  mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="flex items-end justify-between gap-8 mb-12">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#A48943] mb-3">Selected Works</p>
            <h2 className="text-3xl md:text-4xl font-playfair text-[#1c1c18]">Featured Curations</h2>
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <button onClick={() => scroll('left')} className="p-3 border border-[#d0c5af] hover:bg-[#f6f3ed] transition-colors text-[#1c1c18]">
              <ChevronLeft className="w-5 h-5" strokeWidth={1} />
            </button>
            <button onClick={() => scroll('right')} className="p-3 border border-[#d0c5af] hover:bg-[#f6f3ed] transition-colors text-[#1c1c18]">
              <ChevronRight className="w-5 h-5" strokeWidth={1} />
            </button>
          </div>
        </div>

        <div className="relative">
          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div 
              ref={carouselRef}
              className="flex md:grid md:grid-cols-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none gap-6 md:gap-8 pb-8 md:pb-0 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {featuredProducts.map((product, i) => {
                const primaryImage = product.images?.[0];
                const primaryImageUrl = primaryImage?.url;
                const primaryPublicId = primaryImage?.publicId;
                const normalizedImageUrl =
                  primaryImageUrl && !primaryImageUrl.startsWith('http') && !primaryImageUrl.startsWith('/')
                    ? `/${primaryImageUrl}`
                    : primaryImageUrl;
                
                const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                const hasCloudinary = !!cloudName;
                const canUseCldImage =
                  typeof primaryPublicId === 'string' &&
                  (typeof primaryImageUrl !== 'string' ||
                    primaryImageUrl.length === 0 ||
                    (hasCloudinary && primaryImageUrl.includes(`res.cloudinary.com/${cloudName}/`)));

                return (
                  <motion.div
                    key={product._id}
                    className="min-w-[280px] md:min-w-0 snap-start md:snap-none flex-shrink-0 md:flex-shrink"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link href={`/shop/${product.slug}`} className="block group">
                      <div className="relative aspect-square overflow-hidden bg-[#f9f8f6] mb-6">
                        {normalizedImageUrl ? (
                          canUseCldImage ? (
                            <CldImage
                              src={primaryPublicId}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                              sizes="(max-width: 768px) 100vw, 25vw"
                            />
                          ) : (
                            <Image
                              src={normalizedImageUrl}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                              sizes="(max-width: 768px) 100vw, 25vw"
                            />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#7f7663] text-sm tracking-[0.18em] uppercase">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="text-center px-2">
                        <h3 className="text-[#1c1c18] font-playfair text-lg md:text-xl mb-2 line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-sm text-[#A48943] tracking-wider">
                          ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section id="about" className="w-full bg-[#fcf9f3] border-t border-[#d0c5af] scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 relative">
              <div className="absolute -left-8 -top-8 h-28 w-28 bg-[#e7dfd2]" aria-hidden="true" />
              <div className="relative aspect-[4/3] overflow-hidden bg-[#f6f3ed] border border-[#d0c5af]">
                <Image
                  src="/category.jpeg"
                  alt="Atelier craft"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </div>

              <div className="absolute bottom-6 right-6">
                <Link
                  href="/#about"
                  className="inline-flex items-center gap-4 px-6 py-4 bg-[#ffffff] text-[#1c1c18] text-[10px] tracking-[0.22em] uppercase border border-[#d0c5af] hover:bg-[#f6f3ed] transition-colors shadow-sm"
                >
                  <span className="h-9 w-9 border border-[#d0c5af] flex items-center justify-center">
                    <Play className="w-4 h-4" strokeWidth={1.5} />
                  </span>
                  <span>THE LEGACY FILM</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <p className="text-[10px] tracking-[0.28em] uppercase text-[#A48943]">LEGACY SINCE 1894</p>
              <h2 className="mt-6 font-playfair text-5xl md:text-6xl leading-[0.95] text-[#1c1c18]">
                Mastery in <span className="italic">Every Facet.</span>
              </h2>
              <p className="mt-8 text-sm leading-7 text-[#4d4635] max-w-md">
                In the heart of the Atelier, time slows down. Every creation is a dialogue between the artisan and the rare
                materials bestowed by nature. We don&apos;t just set stones; we capture light.
              </p>
              <p className="mt-6 text-sm leading-7 text-[#4d4635] max-w-md">
                Our commitment to excellence transcends generations. From the first sketch on vellum to the final
                hand-polish, every step is a testament to the pursuit of perfection.
              </p>
              <Link
                href="/#about"
                className="mt-10 inline-flex text-[11px] tracking-[0.24em] uppercase text-[#1c1c18] border-b border-[#1c1c18] pb-2 hover:border-[#d4af37] hover:text-[#1c1c18] transition-colors"
              >
                DISCOVER OUR HISTORY
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-[#0b0a0d]">
        <div className="grid grid-cols-3">
          <div className="relative h-[220px] sm:h-[320px] lg:h-[420px] overflow-hidden">
            <Image
              src="/herojewel.jpeg"
              alt="Editorial portrait"
              fill
              className="object-cover grayscale"
              sizes="(max-width: 1024px) 33vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-transparent" />
          </div>
          <div className="relative h-[220px] sm:h-[320px] lg:h-[420px] overflow-hidden border-x border-white/10">
            <Image
              src="/cat2.jpeg"
              alt="Craft detail"
              fill
              className="object-cover grayscale"
              sizes="(max-width: 1024px) 33vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25" />
          </div>
          <div className="relative h-[220px] sm:h-[320px] lg:h-[420px] overflow-hidden">
            <Image
              src="/cat3.jpeg"
              alt="Atelier space"
              fill
              className="object-cover grayscale"
              sizes="(max-width: 1024px) 33vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-black/35 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      <section className="border-t border-[#d0c5af] bg-[#F0EEE8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 w-full text-center">
          <div className="flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#d4af37]" strokeWidth={1.5} />
          </div>
          <h2 className="mt-10 text-4xl md:text-5xl font-playfair text-[#1c1c18]">Enter The Atelier</h2>
          <p className="mt-6 text-sm md:text-base text-[#4d4635] max-w-2xl mx-auto">
            Be the first to explore new collections, private events, and the secrets of the workshop.
          </p>

          <form
            className="mt-16 max-w-3xl mx-auto flex flex-col sm:flex-row items-stretch gap-4 sm:gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              alert('Subscribed!');
            }}
          >
            <div className="flex-1">
              <label className="block text-[10px] tracking-[0.22em] uppercase text-[#7f7663] text-left" htmlFor="atelier-email">
                Your email address
              </label>
              <input
                id="atelier-email"
                type="email"
                required
                className="mt-4 w-full bg-transparent border-b border-[#d0c5af] py-4 px-0 text-sm text-[#1c1c18] placeholder:text-[#7f7663] focus:outline-none focus:border-[#1c1c18]"
                placeholder=""
              />
            </div>
            <button
              type="submit"
              className="sm:self-end bg-[#1c1c18] text-[#fcf9f3] px-10 py-4 text-xs tracking-[0.24em] uppercase hover:bg-[#000000] transition-colors"
            >
              Subscribe
            </button>
          </form>

          <p className="mt-8 text-[10px] tracking-[0.22em] uppercase text-[#7f7663]">
            By subscribing, you accept our privacy policy.
          </p>
        </div>
      </section>
    </div>
  );
}
