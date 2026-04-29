'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import ImageUploader from '@/components/ImageUploader';
import type { CloudinaryImage } from '@/types';
import { z } from 'zod';
import { PARENT_CATEGORIES, getSubcategories, type CategoryItem } from '@/lib/categories';

const vendorProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  shortDescription: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number({ error: 'Price is required' }).min(0, 'Price must be positive'),
  comparePrice: z.number().optional(),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).default('INR'),
  sku: z.string().min(1, 'SKU is required'),
  stock: z.number({ error: 'Stock is required' }).int().min(0),
  availabilityStatus: z.enum(['in_stock', 'out_of_stock', 'preorder']).default('in_stock'),
  brand: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  images: z
    .array(z.object({ url: z.string().url(), publicId: z.string(), alt: z.string().optional() }))
    .min(1, 'At least one image is required'),
});

export default function AddProductPage() {
  const { mongoUser, firebaseUser, loading } = useAuthStore();
  const { addToast } = useUIStore();
  const router = useRouter();

  const [subcategories, setSubcategories] = useState<CategoryItem[]>([]);
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [skuError, setSkuError] = useState<string | null>(null);

  useEffect(() => {
    if (!mongoUser) return;
    if (mongoUser.role !== 'vendor') {
      router.push('/');
    }
  }, [mongoUser, router]);

  const form = useForm({
    defaultValues: {
      name: '',
      shortDescription: '',
      description: '',
      price: '' as unknown as number,
      comparePrice: undefined as number | undefined,
      currency: 'INR' as 'INR' | 'USD' | 'EUR' | 'GBP',
      sku: '',
      stock: '' as unknown as number,
      availabilityStatus: 'in_stock' as 'in_stock' | 'out_of_stock' | 'preorder',
      brand: '',
      category: '',
      subcategory: '',
      images: [] as { url: string; publicId: string; alt?: string }[],
    },
    onSubmit: async ({ value }) => {
      const token = await firebaseUser?.getIdToken();
      if (!token) {
        addToast('Your session has expired. Please sign in again.', 'error');
        return;
      }

      const finalCategory = value.subcategory || value.category;
      const payload = {
        name: value.name,
        shortDescription: value.shortDescription,
        description: value.description,
        price: Number(value.price),
        comparePrice: value.comparePrice !== undefined ? Number(value.comparePrice) : undefined,
        currency: value.currency,
        sku: value.sku,
        stock: Number(value.stock),
        availabilityStatus: value.availabilityStatus,
        brand: value.brand,
        category: finalCategory,
        images: images.map((img) => ({ url: img.url, publicId: img.publicId ?? '', alt: img.alt })),
      };

      const res = await fetch('/api/vendor/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        addToast('Product created successfully', 'success');
        router.push('/vendor/dashboard');
      } else if (res.status === 400) {
        const data = await res.json();
        const fieldErrors: Record<string, string[]> = data.error?.fieldErrors ?? {};
        const firstFieldError = Object.values(fieldErrors)[0]?.[0];
        addToast(firstFieldError ?? data.error?.formErrors?.[0] ?? 'Validation error', 'error');
      } else {
        addToast('Something went wrong. Please try again.', 'error');
      }
    },
  });

  const handleCategoryChange = (parentSlug: string) => {
    setSubcategories(getSubcategories(parentSlug));
    form.setFieldValue('subcategory', '');
  };

  const handleSkuBlur = async (sku: string) => {
    if (!sku) return;
    const token = await firebaseUser?.getIdToken();
    if (!token) return;
    const res = await fetch('/api/vendor/products', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    const taken = data.products?.some((p: { sku: string }) => p.sku === sku);
    setSkuError(taken ? 'SKU already in use' : null);
  };

  const inputClass =
    'w-full bg-transparent border-b border-[#d0c5af] py-3 px-1 text-sm text-[#1c1c18] focus:outline-none focus:border-[#d4af37]';
  const labelClass = 'block text-xs tracking-[0.24em] uppercase text-[#7f7663] mb-2';
  const errorClass = 'text-xs text-red-500 mt-1';

  if (loading || !mongoUser) return null;

  return (
    <div className="min-h-screen bg-[#fcf9f3] py-12 px-4 sm:px-8">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs tracking-[0.28em] uppercase text-[#7f7663]">Vendor</p>
        <h1 className="mt-2 text-3xl font-playfair text-[#1c1c18] mb-8">Add New Product</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-10"
        >
          {/* Section 1: Basic Info */}
          <div className="space-y-6">
            <p className="text-sm font-bold tracking-[0.24em] uppercase text-[#7f7663]  pb-2">Basic Info</p>

            <form.Field
              name="name"
              validators={{ onBlur: ({ value }) => { const r = vendorProductSchema.shape.name.safeParse(value); return r.success ? undefined : r.error.issues[0].message; } }}
            >
              {(field) => (
                <div>
                  <label className={labelClass}>Product Name</label>
                  <input
                    className={inputClass}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. Handcrafted Linen Tote"
                  />
                  {field.state.meta.errors[0] && (
                    <p className={errorClass}>{String(field.state.meta.errors[0])}</p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="shortDescription">
              {(field) => (
                <div>
                  <label className={labelClass}>Short Description (optional)</label>
                  <input
                    className={inputClass}
                    value={field.state.value ?? ''}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="One-line summary shown in product cards"
                  />
                </div>
              )}
            </form.Field>

            <form.Field
              name="description"
              validators={{ onBlur: ({ value }) => { const r = vendorProductSchema.shape.description.safeParse(value); return r.success ? undefined : r.error.issues[0].message; } }}
            >
              {(field) => (
                <div>
                  <label className={labelClass}>Full Description</label>
                  <textarea
                    rows={4}
                    className={`${inputClass} resize-none`}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Detailed product description..."
                  />
                  {field.state.meta.errors[0] && (
                    <p className={errorClass}>{String(field.state.meta.errors[0])}</p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          {/* Section 2: Pricing */}
          <div className="space-y-6">
            <p className="text-sm font-bold tracking-[0.24em] uppercase text-[#7f7663]  pb-2">Pricing</p>

            <div className="grid grid-cols-2 gap-6">
              <form.Field
                name="price"
                validators={{ onBlur: ({ value }) => { const r = vendorProductSchema.shape.price.safeParse(value); return r.success ? undefined : r.error.issues[0].message; } }}
              >
                {(field) => (
                  <div>
                    <label className={labelClass}>Price</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className={inputClass}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value === '' ? ('' as unknown as number) : parseFloat(e.target.value))}
                    />
                    {field.state.meta.errors[0] && (
                      <p className={errorClass}>{String(field.state.meta.errors[0])}</p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field name="comparePrice">
                {(field) => (
                  <div>
                    <label className={labelClass}>Discount Price (optional)</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className={inputClass}
                      value={field.state.value ?? ''}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(e.target.value ? parseFloat(e.target.value) : undefined)
                      }
                    />
                  </div>
                )}
              </form.Field>
            </div>

            <form.Field name="currency">
              {(field) => (
                <div>
                  <label className={labelClass}>Currency</label>
                  <select
                    className={inputClass}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value as 'INR' | 'USD' | 'EUR' | 'GBP')}
                  >
                    <option value="INR">INR — Indian Rupee</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="GBP">GBP — British Pound</option>
                  </select>
                </div>
              )}
            </form.Field>
          </div>

          {/* Section 3: Inventory */}
          <div className="space-y-6">
            <p className="text-sm font-bold tracking-[0.24em] uppercase text-[#7f7663]  pb-2">Inventory</p>

            <div className="grid grid-cols-2 gap-6">
              <form.Field
                name="sku"
                validators={{ onBlur: ({ value }) => { const r = vendorProductSchema.shape.sku.safeParse(value); return r.success ? undefined : r.error.issues[0].message; } }}
              >
                {(field) => (
                  <div>
                    <label className={labelClass}>SKU</label>
                    <input
                      className={inputClass}
                      value={field.state.value}
                      onBlur={(e) => {
                        field.handleBlur();
                        handleSkuBlur(e.target.value);
                      }}
                      onChange={(e) => {
                        field.handleChange(e.target.value);
                        setSkuError(null);
                      }}
                      placeholder="e.g. TOTE-LIN-001"
                    />
                    {field.state.meta.errors[0] && (
                      <p className={errorClass}>{String(field.state.meta.errors[0])}</p>
                    )}
                    {skuError && <p className={errorClass}>{skuError}</p>}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="stock"
                validators={{ onBlur: ({ value }) => { const r = vendorProductSchema.shape.stock.safeParse(value); return r.success ? undefined : r.error.issues[0].message; } }}
              >
                {(field) => (
                  <div>
                    <label className={labelClass}>Stock Quantity</label>
                    <input
                      type="number"
                      min={0}
                      className={inputClass}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value === '' ? ('' as unknown as number) : parseInt(e.target.value))}
                    />
                    {field.state.meta.errors[0] && (
                      <p className={errorClass}>{String(field.state.meta.errors[0])}</p>
                    )}
                  </div>
                )}
              </form.Field>
            </div>

            <form.Field name="availabilityStatus">
              {(field) => (
                <div>
                  <label className={labelClass}>Availability Status</label>
                  <select
                    className={inputClass}
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(e.target.value as 'in_stock' | 'out_of_stock' | 'preorder')
                    }
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="preorder">Preorder</option>
                  </select>
                </div>
              )}
            </form.Field>

            <form.Field name="brand">
              {(field) => (
                <div>
                  <label className={labelClass}>Brand (optional)</label>
                  <input
                    className={inputClass}
                    value={field.state.value ?? ''}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. Artisana"
                  />
                </div>
              )}
            </form.Field>
          </div>

          {/* Section 4: Category */}
          <div className="space-y-6">
            <p className="text-sm font-bold tracking-[0.24em] uppercase text-[#7f7663] pb-2">Category</p>

            <form.Field
              name="category"
              validators={{ onBlur: ({ value }) => { const r = vendorProductSchema.shape.category.safeParse(value); return r.success ? undefined : r.error.issues[0].message; } }}
            >
              {(field) => (
                <div>
                  <label className={labelClass}>Category</label>
                  <select
                    className={inputClass}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      handleCategoryChange(e.target.value);
                    }}
                  >
                    <option value="">Select category</option>
                    {PARENT_CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {field.state.meta.errors[0] && (
                    <p className={errorClass}>{String(field.state.meta.errors[0])}</p>
                  )}
                </div>
              )}
            </form.Field>

            {subcategories.length > 0 && (
              <form.Field name="subcategory">
                {(field) => (
                  <div>
                    <label className={labelClass}>Subcategory</label>
                    <select
                      className={inputClass}
                      value={field.state.value ?? ''}
                      onChange={(e) => field.handleChange(e.target.value)}
                    >
                      <option value="">None</option>
                      {subcategories.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </form.Field>
            )}
          </div>

          {/* Section 5: Images */}
          <div className="space-y-4">
            <p className="text-xs tracking-[0.24em] uppercase text-[#7f7663] border-b border-[#d0c5af] pb-2">Images</p>
            <ImageUploader images={images} onChange={setImages} maxImages={6} folder="products" />
            {images.length === 0 && form.state.submissionAttempts > 0 && (
              <p className={errorClass}>At least one image is required</p>
            )}
          </div>

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <button
                type="submit"
                disabled={isSubmitting || !!skuError}
                className="w-full bg-[#d4af37] text-[#1c1c18] py-4 text-xs tracking-[0.24em] uppercase hover:bg-[#c29a30] disabled:opacity-60 transition-colors"
              >
                {isSubmitting ? 'Creating...' : 'Create Product'}
              </button>
            )}
          </form.Subscribe>
        </form>
      </div>
    </div>
  );
}
