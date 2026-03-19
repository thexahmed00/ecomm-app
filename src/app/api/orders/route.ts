import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { Cart } from '@/models/Cart';
import { User } from '@/models/User';
import { redis } from '@/lib/redis';
import { requireAuth } from '@/lib/authMiddleware';
import { orderSchema } from '@/lib/validations';

type RazorpayOrderCreateResponse = {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status: string;
};

async function createRazorpayOrder(options: {
  amountPaise: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrderCreateResponse> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error('Razorpay keys are not configured');
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: options.amountPaise,
      currency: options.currency,
      receipt: options.receipt,
      notes: options.notes,
    }),
  });

  const data = (await res.json()) as unknown;
  if (!res.ok) {
    const msg = typeof data === 'object' && data && 'error' in data ? JSON.stringify(data) : 'Razorpay order creation failed';
    throw new Error(msg);
  }

  return data as RazorpayOrderCreateResponse;
}

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
      paymentStatus: 'pending',
    };

    let order = await Order.create(orderData);

    if (validation.data.paymentMethod === 'razorpay') {
      const amountPaise = Math.round(order.totalAmount * 100);
      const rpOrder = await createRazorpayOrder({
        amountPaise,
        currency: 'INR',
        receipt: order.orderNumber,
        notes: {
          orderId: String(order._id),
          orderNumber: order.orderNumber,
          userId: String(user._id),
        },
      });

      order = await Order.findByIdAndUpdate(
        order._id,
        { razorpayOrderId: rpOrder.id },
        { new: true }
      );
      if (!order) {
        return NextResponse.json({ error: 'Order not found after update' }, { status: 500 });
      }

      // Clear cart
      await Cart.findOneAndDelete({ user: user._id });
      await redis.del(`cart:user:${uid}`);

      return NextResponse.json(
        {
          order,
          razorpay: {
            keyId: process.env.RAZORPAY_KEY_ID,
            orderId: rpOrder.id,
            amount: rpOrder.amount,
            currency: rpOrder.currency,
          },
        },
        { status: 201 }
      );
    }

    // Clear cart
    await Cart.findOneAndDelete({ user: user._id });
    await redis.del(`cart:user:${uid}`);

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    console.error('Orders POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
