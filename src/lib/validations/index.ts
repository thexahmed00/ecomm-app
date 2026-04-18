import { z } from 'zod';

// Product Validations
export const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  comparePrice: z.number().optional(),
  images: z.array(z.object({
    url: z.string().url(),
    publicId: z.string(),
    alt: z.string().optional()
  })).min(1, 'At least one image is required'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).optional(),
  variants: z.array(z.object({
    name: z.string(),
    options: z.array(z.string())
  })).optional(),
  stock: z.number().int().min(0),
  sku: z.string().min(1, 'SKU is required'),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// Category Validations
export const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  image: z.object({
    url: z.string().url(),
    publicId: z.string()
  }).optional(),
  parentCategory: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Cart Validations
export const cartItemSchema = z.object({
  product: z.string(),
  quantity: z.number().int().min(1),
  price: z.number().min(0),
  selectedVariants: z.record(z.string(), z.string()).optional()
});

// Order Validations
export const orderSchema = z.object({
  items: z.array(z.object({
    product: z.string(),
    name: z.string(),
    image: z.string(),
    price: z.number(),
    quantity: z.number().int().min(1),
    variant: z.record(z.string(), z.string()).optional()
  })).min(1),
  shippingAddress: z.object({
    name: z.string(),
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    country: z.string(),
    phone: z.string()
  }),
  paymentMethod: z.enum(['razorpay', 'cod']),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  orderStatus: z.enum(['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']).optional(),
  subtotal: z.number(),
  shippingCost: z.number(),
  discount: z.number().optional(),
  totalAmount: z.number(),
  promoCode: z.string().optional(),
  notes: z.string().optional(),
});

export const updateOrderSchema = z.object({
  orderStatus: z.enum(['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
});

// Platform Settings Validations
export const platformSettingsSchema = z.object({
  commissionRate: z.number().min(0).max(1),
  vendorRegistrationOpen: z.boolean(),
  maintenanceMode: z.boolean(),
});

export const VendorProfileSchema = z.object({
  storeName: z.string().min(2, 'Store name must be at least 2 characters'),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  socialLinks: z.object({
    instagram: z.string().url().optional(),
    twitter: z.string().url().optional(),
    website: z.string().url().optional(),
  }).optional(),
  applicationStatus: z.enum(['pending', 'approved', 'rejected', 'suspended']),
  applicationNote: z.string().optional(),
  commissionRate: z.number().min(0).max(1).optional(),
});


export const vendorApplicationUpdateSchema = z.object({
  applicationStatus: z.enum(['pending', 'approved', 'rejected', 'suspended']).optional(),
  applicationNote: z.string().optional(),
  isActive: z.boolean().optional(),
});


export const vendorReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(1),
  comment: z.string().min(5),
  images: z.array(z.object({
    url: z.string().url(),
    publicId: z.string()
  })).optional(),
  commisionRate: z.number().min(0).max(1).optional(),
  isActive: z.boolean().optional(),
});




// Review Validations
export const reviewSchema = z.object({
  product: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().min(1),
  comment: z.string().min(5),
  images: z.array(z.object({
    url: z.string().url(),
    publicId: z.string()
  })).optional()
});
