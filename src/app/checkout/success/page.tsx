'use client';

import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Package } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'Unknown';

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center flex flex-col items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="mb-8"
      >
        <CheckCircle className="w-32 h-32 text-green-500 mx-auto" />
      </motion.div>
      
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-4xl font-playfair font-bold text-[#F5F0E8] mb-4"
      >
        Order Confirmed
      </motion.h1>
      
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-400 mb-2 text-lg"
      >
        Thank you for your purchase. Your order has been received.
      </motion.p>
      
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-gray-500 mb-10"
      >
        Order ID: <span className="text-[#E8A020] font-mono">{orderId}</span>
      </motion.p>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
      >
        <Link 
          href="/account/orders"
          className="flex-1 border border-gray-700 text-gray-300 font-medium py-3 rounded-md flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <Package className="w-5 h-5" /> Track Order
        </Link>
        <Link 
          href="/shop"
          className="flex-1 bg-[#E8A020] text-black font-bold py-3 rounded-md flex items-center justify-center gap-2 hover:bg-[#d6901a] transition-colors"
        >
          Continue Shopping <ArrowRight className="w-5 h-5" />
        </Link>
      </motion.div>
    </div>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E8A020]"></div></div>}>
      <SuccessContent />
    </Suspense>
  );
}
