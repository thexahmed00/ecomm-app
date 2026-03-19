import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Product } from '@/models/Product';
import '@/models/Category';
import '@/models/Review';
import '@/models/User';
import { redis, cache, CACHE_TTL } from '@/lib/redis';
import { requireAdmin } from '@/lib/authMiddleware';
import { productSchema } from '@/lib/validations';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const cacheKey = `products:single:${slug}`;

    const fetchProduct = async () => {
      await connectDB();
      // Try finding by slug first, then by ID if slug is a valid ObjectId
      const query: { slug: string } | { _id: string } =
        mongoose.Types.ObjectId.isValid(slug) ? { _id: slug } : { slug };
      
      const product = await Product.findOne(query)
        .populate('category', 'name slug')
        .populate({
          path: 'reviews',
          populate: { path: 'user', select: 'name avatar' }
        })
        .lean();

      return product;
    };

    const product = await cache(cacheKey, fetchProduct, CACHE_TTL.SINGLE_PRODUCT);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Product GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const PUT = requireAdmin(async (
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) => {
  try {
    const { slug } = await params; // Actually this could be ID, depends on route structure. Let's assume ID is passed for PUT/DELETE
    await connectDB();
    const body = await req.json();

    const validation = productSchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }

    const product = await Product.findByIdAndUpdate(slug, validation.data, { new: true });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Invalidate caches
    await redis.del(`products:single:${product.slug}`);
    await redis.keys('products:list:*').then(keys => {
        if(keys.length > 0) redis.del(...keys);
    });
    await redis.del('homepage:featured');

    return NextResponse.json(product);
  } catch (error) {
    console.error('Product PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const DELETE = requireAdmin(async (
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) => {
  try {
    const { slug } = await params; // ID
    await connectDB();

    const product = await Product.findByIdAndDelete(slug);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Optionally: Delete images from Cloudinary here by calling deleteFromCloudinary

    // Invalidate caches
    await redis.del(`products:single:${product.slug}`);
    await redis.keys('products:list:*').then(keys => {
        if(keys.length > 0) redis.del(...keys);
    });
    await redis.del('homepage:featured');

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Product DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
