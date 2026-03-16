'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-8 bg-[#0F0F0F]">
      <div className="w-full max-w-md">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#E8A020] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>
        
        {submitted ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#F5F0E8] mb-2">Check your email</h2>
            <p className="text-gray-400 mb-6">
              We have sent a password reset link to <span className="text-white">{email}</span>.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-[#E8A020] hover:underline"
            >
              Try another email
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-3xl font-bold text-[#F5F0E8] mb-2">Reset Password</h2>
            <p className="text-gray-400 mb-8">Enter your email and we will send you a link to reset your password.</p>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-md py-3 px-4 text-[#F5F0E8] focus:outline-none focus:border-[#E8A020] transition-colors"
                  placeholder="you@example.com"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-[#E8A020] text-black font-bold py-3 rounded-md hover:bg-[#d6901a] transition-colors mt-4"
              >
                Send Reset Link
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
