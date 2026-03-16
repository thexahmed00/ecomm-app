'use client';

import { DollarSign, ShoppingBag, Users, AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic';

const RevenueChart = dynamic(() => import('@/components/admin/RevenueChart'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center text-gray-500">Loading chart...</div>
});

const data = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 2000 },
  { name: 'Apr', revenue: 2780 },
  { name: 'May', revenue: 1890 },
  { name: 'Jun', revenue: 2390 },
  { name: 'Jul', revenue: 3490 },
];

const recentOrders = [
  { orderNumber: 'ORD-1042', amount: 3890, timeAgo: '2 hours ago', status: 'Paid' },
  { orderNumber: 'ORD-1039', amount: 1250, timeAgo: '4 hours ago', status: 'Paid' },
  { orderNumber: 'ORD-1031', amount: 4999, timeAgo: 'Yesterday', status: 'Paid' },
  { orderNumber: 'ORD-1028', amount: 2140, timeAgo: '2 days ago', status: 'Paid' },
  { orderNumber: 'ORD-1021', amount: 1650, timeAgo: '3 days ago', status: 'Paid' },
];

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-playfair font-bold text-[#F5F0E8] mb-8">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Total Revenue</h3>
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#F5F0E8]">₹1,24,500</p>
          <p className="text-sm text-green-500 mt-2 flex items-center gap-1">
            <span>+12.5%</span> <span className="text-gray-500">from last month</span>
          </p>
        </div>
        
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Total Orders</h3>
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#F5F0E8]">342</p>
          <p className="text-sm text-green-500 mt-2 flex items-center gap-1">
            <span>+5.2%</span> <span className="text-gray-500">from last month</span>
          </p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">New Users</h3>
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#F5F0E8]">1,204</p>
          <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
            <span>-2.1%</span> <span className="text-gray-500">from last month</span>
          </p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Low Stock</h3>
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#F5F0E8]">12</p>
          <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
            Items need restocking
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-medium text-[#F5F0E8] mb-6">Revenue Overview</h2>
          <div className="h-80 w-full">
            <RevenueChart data={data} />
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-medium text-[#F5F0E8] mb-6">Recent Orders</h2>
          <div className="space-y-4">
            {recentOrders.map((o) => (
              <div key={o.orderNumber} className="flex items-center justify-between p-3 bg-[#0F0F0F] rounded border border-gray-800">
                <div>
                  <p className="font-medium text-[#F5F0E8]">{o.orderNumber}</p>
                  <p className="text-xs text-gray-500">{o.timeAgo}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[#E8A020]">₹{o.amount}</p>
                  <span className="text-[10px] px-2 py-1 bg-green-900/30 text-green-400 rounded-full">{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
