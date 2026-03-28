'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

function LoginContent() {
  const { firebaseUser, mongoUser } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (firebaseUser || mongoUser) {
      router.push(redirect);
    }
  }, [firebaseUser, mongoUser, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        const secure = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `firebaseToken=${token}; path=/; max-age=3600; SameSite=Lax${secure}`;
      }
      router.push(redirect);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign in';
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
            A curated selection with an editorial sensibility.
          </p>
        </div>
      </div>
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <p className="text-xs tracking-[0.28em] uppercase text-[#7f7663]">Sign In</p>
          <h2 className="mt-4 text-3xl font-playfair text-[#1c1c18] mb-2">Welcome Back</h2>
          <p className="text-sm text-[#4d4635] mb-10">Sign in to continue.</p>
          
          <div className="space-y-6">
            <div className="w-full bg-[#ffffff] border border-[#d0c5af] text-[#7f7663] font-medium py-4 text-center text-sm">
              Google Sign-In is disabled
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#d0c5af]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#fcf9f3] text-xs tracking-[0.24em] uppercase text-[#7f7663]">Email</span>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs tracking-[0.24em] uppercase text-[#7f7663] mb-2">Email</label>
                <input
                  type="email"
                  className="w-full bg-transparent border-b border-[#d0c5af] py-3 px-1 text-sm text-[#1c1c18] focus:outline-none focus:border-[#d4af37]"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  suppressHydrationWarning={true}
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs tracking-[0.24em] uppercase text-[#7f7663]">Password</label>
                  <Link href="/auth/forgot-password" className="text-xs tracking-[0.18em] uppercase text-[#1c1c18] underline underline-offset-8 decoration-[#d4af37]">Forgot?</Link>
                </div>
                <input
                  type="password"
                  className="w-full bg-transparent border-b border-[#d0c5af] py-3 px-1 text-sm text-[#1c1c18] focus:outline-none focus:border-[#d4af37]"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  suppressHydrationWarning={true}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#d4af37] text-[#1c1c18] py-4 text-xs tracking-[0.24em] uppercase hover:bg-[#c29a30] disabled:opacity-60 transition-colors"
              >
                {submitting ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </div>
          
          <p className="mt-10 text-center text-sm text-[#4d4635]">
            Do not have an account?{' '}
            <Link href="/auth/register" className="text-[#1c1c18] underline underline-offset-8 decoration-[#d4af37] font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen flex justify-center items-center"><div className="animate-spin h-10 w-10 border-2 border-[#d0c5af] border-t-[#d4af37]"></div></div>}>
      <LoginContent />
    </Suspense>
  );
}
