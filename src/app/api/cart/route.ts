import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Cart } from '@/models/Cart';
import { redis } from '@/lib/redis';
import { requireAuth } from '@/lib/authMiddleware';
import { cartItemSchema } from '@/lib/validations';
import { User } from '@/models/User';

export const GET = requireAuth(async (req: NextRequest, context) => {
  try {
    const uid = context.auth?.uid;
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const cacheKey = `cart:user:${uid}`;

    // Try Redis first
    const cachedCart = await redis.get(cacheKey);
    if (cachedCart) {
      if (typeof cachedCart === 'string') {
        return NextResponse.json(JSON.parse(cachedCart));
      }
      return NextResponse.json(cachedCart);
    }

    // Fallback to MongoDB
    await connectDB();
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const cart = await Cart.findOne({ user: user._id }).populate('items.product').lean();
    
    if (cart) {
      await redis.set(cacheKey, JSON.stringify(cart), { ex: 120 });
    }

    return NextResponse.json(cart || { items: [] });
  } catch (error) {
    console.error('Cart GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = requireAuth(async (req: NextRequest, context) => {
  try {
    const uid = context.auth?.uid;
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const body = await req.json();

    const validation = cartItemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }

    const item = validation.data;
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      cart = await Cart.create({
        user: user._id,
        items: [item]
      });
    } else {
      const existingItemIndex = cart.items.findIndex(
        (i: { product: { toString(): string }; selectedVariants?: unknown }) =>
          i.product.toString() === item.product &&
          JSON.stringify(i.selectedVariants ?? {}) === JSON.stringify(item.selectedVariants ?? {})
      );

      if (existingItemIndex >= 0) {
        cart.items[existingItemIndex].quantity += item.quantity;
      } else {
        cart.items.push(item);
      }
      await cart.save();
    }

    await redis.set(`cart:user:${uid}`, JSON.stringify(cart), { ex: 120 });

    return NextResponse.json(cart);
  } catch (error) {
    console.error('Cart POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const DELETE = requireAuth(async (req: NextRequest, context) => {
  try {
    const uid = context.auth?.uid;
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await Cart.findOneAndDelete({ user: user._id });
    await redis.del(`cart:user:${uid}`);

    return NextResponse.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Cart DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
