'use client';

import { ClipLoader, PulseLoader, BeatLoader } from 'react-spinners';

export default function LoadingSpinner({ 
  type = 'pulse', 
  size = 'md', 
  color = '#3B82F6',
  text = '' 
}) {
  const sizes = {
    sm: 20,
    md: 35,
    lg: 50,
  };

  const spinners = {
    clip: <ClipLoader color={color} size={sizes[size]} />,
    pulse: <PulseLoader color={color} size={sizes[size] / 3} />,
    beat: <BeatLoader color={color} size={sizes[size] / 3} />,
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {spinners[type] || spinners.pulse}
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}