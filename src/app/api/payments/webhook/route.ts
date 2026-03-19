import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import crypto from 'crypto';

function timingSafeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

type RazorpayWebhookEvent = {
  event?: string;
  payload?: {
    payment?: { entity?: { order_id?: string; id?: string } };
    order?: { entity?: { id?: string } };
  };
};

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get('x-razorpay-signature');
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  try {
    if (webhookSecret) {
      if (!signature) {
        return NextResponse.json({ error: 'Missing x-razorpay-signature header' }, { status: 400 });
      }
      const expected = crypto.createHmac('sha256', webhookSecret).update(payload).digest('hex');
      if (!timingSafeEqual(expected, signature)) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const event = JSON.parse(payload) as RazorpayWebhookEvent;

    await connectDB();

    const type = event?.event;

    if (type === 'payment.captured') {
      const rpOrderId = event?.payload?.payment?.entity?.order_id;
      const rpPaymentId = event?.payload?.payment?.entity?.id;

      if (rpOrderId) {
        await Order.findOneAndUpdate(
          { razorpayOrderId: rpOrderId },
          {
            paymentStatus: 'paid',
            orderStatus: 'confirmed',
            razorpayPaymentId: rpPaymentId,
          }
        );
      }
    }

    if (type === 'order.paid') {
      const rpOrderId = event?.payload?.order?.entity?.id;
      if (rpOrderId) {
        await Order.findOneAndUpdate(
          { razorpayOrderId: rpOrderId },
          {
            paymentStatus: 'paid',
            orderStatus: 'confirmed',
          }
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
