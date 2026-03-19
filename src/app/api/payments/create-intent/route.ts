import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authMiddleware';
import { User } from '@/models/User';
import connectDB from '@/lib/mongodb';

export const POST = requireAuth(async (req: NextRequest, context) => {
  try {
    const uid = context.auth?.uid;
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { amount, currency = 'INR', receipt } = body;

    if (!amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay keys are not configured' }, { status: 500 });
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(Number(amount) * 100),
        currency: String(currency).toUpperCase(),
        receipt: receipt ? String(receipt) : `user-${user._id.toString()}`,
        notes: {
          userId: user._id.toString(),
        },
      }),
    });

    const data = (await res.json()) as unknown;
    if (!res.ok) {
      const msg = typeof data === 'object' && data && 'error' in data ? JSON.stringify(data) : 'Razorpay order creation failed';
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    return NextResponse.json({
      keyId,
      order: data,
    });
  } catch (err) {
    console.error('Razorpay create-order error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
