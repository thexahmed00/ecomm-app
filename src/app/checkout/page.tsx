'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const { mongoUser } = useAuthStore();
  const { } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-playfair font-bold text-[#F5F0E8] mb-4">Your Cart is Empty</h1>
        <Link href="/shop" className="text-[#E8A020] hover:underline">Continue Shopping</Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!mongoUser) {
      alert('Please log in to place an order');
      return;
    }
    
    setLoading(true);
    try {
      // Simulate API call to create order
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      clearCart();
      router.push('/checkout/success?orderId=ORD-' + Math.floor(Math.random() * 1000000));
    } catch (error) {
      console.error(error);
      alert('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <h1 className="text-3xl font-playfair font-bold text-[#F5F0E8] mb-8">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 space-y-8">
          {/* Step 1: Account */}
          <div className={`p-6 rounded-lg border ${step === 1 ? 'border-[#E8A020] bg-gray-900/30' : 'border-gray-800 bg-[#0F0F0F] opacity-70'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-medium text-[#F5F0E8] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gray-800 text-sm flex items-center justify-center">1</span>
                Account
              </h2>
              {step > 1 && <CheckCircle className="w-5 h-5 text-green-500" />}
            </div>
            
            {step === 1 && (
              <div className="pl-8">
                {mongoUser ? (
                  <div>
                    <p className="text-gray-300 mb-4">Logged in as <span className="font-medium text-[#F5F0E8]">{mongoUser.email}</span></p>
                    <button 
                      onClick={() => setStep(2)}
                      className="bg-[#E8A020] text-black font-medium px-6 py-2 rounded hover:bg-[#d6901a]"
                    >
                      Continue
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-400 mb-4">Please log in to continue with your checkout.</p>
                    <Link 
                      href="/auth/login?redirect=/checkout"
                      className="inline-block bg-[#E8A020] text-black font-medium px-6 py-2 rounded hover:bg-[#d6901a]"
                    >
                      Go to Login
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Shipping */}
          <div className={`p-6 rounded-lg border ${step === 2 ? 'border-[#E8A020] bg-gray-900/30' : 'border-gray-800 bg-[#0F0F0F] opacity-70'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-medium text-[#F5F0E8] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gray-800 text-sm flex items-center justify-center">2</span>
                Shipping Address
              </h2>
              {step > 2 && <CheckCircle className="w-5 h-5 text-green-500" />}
            </div>
            
            {step === 2 && (
              <div className="pl-8 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="First Name" className="bg-gray-900 border border-gray-700 rounded p-2 text-white" defaultValue={mongoUser?.name?.split(' ')[0] || ''} />
                  <input type="text" placeholder="Last Name" className="bg-gray-900 border border-gray-700 rounded p-2 text-white" defaultValue={mongoUser?.name?.split(' ')[1] || ''} />
                </div>
                <input type="text" placeholder="Address Line 1" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" defaultValue="123 Main St" />
                <div className="grid grid-cols-3 gap-4">
                  <input type="text" placeholder="City" className="bg-gray-900 border border-gray-700 rounded p-2 text-white" defaultValue="Mumbai" />
                  <input type="text" placeholder="State" className="bg-gray-900 border border-gray-700 rounded p-2 text-white" defaultValue="MH" />
                  <input type="text" placeholder="PIN Code" className="bg-gray-900 border border-gray-700 rounded p-2 text-white" defaultValue="400001" />
                </div>
                <button 
                  onClick={() => setStep(3)}
                  className="bg-[#E8A020] text-black font-medium px-6 py-2 rounded hover:bg-[#d6901a] mt-4"
                >
                  Continue to Payment
                </button>
              </div>
            )}
          </div>

          {/* Step 3: Payment */}
          <div className={`p-6 rounded-lg border ${step === 3 ? 'border-[#E8A020] bg-gray-900/30' : 'border-gray-800 bg-[#0F0F0F] opacity-70'}`}>
            <h2 className="text-xl font-medium text-[#F5F0E8] flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-gray-800 text-sm flex items-center justify-center">3</span>
              Payment Method
            </h2>
            
            {step === 3 && (
              <div className="pl-8 space-y-4">
                <label className="flex items-center gap-3 p-4 border border-gray-700 rounded-md cursor-pointer hover:border-[#E8A020]">
                  <input 
                    type="radio" 
                    name="payment" 
                    value="cod" 
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-[#E8A020]"
                  />
                  <span className="text-white">Cash on Delivery</span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-700 rounded-md cursor-pointer hover:border-[#E8A020] opacity-50">
                  <input 
                    type="radio" 
                    name="payment" 
                    value="stripe" 
                    checked={paymentMethod === 'stripe'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-[#E8A020]"
                    disabled
                  />
                  <span className="text-white">Credit Card (Stripe - Coming Soon)</span>
                </label>
                
                <button 
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full bg-[#E8A020] text-black font-bold px-6 py-3 rounded-md hover:bg-[#d6901a] mt-6 flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 sticky top-24">
            <h2 className="text-lg font-medium text-[#F5F0E8] mb-4">Order Summary</h2>
            <div className="space-y-4 mb-4">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-400 line-clamp-1 pr-4">{item.quantity}x {item.name}</span>
                  <span className="text-gray-300">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-800 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>₹{totalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span>Free</span>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-[#F5F0E8]">Total</span>
                <span className="text-xl font-bold text-[#E8A020]">₹{totalPrice().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
