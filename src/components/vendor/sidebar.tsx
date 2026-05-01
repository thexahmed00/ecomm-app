'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, Store, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useVendorStore } from '@/store/vendorStore';

const navItems = [
  { name: 'Dashboard', href: '/vendor/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/vendor/products', icon: Package },
  { name: 'Orders', href: '/vendor/orders', icon: ShoppingBag },
  { name: 'Profile', href: '/vendor/profile', icon: User },
];

export default function VendorSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const vendorProfile = useVendorStore((state) => state.vendorProfile);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#ffffff] border border-[#d0c5af] text-[#7f7663]"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <div
        className={`fixed h-full lg:static inset-y-0 left-0 z-40 w-64 bg-[#ffffff] border-r border-[#d0c5af] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-[#d0c5af]">
          <div className="flex items-center gap-2 mb-1">
            <Store className="w-4 h-4 text-[#d4af37]" />
            <span className="text-xs tracking-[0.24em] uppercase text-[#7f7663]">Seller Portal</span>
          </div>
          {vendorProfile && (
            <p className="text-sm font-medium text-[#1c1c18] truncate">{vendorProfile.storeName}</p>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                  isActive
                    ? 'bg-[#d4af37]/10 text-[#1c1c18]'
                    : 'text-[#4d4635] hover:bg-[#f6f3ed] hover:text-[#1c1c18]'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#d0c5af]">
          <p className="text-xs tracking-[0.18em] uppercase text-[#7f7663]">/{vendorProfile?.storeSlug}</p>
        </div>
      </div>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-[#4d4635]/18 z-30 lg:hidden"
        />
      )}
    </>
  );
}
