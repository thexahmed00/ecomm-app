import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (serviceAccountKey) {
      const serviceAccount = JSON.parse(serviceAccountKey);
      
      // Fix private key formatting if it has literal '\n' instead of actual newlines
      if (serviceAccount.private_key) {
        let key = serviceAccount.private_key.replace(/\\n/g, '\n');
        if (!key.startsWith('-----BEGIN PRIVATE KEY-----')) {
          // If it's a raw base64 string, wrap it and add newlines every 64 chars
          const matched = key.match(/.{1,64}/g);
          if (matched) {
            key = `-----BEGIN PRIVATE KEY-----\n${matched.join('\n')}\n-----END PRIVATE KEY-----\n`;
          }
        }
        serviceAccount.private_key = key;
      }
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      admin.initializeApp();
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

// In Next.js build time, admin.auth() might fail if not initialized properly
const adminAuth: admin.auth.Auth | null = admin.apps.length ? admin.auth() : null;
const adminApp: admin.app.App | null = admin.apps.length ? admin.app() : null;

export { adminAuth, adminApp };
