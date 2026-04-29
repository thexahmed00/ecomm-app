'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function Page() {
  const { firebaseUser, mongoUser } = useAuthStore();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [bio, setBio] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mongoUser?.role === 'vendor') {
      router.push('/vendor/dashboard');
    } else if (firebaseUser || mongoUser) {
      router.push('/');
    }
  }, [firebaseUser, mongoUser, router]);

  const handleStoreNameChange = (val: string) => {
    setStoreName(val);
    setStoreSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });

      const token = await auth.currentUser?.getIdToken();
      if (token) {
        const secure = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `firebaseToken=${token}; path=/vendor/dashboard; max-age=3600; SameSite=Lax${secure}`;
      }

      // Sync Firebase user to MongoDB first — vendor registration depends on this
      const syncRes = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!syncRes.ok) throw new Error('Failed to sync account. Please try again.');

      // Create vendor profile
      const vendorRes = await fetch('/api/vendor/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ storeName, storeSlug, bio }),
      });
      if (!vendorRes.ok) {
        const data = await vendorRes.json();
        throw new Error(data.error || 'Failed to create vendor profile.');
      }

      router.push('/vendor/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create account';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fcf9f3]">
      <div className="hidden md:flex md:w-1/2 relative flex-col justify-center items-center p-12 overflow-hidden border-r border-[#d0c5af] bg-[#ffffff]">
        <div className="relative z-10 text-center">
          <p className="text-xs tracking-[0.28em] uppercase text-[#7f7663]">Maison</p>
          <h1 className="mt-6 text-5xl font-playfair text-[#1c1c18] tracking-[0.18em] uppercase">Maison</h1>
          <p className="mt-4 text-sm text-[#4d4635] max-w-sm">
            Join the list for early access to launches and private drops.
          </p>
        </div>
      </div>
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <p className="text-xs tracking-[0.28em] uppercase text-[#7f7663]">Become a Seller</p>
          <h2 className="mt-4 text-3xl font-playfair text-[#1c1c18] mb-2">Create a Seller Account</h2>
          <p className="text-sm text-[#4d4635] mb-10">Sign up and set up your store.</p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs tracking-[0.24em] uppercase text-[#7f7663] mb-2">Full Name</label>
              <input
                type="text"
                required
                className="w-full bg-transparent border-b border-[#d0c5af] py-3 px-1 text-sm text-[#1c1c18] focus:outline-none focus:border-[#d4af37]"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                suppressHydrationWarning
              />
            </div>
            <div>
              <label className="block text-xs tracking-[0.24em] uppercase text-[#7f7663] mb-2">Email</label>
              <input
                type="email"
                required
                className="w-full bg-transparent border-b border-[#d0c5af] py-3 px-1 text-sm text-[#1c1c18] focus:outline-none focus:border-[#d4af37]"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                suppressHydrationWarning
              />
            </div>
            <div>
              <label className="block text-xs tracking-[0.24em] uppercase text-[#7f7663] mb-2">Password</label>
              <input
                type="password"
                required
                className="w-full bg-transparent border-b border-[#d0c5af] py-3 px-1 text-sm text-[#1c1c18] focus:outline-none focus:border-[#d4af37]"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                suppressHydrationWarning
              />
            </div>

            <div className="pt-4 ">
              <p className="text-xs tracking-[0.24em] uppercase text-[#7f7663] mb-4">Store Details</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs tracking-[0.24em] uppercase text-[#7f7663] mb-2">Store Name</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={60}
                    className="w-full bg-transparent border-b border-[#d0c5af] py-3 px-1 text-sm text-[#1c1c18] focus:outline-none focus:border-[#d4af37]"
                    placeholder="My Awesome Store"
                    value={storeName}
                    onChange={(e) => handleStoreNameChange(e.target.value)}
                    suppressHydrationWarning
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-[0.24em] uppercase text-[#7f7663] mb-2">Store URL value</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={40}
                    pattern="[a-z0-9-]+"
                    className="w-full bg-transparent border-b border-[#d0c5af] py-3 px-1 text-sm text-[#1c1c18] focus:outline-none focus:border-[#d4af37]"
                    placeholder="my-awesome-store"
                    value={storeSlug}
                    onChange={(e) => setStoreSlug(e.target.value)}
                    suppressHydrationWarning
                  />
                  <p className="text-xs text-[#7f7663] mt-1">/vendors/{storeSlug || 'your-store-name'}</p>
                </div>
                <div>
                  <label className="block text-xs tracking-[0.24em] uppercase text-[#7f7663] mb-2">About Your Store</label>
                  <textarea
                    required
                    minLength={20}
                    maxLength={500}
                    rows={3}
                    className="w-full bg-transparent border-b border-[#d0c5af] py-3 px-1 text-sm text-[#1c1c18] focus:outline-none focus:border-[#d4af37] resize-none"
                    placeholder="Tell customers what your store is about..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    suppressHydrationWarning
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#d4af37] text-[#1c1c18] py-4 text-xs tracking-[0.24em] uppercase hover:bg-[#c29a30] disabled:opacity-60 transition-colors mt-2"
            >
              {submitting ? 'Creating...' : 'Create Seller Account'}
            </button>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </form>

          <p className="mt-10 text-center text-sm text-[#4d4635]">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#1c1c18] underline underline-offset-8 decoration-[#d4af37] font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
