'use client';

import { useUIStore } from '@/store/uiStore';
import { useCartStore } from '@/store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { CldImage } from 'next-cloudinary';

export default function CartDrawer() {
  const hasCloudinary = !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const { cartOpen, closeCart } = useUIStore();
  const { items, removeItem, updateQty, totalPrice } = useCartStore();

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0F0F0F] border-l border-gray-800 z-[70] flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-xl font-playfair font-bold text-[#F5F0E8]">Your Cart</h2>
              <button onClick={closeCart} className="p-2 text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                  <ShoppingBag className="w-16 h-16 mb-4 opacity-50" />
                  <p>Your cart is empty</p>
                  <button
                    onClick={closeCart}
                    className="mt-4 text-[#E8A020] hover:underline"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item, index) => (
                  <div key={`${item.product}-${index}`} className="flex gap-4 p-3 bg-gray-900/30 rounded-lg border border-gray-800">
                    <div className="w-20 h-20 relative bg-gray-900 rounded-md overflow-hidden flex-shrink-0">
                      {item.image ? (
                        hasCloudinary ? (
                          <CldImage
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="object-cover w-full h-full"
                            loading="lazy"
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-[#F5F0E8] line-clamp-1">{item.name}</h3>
                        {item.selectedVariants && (
                          <p className="text-xs text-gray-500 mt-1">
                            {Object.values(item.selectedVariants).join(' / ')}
                          </p>
                        )}
                        <p className="text-sm font-medium text-[#E8A020] mt-1">₹{item.price.toFixed(2)}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-gray-700 rounded-md">
                          <button
                            onClick={() => updateQty(item.product, Math.max(1, item.quantity - 1), item.selectedVariants)}
                            className="p-1 text-gray-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(item.product, item.quantity + 1, item.selectedVariants)}
                            className="p-1 text-gray-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.product, item.selectedVariants)}
                          className="p-1 text-red-500/70 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-4 border-t border-gray-800 bg-gray-900/50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-lg font-bold text-[#F5F0E8]">₹{totalPrice().toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500 mb-4">Shipping and taxes calculated at checkout.</p>
                <div className="flex flex-col gap-2">
                  <Link href="/cart" onClick={closeCart} className="w-full py-3 text-center border border-[#E8A020] text-[#E8A020] rounded-md font-medium hover:bg-[#E8A020]/10 transition-colors">
                    View Cart
                  </Link>
                  <Link href="/checkout" onClick={closeCart} className="w-full py-3 text-center bg-[#E8A020] text-black rounded-md font-bold hover:bg-[#d6901a] transition-colors">
                    Checkout
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
