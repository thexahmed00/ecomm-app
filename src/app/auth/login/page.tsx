'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

function LoginContent() {
  const { mongoUser } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mongoUser) {
      router.push(redirect);
    }
  }, [mongoUser, router, redirect]);

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
      router.push(redirect);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign in';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0F0F0F]">
      <div className="hidden md:flex md:w-1/2 bg-gray-900 relative flex-col justify-center items-center p-12 overflow-hidden border-r border-gray-800">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-transparent"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-playfair font-bold text-[#F5F0E8] mb-4 tracking-wide">LUXE</h1>
          <p className="text-xl text-[#E8A020] italic font-playfair">Quality without compromise.</p>
        </div>
      </div>
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-[#F5F0E8] mb-2">Welcome Back</h2>
          <p className="text-gray-400 mb-8">Sign in to your account to continue</p>
          
          <div className="space-y-6">
            <div className="w-full bg-gray-800 text-gray-400 font-medium py-3 rounded-md text-center">
              Google Sign-In is disabled
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#0F0F0F] text-gray-500">Or continue with email</span>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-[#F5F0E8] focus:outline-none focus:border-[#E8A020]"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  suppressHydrationWarning={true}
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-400">Password</label>
                  <Link href="/auth/forgot-password" className="text-xs text-[#E8A020] hover:underline">Forgot password?</Link>
                </div>
                <input
                  type="password"
                  className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-[#F5F0E8] focus:outline-none focus:border-[#E8A020]"
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
                className="w-full bg-[#E8A020] text-black font-bold py-3 rounded-md hover:bg-[#d6901a] disabled:opacity-60"
              >
                {submitting ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </div>
          
          <p className="mt-8 text-center text-sm text-gray-400">
            Do not have an account?{' '}
            <Link href="/auth/register" className="text-[#E8A020] hover:underline font-medium">
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
    <Suspense fallback={<div className="min-h-screen flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E8A020]"></div></div>}>
      <LoginContent />
    </Suspense>
  );
}
