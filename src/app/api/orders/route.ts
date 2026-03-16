import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { Cart } from '@/models/Cart';
import { User } from '@/models/User';
import { redis } from '@/lib/redis';
import { requireAuth } from '@/lib/authMiddleware';
import { orderSchema } from '@/lib/validations';

export const GET = requireAuth(async (req: NextRequest, context) => {
  try {
    const uid = context.auth?.uid;
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    await connectDB();
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const [orders, total] = await Promise.all([
      Order.find({ user: user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({ user: user._id }),
    ]);

    return NextResponse.json({
      orders,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Orders GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = requireAuth(async (req: NextRequest, context) => {
  try {
    const uid = context.auth?.uid;
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const body = await req.json();

    const validation = orderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }

    const user = await User.findOne({ firebaseUid: uid });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.floor(10000 + Math.random() * 90000).toString();
    const orderNumber = `ORD-${dateStr}-${randomStr}`;

    const orderData = {
      ...validation.data,
      orderNumber,
      user: user._id,
      orderStatus: 'placed',
      paymentStatus: validation.data.paymentMethod === 'stripe' ? 'pending' : 'pending',
    };

    const order = await Order.create(orderData);

    // Clear cart
    await Cart.findOneAndDelete({ user: user._id });
    await redis.del(`cart:user:${uid}`);

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    console.error('Orders POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
