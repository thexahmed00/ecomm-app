import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAdmin } from '@/lib/authMiddleware';
import PlatformSettings from '@/models/PlatformSettings';
import { platformSettingsSchema } from '@/lib/validations';
import { redis } from '@/lib/redis';

const SETTINGS_CACHE_KEY = 'platform_settings';

export const GET = requireAdmin(async (_req: NextRequest) => {
  await connectDB();

  const cached = await redis.get(SETTINGS_CACHE_KEY);
  if (cached) return NextResponse.json(cached);

  let settings = await PlatformSettings.findOne({ key: 'global' }).lean();
  if (!settings) {
    settings = await PlatformSettings.create({ key: 'global' });
  }

  await redis.set(SETTINGS_CACHE_KEY, settings, { ex: 3600 });
  return NextResponse.json(settings);
});

export const PATCH = requireAdmin(async (req: NextRequest) => {
  await connectDB();

  const body = await req.json();
  const parsed = platformSettingsSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const settings = await PlatformSettings.findOneAndUpdate(
    { key: 'global' },
    { $set: parsed.data },
    { upsert: true, new: true }
  ).lean();

  await redis.del(SETTINGS_CACHE_KEY);
  return NextResponse.json(settings);
});
