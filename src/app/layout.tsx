import type { Metadata } from 'next';
import { Inter, Noto_Serif } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import PageTransition from '@/components/PageTransition';
import CartDrawer from '@/components/CartDrawer';
import SearchModal from '@/components/SearchModal';
import Toast from '@/components/Toast';
import Link from 'next/link';

const playfair = Noto_Serif({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700', '800', '900'],
});

const dmSans = Inter({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Maison | Luxury E-Commerce',
  description: 'A luxury e-commerce experience with boutique craftsmanship.',
  openGraph: {
    title: 'Maison | Luxury E-Commerce',
    description: 'A luxury e-commerce experience with boutique craftsmanship.',
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
      <body className="bg-background text-foreground font-sans min-h-screen flex flex-col antialiased">
        <Suspense fallback={<div className="h-[104px] w-full border-b border-[#d0c5af] bg-[#fcf9f3]" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1 flex flex-col">
          {/* /add transition only two initial screen  */}
          {/* <PageTransition> */}
            {children}
          {/* </PageTransition> */}
        </main>
        <CartDrawer />
        <SearchModal />
        <Toast />

        <footer className="bg-[#fcf9f3] py-16 border-t border-[#d0c5af] mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              <div className="md:col-span-5">
                <Link href="/" className="inline-block text-2xl font-playfair tracking-[0.18em] uppercase">
                  Maison
                </Link>
                <p className="mt-6 text-sm leading-6 text-[#4d4635] max-w-sm">
                  Curated pieces with an editorial sensibility. Crafted with intention, presented with restraint.
                </p>
              </div>

              <div className="md:col-span-3">
                <h4 className="text-xs tracking-[0.24em] uppercase text-[#4d4635]">Collections</h4>
                <ul className="mt-6 space-y-3 text-sm">
                  <li>
                    <Link href="/shop" className="hover:underline underline-offset-4 decoration-[#d4af37]">
                      All Pieces
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop?category=jewelry" className="hover:underline underline-offset-4 decoration-[#d4af37]">
                      Jewelry
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop?category=accessories" className="hover:underline underline-offset-4 decoration-[#d4af37]">
                      Accessories
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="md:col-span-4">
                <h4 className="text-xs tracking-[0.24em] uppercase text-[#4d4635]">Client Services</h4>
                <ul className="mt-6 space-y-3 text-sm">
                  <li>
                    <Link href="/account/orders" className="hover:underline underline-offset-4 decoration-[#d4af37]">
                      Order Tracking
                    </Link>
                  </li>
                  <li>
                    <Link href="/account" className="hover:underline underline-offset-4 decoration-[#d4af37]">
                      Account
                    </Link>
                  </li>
                  <li>
                    <a href="mailto:support@example.com" className="hover:underline underline-offset-4 decoration-[#d4af37]">
                      support@example.com
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-14 pt-10 border-t border-[#d0c5af] text-xs tracking-[0.18em] uppercase text-[#7f7663] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <span>&copy; {new Date().getFullYear()} Maison</span>
              <span>Crafted for quiet luxury</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
