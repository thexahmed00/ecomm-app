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

export const vendorRegistrationSchema = z.object({
  storeName: z.string().min(2, 'Store name must be at least 2 characters'),
  storeSlug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  bio: z.string().min(20, 'Bio must be at least 20 characters'),
});

export const vendorProfileUpdateSchema = z.object({
  storeName: z.string().min(2, 'Store name must be at least 2 characters').optional(),
  bio: z.string().min(20, 'Bio must be at least 20 characters').optional(),
  socialLinks: z.object({
    instagram: z.string().url().optional(),
    twitter: z.string().url().optional(),
    website: z.string().url().optional(),
  }).optional(),
});

export const vendorSuspendSchema = z.object({
  isActive: z.boolean(),
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

// Vendor Validations
export const vendorApplicationSchema = z.object({
  storeName: z.string().min(2).max(60),
  storeSlug: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  bio: z.string().min(20).max(500),
});

export const vendorProfileSchema = z.object({
  storeName: z.string().min(2).max(60),
  storeSlug: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/),
  bio: z.string().max(500).optional(),
  socialLinks: z
    .object({
      instagram: z.string().url().optional().or(z.literal('')),
      twitter: z.string().url().optional().or(z.literal('')),
      website: z.string().url().optional().or(z.literal('')),
    })
    .optional(),
});

export const vendorReviewSchema = z.object({
  status: z.enum(['approved', 'rejected', 'suspended']),
  applicationNote: z.string().max(500).optional(),
  commissionRate: z.number().min(0).max(1).optional(),
});

export const platformSettingsSchema = z.object({
  commissionRate: z.number().min(0).max(1),
  vendorRegistrationOpen: z.boolean(),
  maintenanceMode: z.boolean(),
});

export const vendorSuspendSchema = z.object({
  isActive: z.boolean(),
});
