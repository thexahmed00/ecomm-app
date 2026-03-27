'use client';

import { useCartStore } from '@/store/cartStore';
import { CldImage } from 'next-cloudinary';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { items, updateQty, removeItem, totalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-20 h-20 bg-[#ffffff] border border-[#d0c5af] flex items-center justify-center mb-8">
          <ShoppingBag className="w-10 h-10 text-[#7f7663]" />
        </div>
        <h1 className="text-3xl font-playfair text-[#1c1c18] mb-4">Your Bag is Empty</h1>
        <p className="text-sm text-[#4d4635] mb-10 text-center max-w-md">
          Discover a curated selection and add pieces to your bag.
        </p>
        <Link 
          href="/shop" 
          className="bg-[#d4af37] text-[#1c1c18] px-10 py-4 text-xs tracking-[0.24em] uppercase flex items-center justify-center gap-3 hover:bg-[#c29a30] transition-colors"
        >
          Explore Collection <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20 w-full">
      <p className="text-xs tracking-[0.28em] uppercase text-[#7f7663]">Bag</p>
      <h1 className="mt-4 text-3xl md:text-4xl font-playfair text-[#1c1c18]">Shopping Bag</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items */}
        <div className="flex-1">
          <div className="hidden md:grid grid-cols-12 gap-4 text-xs tracking-[0.24em] uppercase text-[#7f7663] pb-4 border-b border-[#d0c5af] mt-10">
            <div className="col-span-6">Product</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          <div className="divide-y divide-[#d0c5af] mt-4">
            {items.map((item, index) => (
              <div key={`${item.product}-${index}`} className="py-6 flex flex-col md:grid md:grid-cols-12 md:items-center gap-4">
                <div className="col-span-6 flex gap-4">
                  <div className="w-24 h-24 relative bg-[#f6f3ed] overflow-hidden flex-shrink-0 border border-[#d0c5af]">
                    {item.image ? (
                      <CldImage src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#7f7663]">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center">
                    <Link href={`/shop/${item.product}`} className="text-[#1c1c18] font-medium hover:underline underline-offset-8 decoration-[#d4af37] transition-colors line-clamp-2">
                      {item.name}
                    </Link>
                    {item.selectedVariants && (
                      <p className="text-xs tracking-[0.18em] uppercase text-[#7f7663] mt-2">
                        {Object.values(item.selectedVariants).join(' / ')}
                      </p>
                    )}
                    {/* Mobile Price & Controls */}
                    <div className="md:hidden mt-2 flex items-center justify-between">
                      <span className="text-[#1c1c18] font-medium">₹{item.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="hidden md:block col-span-2 text-center text-[#4d4635]">
                  ₹{item.price.toFixed(2)}
                </div>

                <div className="col-span-2 flex items-center justify-between md:justify-center">
                  <div className="flex items-center border border-[#d0c5af] bg-[#fcf9f3]">
                    <button
                      onClick={() => updateQty(item.product, Math.max(1, item.quantity - 1), item.selectedVariants)}
                      className="p-2 text-[#4d4635] hover:text-[#1c1c18]"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-[#1c1c18]">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.product, item.quantity + 1, item.selectedVariants)}
                      className="p-2 text-[#4d4635] hover:text-[#1c1c18]"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="col-span-2 flex items-center justify-between md:justify-end">
                  <span className="md:hidden text-[#7f7663] text-sm">Total:</span>
                  <div className="flex items-center gap-4">
                    <span className="text-[#1c1c18] font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                    <button
                      onClick={() => removeItem(item.product, item.selectedVariants)}
                      className="text-[#7f7663] hover:text-[#8f0402] transition-colors p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-[#ffffff] border border-[#d0c5af] p-8 lg:sticky lg:top-24 mt-10">
            <h2 className="text-xs tracking-[0.24em] uppercase text-[#1c1c18]">Order Summary</h2>
            
            <div className="mt-6 space-y-3 mb-6 text-sm">
              <div className="flex justify-between text-[#4d4635]">
                <span>Subtotal</span>
                <span>₹{totalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#4d4635]">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-[#4d4635]">
                <span>Tax</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t border-[#d0c5af] pt-5 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-xs tracking-[0.24em] uppercase text-[#4d4635]">Estimated Total</span>
                <span className="text-lg font-playfair text-[#1c1c18]">₹{totalPrice().toFixed(2)}</span>
              </div>
            </div>

            <Link 
              href="/checkout"
              className="w-full bg-[#d4af37] text-[#1c1c18] py-4 flex items-center justify-center text-xs tracking-[0.24em] uppercase hover:bg-[#c29a30] transition-colors mb-3"
            >
              Proceed to Checkout
            </Link>

            <Link 
              href="/shop"
              className="w-full border border-[#d0c5af] text-[#1c1c18] py-4 flex items-center justify-center text-xs tracking-[0.24em] uppercase hover:bg-[#f6f3ed] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
