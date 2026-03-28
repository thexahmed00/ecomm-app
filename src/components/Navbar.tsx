'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ShoppingCart, Heart, User, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useCartStore } from '@/store/cartStore';
import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';

function CartBadge() {
  const { itemCount } = useCartStore();
  const count = itemCount();
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1 -right-1 bg-[#d4af37] text-[#1c1c18] text-[10px] font-semibold h-4 w-4 flex items-center justify-center">
      {count}
    </span>
  );
}
const CartBadgeNoSSR = dynamic(() => Promise.resolve(CartBadge), { ssr: false });

export default function Navbar() {
  const { logout } = useAuth();
  const { mongoUser, loading } = useAuthStore();
  const { openCart } = useUIStore();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';

  const linkClass = (active: boolean) =>
    `inline-flex items-center text-[11px] tracking-[0.24em] uppercase pb-2 border-b-2 ${
      active
        ? 'text-[#d4af37] border-[#d4af37]'
        : 'text-[#4d4635] border-transparent hover:text-[#1c1c18] hover:border-[#d4af37]'
    }`;

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
    <nav className="bg-[#ffffff] sticky top-0 z-50">
      <div className="bg-[#1c1c18] w-full py-2.5 flex items-center justify-center">
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#fcf9f3] text-center">
          COMPLIMENTARY EXPRESS SHIPPING & ARTFUL GIFTING ON ALL ORDERS
        </p>
      </div>

      <div className="border-b border-[#d0c5af]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">
            <div className="hidden md:flex items-center gap-8 w-1/3">
              <Link href="/shop?sort=newest" className={linkClass(pathname === '/shop' && sort === 'newest')}>
                NEW ARRIVALS
              </Link>
              <Link href="/shop" className={linkClass(pathname === '/shop' && !category && sort !== 'newest')}>
                COLLECTIONS
              </Link>
              <Link href="/shop?category=jewelry" className={linkClass(pathname === '/shop' && category === 'jewelry')}>
                JEWELRY
              </Link>
            </div>

            <div className="flex-1 md:w-1/3 flex justify-start md:justify-center">
              <Link href="/" className="text-3xl font-playfair tracking-[0.05em] text-[#1c1c18]">
                THE ATELIER
              </Link>
            </div>

            <div className="flex items-center md:hidden">
              <button
                onClick={openCart}
                className="text-[#1c1c18] hover:text-[#d4af37] transition-colors p-2 relative"
                aria-label="Cart"
              >
                <ShoppingCart className="w-6 h-6 stroke-[1.5]" />
                <CartBadgeNoSSR />
              </button>
              <button
                className="p-2 text-[#4d4635] hover:text-[#1c1c18]"
                onClick={() => {
                  const nextOpen = !mobileMenuOpen;
                  setMobileMenuOpen(nextOpen);
                  if (!nextOpen) setMobileAccountOpen(false);
                }}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            <div className="hidden md:flex items-center justify-end w-1/3">
              <div className="flex items-center gap-8 mr-8">
                <Link href="/shop?category=gifts" className={linkClass(pathname === '/shop' && category === 'gifts')}>
                  GIFTS
                </Link>
                <Link href="/#about" className={linkClass(false)}>
                  ABOUT
                </Link>
              </div>

              <div className="flex items-center gap-5">
                <Link href="/wishlist" className="text-[#1c1c18] hover:text-[#d4af37] transition-colors p-1" aria-label="Wishlist">
                  <Heart className="w-[18px] h-[18px] stroke-[1.5]" />
                </Link>

                {!loading && (
                  <>
                    {mongoUser ? (
                      <div className="relative" ref={dropdownRef}>
                        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center focus:outline-none p-1" aria-label="Account menu">
                          <User className="w-[18px] h-[18px] stroke-[1.5]" />
                        </button>
                        {dropdownOpen && (
                          <div className="absolute right-0 mt-2 w-52 bg-[#ffffff] border border-[#d0c5af] shadow-lg py-1 z-50">
                            <div className="px-4 py-3 border-b border-[#d0c5af]">
                              <p className="text-sm font-medium text-[#1c1c18] truncate">{mongoUser.name}</p>
                              <p className="text-xs text-[#7f7663] truncate">{mongoUser.email}</p>
                            </div>
                            {mongoUser.role === 'admin' && (
                              <Link href="/admin" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-[#4d4635] hover:bg-[#fcf9f3] hover:text-[#1c1c18]">
                                Admin Dashboard
                              </Link>
                            )}
                            <Link href="/account" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-[#4d4635] hover:bg-[#fcf9f3] hover:text-[#1c1c18]">
                              My Profile
                            </Link>
                            <Link href="/account/orders" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-[#4d4635] hover:bg-[#fcf9f3] hover:text-[#1c1c18]">
                              My Orders
                            </Link>
                            <button onClick={() => { logout(); setDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-[#8f0402] hover:bg-[#fcf9f3] border-t border-[#d0c5af]">
                              Sign out
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link href="/auth/login" className="text-[#1c1c18] hover:text-[#d4af37] transition-colors p-1" aria-label="Sign in">
                        <User className="w-[18px] h-[18px] stroke-[1.5]" />
                      </Link>
                    )}
                  </>
                )}

                <button onClick={openCart} className="text-[#1c1c18] hover:text-[#d4af37] transition-colors p-1 relative" aria-label="Cart">
                  <ShoppingCart className="w-[18px] h-[18px] stroke-[1.5]" />
                  <CartBadgeNoSSR />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
          {mobileMenuOpen && (
        <div className="md:hidden bg-[#fcf9f3] border-b border-[#d0c5af] px-4 pt-2 pb-6 space-y-1">
          <Link href="/shop?sort=newest" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-3 text-sm tracking-[0.16em] uppercase text-[#4d4635] hover:text-[#1c1c18]">New Arrivals</Link>
          <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-3 text-sm tracking-[0.16em] uppercase text-[#4d4635] hover:text-[#1c1c18]">Collections</Link>
          <Link href="/shop?category=jewelry" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-3 text-sm tracking-[0.16em] uppercase text-[#4d4635] hover:text-[#1c1c18]">Jewelry</Link>
          <Link href="/shop?category=gifts" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-3 text-sm tracking-[0.16em] uppercase text-[#4d4635] hover:text-[#1c1c18]">Gifts</Link>
          <Link href="/#about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-3 text-sm tracking-[0.16em] uppercase text-[#4d4635] hover:text-[#1c1c18]">About</Link>
          
          {!loading && (
            <>
              {mongoUser ? (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setMobileAccountOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-3 py-3 text-sm tracking-[0.16em] uppercase text-[#1c1c18] hover:text-[#1c1c18]"
                    aria-expanded={mobileAccountOpen}
                  >
                    Profile
                    <span className="text-[#7f7663] text-xs">{mobileAccountOpen ? '—' : '+'}</span>
                  </button>
                  {mobileAccountOpen && (
                    <div className="pl-3 pr-3 pb-2">
                      {mongoUser.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setMobileAccountOpen(false);
                          }}
                          className="block px-3 py-2 text-sm text-[#4d4635] hover:text-[#1c1c18]"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        href="/account"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setMobileAccountOpen(false);
                        }}
                        className="block px-3 py-2 text-sm text-[#4d4635] hover:text-[#1c1c18]"
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/account/orders"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setMobileAccountOpen(false);
                        }}
                        className="block px-3 py-2 text-sm text-[#4d4635] hover:text-[#1c1c18]"
                      >
                        My Orders
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                          setMobileAccountOpen(false);
                        }}
                        className="block w-full text-left px-3 py-2 text-sm text-[#8f0402] hover:text-[#8f0402]"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-3 py-3 text-sm tracking-[0.16em] uppercase text-[#1c1c18] underline underline-offset-8 decoration-[#d4af37] mt-4"
                >
                  Sign In
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </nav>
  );
}
