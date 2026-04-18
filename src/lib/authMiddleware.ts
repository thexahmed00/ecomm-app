import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import connectDB from '@/lib/mongodb';
import { User } from '@/models/User';
import type { DecodedIdToken } from 'firebase-admin/auth';

const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

export async function verifyToken(req: NextRequest): Promise<DecodedIdToken | null> {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.split('Bearer ')[1]
    : req.cookies.get('firebaseToken')?.value;

  if (!token) return null;

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) return null;

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });

    const uid =
      typeof payload.user_id === 'string'
        ? payload.user_id
        : typeof payload.sub === 'string'
          ? payload.sub
          : null;

    if (!uid) return null;

    return { uid, ...payload } as unknown as DecodedIdToken;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

type RouteHandler<C extends Record<string, unknown>> = (
  req: NextRequest,
  context: C
) => Promise<NextResponse> | NextResponse;

type WithAuth<C extends Record<string, unknown>> = C & { auth: DecodedIdToken };

export function requireAuth<C extends Record<string, unknown>>(
  handler: RouteHandler<WithAuth<C>>
): RouteHandler<C> {
  return async (req: NextRequest, context: C) => {
    const decodedToken = await verifyToken(req);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return handler(req, { ...context, auth: decodedToken } as WithAuth<C>);
  };
}

export function requireAdmin<C extends Record<string, unknown>>(
  handler: RouteHandler<WithAuth<C>>
): RouteHandler<C> {
  return requireRole(handler, ['admin']);
}

export function requireVendor<C extends Record<string, unknown>>(
  handler: RouteHandler<WithAuth<C>>
): RouteHandler<C> {
  return requireRole(handler, ['vendor']);
}



//single function to check for both admin and vendor access
export function requireRole<C extends Record<string, unknown>>(
  handler: RouteHandler<WithAuth<C>>,
  allowedRoles: ('admin' | 'vendor')[]
): RouteHandler<C> {
  return async (req: NextRequest, context: C) => {
    const decodedToken = await verifyToken(req);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ firebaseUid: decodedToken.uid }).lean();
    if (!user || !allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Access denied' }, { status: 403 });
    }

    return handler(req, { ...context, auth: decodedToken } as WithAuth<C>);
  };
}