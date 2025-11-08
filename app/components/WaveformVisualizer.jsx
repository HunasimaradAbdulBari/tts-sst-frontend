'use client';

import { motion } from 'framer-motion';

export default function WaveformVisualizer({ audioLevel = 0, isActive = false }) {
  // Create 20 bars for a smooth wave effect
  const bars = Array.from({ length: 20 }, (_, i) => i);

  // Calculate height based on audio level and position
  const getBarHeight = (index) => {
    if (!isActive || audioLevel < 5) {
      return 10; // Minimum height when not active or silent
    }

    // Create a wave pattern across bars
    const centerPosition = bars.length / 2;
    const distanceFromCenter = Math.abs(index - centerPosition);
    const centerBoost = 1 - (distanceFromCenter / centerPosition) * 0.4;
    
    // Scale audio level (5-100) to height (10-80px)
    const scaledLevel = ((audioLevel - 5) / 95) * 70 + 10;
    
    // Apply center boost and ensure minimum height
    return Math.max(10, scaledLevel * centerBoost);
  };

  return (
    <div className="w-full h-28 flex justify-center items-end gap-2 px-6 py-4 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-slate-800/50 dark:to-slate-900/50 rounded-2xl backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50">
      {bars.map((index) => (
        <motion.div
          key={index}
          className="w-3 bg-gradient-to-t from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 rounded-full"
          initial={{ height: 10 }}
          animate={{
            height: isActive ? getBarHeight(index) : 10,
            boxShadow: isActive && audioLevel > 5 
              ? '0 0 10px rgba(99, 102, 241, 0.5)' 
              : '0 0 0px rgba(99, 102, 241, 0)',
          }}
          transition={{
            height: {
              duration: 0.3,
              ease: 'easeOut',
            },
            boxShadow: {
              duration: 0.3,
              ease: 'easeOut',
            },
          }}
          style={{
            minHeight: '10px',
          }}
        />
      ))}
    </div>
  );
}