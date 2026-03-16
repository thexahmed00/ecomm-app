# System Architecture

## Overview
This application follows a serverless architecture using Next.js 14 App Router. It leverages Edge Middleware for security, Serverless Functions for API logic, and Client Components for interactive UI.

## Directory Structure
- `src/app`: App Router pages and API routes.
- `src/components`: Reusable UI components (Atomic design principles).
- `src/lib`: Utility functions, database connections, third-party clients.
- `src/models`: Mongoose schemas for MongoDB.
- `src/store`: Global state management using Zustand (Cart, User, UI).
- `src/hooks`: Custom React hooks (useAuth, useDebounce).

## Data Flow
1. **Client**: User interacts with UI (e.g., Add to Cart).
2. **State**: Zustand updates local state optimistically.
3. **API**: Request sent to Next.js API Route (e.g., `POST /api/cart`).
4. **Middleware**: `src/middleware.ts` verifies authentication via Firebase JWT.
5. **Controller**: API Route validates input (Zod), connects to DB.
6. **Database**: MongoDB stores persistent data.
7. **Cache**: Redis caches frequent reads (Product lists, Cart).
8. **Response**: JSON response returned to client.

## Authentication
- **Firebase Auth**: Handles identity (Google, Email).
- **Custom Claims**: 'admin' claim used for RBAC.
- **Session**: JWT tokens passed via Authorization header or Cookies.
- **Sync**: `useAuth` hook syncs Firebase user with MongoDB user record.

## Caching Strategy
- **Static Content**: Images served via Cloudinary CDN.
- **Product List**: Cached in Redis for 5 minutes (ISR-like behavior in API).
- **Single Product**: Cached in Redis for 10 minutes.
- **Cart**: Cached in Redis for 2 minutes to reduce DB load during shopping sessions.
- **Revalidation**: Admin actions (Create/Update Product) invalidate relevant Redis keys.

## Payment Flow
1. User proceeds to checkout.
2. `create-payment-intent` API called.
3. Stripe returns `client_secret`.
4. Stripe Elements UI collects card details securely.
5. Webhook (`/api/payments/webhook`) listens for `payment_intent.succeeded`.
6. Webhook updates Order status in MongoDB and clears Cart.
