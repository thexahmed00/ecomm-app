import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { Category } from '@/models/Category';
import { redis, cache, CACHE_TTL } from '@/lib/redis';
import { requireAdmin } from '@/lib/authMiddleware';
import { productSchema } from '@/lib/validations';
import mongoose from 'mongoose';

// GET route remains unchanged...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category') || 'all';
    const sort = searchParams.get('sort') || 'newest';
    const search = searchParams.get('search') || '';
    const featured = searchParams.get('featured');

    const cacheKey = `products:list:${page}:${limit}:${category}:${sort}:${search}:${featured || 'all'}`;

    const fetchProducts = async () => {
      await connectDB();

      type RegexQuery = { $regex: string; $options: 'i' };
      type OrClause = { name?: RegexQuery; description?: RegexQuery; tags?: RegexQuery };
      type ProductQuery = {
        isActive: boolean;
        category?: string;
        isFeatured?: boolean;
        $or?: OrClause[];
      };

      const query: ProductQuery = { isActive: true };
      
      if (category !== 'all') {
        if (mongoose.Types.ObjectId.isValid(category)) {
          query.category = category;
        } else {
          const cat = await Category.findOne({ slug: category }).select('_id').lean();
          if (cat?._id) query.category = String(cat._id);
          else query.category = category;
        }
      }
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } }
        ];
      }

      if (featured === 'true') {
        query.isFeatured = true;
      }

      let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
      if (sort === 'price_asc') sortOption = { price: 1 };
      if (sort === 'price_desc') sortOption = { price: -1 };
      if (sort === 'rating') sortOption = { avgRating: -1 };

      const skip = (page - 1) * limit;

      const [products, total] = await Promise.all([
        Product.find(query)
          .populate('category', 'name slug')
          .sort(sortOption)
          .skip(skip)
          .limit(limit)
          .lean(),
        Product.countDocuments(query),
      ]);

      return {
        products,
        total,
        page,
        pages: Math.ceil(total / limit),
      };
    };

    const data = await cache(cacheKey, fetchProducts, CACHE_TTL.PRODUCT_LIST);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = requireAdmin(async (req: NextRequest) => {
  try {
    await connectDB();
    const body = await req.json();

    const validation = productSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }

    const product = await Product.create(validation.data);

    // Invalidate caches
    await redis.keys('products:list:*').then(keys => {
        if(keys.length > 0) {
            redis.del(...keys);
        }
    });
    await redis.del('homepage:featured');

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Products POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
