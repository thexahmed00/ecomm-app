import mongoose, { Schema, Document } from 'mongoose';

export interface IVendorProfile extends Document {
  user: mongoose.Types.ObjectId;
  storeName: string;
  storeSlug: string;
  logo?: { url: string; publicId: string };
  banner?: { url: string; publicId: string };
  bio: string;
  socialLinks?: { instagram?: string; twitter?: string; website?: string };
  totalEarnings: number;
  pendingPayout: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VendorProfileSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    storeName: { type: String, required: true },
    storeSlug: { type: String, required: true, unique: true },
    logo: { url: String, publicId: String },
    banner: { url: String, publicId: String },
    bio: { type: String, required: true },
    socialLinks: {
      instagram: String,
      twitter: String,
      website: String,
    },
    totalEarnings: { type: Number, default: 0 },
    pendingPayout: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const VendorProfile =
  mongoose.models.VendorProfile ||
  mongoose.model<IVendorProfile>('VendorProfile', VendorProfileSchema);
export default VendorProfile;
