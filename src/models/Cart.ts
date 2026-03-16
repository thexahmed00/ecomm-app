import mongoose, { Schema, Document } from 'mongoose';

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: {
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
    selectedVariants?: Record<string, string>;
  }[];
  updatedAt: Date;
}

const CartSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        selectedVariants: { type: Map, of: String },
      },
    ],
  },
  { timestamps: true }
);

export const Cart = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);
export default Cart;
