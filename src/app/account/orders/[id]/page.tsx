'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { ArrowLeft, Package, MapPin, CreditCard } from 'lucide-react';
import { CldImage } from 'next-cloudinary';

type OrderItem = {
  product: string;
  name: string;
  image?: string;
  quantity: number;
  price: number;
};

type OrderDetail = {
  _id: string;
  orderNumber: string;
  createdAt: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  totalAmount: number;
};

export default function OrderDetail() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;
  const { firebaseUser } = useAuthStore();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      if (!firebaseUser) return;
      try {
        const token = await firebaseUser.getIdToken();
        const res = await fetch(`/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          if (res.status === 404) {
            setNotFound(true);
            return;
          }
          throw new Error('Failed to fetch order');
        }
        const data = await res.json();
        setOrder(data as OrderDetail);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [firebaseUser, orderId]);

  if (loading) {
    return <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E8A020]"></div></div>;
  }

  if (notFound) {
    return (
      <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-8 text-center">
        <h2 className="text-xl font-medium text-[#F5F0E8] mb-2">Order not found</h2>
        <p className="text-gray-400 mb-6">This order may not exist or you may not have access to it.</p>
        <Link href="/account/orders" className="text-[#E8A020] hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="space-y-6">
      <Link href="/account/orders" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#E8A020] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      <div className="bg-gray-900/30 border border-gray-800 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-medium text-[#F5F0E8] mb-1">Order <span className="font-mono text-[#E8A020]">#{order.orderNumber}</span></h2>
            <p className="text-sm text-gray-400">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
          <div className="flex gap-3">
            <OrderStatusBadge status={order.orderStatus} />
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-gray-800">
          <div>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Shipping Address
            </h3>
            <div className="bg-[#0F0F0F] p-4 rounded-md border border-gray-800">
              <p className="font-medium text-[#F5F0E8] mb-1">{order.shippingAddress.name}</p>
              <p className="text-sm text-gray-400">{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p className="text-sm text-gray-400">{order.shippingAddress.line2}</p>}
              <p className="text-sm text-gray-400">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Payment Info
            </h3>
            <div className="bg-[#0F0F0F] p-4 rounded-md border border-gray-800">
              <p className="text-sm text-gray-300 mb-2">Method: <span className="font-medium text-[#F5F0E8] uppercase">{order.paymentMethod}</span></p>
              <p className="text-sm text-gray-300">Status: <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-500' : 'text-yellow-500'} capitalize`}>{order.paymentStatus}</span></p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Package className="w-4 h-4" /> Order Items
          </h3>
          <div className="space-y-4">
            {order.items.map((item, idx: number) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-[#0F0F0F] rounded-md border border-gray-800">
                <div className="w-16 h-16 relative bg-gray-900 rounded overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <CldImage src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                      <Package className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Link href={`/shop/${item.product}`} className="text-[#F5F0E8] font-medium hover:text-[#E8A020] transition-colors line-clamp-1">
                    {item.name}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[#F5F0E8]">₹{item.price * item.quantity}</p>
                  <p className="text-xs text-gray-500">₹{item.price} each</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-[#0F0F0F] border-t border-gray-800">
          <div className="max-w-xs ml-auto space-y-3 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Shipping</span>
              <span>₹{order.shippingCost}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-500">
                <span>Discount</span>
                <span>-₹{order.discount}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 border-t border-gray-800">
              <span className="text-base font-bold text-[#F5F0E8]">Total</span>
              <span className="text-xl font-bold text-[#E8A020]">₹{order.totalAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
