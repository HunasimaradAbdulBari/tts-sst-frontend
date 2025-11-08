'use client';

import { motion } from 'framer-motion';

export default function LoadingSpinner({ 
  type = 'pulse', 
  size = 'md', 
  color = '#6366F1',
  text = '' 
}) {
  const sizes = {
    sm: 20,
    md: 35,
    lg: 50,
  };

  const dotSize = sizes[size] / 3;

  if (type === 'pulse') {
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="flex gap-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="rounded-full"
              style={{
                width: dotSize,
                height: dotSize,
                backgroundColor: color,
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: index * 0.15,
              }}
            />
          ))}
        </div>
        {text && (
          <motion.p
            className="text-sm font-medium text-gray-600 dark:text-gray-400"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  if (type === 'ring') {
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        <motion.div
          className="rounded-full border-4 border-t-transparent"
          style={{
            width: sizes[size],
            height: sizes[size],
            borderColor: color,
            borderTopColor: 'transparent',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        {text && (
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {text}
          </p>
        )}
      </div>
    );
  }

  return null;
}