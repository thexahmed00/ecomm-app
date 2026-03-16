'use client';

import { useAuthStore } from '@/store/authStore';
import { CldImage } from 'next-cloudinary';
import { User } from 'lucide-react';
import { useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import type { CloudinaryImage } from '@/types';

export default function AccountProfile() {
  const hasCloudinary = !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const { mongoUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState<CloudinaryImage[]>(
    mongoUser?.avatar ? [{ url: mongoUser.avatar, publicId: 'avatar' }] : []
  );

  return (
    <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-medium text-[#F5F0E8]">Profile Details</h2>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="text-sm text-[#E8A020] hover:underline"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className="w-32 h-32 relative bg-gray-800 rounded-full overflow-hidden border-2 border-gray-700 mb-4 flex items-center justify-center">
            {avatar.length > 0 ? (
              hasCloudinary ? (
                <CldImage src={avatar[0].url} alt="Avatar" fill className="object-cover" sizes="128px" />
              ) : (
                <img src={avatar[0].url} alt="Avatar" className="object-cover w-full h-full" loading="lazy" />
              )
            ) : (
              <User className="w-12 h-12 text-gray-500" />
            )}
          </div>
          {isEditing && (
            <div className="w-full max-w-[150px]">
              <ImageUploader 
                images={avatar} 
                onChange={setAvatar} 
                maxImages={1} 
                folder="avatars" 
              />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
            <input 
              type="text" 
              defaultValue={mongoUser?.name} 
              disabled={!isEditing}
              className={`w-full bg-gray-900 border rounded-md py-2 px-3 text-[#F5F0E8] focus:outline-none focus:border-[#E8A020] ${isEditing ? 'border-gray-700' : 'border-transparent bg-transparent px-0'}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
            <input 
              type="email" 
              defaultValue={mongoUser?.email} 
              disabled
              className="w-full bg-transparent border-transparent rounded-md py-2 px-0 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
            <input 
              type="tel" 
              placeholder="+91 " 
              disabled={!isEditing}
              className={`w-full bg-gray-900 border rounded-md py-2 px-3 text-[#F5F0E8] focus:outline-none focus:border-[#E8A020] ${isEditing ? 'border-gray-700' : 'border-transparent bg-transparent px-0'}`}
            />
          </div>

          {isEditing && (
            <div className="pt-4 flex justify-end">
              <button 
                onClick={() => setIsEditing(false)}
                className="bg-[#E8A020] text-black font-medium px-6 py-2 rounded hover:bg-[#d6901a]"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
