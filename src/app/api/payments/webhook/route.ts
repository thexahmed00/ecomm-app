import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import type Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature');

  type StripeEventLike = { type: string; data: { object: unknown } };
  let event: Stripe.Event | StripeEventLike;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      // If no webhook secret, just parse the payload (for testing without webhook signature validation)
      event = JSON.parse(payload) as StripeEventLike;
    } else {
      if (!signature) {
        return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
      }
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed';
    console.error('Webhook signature verification failed.', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    await connectDB();

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Update order status based on paymentIntent id
      // Assuming we saved stripePaymentIntentId when creating the order, or passed orderId in metadata
      const stripePaymentIntentId = paymentIntent.id;
      
      await Order.findOneAndUpdate(
        { stripePaymentIntentId },
        { 
          paymentStatus: 'paid',
          orderStatus: 'confirmed'
        }
      );
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
