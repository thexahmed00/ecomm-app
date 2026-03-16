import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { PromoCode } from '@/models/PromoCode';
import { requireAuth } from '@/lib/authMiddleware';

export const POST = requireAuth(async (req: NextRequest) => {
  try {
    await connectDB();
    const body = await req.json();
    const { code, orderAmount } = body;

    if (!code) {
      return NextResponse.json({ error: 'Promo code is required' }, { status: 400 });
    }

    const promo = await PromoCode.findOne({ code: code.toUpperCase(), isActive: true });

    if (!promo) {
      return NextResponse.json({ error: 'Invalid or expired promo code' }, { status: 400 });
    }

    if (promo.expiresAt && new Date() > promo.expiresAt) {
      return NextResponse.json({ error: 'Promo code has expired' }, { status: 400 });
    }

    if (promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ error: 'Promo code usage limit reached' }, { status: 400 });
    }

    if (orderAmount < promo.minOrderAmount) {
      return NextResponse.json({ 
        error: `Minimum order amount for this code is ₹${promo.minOrderAmount}` 
      }, { status: 400 });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (promo.discountType === 'percentage') {
      discountAmount = (orderAmount * promo.discountValue) / 100;
    } else {
      discountAmount = promo.discountValue;
    }

    // Don't let discount exceed order amount
    discountAmount = Math.min(discountAmount, orderAmount);

    return NextResponse.json({
      code: promo.code,
      discountAmount,
      discountType: promo.discountType,
    });
  } catch (err) {
    console.error('Promo validate error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
