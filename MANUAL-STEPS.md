# Manual Setup Steps

1. **Firebase Configuration**
   - Create a Firebase project.
   - Enable Authentication (Google, Email/Password).
   - Generate a new Service Account Private Key from Project Settings > Service Accounts.
   - Set `FIREBASE_SERVICE_ACCOUNT_KEY` env var (stringified JSON).

2. **MongoDB Atlas**
   - Create a free cluster.
   - Whitelist your IP (or 0.0.0.0/0).
   - Create a database user.
   - Copy connection string to `MONGODB_URI`.

3. **Stripe**
   - Create a Stripe account.
   - Get Test Mode API keys (`pk_test_...`, `sk_test_...`).
   - Create a webhook endpoint for `http://localhost:3000/api/payments/webhook`.
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`.
   - Copy signing secret to `STRIPE_WEBHOOK_SECRET`.

4. **Cloudinary**
   - Create an account.
   - Get Cloud Name, API Key, API Secret.
   - Create an unsigned upload preset named `ecomm_preset` (or use signed uploads with API signature, current implementation uses signed/server-side upload via API route which is safer).

5. **Upstash Redis**
   - Create a Redis database.
   - Get REST URL and Token.

6. **Admin Access**
   - Sign up via the app.
   - Manually set the `role` field to `admin` in your MongoDB `users` collection for your user document.
   - Alternatively, use a script to set custom claims on Firebase user (though our middleware checks MongoDB role or custom claim).

7. **Initial Data**
   - Run `npm run seed` to populate categories and products.
