import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Cart } from '@/models/Cart';
import { User } from '@/models/User';
import { redis } from '@/lib/redis';
import { requireAuth } from '@/lib/authMiddleware';
import { z } from 'zod';
import type { DecodedIdToken } from 'firebase-admin/auth';

const CACHE_TTL_CART = 120;

export const PUT = requireAuth(async (
  req: NextRequest,
  context: { params: Promise<{ itemId: string }>; auth?: DecodedIdToken }
) => {
  try {
    const uid = context.auth?.uid;
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { itemId } = await context.params;
    const body = await req.json();
    
    const quantitySchema = z.object({ quantity: z.number().int().min(1) });
    const validation = quantitySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }
    const { quantity } = validation.data;

    await connectDB();
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
    }

    item.quantity = quantity;
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product').lean();
    const cacheKey = `cart:user:${uid}`;
    await redis.set(cacheKey, JSON.stringify(populatedCart), { ex: CACHE_TTL_CART });

    return NextResponse.json(populatedCart);
  } catch (err) {
    console.error('Cart PUT error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const DELETE = requireAuth(async (
  req: NextRequest,
  context: { params: Promise<{ itemId: string }>; auth?: DecodedIdToken }
) => {
  try {
    const uid = context.auth?.uid;
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { itemId } = await context.params;

    await connectDB();
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    cart.items.pull(itemId);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.product').lean();
    const cacheKey = `cart:user:${uid}`;
    await redis.set(cacheKey, JSON.stringify(populatedCart), { ex: CACHE_TTL_CART });

    return NextResponse.json(populatedCart);
  } catch (err) {
    console.error('Cart item DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
