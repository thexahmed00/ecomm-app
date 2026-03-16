import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { redis, cache, CACHE_TTL } from '@/lib/redis';
import { requireAdmin } from '@/lib/authMiddleware';
import { categorySchema } from '@/lib/validations';

export async function GET() {
  try {
    const fetchCategories = async () => {
      await connectDB();
      return await Category.find({ isActive: true }).lean();
    };

    const categories = await cache('categories:all', fetchCategories, CACHE_TTL.CATEGORIES);

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Categories GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = requireAdmin(async (req: NextRequest) => {
  try {
    await connectDB();
    const body = await req.json();

    const validation = categorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }

    const category = await Category.create(validation.data);

    await redis.del('categories:all');

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Categories POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
