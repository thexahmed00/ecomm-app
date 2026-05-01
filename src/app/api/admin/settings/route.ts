import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import { requireAdmin } from "@/lib/authMiddleware";
import PlatformSettings from "@/models/PlatformSettings";
import { redis } from "@/lib/redis";

const SETTINGS_CACHE_KEY = "platform_settings";

//get and patch platform settings
export const GET = requireAdmin(async () => {
  await connectDB();

  const cached = await redis.get(SETTINGS_CACHE_KEY);
  if (cached) return NextResponse.json(cached);

  const settings = await PlatformSettings.findOneAndUpdate(
    { key: 'global' },
    { $setOnInsert: { key: 'global', maintenanceMode: false } },
    { upsert: true, new: true }
  ).lean();

  await redis.set(SETTINGS_CACHE_KEY, settings, { ex: 3600 });

  return NextResponse.json(settings);
});

export const PATCH = requireAdmin(async (req: NextRequest) => {
  await connectDB();

  const data = await req.json();

  const updatedSettings = await PlatformSettings.findOneAndUpdate(
    { key: "global" },
    { $set: data },
    { new: true, upsert: true }
  ).lean();

  await redis.set(SETTINGS_CACHE_KEY, updatedSettings, { ex: 3600 });

  return NextResponse.json(updatedSettings);
});
