import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: {
    url: string;
    publicId: string;
  };
  parentCategory?: mongoose.Types.ObjectId;
  isActive: boolean;
}

const CategorySchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  image: {
    url: String,
    publicId: String,
  },
  parentCategory: { type: Schema.Types.ObjectId, ref: 'Category' },
  isActive: { type: Boolean, default: true },
});

export const Category = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
export default Category;
