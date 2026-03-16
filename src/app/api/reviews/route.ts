import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Review } from '@/models/Review';
import { Product } from '@/models/Product';
import { Order } from '@/models/Order';
import { User } from '@/models/User';
import { requireAuth } from '@/lib/authMiddleware';
import { reviewSchema } from '@/lib/validations';
import { redis } from '@/lib/redis';

export const POST = requireAuth(async (req: NextRequest, context) => {
  try {
    const uid = context.auth?.uid;
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const body = await req.json();
    
    const validation = reviewSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }
    const { product: productId, rating, title, comment, images } = validation.data;

    const user = await User.findOne({ firebaseUid: uid });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Validate user purchased product before allowing review
    const hasPurchased = await Order.findOne({
      user: user._id,
      'items.product': productId,
      orderStatus: 'delivered', // Assume they must have received it
    });

    // We can strictly enforce this, or just mark isVerifiedPurchase
    const isVerifiedPurchase = !!hasPurchased;

    // Check if user already reviewed
    const existingReview = await Review.findOne({ product: productId, user: user._id });
    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 400 });
    }

    const review = await Review.create({
      product: productId,
      user: user._id,
      rating,
      title,
      comment,
      images,
      isVerifiedPurchase,
    });

    // Recalculate product avgRating + numReviews
    const allReviews = await Review.find({ product: productId });
    const numReviews = allReviews.length;
    const avgRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        $push: { reviews: review._id },
        numReviews,
        avgRating,
      },
      { new: true }
    );

    // Invalidate Redis cache for this product
    if (updatedProduct) {
      await redis.del(`products:single:${updatedProduct.slug}`);
    }

    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    console.error('Review POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
