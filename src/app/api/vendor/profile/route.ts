import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireVendor } from '@/lib/authMiddleware';
import { VendorProfile } from '@/models/VendorProfile';
import { User } from '@/models/User';

export const GET = requireVendor(async (_req: NextRequest, { auth }) => {
  await connectDB();

  const user = await User.findOne({ firebaseUid: auth.uid }).lean();
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const profile = await VendorProfile.findOne({ user: user._id }).lean();
  if (!profile) return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });

  return NextResponse.json({ profile });
});

  export const PUT = requireVendor(async (req: NextRequest, { auth }) => {
    await connectDB();                                                                         
                                                        
    const user = await User.findOne({ firebaseUid: auth.uid });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });         
                                              
    const profile = await VendorProfile.findOne({ user: user._id });                           
    if (!profile) return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404
   });                                                                                         
                                          
    const { storeName, bio, socialLinks } = await req.json();                                  
                                                                                               
    if (storeName) profile.storeName = storeName;
    if (bio) profile.bio = bio;                                                                
    if (socialLinks) profile.socialLinks = socialLinks; 
                                                                                               
    await profile.save();
    return NextResponse.json({ profile });                                                     
  });          

