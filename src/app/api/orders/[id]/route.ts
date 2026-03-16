import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { User } from '@/models/User';
import { requireAuth } from '@/lib/authMiddleware';
import type { DecodedIdToken } from 'firebase-admin/auth';

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
