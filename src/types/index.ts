export type CloudinaryImage = {
  url: string;
  publicId?: string;
  alt?: string;
  width?: number;
  height?: number;
};

export type CategorySummary = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: { url: string; publicId?: string } | null;
  parentCategory?: { _id: string; name: string; slug: string } | string | null;
  isActive?: boolean;
};

export type ProductSummary = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: CloudinaryImage[];
  avgRating: number;
  numReviews?: number;
  stock?: number;
  shortDescription?: string;
  category?: { _id: string; name: string; slug: string } | null;
};

export type ProductDetail = ProductSummary & {
  description?: string;
  variants?: { name: string; options: string[] }[];
  tags?: string[];
};

export type Address = {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
  phone?: string;
  name?: string;
};

export type MongoUser = {
  _id: string;
  firebaseUid: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin' | 'vendor';
  addresses?: Address[];
  wishlist?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type VendorProfileSummary = {
  _id: string;
  user: string;
  storeName: string;
  storeSlug: string;
  logo?: { url: string; publicId: string };
  banner?: { url: string; publicId: string };
  bio: string;
  socialLinks?: { instagram?: string; twitter?: string; website?: string };
  totalEarnings: number;
  pendingPayout: number;
  isActive: boolean;
  createdAt: string;
};                                                                                                                                                                                                                                                                         
                     