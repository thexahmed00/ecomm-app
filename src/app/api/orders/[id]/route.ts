import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { User } from '@/models/User';
import { requireAuth } from '@/lib/authMiddleware';
import type { DecodedIdToken } from 'firebase-admin/auth';
import crypto from 'crypto';

function timingSafeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export const GET = requireAuth(async (
  req: NextRequest,
  context: { params: Promise<{ id: string }>; auth?: DecodedIdToken }
) => {
  try {
    const uid = context.auth?.uid;
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await context.params;
    await connectDB();

    const user = await User.findOne({ firebaseUid: uid });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const order = await Order.findById(id).lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Ensure the order belongs to the user
    if (order.user.toString() !== user._id.toString() && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (err) {
    console.error('Order GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = requireAuth(async (
  req: NextRequest,
  context: { params: Promise<{ id: string }>; auth?: DecodedIdToken }
) => {
  try {
    const uid = context.auth?.uid;
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await context.params;
    await connectDB();

    const user = await User.findOne({ firebaseUid: uid });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const order = await Order.findById(id);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    if (order.user.toString() !== user._id.toString() && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = (await req.json()) as {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    };

    if (!body.razorpay_order_id || !body.razorpay_payment_id || !body.razorpay_signature) {
      return NextResponse.json({ error: 'Missing Razorpay fields' }, { status: 400 });
    }

    if (!order.razorpayOrderId || order.razorpayOrderId !== body.razorpay_order_id) {
      return NextResponse.json({ error: 'Razorpay order mismatch' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return NextResponse.json({ error: 'Razorpay keys are not configured' }, { status: 500 });

    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`)
      .digest('hex');

    if (!timingSafeEqual(expected, body.razorpay_signature)) {
      await Order.findByIdAndUpdate(order._id, { paymentStatus: 'failed' });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const updated = await Order.findByIdAndUpdate(
      order._id,
      {
        paymentStatus: 'paid',
        orderStatus: 'confirmed',
        razorpayPaymentId: body.razorpay_payment_id,
        razorpaySignature: body.razorpay_signature,
      },
      { new: true }
    ).lean();

    return NextResponse.json(updated);
  } catch (err) {
    console.error('Order payment verify error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
