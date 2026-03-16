'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  isInput?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({
  rating,
  max = 5,
  size = 'md',
  isInput = false,
  onChange,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  const displayRating = isInput && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className="flex items-center gap-1">
      {[...Array(max)].map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= displayRating;
        const isHalf = !isFilled && starValue - 0.5 <= displayRating;

        return (
          <button
            key={i}
            type={isInput ? 'button' : 'button'}
            disabled={!isInput}
            onClick={(e) => {
              e.preventDefault();
              if (isInput && onChange) onChange(starValue);
            }}
            onMouseEnter={() => {
              if (isInput) setHoverRating(starValue);
            }}
            onMouseLeave={() => {
              if (isInput) setHoverRating(0);
            }}
            className={`${isInput ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            {isFilled ? (
              <Star className={`${sizeClasses[size]} fill-[#E8A020] text-[#E8A020]`} />
            ) : isHalf ? (
              <div className="relative">
                <Star className={`${sizeClasses[size]} text-gray-600`} />
                <div className="absolute inset-0 overflow-hidden w-[50%]">
                  <Star className={`${sizeClasses[size]} fill-[#E8A020] text-[#E8A020]`} />
                </div>
              </div>
            ) : (
              <Star className={`${sizeClasses[size]} text-gray-600`} />
            )}
          </button>
        );
      })}
    </div>
  );
}
