# Architectural Decisions Log

## 1. Authentication: Firebase + MongoDB
**Decision:** Use Firebase for Identity Provider (IdP) but store user profiles in MongoDB.
**Reason:** Firebase handles complex auth flows (OAuth, password reset, security) securely. MongoDB allows relational-like data modeling (Orders linked to Users) and custom profile fields (addresses, role).
**Trade-off:** Need to sync Firebase user creation with MongoDB (handled via `useAuth` hook and `/api/auth/sync` endpoint).

## 2. Caching: Upstash Redis
**Decision:** Use Redis for caching API responses (Products, Cart) instead of just `next/cache`.
**Reason:** Next.js Data Cache is persistent and sometimes hard to invalidate granularly in serverless environments. Redis provides explicit control over TTL and invalidation keys (e.g., clearing `products:list` when a new product is added).
**Trade-off:** Adds an external infrastructure dependency.

## 3. State Management: Zustand
**Decision:** Use Zustand over Redux or Context API.
**Reason:** Redux is too boilerplate-heavy. Context API causes unnecessary re-renders. Zustand is lightweight, supports async actions natively (great for cart operations), and works well with React hooks.

## 4. Styling: Tailwind CSS
**Decision:** Use Tailwind CSS for styling.
**Reason:** Rapid development, co-location of styles with markup, small bundle size (purge unused CSS).
**Theme:** Custom `zinc` and `gold` color palette for "Dark Luxury" aesthetic.

## 5. Payments: Stripe Elements
**Decision:** Use Stripe Payment Intents and Elements.
**Reason:** SAQ A compliance (card data never touches our server). Dynamic 3D Secure handling.
**Flow:** Create Intent -> Client confirms payment -> Webhook fulfills order.

## 6. Image Optimization: Cloudinary
**Decision:** Use Cloudinary for image hosting and `next-cloudinary` for rendering.
**Reason:** Automatic format selection (WebP/AVIF), resizing, and CDNs. Offloads bandwidth from Vercel.
