import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/authMiddleware';
import VendorProfile from '@/models/VendorProfile';
import { User } from '@/models/User';
import { vendorApplicationSchema } from '@/lib/validations';

export const POST = requireAuth(async (req: NextRequest, { auth }) => {
  await connectDB();

  const body = await req.json();
  const parsed = vendorApplicationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { storeName, storeSlug, bio } = parsed.data;

  const slugTaken = await VendorProfile.findOne({ storeSlug });
  if (slugTaken) return NextResponse.json({ error: 'Slug already taken' }, { status: 409 });

  const user = await User.findOne({ firebaseUid: auth.uid });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const existingProfile = await VendorProfile.findOne({ user: user._id });
  if (existingProfile) return NextResponse.json({ error: 'Already registered as vendor' }, { status: 409 });

  // const [profile] = await Promise.all([
  //   VendorProfile.create({ user: user._id, storeName, storeSlug, bio }),
  //   User.findByIdAndUpdate(user._id, { role: 'vendor' }),
  // ]);

  const session = await VendorProfile.db.startSession();
  const [profile] = await session.withTransaction(async () => {
  const [createdProfile] = await VendorProfile.create(
      [{ user: user._id, storeName, storeSlug, bio }],
      { session }
    );

    await User.findByIdAndUpdate(
      user._id,
      { $set: { role: 'vendor' } },
      { session, runValidators: true }
    );

    return [createdProfile];
  });
  await session.endSession();

  return NextResponse.json({ profile }, { status: 201 });
});
