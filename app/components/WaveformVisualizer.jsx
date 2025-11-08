'use client';

import { motion } from 'framer-motion';

export default function WaveformVisualizer({ audioLevel = 0, isActive = false }) {
  const bars = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div className="flex items-center justify-center gap-4 h-24 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 rounded-xl px-6">
      {bars.map((i) => (
        <div key={i} className="relative">
          <div className="w-5 h-20 bg-white dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="w-full bg-gradient-to-t from-[#2697f3] to-[#64b5f6] rounded-full"
              animate={isActive ? {
                height: [
                  '20px',
                  `${20 + (audioLevel / 100) * 60}px`,
                  '20px'
                ],
                filter: [
                  'hue-rotate(0deg)',
                  'hue-rotate(90deg)',
                  'hue-rotate(180deg)',
                ],
              } : {
                height: '20px',
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.09,
              }}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                borderRadius: '100%',
                boxShadow: 'inset 0px 0px 0px rgba(0, 0, 0, 0.3)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}