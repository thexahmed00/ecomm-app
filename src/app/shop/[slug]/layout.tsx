import { Metadata } from 'next';
import connectDB from '@/lib/mongodb';
import { Product } from '@/models/Product';

export const revalidate = 120;

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { slug } = await params;
  
  await connectDB();
  
  const product = await Product.findOne({ slug }).lean();

  if (!product) {
    return {
      title: 'Product Not Found | LUXE',
    };
  }

  const imageUrl = product.images?.[0]?.url || 'https://res.cloudinary.com/demo/image/upload/sample.jpg';

  return {
    title: `${product.name} | LUXE`,
    description: product.shortDescription || product.description?.substring(0, 160),
    openGraph: {
      title: `${product.name} | LUXE`,
      description: product.shortDescription || product.description?.substring(0, 160),
      images: [{ url: imageUrl }],
    },
  };
}

export default function ProductLayout({ children }: Props) {
  return <>{children}</>;
}
