'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function WaveformVisualizer({ audioLevel = 0, isActive = false }) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const barCount = 32;
    const barWidth = width / barCount;

    let bars = Array(barCount).fill(0);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Update bars with smooth animation
      if (isActive) {
        bars = bars.map((bar, i) => {
          const target = (audioLevel / 100) * height * (0.5 + Math.random() * 0.5);
          return bar + (target - bar) * 0.3;
        });
      } else {
        bars = bars.map(bar => bar * 0.95);
      }

      // Draw bars
      bars.forEach((barHeight, i) => {
        const x = i * barWidth;
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, '#3B82F6');
        gradient.addColorStop(0.5, '#8B5CF6');
        gradient.addColorStop(1, '#EC4899');

        ctx.fillStyle = gradient;
        ctx.fillRect(x + 2, height - barHeight, barWidth - 4, barHeight);
      });

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioLevel, isActive]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden shadow-inner"
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={96}
        className="w-full h-full"
      />
    </motion.div>
  );
}