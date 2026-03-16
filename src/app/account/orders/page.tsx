'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { OrderRowSkeleton } from '@/components/Skeleton';
import { Package, Eye } from 'lucide-react';

type OrderListItem = {
  _id: string;
  orderNumber: string;
  createdAt: string;
  orderStatus: string;
  totalAmount: number;
};

export default function AccountOrders() {
  const { firebaseUser } = useAuthStore();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!firebaseUser) return;
      try {
        const token = await firebaseUser.getIdToken();
        const res = await fetch('/api/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [firebaseUser]);

  return (
    <div className="bg-gray-900/30 border border-gray-800 rounded-lg overflow-hidden">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-medium text-[#F5F0E8]">Order History</h2>
      </div>

      {loading ? (
        <div className="p-6 space-y-4">
          {[...Array(3)].map((_, i) => <OrderRowSkeleton key={i} />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-[#F5F0E8] mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-6">When you place an order, it will appear here.</p>
          <Link href="/shop" className="bg-[#E8A020] text-black px-6 py-2 rounded font-medium hover:bg-[#d6901a]">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/50 text-gray-400 text-sm">
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-900/30 transition-colors">
                  <td className="p-4 font-mono text-gray-300">{order.orderNumber}</td>
                  <td className="p-4 text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </td>
                  <td className="p-4">
                    <OrderStatusBadge status={order.orderStatus} />
                  </td>
                  <td className="p-4 font-medium text-[#F5F0E8]">₹{order.totalAmount}</td>
                  <td className="p-4 text-right">
                    <Link 
                      href={`/account/orders/${order._id}`}
                      className="inline-flex items-center gap-1 text-[#E8A020] hover:underline"
                    >
                      <Eye className="w-4 h-4" /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
