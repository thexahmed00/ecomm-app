import ProductForm from '@/components/admin/ProductForm';
import connectDB from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { notFound } from 'next/navigation';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  await connectDB();
  const product = await Product.findById(id).lean();

  if (!product) {
    notFound();
  }

  // Convert ObjectIds to string for client component serialization
  const serializedProduct = JSON.parse(JSON.stringify(product));

  return <ProductForm initialData={serializedProduct} />;
}