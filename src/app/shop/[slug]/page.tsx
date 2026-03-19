import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import { Product } from '@/models/Product';
import '@/models/Category';
import ProductDetailClient from '@/components/ProductDetailClient';
import type { ProductDetail, ProductSummary } from '@/types';

export const revalidate = 120;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  await connectDB();

  const productDoc = await Product.findOne({ slug })
    .populate('category', 'name slug')
    .lean();

  if (!productDoc) return notFound();

  const categoryId = (productDoc as { category?: { _id?: string } | null }).category?._id;

  const relatedDocs = categoryId
    ? await Product.find({ category: categoryId, isActive: true, _id: { $ne: productDoc._id } })
        .select('name slug price comparePrice images avgRating numReviews stock shortDescription category')
        .limit(4)
        .populate('category', 'name slug')
        .lean()
    : [];

  const product = JSON.parse(JSON.stringify(productDoc)) as ProductDetail & { stock: number };
  const relatedProducts = JSON.parse(JSON.stringify(relatedDocs)) as ProductSummary[];

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}
