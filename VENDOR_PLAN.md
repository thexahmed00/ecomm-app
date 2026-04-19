# Vendor Management Feature Plan — ecomm-app

## Overview

The app currently has a user-side implementation and a basic single-admin panel. This plan introduces a full multi-vendor/marketplace system where vendors (sellers) can manage their product portfolio, view orders, and track earnings — while admins oversee the entire platform.

---

## Current State

| Area | Status |
|---|---|
| User auth (Firebase + MongoDB) | ✅ Done |
| Product catalog (browse, search, filter) | ✅ Done |
| Cart, checkout, orders | ✅ Done |
| Admin dashboard (products, orders, revenue chart) | ✅ Done |
| Vendor system | ❌ Not started |
| Multi-seller product ownership | ❌ Not started |
| Vendor storefront (public) | ❌ Not started |

---

## Tech Stack

| Concern | Tool |
|---|---|
| Framework | Next.js 16 App Router + React 19 + TypeScript |
| Database | MongoDB + Mongoose |
| Auth | Firebase JWT — `requireAuth()` / `requireAdmin()` in `authMiddleware.ts` |
| State | Zustand stores (`/src/store/`) |
| Images | Cloudinary — `ImageUploader.tsx` with `folder` prop |
| Cache | Upstash Redis — `CACHE_TTL` in `redis.ts` |
| Validation | Zod — `/src/lib/validations/index.ts` |
| Styling | Tailwind CSS dark-luxury theme (zinc + gold) |

---

## Phase 1 — Foundation (Must-Have)

### 1. Database Schema Changes

#### Modify `User.ts`
Expand the `role` field enum from `'user' | 'admin'` to:
```ts
role: 'user' | 'vendor' | 'admin'
```

#### Modify `Product.ts`
Add optional vendor ownership field:
```ts
vendor: { type: ObjectId, ref: 'User', default: null }
```
Existing admin-owned products keep `vendor: null` — no migration needed.

#### Modify `Order.ts`
Add two fields to the `items[]` sub-document:
```ts
vendor: { type: ObjectId, ref: 'User', default: null }
vendorEarning: { type: Number, default: 0 }  // price * qty * (1 - commissionRate)
```
`vendorEarning` is denormalized at order-creation time so earnings queries stay fast.

#### New Model — `VendorProfile.ts`

| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId (ref User) | Unique — one profile per user |
| `storeName` | string | Public store name |
| `storeSlug` | string (unique) | URL-safe, used in `/vendors/[storeSlug]` |
| `logo` | `{ url, publicId }` | Optional Cloudinary image |
| `banner` | `{ url, publicId }` | Optional Cloudinary image |
| `bio` | string | Store description |
| `socialLinks` | `{ instagram, twitter, website }` | Optional |
| `applicationStatus` | `'pending' \| 'approved' \| 'rejected' \| 'suspended'` | Admin-controlled |
| `applicationNote` | string | Admin note on decision |
| `commissionRate` | number | Per-vendor override (fallback to PlatformSettings) |
| `totalEarnings` | number | Running total (denormalized) |
| `pendingPayout` | number | Earnings not yet paid out |
| `isActive` | boolean | — |

**Indexes:** `{ user: 1 }` unique, `{ storeSlug: 1 }` unique, `{ applicationStatus: 1 }`

#### New Model — `PlatformSettings.ts`

Singleton document (one record, `key: 'global'`):

| Field | Type | Notes |
|---|---|---|
| `key` | `'global'` | Always this value |
| `commissionRate` | number | e.g. `0.10` = 10% |
| `vendorRegistrationOpen` | boolean | Gate vendor applications |
| `maintenanceMode` | boolean | — |

---

### 2. Auth Middleware & Route Protection

#### Modify `authMiddleware.ts`
Add `requireVendor()` — mirrors `requireAdmin()` exactly:
- Verifies Firebase JWT
- Queries MongoDB for user
- Allows `vendor` **and** `admin` roles (admins can access vendor routes for support)
- Returns `403` for plain users

#### Modify `middleware.ts`
Add `/vendor/:path*` to the `matcher` array alongside existing `/admin/:path*`.

#### Modify `/api/upload/route.ts`
Extend folder-access rules:
- `products` folder → vendor + admin allowed
- `vendors` folder → vendor + admin allowed
- `categories` folder → admin only (unchanged)

---

### 3. Types & State Management

#### Modify `types/index.ts`
- `MongoUser.role` → `'user' | 'vendor' | 'admin'`
- Add `VendorProfileSummary` type (public-safe fields, no earnings)
- Add `VendorApplicationStatus` type

#### Modify `authStore.ts`
Add `isVendor` derived flag alongside existing `isAdmin`:
```ts
isVendor: mongoUser?.role === 'vendor'
```

#### New Store — `vendorStore.ts`
```ts
profile: VendorProfileSummary | null
loading: boolean
fetchProfile(token): Promise<void>
updateProfile(data, token): Promise<void>
clearProfile(): void
```
No `persist` middleware — always freshly fetched. Initialized in vendor layout `useEffect`.

---

### 4. Validation Schemas

Add to `/src/lib/validations/index.ts`:

| Schema | Fields |
|---|---|
| `vendorApplicationSchema` | storeName, storeSlug (regex `/^[a-z0-9-]+$/`), bio (min 20 chars) |
| `vendorProfileSchema` | storeName, storeSlug, bio, socialLinks |
| `vendorReviewSchema` | status enum, applicationNote, commissionRate |
| `platformSettingsSchema` | commissionRate, vendorRegistrationOpen, maintenanceMode |

---

### 5. API Routes

#### Vendor — Application
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/vendor/apply` | `requireAuth` | Submit vendor application; creates `VendorProfile` with `status: 'pending'`; does NOT change role yet |

#### Vendor — Own Profile
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/vendor/profile` | `requireVendor` | Get own vendor profile |
| PATCH | `/api/vendor/profile` | `requireVendor` | Update storeName, bio, socialLinks, logo, banner; invalidates Redis cache |

#### Vendor — Products
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/vendor/products` | `requireVendor` | List own products (`product.vendor === user._id`) |
| POST | `/api/vendor/products` | `requireVendor` | Create product; auto-sets `vendor` field |
| PUT | `/api/vendor/products/[id]` | `requireVendor` | Update product (ownership check) |
| DELETE | `/api/vendor/products/[id]` | `requireVendor` | Delete product (ownership check) |

#### Vendor — Orders & Earnings
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/vendor/orders` | `requireVendor` | Orders containing vendor's products |
| GET | `/api/vendor/earnings` | `requireVendor` | Monthly earnings aggregation (matches `RevenueChart` data shape) |

#### Admin — Vendor Management
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/vendors` | `requireAdmin` | List all vendors, filterable by `applicationStatus` |
| GET | `/api/admin/vendors/[id]` | `requireAdmin` | Vendor detail + stats |
| PATCH | `/api/admin/vendors/[id]` | `requireAdmin` | Approve / reject / suspend. On approval → sets `user.role = 'vendor'`. On rejection/suspension → reverts to `'user'`, sets `isActive: false` |

#### Admin — Platform Settings
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/settings` | `requireAdmin` | Get platform settings |
| PATCH | `/api/admin/settings` | `requireAdmin` | Update commissionRate, toggles |

---

### 6. Component Changes

#### Modify `ProductForm.tsx`
Add two optional props (backward-compatible — existing admin usage unchanged):
```ts
backUrl?: string   // default: '/admin/products'
apiBase?: string   // default: '/api/products'
```
Vendor pages pass `apiBase="/api/vendor/products"` and `backUrl="/vendor/products"`.

#### New Component — `VendorSidebar.tsx`
Near-copy of `AdminSidebar.tsx` with vendor-specific nav links:

| Label | Route | Icon |
|---|---|---|
| Dashboard | `/vendor` | `LayoutDashboard` |
| Products | `/vendor/products` | `Package` |
| Orders | `/vendor/orders` | `ShoppingBag` |
| Earnings | `/vendor/earnings` | `TrendingUp` |
| My Store | `/vendor/store` | `Store` |

#### Modify `AdminSidebar.tsx`
Add two new nav items:

| Label | Route | Icon |
|---|---|---|
| Vendors | `/admin/vendors` | `Store` |
| Settings | `/admin/settings` | `Settings2` |

---

### 7. New Pages

#### Vendor Application Page
- **`/vendor/apply`** — Form (storeName, storeSlug, bio). Hits `POST /api/vendor/apply`. Shows pending confirmation after submit.

#### Vendor Dashboard
| Page | Route | Description |
|---|---|---|
| Layout | `/vendor/layout.tsx` | Guards with `isVendor \|\| isAdmin`; renders `VendorSidebar`; redirects pending/rejected to `/vendor/apply` |
| Dashboard | `/vendor` | KPI cards (revenue, orders, products, pending payout) + `RevenueChart` |
| Products | `/vendor/products` | Product list from `/api/vendor/products` |
| New Product | `/vendor/products/new` | `<ProductForm apiBase="/api/vendor/products" backUrl="/vendor/products" />` |
| Edit Product | `/vendor/products/[id]/edit` | Same server-component pattern as admin; verifies ownership |
| Orders | `/vendor/orders` | Vendor-scoped orders list; reuses `OrderStatusBadge` |
| Earnings | `/vendor/earnings` | totalEarnings, pendingPayout, monthly chart, breakdown table |
| My Store | `/vendor/store` | Edit storeName, bio, socialLinks; `ImageUploader` for logo + banner |

#### Admin Vendor Management Pages
| Page | Route | Description |
|---|---|---|
| Vendor List | `/admin/vendors` | Table of all vendors with status badges; filterable by status |
| Vendor Detail | `/admin/vendors/[id]` | Profile + stats + approve/reject/suspend buttons + commissionRate override |
| Settings | `/admin/settings` | Edit commissionRate, vendorRegistrationOpen toggle |

---

## Phase 2 — Revenue & Visibility (Should-Have)

### Public Vendor Storefront

#### New API Routes
| Method | Route | Cache TTL | Description |
|---|---|---|---|
| GET | `/api/vendors/[storeSlug]` | 600s | Public vendor profile (no earnings data) |
| GET | `/api/vendors/[storeSlug]/products` | 300s | Public product listing for vendor |

#### New Page — `/vendors/[storeSlug]`
Server component with ISR (`revalidate = 300`). Shows:
- Store banner + logo
- Store name, bio, social links
- Product grid using existing `ProductCard` component

### Order Creation Enrichment

**Modify `/api/orders/route.ts`:**
1. For each cart item, batch-lookup `product.vendor` via `Promise.all`
2. Fetch `commissionRate` from `PlatformSettings` (or Redis-cached copy)
3. Set `item.vendor` and `item.vendorEarning = price * qty * (1 - commissionRate)`
4. After order save, bulk-update each vendor's `totalEarnings` and `pendingPayout`:
```ts
VendorProfile.bulkWrite(
  vendorEarningsMap.map(([vendorId, earning]) => ({
    updateOne: {
      filter: { user: vendorId },
      update: { $inc: { totalEarnings: earning, pendingPayout: earning } }
    }
  }))
)
```

### Redis Cache Updates

Add to `CACHE_TTL` in `redis.ts`:
```ts
VENDOR_PROFILE: 600    // 10 min
VENDOR_PRODUCTS: 300   // 5 min
VENDOR_EARNINGS: 120   // 2 min
```

Cache key conventions:
- `vendor:profile:{storeSlug}`
- `vendor:products:{storeSlug}:{page}:{sort}`

---

## Phase 3 — Polish (Nice-to-Have)

- [ ] Payout management — admin marks `pendingPayout` as paid
- [ ] Vendor product approval workflow — admin approves new products before they go live
- [ ] Vendor-specific revenue breakdown in admin analytics dashboard
- [ ] Email notifications on vendor application status change
- [ ] Vendor registration open/close toggle enforced in `/api/vendor/apply`
- [ ] Vendor analytics — views per product, conversion rate

---

## Implementation Sequence

> Follow this order to minimise rework — each step unblocks the next.

1. **Types** — `types/index.ts` + `authStore.ts` (`isVendor` flag)
2. **Models** — new `VendorProfile.ts`, `PlatformSettings.ts`; modify `User.ts`, `Product.ts`, `Order.ts`
3. **Middleware** — `requireVendor()` in `authMiddleware.ts` → `middleware.ts` matcher → upload route folder permissions
4. **Validations** — vendor + settings Zod schemas in `validations/index.ts`
5. **Admin vendor APIs** — approval endpoints first (no vendor role without admin approval)
6. **Vendor APIs** — apply → profile → products → orders → earnings
7. **Public APIs** — `/api/vendors/[storeSlug]` + products
8. **State** — `vendorStore.ts`
9. **Components** — `VendorSidebar.tsx`; `ProductForm` props; `AdminSidebar` additions
10. **Pages** — admin vendor pages → vendor dashboard → public storefront
11. **Order enrichment** — last (all models + APIs must be in place)

---

## Critical Files Reference

| File | Change Type | Description |
|---|---|---|
| `/src/models/User.ts` | Modify | Add `vendor` to role enum |
| `/src/models/Product.ts` | Modify | Add `vendor` field |
| `/src/models/Order.ts` | Modify | Add `vendor` + `vendorEarning` to items |
| `/src/models/VendorProfile.ts` | **New** | Vendor store profile model |
| `/src/models/PlatformSettings.ts` | **New** | Platform-wide settings singleton |
| `/src/lib/authMiddleware.ts` | Modify | Add `requireVendor()` |
| `/src/middleware.ts` | Modify | Add `/vendor/:path*` to matcher |
| `/src/app/api/upload/route.ts` | Modify | Allow vendor uploads to `products`/`vendors` folders |
| `/src/lib/validations/index.ts` | Modify | Add vendor + settings Zod schemas |
| `/src/lib/redis.ts` | Modify | Add vendor cache TTL constants |
| `/src/types/index.ts` | Modify | Expand role union; add `VendorProfileSummary` type |
| `/src/store/authStore.ts` | Modify | Add `isVendor` derived flag |
| `/src/store/vendorStore.ts` | **New** | Vendor state management |
| `/src/components/admin/ProductForm.tsx` | Modify | Add `backUrl` + `apiBase` optional props |
| `/src/components/VendorSidebar.tsx` | **New** | Vendor dashboard navigation |
| `/src/components/AdminSidebar.tsx` | Modify | Add Vendors + Settings nav items |
| `/src/app/api/orders/route.ts` | Modify | Enrich order items with vendor + commission |

---

## Auth Boundary Summary

| Role | Can Access |
|---|---|
| `user` | `/account/*`, `/shop/*`, `/cart`, `/checkout/*`, `/wishlist` |
| `vendor` | All user routes + `/vendor/*` dashboard |
| `admin` | All user routes + `/vendor/*` + `/admin/*` |
