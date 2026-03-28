import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models/User';
import { rateLimit } from '@/lib/rateLimit';
import { jwtVerify, createRemoteJWKSet } from 'jose';

const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const isDev = process.env.NODE_ENV !== 'production';
  if (!isDev) {
    const rateLimitResult = rateLimit(ip, 'login', 5, 15 * 60 * 1000);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many login attempts' }, { status: 429 });
    }
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];

    const projectId = process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) {
      return NextResponse.json({ error: 'Auth not configured' }, { status: 500 });
    }

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });

    const uid =
      typeof payload.user_id === 'string'
        ? payload.user_id
        : typeof payload.sub === 'string'
          ? payload.sub
          : undefined;
    const email = typeof payload.email === 'string' ? payload.email : undefined;
    const name = typeof payload.name === 'string' ? payload.name : undefined;
    const picture = typeof payload.picture === 'string' ? payload.picture : undefined;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await connectDB();

    // Find or create user
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // Check if user exists by email (e.g. seeded admin)
      user = await User.findOne({ email });
      
      if (user) {
        // Update existing user with firebaseUid
        user.firebaseUid = uid;
        user.avatar = user.avatar || picture;
        user.name = user.name || name || email.split('@')[0];
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          firebaseUid: uid,
          email,
          name: name || email.split('@')[0],
          avatar: picture,
          role: 'user', // Default role
          addresses: [],
        });
      }
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Auth sync error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
