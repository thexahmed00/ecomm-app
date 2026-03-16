import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models/User';
import { requireAuth } from '@/lib/authMiddleware';
import { Product } from '@/models/Product';
import { z } from 'zod';
import mongoose from 'mongoose';

export const GET = requireAuth(async (req: NextRequest, context) => {
  try {
    const uid = context.auth?.uid;
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const populatedUser = await User.findById(user._id)
      .populate({
        path: 'wishlist',
        model: Product,
        select: 'name slug price images avgRating numReviews isFeatured stock'
      })
      .lean();

    return NextResponse.json({ wishlist: populatedUser?.wishlist || [] });
  } catch (err) {
    console.error('Wishlist GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = requireAuth(async (req: NextRequest, context) => {
  try {
    const uid = context.auth?.uid;
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    
    const schema = z.object({ productId: z.string() });
    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }
    const { productId } = validation.data;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: 'Invalid productId' }, { status: 400 });
    }

    await connectDB();

    const currentUser = await User.findOne({ firebaseUid: uid });
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const productObjectId = new mongoose.Types.ObjectId(productId);
    const index = currentUser.wishlist.findIndex((id: mongoose.Types.ObjectId) => id.equals(productObjectId));
    
    if (index === -1) {
      // Add to wishlist
      currentUser.wishlist.push(productObjectId);
    } else {
      // Remove from wishlist
      currentUser.wishlist.splice(index, 1);
    }

    await currentUser.save();

    return NextResponse.json({ wishlist: currentUser.wishlist });
  } catch (err) {
    console.error('Wishlist POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
