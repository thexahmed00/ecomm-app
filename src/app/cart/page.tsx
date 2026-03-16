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
        <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-gray-500" />
        </div>
        <h1 className="text-3xl font-playfair font-bold text-[#F5F0E8] mb-4">Your Cart is Empty</h1>
        <p className="text-gray-400 mb-8 text-center max-w-md">
          Looks like you have not added anything to your cart yet. Discover our premium collection and find something you love.
        </p>
        <Link 
          href="/shop" 
          className="bg-[#E8A020] text-black font-bold px-8 py-3 rounded-md flex items-center gap-2 hover:bg-[#d6901a] transition-colors"
        >
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <h1 className="text-3xl md:text-4xl font-playfair font-bold text-[#F5F0E8] mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items */}
        <div className="flex-1">
          <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-medium text-gray-400 pb-4 border-b border-gray-800">
            <div className="col-span-6">Product</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          <div className="divide-y divide-gray-800">
            {items.map((item, index) => (
              <div key={`${item.product}-${index}`} className="py-6 flex flex-col md:grid md:grid-cols-12 md:items-center gap-4">
                <div className="col-span-6 flex gap-4">
                  <div className="w-24 h-24 relative bg-gray-900 rounded-md overflow-hidden flex-shrink-0 border border-gray-800">
                    {item.image ? (
                      <CldImage src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-700">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center">
                    <Link href={`/shop/${item.product}`} className="text-[#F5F0E8] font-medium hover:text-[#E8A020] transition-colors line-clamp-2">
                      {item.name}
                    </Link>
                    {item.selectedVariants && (
                      <p className="text-sm text-gray-500 mt-1">
                        {Object.values(item.selectedVariants).join(' / ')}
                      </p>
                    )}
                    {/* Mobile Price & Controls */}
                    <div className="md:hidden mt-2 flex items-center justify-between">
                      <span className="text-[#E8A020] font-medium">₹{item.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="hidden md:block col-span-2 text-center text-gray-300">
                  ₹{item.price.toFixed(2)}
                </div>

                <div className="col-span-2 flex items-center justify-between md:justify-center">
                  <div className="flex items-center border border-gray-700 rounded-md bg-[#0F0F0F]">
                    <button
                      onClick={() => updateQty(item.product, Math.max(1, item.quantity - 1), item.selectedVariants)}
                      className="p-2 text-gray-400 hover:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.product, item.quantity + 1, item.selectedVariants)}
                      className="p-2 text-gray-400 hover:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="col-span-2 flex items-center justify-between md:justify-end">
                  <span className="md:hidden text-gray-400 text-sm">Total:</span>
                  <div className="flex items-center gap-4">
                    <span className="text-[#F5F0E8] font-bold">₹{(item.price * item.quantity).toFixed(2)}</span>
                    <button
                      onClick={() => removeItem(item.product, item.selectedVariants)}
                      className="text-gray-500 hover:text-red-500 transition-colors p-1"
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
          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 sticky top-24">
            <h2 className="text-xl font-playfair font-bold text-[#F5F0E8] mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span>₹{totalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Tax</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-[#F5F0E8]">Estimated Total</span>
                <span className="text-xl font-bold text-[#E8A020]">₹{totalPrice().toFixed(2)}</span>
              </div>
            </div>

            <Link 
              href="/checkout"
              className="w-full bg-[#E8A020] text-black font-bold py-3 rounded-md flex items-center justify-center gap-2 hover:bg-[#d6901a] transition-colors mb-4"
            >
              Proceed to Checkout
            </Link>

            <Link 
              href="/shop"
              className="w-full border border-gray-700 text-gray-300 font-medium py-3 rounded-md flex items-center justify-center hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
