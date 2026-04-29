import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireVendor } from '@/lib/authMiddleware';
import { Product } from '@/models/Product';
import { Category } from '@/models/Category';
import { User } from '@/models/User';
import { productSchema } from '@/lib/validations';
import { redis } from '@/lib/redis';
import { getCategoryName } from '@/lib/categories';

export const GET = requireVendor(async (_req: NextRequest, { auth }) => {
  await connectDB();

  const user = await User.findOne({ firebaseUid: auth.uid }).lean();
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const products = await Product.find({ vendor: user._id })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ products });
});

export const POST = requireVendor(async (req: NextRequest, { auth }) => {
  await connectDB();

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const user = await User.findOne({ firebaseUid: auth.uid }).lean();
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const categorySlug = parsed.data.category;
  const categoryDoc = await Category.findOneAndUpdate(
    { slug: categorySlug },
    { slug: categorySlug, name: getCategoryName(categorySlug), isActive: true },
    { upsert: true, new: true }
  );

  const baseSlug = parsed.data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const slug = `${baseSlug}-${Date.now()}`;

  const product = await Product.create({
    ...parsed.data,
    category: categoryDoc._id,
    slug,
    vendor: user._id,
  });

  await redis.del('products:list');

  return NextResponse.json({ product }, { status: 201 });
});
