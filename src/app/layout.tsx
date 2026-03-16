import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import SearchModal from '@/components/SearchModal';
import Toast from '@/components/Toast';
import Link from 'next/link';

const playfair = Playfair_Display({ 
  subsets: ['latin'], 
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700', '800', '900']
});

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '700']
});

export const metadata: Metadata = {
  title: 'LUXE | Premium E-Commerce',
  description: 'Premium dark luxury e-commerce experience',
  openGraph: {
    title: 'LUXE | Premium E-Commerce',
    description: 'Premium dark luxury e-commerce experience',
    images: [{ url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="bg-[#0F0F0F] text-[#F5F0E8] font-sans min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        
        {/* Global Components */}
        <CartDrawer />
        <SearchModal />
        <Toast />
        
        <footer className="bg-black py-12 border-t border-gray-800 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-2xl font-playfair font-bold text-[#F5F0E8] mb-4">LUXE</h3>
                <p className="text-gray-400 max-w-sm">
                  Curated premium products for the modern lifestyle. Quality without compromise.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-4 text-[#F5F0E8]">Shop</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/shop" className="hover:text-[#E8A020]">All Products</Link></li>
                  <li><Link href="/shop?category=electronics" className="hover:text-[#E8A020]">Electronics</Link></li>
                  <li><Link href="/shop?category=fashion" className="hover:text-[#E8A020]">Fashion</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4 text-[#F5F0E8]">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-[#E8A020]">FAQ</a></li>
                  <li><a href="#" className="hover:text-[#E8A020]">Shipping</a></li>
                  <li><a href="#" className="hover:text-[#E8A020]">Returns</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-gray-900 text-center text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} LUXE. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
