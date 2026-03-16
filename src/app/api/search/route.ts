import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { cache, CACHE_TTL } from '@/lib/redis';
import { rateLimit } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const rateLimitResult = rateLimit(ip, 'search', 10, 60 * 1000);
  
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');

    if (!q) {
      return NextResponse.json({ results: [] });
    }

    const cacheKey = `search:results:${q}`;

    const fetchSearchResults = async () => {
      await connectDB();
      
      const results = await Product.find({
        isActive: true,
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { tags: { $regex: q, $options: 'i' } },
        ],
      })
        .select('name slug price images')
        .limit(10)
        .lean();

      return results.map(p => ({
        name: p.name,
        slug: p.slug,
        price: p.price,
        image: p.images?.[0] || null,
      }));
    };

    const results = await cache(cacheKey, fetchSearchResults, CACHE_TTL.SEARCH_RESULTS);

    return NextResponse.json({ results });
  } catch (err) {
    console.error('Search GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
