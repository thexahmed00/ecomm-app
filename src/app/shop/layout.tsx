import { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Shop | LUXE Premium E-Commerce',
  description: 'Browse our collection of premium luxury products.',
  openGraph: {
    title: 'Shop | LUXE Premium E-Commerce',
    description: 'Browse our collection of premium luxury products.',
    images: [{ url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' }],
  },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}