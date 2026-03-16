import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { requireAdmin } from '@/lib/authMiddleware';

export const GET = requireAdmin(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search'); // email or orderNumber
    const skip = (page - 1) * limit;

    await connectDB();

    type RegexQuery = { $regex: string; $options: 'i' };
    type OrderQuery = { orderStatus?: string; orderNumber?: RegexQuery };

    const query: OrderQuery = {};
    if (status) {
      query.orderStatus = status;
    }

    if (search) {
      query.orderNumber = { $regex: search, $options: 'i' };
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'email name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    return NextResponse.json({
      orders,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Admin Orders GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
