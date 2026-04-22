import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  images: {
    url: string;
    publicId: string;
    alt?: string;
  }[];
  category: mongoose.Types.ObjectId;
  vendor?: mongoose.Types.ObjectId | null;
  tags: string[];
  variants: {
    name: string;
    options: string[];
  }[];
  stock: number;
  sku: string;
  reviews: mongoose.Types.ObjectId[];
  avgRating: number;
  numReviews: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    price: { type: Number, required: true },
    comparePrice: { type: Number },
    images: [
      {
        url: String,
        publicId: String,
        alt: String,
      },
    ],
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    tags: [String],
    variants: [
      {
        name: String,
        options: [String],
      },
    ],
    stock: { type: Number, default: 0 },
    sku: { type: String, required: true, unique: true },
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
    avgRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Pre-save hook to generate slug could be added here, but usually better handled in service layer to ensure uniqueness with counters if needed.
// For now, we assume slug is provided or generated before save.

export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
export default Product;
