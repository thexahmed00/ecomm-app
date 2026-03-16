'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ShoppingCart, Heart, User, Search as SearchIcon, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useCartStore } from '@/store/cartStore';
import { useState, useRef, useEffect } from 'react';
import { CldImage } from 'next-cloudinary';
import dynamic from 'next/dynamic';

function CartBadge() {
  const { itemCount } = useCartStore();
  const count = itemCount();
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1 -right-1 bg-[#E8A020] text-black text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
      {count}
    </span>
  );
}
const CartBadgeNoSSR = dynamic(() => Promise.resolve(CartBadge), { ssr: false });

export default function Navbar() {
  const hasCloudinary = !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const { logout } = useAuth();
  const { mongoUser, loading } = useAuthStore();
  const { openSearch, openCart } = useUIStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <nav className="bg-[#0F0F0F] shadow-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <button 
              className="md:hidden p-2 text-gray-400 hover:text-white mr-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/" className="text-2xl font-bold text-[#F5F0E8] font-playfair tracking-wide">
              LUXE
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-[#E8A020] transition-colors font-medium">Home</Link>
            <Link href="/shop" className="text-gray-300 hover:text-[#E8A020] transition-colors font-medium">Shop</Link>
            <Link href="/shop?category=electronics" className="text-gray-300 hover:text-[#E8A020] transition-colors font-medium">Electronics</Link>
            <Link href="/shop?category=fashion" className="text-gray-300 hover:text-[#E8A020] transition-colors font-medium">Fashion</Link>
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={openSearch} className="text-gray-400 hover:text-[#E8A020] transition-colors p-1">
              <SearchIcon className="w-5 h-5" />
            </button>
            
            <Link href="/wishlist" className="hidden sm:block text-gray-400 hover:text-[#E8A020] transition-colors p-1">
              <Heart className="w-5 h-5" />
            </Link>
            
            <button onClick={openCart} className="text-gray-400 hover:text-[#E8A020] transition-colors p-1 relative">
              <ShoppingCart className="w-5 h-5" />
              <CartBadgeNoSSR />
            </button>
            
            {!loading && (
              <>
                {mongoUser ? (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center focus:outline-none"
                    >
                      {mongoUser.avatar ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-700">
                          {hasCloudinary ? (
                            <CldImage src={mongoUser.avatar} alt="Avatar" width={32} height={32} className="object-cover" />
                          ) : (
                            <img src={mongoUser.avatar} alt="Avatar" width={32} height={32} className="object-cover w-full h-full" loading="lazy" />
                          )}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 text-gray-400 hover:text-[#E8A020]">
                          <User className="w-5 h-5" />
                        </div>
                      )}
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-[#0F0F0F] border border-gray-800 rounded-md shadow-lg py-1 z-50">
                        <div className="px-4 py-2 border-b border-gray-800">
                          <p className="text-sm font-medium text-[#F5F0E8] truncate">{mongoUser.name}</p>
                          <p className="text-xs text-gray-500 truncate">{mongoUser.email}</p>
                        </div>
                        
                        {mongoUser.role === 'admin' && (
                          <Link href="/admin" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-900 hover:text-[#E8A020]">
                            Admin Dashboard
                          </Link>
                        )}
                        
                        <Link href="/account" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-900 hover:text-[#E8A020]">
                          My Profile
                        </Link>
                        <Link href="/account/orders" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-900 hover:text-[#E8A020]">
                          My Orders
                        </Link>
                        <Link href="/wishlist" onClick={() => setDropdownOpen(false)} className="block sm:hidden px-4 py-2 text-sm text-gray-300 hover:bg-gray-900 hover:text-[#E8A020]">
                          Wishlist
                        </Link>
                        
                        <button 
                          onClick={() => { logout(); setDropdownOpen(false); }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-900 hover:text-red-300 border-t border-gray-800"
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    className="text-sm font-medium text-[#E8A020] hover:text-amber-500 transition-colors hidden sm:block"
                  >
                    Sign In
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
          {mobileMenuOpen && (
        <div className="md:hidden bg-[#0F0F0F] border-b border-gray-800 px-4 pt-2 pb-4 space-y-1">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-[#E8A020] hover:bg-gray-900">Home</Link>
          <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-[#E8A020] hover:bg-gray-900">Shop All</Link>
          <Link href="/shop?category=electronics" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-[#E8A020] hover:bg-gray-900">Electronics</Link>
          <Link href="/shop?category=fashion" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-[#E8A020] hover:bg-gray-900">Fashion</Link>
          
          {!mongoUser && !loading && (
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-[#E8A020] hover:bg-gray-900 mt-4"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
