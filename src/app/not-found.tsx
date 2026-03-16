import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <FileQuestion className="w-20 h-20 text-[#E8A020] mb-6 opacity-80" />
      <h2 className="text-4xl font-playfair font-bold text-[#F5F0E8] mb-4">404</h2>
      <h3 className="text-xl text-gray-300 mb-8">Page Not Found</h3>
      <p className="text-gray-400 mb-8 max-w-md text-center">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link 
        href="/"
        className="px-8 py-3 bg-[#E8A020] text-black font-semibold rounded-md hover:bg-[#d6901a] transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}