import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import { requireAdmin } from "@/lib/authMiddleware";
import PlatformSettings from "@/models/PlatformSettings";
import { redis } from "@/lib/redis";


//get and patch platform settings
export const GET = requireAdmin(async (req: NextRequest) => {
  await connectDB();

  // Try to get settings from Redis cache
  const cachedSettings = await redis.get("platform_settings");
  if (cachedSettings) {
    return NextResponse.json(cachedSettings);
  }

  // If not in cache, fetch from database
  let settings = await PlatformSettings.findOne({ key: "global" }).lean();

  if (!settings) {
    settings = await PlatformSettings.create({ key: "global" });
  }

  await redis.set("platform_settings", settings, { ex: 3600 });

  return NextResponse.json(settings);
});

export const PATCH = requireAdmin(async (req: NextRequest) => {
  await connectDB();

  const data = await req.json();
  
  // Update the platform settings document
  const updatedSettings = await PlatformSettings.findOneAndUpdate(
    { key: "global" },
    { $set: data },
    { new: true, upsert: true }
  ).lean();

  // Update the cache with the new settings
  await redis.set("platform_settings", updatedSettings, { ex: 3600 });

  return NextResponse.json(updatedSettings);
});