import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import { requireAuth, requireAdmin } from '@/lib/authMiddleware';
import { User } from '@/models/User';
import connectDB from '@/lib/mongodb';

export const POST = requireAuth(async (req: NextRequest, context) => {
  try {
    const uid = context.auth?.uid;
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'general';

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    // Validate type and size (max 5MB)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only jpg, png, webp allowed.' }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 5MB' }, { status: 400 });
    }

    // Admin only for product/category images
    if (['products', 'categories'].includes(folder) && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // We need to convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const result = await uploadToCloudinary(buffer, folder);

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error('Upload POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const DELETE = requireAdmin(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { publicId } = body;

    if (!publicId) {
      return NextResponse.json({ error: 'publicId is required' }, { status: 400 });
    }

    await deleteFromCloudinary(publicId);

    return NextResponse.json({ message: 'Image deleted successfully' });
  } catch (err) {
    console.error('Upload DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
