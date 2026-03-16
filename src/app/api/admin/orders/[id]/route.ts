import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { requireAdmin } from '@/lib/authMiddleware';
import { updateOrderSchema } from '@/lib/validations';

export const PUT = requireAdmin(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const validation = updateOrderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findByIdAndUpdate(id, validation.data, { new: true });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (err) {
    console.error('Admin Order PUT error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
