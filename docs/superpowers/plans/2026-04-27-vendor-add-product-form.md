# Vendor Add Product Form — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a vendor-facing Add Product form using TanStack Form + Zod, with dependent category dropdowns, async SKU validation, and Cloudinary image upload.

**Architecture:** Extend the Product model and Zod schema with `brand`, `currency`, and `availabilityStatus` fields first. Then build the form page at `src/app/vendor/products/new/page.tsx` that submits to the existing `POST /api/vendor/products` endpoint. No new API routes needed.

**Tech Stack:** Next.js 14 App Router, TanStack Form (`@tanstack/react-form`), `@tanstack/zod-form-adapter`, Zod v4, Mongoose, Tailwind CSS, existing `ImageUploader` component, existing `useAuthStore` (Zustand).

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/models/Product.ts` | Modify | Add `brand`, `currency`, `availabilityStatus` to schema + interface |
| `src/lib/validations/index.ts` | Modify | Extend `productSchema` with new fields |
| `src/app/vendor/products/new/page.tsx` | Create | Full form page with TanStack Form |
| `package.json` | Modify | Add `@tanstack/react-form`, `@tanstack/zod-form-adapter` |

---

## Task 1: Install TanStack Form packages

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install packages**

```bash
npm install @tanstack/react-form @tanstack/zod-form-adapter
```

Expected output: packages added, no peer dep errors.

- [ ] **Step 2: Verify installation**

```bash
node -e "require('@tanstack/react-form'); console.log('ok')"
```

Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add tanstack form and zod adapter"
```

---

## Task 2: Extend Product model with brand, currency, availabilityStatus

**Files:**
- Modify: `src/models/Product.ts`

- [ ] **Step 1: Update the `IProduct` interface**

In `src/models/Product.ts`, add three fields to the `IProduct` interface after `isActive`:

```ts
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
  brand?: string;
  currency: string;
  availabilityStatus: 'in_stock' | 'out_of_stock' | 'preorder';
  reviews: mongoose.Types.ObjectId[];
  avgRating: number;
  numReviews: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

- [ ] **Step 2: Update the Mongoose schema**

In `ProductSchema`, add the three fields after the `sku` field:

```ts
sku: { type: String, required: true, unique: true },
brand: { type: String },
currency: { type: String, default: 'INR', required: true },
availabilityStatus: {
  type: String,
  enum: ['in_stock', 'out_of_stock', 'preorder'],
  default: 'in_stock',
  required: true,
},
```

- [ ] **Step 3: Run TypeScript check**

```bash
npm run typecheck
```

Expected: no errors related to Product model.

- [ ] **Step 4: Commit**

```bash
git add src/models/Product.ts
git commit -m "feat: add brand, currency, availabilityStatus to Product model"
```

---

## Task 3: Extend productSchema Zod validation

**Files:**
- Modify: `src/lib/validations/index.ts`

- [ ] **Step 1: Add fields to productSchema**

In `src/lib/validations/index.ts`, extend `productSchema` by adding three fields after `sku`:

```ts
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
  brand: z.string().optional(),
  currency: z.string().default('INR'),
  availabilityStatus: z.enum(['in_stock', 'out_of_stock', 'preorder']).default('in_stock'),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});
```

- [ ] **Step 2: Run TypeScript check**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/validations/index.ts
git commit -m "feat: extend productSchema with brand, currency, availabilityStatus"
```

---

## Task 4: Create vendor Add Product page

**Files:**
- Create: `src/app/vendor/products/new/page.tsx`

- [ ] **Step 1: Create the file with auth guard and form skeleton**

Create `src/app/vendor/products/new/page.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import ImageUploader from '@/components/ImageUploader';
import type { CloudinaryImage } from '@/types';
import { z } from 'zod';

type Category = {
  _id: string;
  name: string;
  slug: string;
  parentCategory?: string | null;
};

const vendorProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  shortDescription: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number({ invalid_type_error: 'Price is required' }).min(0, 'Price must be positive'),
  comparePrice: z.number().optional(),
  currency: z.string().default('INR'),
  sku: z.string().min(1, 'SKU is required'),
  stock: z.number({ invalid_type_error: 'Stock is required' }).int().min(0),
  availabilityStatus: z.enum(['in_stock', 'out_of_stock', 'preorder']).default('in_stock'),
  brand: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  images: z
    .array(z.object({ url: z.string().url(), publicId: z.string(), alt: z.string().optional() }))
    .min(1, 'At least one image is required'),
});

type VendorProductFormValues = z.infer<typeof vendorProductSchema>;

export default function AddProductPage() {
  const { mongoUser, firebaseUser } = useAuthStore();
  const { addToast } = useUIStore();
  const router = useRouter();

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [categoriesError, setCategoriesError] = useState(false);
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [skuError, setSkuError] = useState<string | null>(null);

  useEffect(() => {
    if (!mongoUser) return;
    if (mongoUser.role !== 'vendor') {
      router.push('/vendor/dashboard');
    }
  }, [mongoUser, router]);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data: Category[]) => {
        setAllCategories(data);
        setParentCategories(data.filter((c) => !c.parentCategory));
      })
      .catch(() => setCategoriesError(true));
  }, []);

  const form = useForm<VendorProductFormValues>({
    defaultValues: {
      name: '',
      shortDescription: '',
      description: '',
      price: 0,
      comparePrice: undefined,
      currency: 'INR',
      sku: '',
      stock: 0,
      availabilityStatus: 'in_stock',
      brand: '',
      category: '',
      subcategory: '',
      images: [],
    },
    validatorAdapter: zodValidator(),
    onSubmit: async ({ value }) => {
      const token = await firebaseUser?.getIdToken();
      if (!token) return;

      const finalCategory = value.subcategory || value.category;
      const payload = {
        name: value.name,
        shortDescription: value.shortDescription,
        description: value.description,
        price: value.price,
        comparePrice: value.comparePrice,
        currency: value.currency,
        sku: value.sku,
        stock: value.stock,
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
        addToast({ type: 'success', message: 'Product created successfully' });
        router.push('/vendor/dashboard');
      } else if (res.status === 400) {
        const data = await res.json();
        addToast({ type: 'error', message: data.error?.formErrors?.[0] ?? 'Validation error' });
      } else {
        addToast({ type: 'error', message: 'Something went wrong. Please try again.' });
      }
    },
  });

  const handleCategoryChange = (parentId: string) => {
    const children = allCategories.filter(
      (c) => c.parentCategory && String(c.parentCategory) === parentId
    );
    setSubcategories(children);
    form.setFieldValue('subcategory', '');
  };

  const handleSkuBlur = async (sku: string) => {
    if (!sku) return;
    const token = await firebaseUser?.getIdToken();
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

  return (
    <div className="min-h-screen bg-[#fcf9f3] py-12 px-4 sm:px-8">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs tracking-[0.28em] uppercase text-[#7f7663]">Vendor</p>
        <h1 className="mt-2 text-3xl font-playfair text-[#1c1c18] mb-8">Add New Product</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.setFieldValue('images', images.map((img) => ({
              url: img.url,
              publicId: img.publicId ?? '',
              alt: img.alt,
            })));
            form.handleSubmit();
          }}
          className="space-y-10"
        >
          {/* Section 1: Basic Info */}
          <div className="space-y-6">
            <p className="text-xs tracking-[0.24em] uppercase text-[#7f7663] border-b border-[#d0c5af] pb-2">Basic Info</p>

            <form.Field
              name="name"
              validators={{ onBlur: vendorProductSchema.shape.name }}
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

            <form.Field
              name="shortDescription"
              validators={{ onBlur: vendorProductSchema.shape.shortDescription }}
            >
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
              validators={{ onBlur: vendorProductSchema.shape.description }}
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
            <p className="text-xs tracking-[0.24em] uppercase text-[#7f7663] border-b border-[#d0c5af] pb-2">Pricing</p>

            <div className="grid grid-cols-2 gap-6">
              <form.Field
                name="price"
                validators={{ onBlur: vendorProductSchema.shape.price }}
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
                      onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
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
                    onChange={(e) => field.handleChange(e.target.value)}
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
            <p className="text-xs tracking-[0.24em] uppercase text-[#7f7663] border-b border-[#d0c5af] pb-2">Inventory</p>

            <div className="grid grid-cols-2 gap-6">
              <form.Field
                name="sku"
                validators={{ onBlur: vendorProductSchema.shape.sku }}
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
                validators={{ onBlur: vendorProductSchema.shape.stock }}
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
                      onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)}
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
            <p className="text-xs tracking-[0.24em] uppercase text-[#7f7663] border-b border-[#d0c5af] pb-2">Category</p>

            {categoriesError && (
              <p className={errorClass}>Failed to load categories. Please refresh.</p>
            )}

            <form.Field
              name="category"
              validators={{ onBlur: vendorProductSchema.shape.category }}
            >
              {(field) => (
                <div>
                  <label className={labelClass}>Category</label>
                  <select
                    className={inputClass}
                    value={field.state.value}
                    disabled={categoriesError}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      handleCategoryChange(e.target.value);
                    }}
                  >
                    <option value="">Select category</option>
                    {parentCategories.map((c) => (
                      <option key={c._id} value={c._id}>
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
                        <option key={c._id} value={c._id}>
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
```

- [ ] **Step 2: Run TypeScript check**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Verify dev server starts**

```bash
npm run dev
```

Open `http://localhost:3000/vendor/products/new` in browser. Confirm:
- Redirects to dashboard if not vendor
- Form renders all 5 sections
- Category dropdown populates from API
- Selecting category populates subcategory dropdown (if subcategories exist)
- SKU field shows error on blur if SKU already taken
- Images section accepts upload
- Submit button disabled while submitting

- [ ] **Step 4: Commit**

```bash
git add src/app/vendor/products/new/page.tsx
git commit -m "feat: add vendor add-product form with TanStack Form"
```

---

## Task 5: Add navigation link to vendor dashboard

**Files:**
- Modify: `src/app/vendor/dashboard/page.tsx`

- [ ] **Step 1: Find and add Add Product button**

Open `src/app/vendor/dashboard/page.tsx`. Find the section with the vendor's product list or header area. Add a link to the new page:

```tsx
import Link from 'next/link';

// Inside the JSX, near the dashboard header or products section:
<Link
  href="/vendor/products/new"
  className="inline-block bg-[#d4af37] text-[#1c1c18] py-3 px-6 text-xs tracking-[0.24em] uppercase hover:bg-[#c29a30] transition-colors"
>
  Add Product
</Link>
```

- [ ] **Step 2: Verify in browser**

Navigate to `http://localhost:3000/vendor/dashboard`. Confirm "Add Product" link is visible and routes to `/vendor/products/new`.

- [ ] **Step 3: Commit**

```bash
git add src/app/vendor/dashboard/page.tsx
git commit -m "feat: add 'Add Product' link to vendor dashboard"
```

---

## Self-Review Checklist

- [x] Task 1 installs packages before they're used in Task 4
- [x] `vendorProductSchema` in page matches all fields submitted in `onSubmit`
- [x] `images` state synced into form values on submit via `form.setFieldValue`
- [x] `subcategory` overrides `category` as `finalCategory` in payload — matches spec data flow
- [x] SKU async check uses `GET /api/vendor/products` — matches spec
- [x] Categories fetch failure shows error + disables dropdown — matches error handling spec
- [x] `addToast` maps all three API response scenarios (201, 400, 500) — matches spec
- [x] Auth guard redirects non-vendors — matches spec
- [x] `availabilityStatus` default `'in_stock'` set in both Zod schema and form `defaultValues`
- [x] `currency` default `'INR'` set in both Zod schema and form `defaultValues`
- [x] `brand` optional in both model and schema
