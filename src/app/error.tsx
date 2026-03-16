'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <AlertCircle className="w-16 h-16 text-[#E8A020] mb-6" />
      <h2 className="text-2xl font-playfair font-bold text-[#F5F0E8] mb-4">Something went wrong!</h2>
      <p className="text-gray-400 mb-8 max-w-md text-center">
        We apologize for the inconvenience. An unexpected error has occurred.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-[#E8A020] text-black font-semibold rounded-md hover:bg-[#d6901a] transition-colors"
      >
        Try again
      </button>
    </div>
  );
}