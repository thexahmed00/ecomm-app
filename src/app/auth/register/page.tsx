'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function Register() {
  const { mongoUser } = useAuthStore();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mongoUser) {
      router.push('/');
    }
  }, [mongoUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !email || !password) {
      setError('Please fill all fields.');
      return;
    }
    setSubmitting(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (cred.user && name) {
        await updateProfile(cred.user, { displayName: name });
      }
      router.push('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create account';
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
          <p className="text-xl text-[#E8A020] italic font-playfair">Join the exclusive circle.</p>
        </div>
      </div>
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-[#F5F0E8] mb-2">Create an Account</h2>
          <p className="text-gray-400 mb-8">Sign up to get started</p>
          
          <div className="space-y-6">
            <div className="w-full bg-gray-800 text-gray-400 font-medium py-3 rounded-md text-center">
              Google Sign-In is disabled
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#0F0F0F] text-gray-500">Or sign up with email</span>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-[#F5F0E8] focus:outline-none focus:border-[#E8A020]"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  suppressHydrationWarning={true}
                />
              </div>
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
                <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                <input
                  type="password"
                  className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-[#F5F0E8] focus:outline-none focus:border-[#E8A020]"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  suppressHydrationWarning={true}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#E8A020] text-black font-bold py-3 rounded-md hover:bg-[#d6901a] disabled:opacity-60"
              >
                {submitting ? 'Creating...' : 'Create Account'}
              </button>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </form>
          </div>
          
          <p className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#E8A020] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
