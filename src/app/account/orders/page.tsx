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
    <div className="bg-[#ffffff] border border-[#d0c5af] overflow-hidden">
      <div className="p-6 border-b border-[#d0c5af]">
        <h2 className="text-xs tracking-[0.24em] uppercase text-[#1c1c18]">Order History</h2>
      </div>

      {loading ? (
        <div className="p-6 space-y-4">
          {[...Array(3)].map((_, i) => <OrderRowSkeleton key={i} />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-[#f6f3ed] border border-[#d0c5af] flex items-center justify-center mb-6">
            <Package className="w-8 h-8 text-[#7f7663]" />
          </div>
          <h3 className="text-lg font-playfair text-[#1c1c18] mb-3">No orders yet</h3>
          <p className="text-sm text-[#4d4635] mb-8">When you place an order, it will appear here.</p>
          <Link href="/shop" className="bg-[#d4af37] text-[#1c1c18] px-10 py-4 text-xs tracking-[0.24em] uppercase hover:bg-[#c29a30] transition-colors">
            Explore Collection
          </Link>
        </div>
      ) : (
        <>
          <div className="md:hidden p-6 space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="border border-[#d0c5af] bg-[#fcf9f3] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs tracking-[0.24em] uppercase text-[#7f7663]">Order</p>
                    <p className="mt-2 font-mono text-sm text-[#1c1c18] truncate">{order.orderNumber}</p>
                    <p className="mt-2 text-sm text-[#4d4635]">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.orderStatus} />
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs tracking-[0.24em] uppercase text-[#7f7663]">Total</p>
                    <p className="mt-2 font-medium text-[#1c1c18]">₹{order.totalAmount}</p>
                  </div>
                  <Link
                    href={`/account/orders/${order._id}`}
                    className="inline-flex items-center gap-2 text-xs tracking-[0.24em] uppercase text-[#1c1c18] underline underline-offset-8 decoration-[#d4af37]"
                  >
                    <Eye className="w-4 h-4" /> View
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fcf9f3] text-[#7f7663] text-xs tracking-[0.24em] uppercase border-b border-[#d0c5af]">
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d0c5af] text-sm">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-[#f6f3ed] transition-colors">
                    <td className="p-4 font-mono text-[#1c1c18]">{order.orderNumber}</td>
                    <td className="p-4 text-[#4d4635]">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>
                    <td className="p-4">
                      <OrderStatusBadge status={order.orderStatus} />
                    </td>
                    <td className="p-4 font-medium text-[#1c1c18]">₹{order.totalAmount}</td>
                    <td className="p-4 text-right">
                      <Link 
                        href={`/account/orders/${order._id}`}
                        className="inline-flex items-center gap-2 text-xs tracking-[0.24em] uppercase text-[#1c1c18] underline underline-offset-8 decoration-[#d4af37]"
                      >
                        <Eye className="w-4 h-4" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
