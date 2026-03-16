'use client';

import { useState, useRef } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { useAuthStore } from '@/store/authStore';
import type { CloudinaryImage } from '@/types';

interface ImageUploaderProps {
  images: CloudinaryImage[];
  onChange: (images: CloudinaryImage[]) => void;
  maxImages?: number;
  folder?: string;
}

export default function ImageUploader({
  images,
  onChange,
  maxImages = 6,
  folder = 'products',
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { firebaseUser } = useAuthStore();

  const handleUpload = async (files: FileList | File[]) => {
    if (!files.length || images.length >= maxImages) return;

    setUploading(true);
    const newImages = [...images];

    try {
      const token = await firebaseUser?.getIdToken();

      for (let i = 0; i < files.length; i++) {
        if (newImages.length >= maxImages) break;

        const file = files[i];
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) continue;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          newImages.push({ url: data.url, publicId: data.publicId });
        }
      }
      onChange(newImages);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (img: CloudinaryImage) => {
    try {
      if (img.publicId) {
        const token = await firebaseUser?.getIdToken();
        await fetch('/api/upload', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ publicId: img.publicId }),
        });
        onChange(images.filter((i) => i.publicId !== img.publicId));
      } else {
        onChange(images.filter((i) => i.url !== img.url));
      }
    } catch (error) {
      console.error('Failed to remove image:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((img, idx) => (
          <div key={img.publicId ?? img.url} className="relative aspect-square bg-gray-900 rounded-md overflow-hidden border border-gray-800">
            <CldImage
              src={img.url}
              alt={`Upload ${idx}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <button
              type="button"
              onClick={() => handleRemove(img)}
              className="absolute top-2 right-2 p-1 bg-black/70 text-white rounded-full hover:bg-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            {idx === 0 && (
              <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-xs font-medium text-[#E8A020] rounded">
                Main
              </span>
            )}
          </div>
        ))}
        
        {images.length < maxImages && (
          <div
            className={`relative aspect-square rounded-md border-2 border-dashed transition-colors flex flex-col items-center justify-center text-center p-4 cursor-pointer
              ${isDragging ? 'border-[#E8A020] bg-[#E8A020]/10' : 'border-gray-700 hover:border-gray-500 bg-gray-900/50'}
            `}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleUpload(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="w-8 h-8 text-[#E8A020] animate-spin mb-2" />
            ) : (
              <>
                <UploadCloud className="w-8 h-8 text-gray-500 mb-2" />
                <span className="text-sm text-gray-400">Click or drag</span>
              </>
            )}
          </div>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        accept="image/jpeg, image/png, image/webp"
        onChange={(e) => e.target.files && handleUpload(e.target.files)}
      />
    </div>
  );
}
